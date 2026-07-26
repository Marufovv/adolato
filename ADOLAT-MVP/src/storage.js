import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { hashPassword } from './security.js';
import { analyzeSituation, buildApplicationDraft, DEMO_SCENARIOS } from './analyzer.js';

function isoDate(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

function isoDateTime(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString();
}

function safeJsonParse(value, fallback = null) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export class Storage {
  constructor(dbPath = process.env.DB_PATH || './data/adolat.sqlite') {
    const absolutePath = resolve(dbPath);
    mkdirSync(dirname(absolutePath), { recursive: true });
    this.db = new DatabaseSync(absolutePath);
    this.db.exec('PRAGMA foreign_keys = ON;');
    this.db.exec('PRAGMA journal_mode = WAL;');
    this.migrate();
    this.seed();
  }

  migrate() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'citizen' CHECK(role IN ('citizen', 'admin')),
        phone TEXT DEFAULT '',
        address TEXT DEFAULT '',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS cases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        authority TEXT NOT NULL,
        strength INTEGER NOT NULL DEFAULT 0,
        analysis_json TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'reviewed', 'application_created', 'closed')),
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        case_id INTEGER,
        reference_no TEXT NOT NULL UNIQUE,
        recipient TEXT NOT NULL,
        subject TEXT NOT NULL,
        body TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'submitted', 'in_review', 'answered', 'escalated', 'closed')),
        submitted_at TEXT,
        deadline_at TEXT,
        response_at TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(case_id) REFERENCES cases(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS knowledge (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT NOT NULL,
        title TEXT NOT NULL,
        summary TEXT NOT NULL,
        source_name TEXT NOT NULL,
        source_url TEXT NOT NULL,
        reviewed_at TEXT NOT NULL,
        is_demo INTEGER NOT NULL DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        action TEXT NOT NULL,
        details TEXT DEFAULT '',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
      );

      CREATE INDEX IF NOT EXISTS idx_cases_user ON cases(user_id);
      CREATE INDEX IF NOT EXISTS idx_cases_created ON cases(created_at);
      CREATE INDEX IF NOT EXISTS idx_applications_user ON applications(user_id);
      CREATE INDEX IF NOT EXISTS idx_applications_deadline ON applications(deadline_at);
      CREATE INDEX IF NOT EXISTS idx_knowledge_category ON knowledge(category);
    `);
  }

  seed() {
    const count = this.db.prepare('SELECT COUNT(*) AS count FROM users').get().count;
    if (count > 0) return;

    const insertUser = this.db.prepare(`
      INSERT INTO users (name, username, password_hash, role, phone, address)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const demoResult = insertUser.run(
      'Demo Foydalanuvchi',
      'ozodbek',
      hashPassword('Demo2026!'),
      'citizen',
      '+998 90 123 45 67',
      'Toshkent shahri, Chilonzor tumani',
    );
    insertUser.run(
      'ADOLAT Administratori',
      'admin',
      hashPassword('Adolat2026!'),
      'admin',
      '+998 71 000 00 00',
      'Toshkent shahri',
    );

    const demoUserId = Number(demoResult.lastInsertRowid);
    const insertCase = this.db.prepare(`
      INSERT INTO cases (user_id, title, description, category, authority, strength, analysis_json, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const seededCases = [
      { scenario: DEMO_SCENARIOS[0], status: 'application_created', createdAt: isoDateTime(-8) },
      { scenario: DEMO_SCENARIOS[2], status: 'reviewed', createdAt: isoDateTime(-4) },
      { scenario: DEMO_SCENARIOS[1], status: 'draft', createdAt: isoDateTime(-1) },
    ];

    const caseIds = [];
    for (const item of seededCases) {
      const analysis = analyzeSituation(item.scenario.description);
      const result = insertCase.run(
        demoUserId,
        item.scenario.title,
        item.scenario.description,
        analysis.category,
        analysis.authority,
        analysis.strength,
        JSON.stringify(analysis),
        item.status,
        item.createdAt,
      );
      caseIds.push(Number(result.lastInsertRowid));
    }

    const user = this.getUserById(demoUserId);
    const draftOne = buildApplicationDraft({
      analysis: analyzeSituation(DEMO_SCENARIOS[0].description),
      description: DEMO_SCENARIOS[0].description,
      profile: user,
    });
    const draftTwo = buildApplicationDraft({
      analysis: analyzeSituation(DEMO_SCENARIOS[2].description),
      description: DEMO_SCENARIOS[2].description,
      profile: user,
    });

    const insertApplication = this.db.prepare(`
      INSERT INTO applications (
        user_id, case_id, reference_no, recipient, subject, body, status,
        submitted_at, deadline_at, response_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertApplication.run(
      demoUserId,
      caseIds[0],
      'ADL-DEMO-1001',
      draftOne.recipient,
      draftOne.subject,
      draftOne.body,
      'in_review',
      isoDateTime(-7),
      isoDate(8),
      null,
      isoDateTime(-8),
    );
    insertApplication.run(
      demoUserId,
      caseIds[1],
      'ADL-DEMO-1002',
      draftTwo.recipient,
      draftTwo.subject,
      draftTwo.body,
      'submitted',
      isoDateTime(-3),
      isoDate(12),
      null,
      isoDateTime(-4),
    );
    insertApplication.run(
      demoUserId,
      null,
      'ADL-DEMO-0998',
      'Raqobatni rivojlantirish va iste’molchilar huquqlarini himoya qilish qo‘mitasi',
      'Nuqsonli maishiy texnika bo‘yicha shikoyat',
      'Demo murojaat matni. Ushbu yozuv tizim imkoniyatlarini ko‘rsatish uchun qo‘shilgan.',
      'answered',
      isoDateTime(-28),
      isoDate(-13),
      isoDateTime(-10),
      isoDateTime(-29),
    );

    const knowledgeItems = [
      ['Mehnat', 'Ish haqi kechiktirilganda nimalarni saqlash kerak?', 'Mehnat shartnomasi, hisob-kitob varaqasi, bank ko‘chirmasi va ish beruvchi bilan yozishmalar murojaatni asoslashga yordam beradi.', 'Mehnat inspeksiyasi', 'https://gov.uz/oz/bv/activity_page/inspectorate'],
      ['Murojaatlar', 'Murojaatni ko‘rib chiqish muddati', 'Ariza yoki shikoyat odatda 15 kun ichida, qo‘shimcha o‘rganish talab etilganda bir oygacha ko‘rib chiqilishi mumkin. Aniq holat uchun amaldagi hujjatni tekshiring.', 'LexUZ sharhi', 'https://sharh.lex.uz/reviews/52'],
      ['Iste’molchi', 'Nuqsonli tovar bo‘yicha dalillar', 'Chek, kafolat taloni, foto-video va sotuvchiga yuborilgan yozma talabni saqlash muhim.', 'Raqobat qo‘mitasi', 'https://raqobat.gov.uz/uz/istemolchilar-huquqlarini-himoya-qilish-togrisidagi-qonunning-asosiy-jihatlari/'],
      ['Murojaatlar', 'Tegishli tashkilotga elektron murojaat yuborish', 'Murojaat.gov.uz orqali ariza, taklif yoki shikoyatni tegishli tashkilotga yuborish mumkin.', 'Murojaat.gov.uz', 'https://murojaat.gov.uz/oz'],
      ['Mulk', 'Ko‘chmas mulk nizosida asosiy hujjatlar', 'Kadastr hujjati, shartnoma, hokim qarori, notarial hujjat va to‘lov dalillari birlamchi tekshiruv uchun kerak bo‘ladi.', 'LexUZ', 'https://lex.uz/uz/'],
      ['Sog‘liq', 'Tibbiy xizmat bo‘yicha murojaat', 'Tibbiy karta, xulosa, retsept, to‘lov hujjatlari va muassasaga berilgan yozma murojaat nusxasini saqlang.', 'Murojaat.gov.uz', 'https://murojaat.gov.uz/oz'],
      ['Ma’muriy', 'Qaror nusxasi va shikoyat muddati', 'Ma’muriy qarorga e’tiroz bildirishda qaror nusxasi va unda ko‘rsatilgan shikoyat tartibi tekshiriladi.', 'LexUZ', 'https://lex.uz/uz/'],
      ['Xavfsizlik', 'Shaxsiy ma’lumotlarni ehtiyot qiling', 'Pasport, tibbiy va moliyaviy ma’lumotlarni faqat zarur bo‘lganda, ishonchli kanal orqali taqdim eting.', 'ADOLAT demo siyosati', '#privacy'],
    ];
    const insertKnowledge = this.db.prepare(`
      INSERT INTO knowledge (category, title, summary, source_name, source_url, reviewed_at, is_demo)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `);
    for (const item of knowledgeItems) {
      insertKnowledge.run(...item, isoDate(0));
    }
  }

  getUserByUsername(username) {
    return this.db.prepare('SELECT * FROM users WHERE username = ?').get(username) || null;
  }

  getUserById(id) {
    const row = this.db.prepare('SELECT id, name, username, role, phone, address, created_at FROM users WHERE id = ?').get(id);
    return row || null;
  }

  log(userId, action, details = '') {
    this.db.prepare('INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)').run(userId || null, action, String(details));
  }

  createCase(userId, analysis, description) {
    const result = this.db.prepare(`
      INSERT INTO cases (user_id, title, description, category, authority, strength, analysis_json, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'reviewed')
    `).run(
      userId,
      analysis.title,
      description,
      analysis.category,
      analysis.authority,
      analysis.strength,
      JSON.stringify(analysis),
    );
    this.log(userId, 'case.created', `case:${result.lastInsertRowid}`);
    return this.getCase(Number(result.lastInsertRowid), userId);
  }

  getCase(id, userId = null) {
    const row = userId
      ? this.db.prepare('SELECT * FROM cases WHERE id = ? AND user_id = ?').get(id, userId)
      : this.db.prepare('SELECT * FROM cases WHERE id = ?').get(id);
    if (!row) return null;
    return { ...row, analysis: safeJsonParse(row.analysis_json, {}) };
  }

  listCases(userId) {
    return this.db.prepare(`
      SELECT id, title, description, category, authority, strength, status, created_at
      FROM cases WHERE user_id = ? ORDER BY datetime(created_at) DESC
    `).all(userId);
  }

  createApplication(userId, payload) {
    const referenceNo = `ADL-${new Date().getFullYear()}-${String(Date.now()).slice(-7)}`;
    const status = payload.status || 'draft';
    const submittedAt = status === 'draft' ? null : new Date().toISOString();
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + Number(payload.reviewDays || 15));

    const result = this.db.prepare(`
      INSERT INTO applications (
        user_id, case_id, reference_no, recipient, subject, body, status,
        submitted_at, deadline_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      payload.caseId || null,
      referenceNo,
      payload.recipient,
      payload.subject,
      payload.body,
      status,
      submittedAt,
      status === 'draft' ? null : deadline.toISOString().slice(0, 10),
    );

    if (payload.caseId) {
      this.db.prepare("UPDATE cases SET status = 'application_created' WHERE id = ? AND user_id = ?").run(payload.caseId, userId);
    }
    this.log(userId, 'application.created', `application:${result.lastInsertRowid}`);
    return this.getApplication(Number(result.lastInsertRowid), userId);
  }

  getApplication(id, userId = null) {
    const row = userId
      ? this.db.prepare('SELECT * FROM applications WHERE id = ? AND user_id = ?').get(id, userId)
      : this.db.prepare('SELECT * FROM applications WHERE id = ?').get(id);
    return row || null;
  }

  listApplications(userId) {
    return this.db.prepare(`
      SELECT a.*, c.category AS case_category
      FROM applications a
      LEFT JOIN cases c ON c.id = a.case_id
      WHERE a.user_id = ?
      ORDER BY datetime(a.created_at) DESC
    `).all(userId);
  }

  updateApplicationStatus(id, userId, status) {
    const allowed = ['draft', 'submitted', 'in_review', 'answered', 'escalated', 'closed'];
    if (!allowed.includes(status)) return null;
    const current = this.getApplication(id, userId);
    if (!current) return null;
    const now = new Date().toISOString();
    const submittedAt = current.submitted_at || (status !== 'draft' ? now : null);
    let deadlineAt = current.deadline_at;
    if (!deadlineAt && status !== 'draft') {
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + 15);
      deadlineAt = deadline.toISOString().slice(0, 10);
    }
    const responseAt = ['answered', 'closed'].includes(status) ? (current.response_at || now) : current.response_at;
    this.db.prepare(`
      UPDATE applications SET status = ?, submitted_at = ?, deadline_at = ?, response_at = ?
      WHERE id = ? AND user_id = ?
    `).run(status, submittedAt, deadlineAt, responseAt, id, userId);
    this.log(userId, 'application.status', `application:${id};status:${status}`);
    return this.getApplication(id, userId);
  }

  listKnowledge(query = '', category = '') {
    const q = `%${String(query).trim()}%`;
    if (category) {
      return this.db.prepare(`
        SELECT * FROM knowledge
        WHERE category = ? AND (title LIKE ? OR summary LIKE ?)
        ORDER BY category, title
      `).all(category, q, q);
    }
    return this.db.prepare(`
      SELECT * FROM knowledge
      WHERE title LIKE ? OR summary LIKE ? OR category LIKE ?
      ORDER BY category, title
    `).all(q, q, q);
  }

  getDashboard(userId) {
    const caseStats = this.db.prepare(`
      SELECT COUNT(*) AS total,
             SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) AS drafts,
             SUM(CASE WHEN strength >= 70 THEN 1 ELSE 0 END) AS strong
      FROM cases WHERE user_id = ?
    `).get(userId);
    const appStats = this.db.prepare(`
      SELECT COUNT(*) AS total,
             SUM(CASE WHEN status IN ('submitted', 'in_review', 'escalated') THEN 1 ELSE 0 END) AS active,
             SUM(CASE WHEN status IN ('answered', 'closed') THEN 1 ELSE 0 END) AS resolved,
             SUM(CASE WHEN deadline_at IS NOT NULL AND date(deadline_at) < date('now') AND status NOT IN ('answered', 'closed') THEN 1 ELSE 0 END) AS overdue
      FROM applications WHERE user_id = ?
    `).get(userId);
    const recentCases = this.db.prepare(`
      SELECT id, title, category, strength, status, created_at
      FROM cases WHERE user_id = ? ORDER BY datetime(created_at) DESC LIMIT 4
    `).all(userId);
    const upcoming = this.db.prepare(`
      SELECT id, reference_no, subject, status, deadline_at
      FROM applications
      WHERE user_id = ? AND deadline_at IS NOT NULL AND status NOT IN ('answered', 'closed')
      ORDER BY date(deadline_at) ASC LIMIT 4
    `).all(userId);
    return {
      metrics: {
        cases: Number(caseStats.total || 0),
        applications: Number(appStats.total || 0),
        active: Number(appStats.active || 0),
        resolved: Number(appStats.resolved || 0),
        overdue: Number(appStats.overdue || 0),
        strongCases: Number(caseStats.strong || 0),
      },
      recentCases,
      upcoming,
    };
  }

  getAdminOverview() {
    const totals = {
      users: this.db.prepare('SELECT COUNT(*) AS count FROM users').get().count,
      cases: this.db.prepare('SELECT COUNT(*) AS count FROM cases').get().count,
      applications: this.db.prepare('SELECT COUNT(*) AS count FROM applications').get().count,
      active: this.db.prepare("SELECT COUNT(*) AS count FROM applications WHERE status IN ('submitted', 'in_review', 'escalated')").get().count,
    };
    const byCategory = this.db.prepare(`
      SELECT category, COUNT(*) AS count, ROUND(AVG(strength), 0) AS average_strength
      FROM cases GROUP BY category ORDER BY count DESC
    `).all();
    const applications = this.db.prepare(`
      SELECT a.id, a.reference_no, a.subject, a.recipient, a.status, a.deadline_at, a.created_at,
             u.name AS user_name, u.username
      FROM applications a JOIN users u ON u.id = a.user_id
      ORDER BY datetime(a.created_at) DESC LIMIT 50
    `).all();
    const logs = this.db.prepare(`
      SELECT l.action, l.details, l.created_at, u.username
      FROM audit_logs l LEFT JOIN users u ON u.id = l.user_id
      ORDER BY datetime(l.created_at) DESC LIMIT 20
    `).all();
    return { totals, byCategory, applications, logs };
  }
}
