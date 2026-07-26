import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { analyzeSituation, buildApplicationDraft, DEMO_SCENARIOS, AI_SYSTEM_PROMPT, LEGAL_DISCLAIMER } from './src/analyzer.js';
import { Storage } from './src/storage.js';
import {
  clearSessionCookie,
  createSessionToken,
  parseCookies,
  sessionCookie,
  verifyPassword,
  verifySessionToken,
} from './src/security.js';

try {
  process.loadEnvFile?.();
} catch {
  // .env fayli majburiy emas.
}

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const PUBLIC_DIR = resolve(__dirname, 'public');
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';
const SESSION_SECRET = process.env.SESSION_SECRET || 'change-this-secret-before-production-adolat';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const storage = new Storage();

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
};

function setSecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), geolocation=(), payment=()');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; font-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'",
  );
}

function json(res, status, payload, headers = {}) {
  setSecurityHeaders(res);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', ...headers });
  res.end(JSON.stringify(payload));
}

function text(res, status, payload, contentType = 'text/plain; charset=utf-8', headers = {}) {
  setSecurityHeaders(res);
  res.writeHead(status, { 'Content-Type': contentType, ...headers });
  res.end(payload);
}

async function readJson(req, limit = 1_000_000) {
  return new Promise((resolvePromise, reject) => {
    let body = '';
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > limit) {
        const error = new Error('So‘rov hajmi juda katta.');
        error.statusCode = 413;
        reject(error);
        req.destroy();
        return;
      }
      body += chunk;
    });
    req.on('end', () => {
      if (!body) return resolvePromise({});
      try {
        resolvePromise(JSON.parse(body));
      } catch {
        const error = new Error('JSON formati noto‘g‘ri.');
        error.statusCode = 400;
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function getSession(req) {
  const cookies = parseCookies(req.headers.cookie || '');
  const payload = verifySessionToken(cookies.adolat_session, SESSION_SECRET);
  if (!payload) return null;
  const user = storage.getUserById(Number(payload.sub));
  return user || null;
}

function requireUser(req, res) {
  const user = getSession(req);
  if (!user) {
    json(res, 401, { error: 'Tizimga kirish talab qilinadi.' });
    return null;
  }
  return user;
}

function requireAdmin(req, res) {
  const user = requireUser(req, res);
  if (!user) return null;
  if (user.role !== 'admin') {
    json(res, 403, { error: 'Administrator huquqi talab qilinadi.' });
    return null;
  }
  return user;
}

function cleanAiResult(value) {
  if (!value || typeof value !== 'object') return null;
  const required = ['summary', 'category', 'categoryLabel', 'authority', 'steps', 'evidence'];
  if (!required.every((key) => value[key])) return null;
  return {
    ...value,
    strength: Math.max(0, Math.min(100, Number(value.strength || 50))),
    legalBasis: Array.isArray(value.legalBasis) ? value.legalBasis : [],
    steps: Array.isArray(value.steps) ? value.steps : [],
    evidence: Array.isArray(value.evidence) ? value.evidence : [],
    sourceLinks: Array.isArray(value.sourceLinks) ? value.sourceLinks : [],
    clarifyingQuestions: Array.isArray(value.clarifyingQuestions) ? value.clarifyingQuestions : [],
    disclaimer: LEGAL_DISCLAIMER,
    engine: 'external-ai',
    generatedAt: new Date().toISOString(),
  };
}

async function analyzeWithExternalAi(description) {
  const apiKey = process.env.AI_API_KEY;
  const apiUrl = String(process.env.AI_API_URL || '').replace(/\/$/, '');
  const model = process.env.AI_MODEL;
  if (!apiKey || !apiUrl || !model) return null;

  const schemaInstruction = `Faqat JSON qaytar. Tuzilma:
{
  "title":"qisqa sarlavha",
  "summary":"oddiy tildagi xulosa",
  "category":"lotincha_id",
  "categoryLabel":"o‘zbekcha nom",
  "secondaryCategory":null,
  "authority":"murojaat qilinadigan organ",
  "authorityNote":"izoh",
  "legalBasis":["faqat ishonchli qonun nomlari"],
  "steps":["1-qadam"],
  "evidence":["dalil"],
  "strength":65,
  "strengthLabel":"O‘rta",
  "urgency":"o‘rta",
  "recommendedReviewDays":15,
  "clarifyingQuestions":["savol"],
  "sourceLinks":[]
}`;

  const response = await fetch(`${apiUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        { role: 'system', content: `${AI_SYSTEM_PROMPT}\n\n${schemaInstruction}` },
        { role: 'user', content: description },
      ],
    }),
    signal: AbortSignal.timeout(25_000),
  });

  if (!response.ok) throw new Error(`AI xizmati ${response.status} holat kodini qaytardi.`);
  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) return null;
  const jsonMatch = String(content).match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  return cleanAiResult(JSON.parse(jsonMatch[0]));
}

function validateApplicationPayload(body) {
  const recipient = String(body.recipient || '').trim();
  const subject = String(body.subject || '').trim();
  const applicationBody = String(body.body || '').trim();
  if (recipient.length < 3 || subject.length < 3 || applicationBody.length < 30) {
    const error = new Error('Qabul qiluvchi, mavzu va ariza matnini to‘liq kiriting.');
    error.statusCode = 400;
    throw error;
  }
  return {
    caseId: body.caseId ? Number(body.caseId) : null,
    recipient,
    subject,
    body: applicationBody,
    status: ['draft', 'submitted'].includes(body.status) ? body.status : 'draft',
    reviewDays: Number(body.reviewDays || 15),
  };
}

async function handleApi(req, res, url) {
  const { pathname, searchParams } = url;

  if (pathname === '/api/health' && req.method === 'GET') {
    return json(res, 200, {
      ok: true,
      name: 'ADOLAT MVP',
      version: '1.0.0',
      aiMode: process.env.AI_API_KEY ? 'external-with-fallback' : 'demo-rule-engine',
      time: new Date().toISOString(),
    });
  }

  if (pathname === '/api/public/config' && req.method === 'GET') {
    return json(res, 200, {
      appName: 'ADOLAT',
      aiMode: process.env.AI_API_KEY ? 'external-with-fallback' : 'demo',
      disclaimer: LEGAL_DISCLAIMER,
      reviewWindowText: 'Demo kuzatuv: odatda 15 kun, qo‘shimcha o‘rganishda 1 oygacha.',
    });
  }

  if (pathname === '/api/demo-scenarios' && req.method === 'GET') {
    return json(res, 200, { scenarios: DEMO_SCENARIOS });
  }

  if (pathname === '/api/auth/login' && req.method === 'POST') {
    const body = await readJson(req);
    const username = String(body.username || '').trim().toLowerCase();
    const password = String(body.password || '');
    const user = storage.getUserByUsername(username);
    if (!user || !verifyPassword(password, user.password_hash)) {
      storage.log(user?.id || null, 'auth.failed', username);
      return json(res, 401, { error: 'Login yoki parol noto‘g‘ri.' });
    }
    const token = createSessionToken(user, SESSION_SECRET);
    storage.log(user.id, 'auth.login');
    return json(
      res,
      200,
      { user: storage.getUserById(user.id) },
      { 'Set-Cookie': sessionCookie(token, IS_PRODUCTION) },
    );
  }

  if (pathname === '/api/auth/logout' && req.method === 'POST') {
    const user = getSession(req);
    if (user) storage.log(user.id, 'auth.logout');
    return json(res, 200, { ok: true }, { 'Set-Cookie': clearSessionCookie(IS_PRODUCTION) });
  }

  if (pathname === '/api/auth/me' && req.method === 'GET') {
    const user = getSession(req);
    return json(res, 200, { user });
  }

  if (pathname === '/api/analyze' && req.method === 'POST') {
    const body = await readJson(req);
    const description = String(body.description || '').trim();
    let analysis = null;
    let externalError = null;
    try {
      analysis = await analyzeWithExternalAi(description);
    } catch (error) {
      externalError = error.message;
    }
    if (!analysis) analysis = analyzeSituation(description, { engine: 'demo-rule-engine' });
    return json(res, 200, {
      analysis,
      fallbackUsed: Boolean(externalError),
      fallbackReason: IS_PRODUCTION ? undefined : externalError,
    });
  }

  if (pathname === '/api/draft' && req.method === 'POST') {
    const body = await readJson(req);
    const user = getSession(req);
    const draft = buildApplicationDraft({
      analysis: body.analysis || {},
      description: String(body.description || ''),
      profile: user || body.profile || {},
      extra: body.extra || {},
    });
    return json(res, 200, { draft });
  }

  if (pathname === '/api/dashboard' && req.method === 'GET') {
    const user = requireUser(req, res);
    if (!user) return;
    return json(res, 200, storage.getDashboard(user.id));
  }

  if (pathname === '/api/cases' && req.method === 'GET') {
    const user = requireUser(req, res);
    if (!user) return;
    return json(res, 200, { cases: storage.listCases(user.id) });
  }

  if (pathname === '/api/cases' && req.method === 'POST') {
    const user = requireUser(req, res);
    if (!user) return;
    const body = await readJson(req);
    const description = String(body.description || '').trim();
    const analysis = body.analysis && typeof body.analysis === 'object'
      ? cleanAiResult(body.analysis) || body.analysis
      : analyzeSituation(description);
    const savedCase = storage.createCase(user.id, analysis, description);
    return json(res, 201, { case: savedCase });
  }

  const caseMatch = pathname.match(/^\/api\/cases\/(\d+)$/);
  if (caseMatch && req.method === 'GET') {
    const user = requireUser(req, res);
    if (!user) return;
    const found = storage.getCase(Number(caseMatch[1]), user.id);
    if (!found) return json(res, 404, { error: 'Holat topilmadi.' });
    return json(res, 200, { case: found });
  }

  if (pathname === '/api/applications' && req.method === 'GET') {
    const user = requireUser(req, res);
    if (!user) return;
    return json(res, 200, { applications: storage.listApplications(user.id) });
  }

  if (pathname === '/api/applications' && req.method === 'POST') {
    const user = requireUser(req, res);
    if (!user) return;
    const body = validateApplicationPayload(await readJson(req));
    const application = storage.createApplication(user.id, body);
    return json(res, 201, { application });
  }

  const applicationStatusMatch = pathname.match(/^\/api\/applications\/(\d+)\/status$/);
  if (applicationStatusMatch && req.method === 'PATCH') {
    const user = requireUser(req, res);
    if (!user) return;
    const body = await readJson(req);
    const application = storage.updateApplicationStatus(Number(applicationStatusMatch[1]), user.id, String(body.status || ''));
    if (!application) return json(res, 404, { error: 'Murojaat topilmadi yoki holat noto‘g‘ri.' });
    return json(res, 200, { application });
  }

  const applicationMatch = pathname.match(/^\/api\/applications\/(\d+)$/);
  if (applicationMatch && req.method === 'GET') {
    const user = requireUser(req, res);
    if (!user) return;
    const application = storage.getApplication(Number(applicationMatch[1]), user.id);
    if (!application) return json(res, 404, { error: 'Murojaat topilmadi.' });
    return json(res, 200, { application });
  }

  if (pathname === '/api/knowledge' && req.method === 'GET') {
    const items = storage.listKnowledge(searchParams.get('q') || '', searchParams.get('category') || '');
    return json(res, 200, { items });
  }

  if (pathname === '/api/admin/overview' && req.method === 'GET') {
    const user = requireAdmin(req, res);
    if (!user) return;
    return json(res, 200, storage.getAdminOverview());
  }

  return json(res, 404, { error: 'API manzili topilmadi.' });
}

async function serveStatic(req, res, pathname) {
  let relative = pathname === '/' ? '/index.html' : pathname;
  try {
    relative = decodeURIComponent(relative);
  } catch {
    return text(res, 400, 'Noto‘g‘ri manzil.');
  }
  const safeRelative = normalize(relative).replace(/^(\.\.[/\\])+/, '');
  let filePath = resolve(join(PUBLIC_DIR, safeRelative));
  if (!filePath.startsWith(PUBLIC_DIR)) return text(res, 403, 'Ruxsat berilmagan.');

  try {
    const info = await stat(filePath);
    if (info.isDirectory()) filePath = join(filePath, 'index.html');
    setSecurityHeaders(res);
    res.writeHead(200, {
      'Content-Type': MIME[extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': extname(filePath) === '.html' ? 'no-cache' : 'public, max-age=3600',
    });
    createReadStream(filePath).pipe(res);
  } catch {
    // SPA route fallback.
    try {
      const html = await readFile(join(PUBLIC_DIR, 'index.html'));
      setSecurityHeaders(res);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
      res.end(html);
    } catch {
      text(res, 404, 'Sahifa topilmadi.');
    }
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  try {
    if (url.pathname.startsWith('/api/')) {
      await handleApi(req, res, url);
    } else {
      await serveStatic(req, res, url.pathname);
    }
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      json(res, Number(error.statusCode || 500), {
        error: error.statusCode ? error.message : 'Serverda kutilmagan xatolik yuz berdi.',
        details: IS_PRODUCTION ? undefined : error.message,
      });
    } else {
      res.end();
    }
  }
});

server.listen(PORT, HOST, () => {
  console.log(`ADOLAT MVP: http://localhost:${PORT}`);
  console.log('Demo foydalanuvchi: ozodbek / Demo2026!');
  console.log('Demo administrator: admin / Adolat2026!');
});

export { server };
