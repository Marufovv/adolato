const state = {
  user: null,
  config: null,
  demos: [],
  cases: [],
  applications: [],
  knowledge: [],
  dashboard: null,
  admin: null,
  currentAnalysis: null,
  currentDescription: '',
  currentCaseId: null,
  draft: null,
  language: 'uz',
  trackerFilter: 'all',
  knowledgeQuery: '',
  knowledgeCategory: '',
};

const translations = {
  uz: {
    home: 'Bosh sahifa', analyze: 'AI tahlil', generator: 'Ariza generatori', tracker: 'Murojaatlar',
    knowledge: 'Huquqiy baza', dashboard: 'Kabinet', admin: 'Admin panel', login: 'Kirish', logout: 'Chiqish',
    heroTitle: 'Huquqingizni tushuning. <span>To‘g‘ri murojaat qiling.</span>',
    heroText: 'Muammoingizni oddiy tilda yozing — ADOLAT huquq sohasini aniqlaydi, tegishli organni tavsiya qiladi va ariza loyihasini tayyorlaydi.',
    heroPlaceholder: 'Masalan: ish beruvchim ikki oydan beri maosh bermayapti…',
    startAnalysis: 'Holatni tahlil qilish',
  },
  ru: {
    home: 'Главная', analyze: 'AI-анализ', generator: 'Генератор заявления', tracker: 'Обращения',
    knowledge: 'Правовая база', dashboard: 'Кабинет', admin: 'Админ-панель', login: 'Войти', logout: 'Выйти',
    heroTitle: 'Поймите свои права. <span>Обратитесь правильно.</span>',
    heroText: 'Опишите проблему простыми словами — ADOLAT определит направление, предложит орган и подготовит проект обращения.',
    heroPlaceholder: 'Например: работодатель два месяца не выплачивает зарплату…',
    startAnalysis: 'Проанализировать ситуацию',
  },
  qr: {
    home: 'Bas bet', analyze: 'AI tallaw', generator: 'Arza generatorı', tracker: 'Múrájatlar',
    knowledge: 'Huquqıy baza', dashboard: 'Kabinet', admin: 'Admin panel', login: 'Kiriw', logout: 'Shıǵıw',
    heroTitle: 'Huquqıńızdı túsiniń. <span>Durıs múrájat etiń.</span>',
    heroText: 'Mashqalańızdı ápiwayı tilde jazıń — ADOLAT baǵdardı anıqlaydı, tiyisli organdı usınıs etedi hám arza jobasın tayarlaydı.',
    heroPlaceholder: 'Mısalı: jumıs beriwshi eki aydan beri aylıq bermey atır…',
    startAnalysis: 'Jaǵdaydı tallaw',
  },
};

const app = document.querySelector('#app');
const desktopNav = document.querySelector('#desktop-nav');
const mobileNav = document.querySelector('#mobile-nav');
const authDialog = document.querySelector('#auth-dialog');
const infoDialog = document.querySelector('#info-dialog');
const applicationDialog = document.querySelector('#application-dialog');
const authButton = document.querySelector('#auth-button');
const languageSwitcher = document.querySelector('#language-switcher');
const mobileMenuButton = document.querySelector('#mobile-menu-button');

const statusLabels = {
  draft: 'Qoralama', submitted: 'Yuborilgan', in_review: 'Ko‘rib chiqilmoqda', answered: 'Javob olingan',
  escalated: 'Yuqori organga yuborilgan', closed: 'Yopilgan', reviewed: 'Tahlil qilingan', application_created: 'Ariza yaratilgan',
};

const statusClasses = {
  draft: 'badge--gray', submitted: 'badge--gold', in_review: '', answered: 'badge--green',
  escalated: 'badge--red', closed: 'badge--gray', reviewed: '', application_created: 'badge--green',
};

const serviceIcons = { analyze: '✦', generator: '▤', tracker: '◷', knowledge: '§', dashboard: '▦', admin: '⚙' };

function t(key) {
  return translations[state.language]?.[key] || translations.uz[key] || key;
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function truncate(value, length = 150) {
  const text = String(value || '');
  return text.length > length ? `${text.slice(0, length).trim()}…` : text;
}

function formatDate(value, options = {}) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(state.language === 'ru' ? 'ru-RU' : 'uz-UZ', {
    day: '2-digit', month: 'short', year: 'numeric', ...options,
  }).format(date);
}

function daysUntil(value) {
  if (!value) return null;
  const deadline = new Date(`${value}T23:59:59`);
  return Math.ceil((deadline.getTime() - Date.now()) / 86_400_000);
}

function showToast(message, type = 'default') {
  const region = document.querySelector('#toast-region');
  const toast = document.createElement('div');
  toast.className = `toast ${type === 'error' ? 'toast--error' : type === 'success' ? 'toast--success' : ''}`;
  toast.textContent = message;
  region.append(toast);
  setTimeout(() => toast.remove(), 3800);
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || 'So‘rov bajarilmadi.');
  return payload;
}

function currentRoute() {
  return (location.hash.replace(/^#/, '').split('?')[0] || 'home').toLowerCase();
}

function navigate(route) {
  location.hash = route;
}

function navItems() {
  const items = [
    ['home', t('home')],
    ['analyze', t('analyze')],
    ['generator', t('generator')],
    ['tracker', t('tracker')],
    ['knowledge', t('knowledge')],
  ];
  if (state.user) items.push(['dashboard', t('dashboard')]);
  if (state.user?.role === 'admin') items.push(['admin', t('admin')]);
  return items;
}

function renderNavigation() {
  const route = currentRoute();
  const html = navItems().map(([key, label]) => `
    <a class="nav-link ${route === key ? 'active' : ''}" href="#${key}">
      <span aria-hidden="true">${serviceIcons[key] || '•'}</span>${escapeHtml(label)}
    </a>
  `).join('');
  desktopNav.innerHTML = html;
  mobileNav.innerHTML = html;
  authButton.textContent = state.user ? `${state.user.name.split(' ')[0]} · ${t('logout')}` : t('login');
}

function authGate(title = 'Bu bo‘limga kirish uchun tizimga kiring') {
  return `
    <section class="page-section">
      <div class="container">
        <div class="form-card" style="max-width:720px;margin:0 auto;text-align:center">
          <span class="eyebrow">Shaxsiy kabinet</span>
          <h1 style="font-size:clamp(2rem,4vw,3.2rem)">${escapeHtml(title)}</h1>
          <p style="margin:16px auto 24px;color:var(--muted);max-width:560px">Holatlar, arizalar va muddatlar shaxsiy hisobingizda saqlanadi. Demo foydalanuvchi orqali barcha imkoniyatlarni ko‘rishingiz mumkin.</p>
          <button class="button button--gold" data-open-auth>Demo hisobga kirish</button>
        </div>
      </div>
    </section>
  `;
}

function renderHome() {
  app.innerHTML = `
    <section class="hero">
      <div class="container hero-grid">
        <div class="hero-copy">
          <span class="eyebrow">O‘zbekiston fuqarolari uchun LegalTech MVP</span>
          <h1>${t('heroTitle')}</h1>
          <p>${escapeHtml(t('heroText'))}</p>
          <div class="hero-search">
            <input id="hero-question" aria-label="Huquqiy muammo" placeholder="${escapeHtml(t('heroPlaceholder'))}">
            <button id="hero-analyze" class="button button--gold" type="button">${escapeHtml(t('startAnalysis'))} →</button>
          </div>
          <div class="hero-trust">
            <span>✓ Ma’lumotlar mahalliy bazada</span>
            <span>✓ Rasmiy manbalarga yo‘naltirish</span>
            <span>✓ PDF/Word uchun ariza</span>
          </div>
        </div>
        <aside class="hero-card" aria-label="ADOLAT ishlash jarayoni">
          <img class="hero-logo" src="/assets/adolat-logo.png" alt="ADOLAT logotipi">
          <h3>Muammodan murojaatgacha</h3>
          <p>3 sodda bosqichda huquqiy yo‘nalish va tayyor hujjat.</p>
          <div class="hero-flow">
            <div class="flow-step"><span>1</span><div><strong>Holatni yozing</strong><small>Oddiy, tushunarli tilda</small></div></div>
            <div class="flow-step"><span>2</span><div><strong>Yo‘nalishni oling</strong><small>Organ, qadamlar va dalillar</small></div></div>
            <div class="flow-step"><span>3</span><div><strong>Arizani yarating</strong><small>Saqlash, Word va PDF</small></div></div>
          </div>
        </aside>
      </div>
    </section>

    <div class="trust-strip">
      <div class="container trust-grid">
        <div class="trust-item"><strong>Rasmiy manbalar</strong><span>LexUZ, gov.uz va Murojaat.gov.uz havolalari</span></div>
        <div class="trust-item"><strong>Maxfiylik</strong><span>Nozik ma’lumotni kiritmaslik bo‘yicha ogohlantirishlar</span></div>
        <div class="trust-item"><strong>Mobil-birinchi</strong><span>Telefon, planshet va kompyuterga mos</span></div>
        <div class="trust-item"><strong>Demo AI</strong><span>API kalitisiz ham ishlaydigan tahlil mexanizmi</span></div>
      </div>
    </div>

    <section class="page-section">
      <div class="container">
        <div class="section-header">
          <div><span class="eyebrow">Asosiy modullar</span><h2>Huquqiy yordamning to‘liq MVP oqimi</h2><p>Platforma holatni tahlil qilishdan boshlab murojaat muddatini kuzatishgacha bo‘lgan amaliy jarayonni bir joyga jamlaydi.</p></div>
        </div>
        <div class="card-grid">
          ${[
            ['analyze', 'Holatni AI tahlil qilish', 'Huquq sohasi, ehtimoliy organ, dalillar va keyingi qadamlarni oling.'],
            ['generator', 'Ariza generatori', 'Tahlil natijasidan rasmiy uslubdagi ariza yoki shikoyat loyihasini yarating.'],
            ['tracker', 'Murojaat kuzatuvi', 'Yuborilgan sana, 15/30 kunlik muddat va murojaat holatini boshqaring.'],
            ['knowledge', 'Huquqiy bilim bazasi', 'Demo maqolalar, rasmiy manbalar va amaliy dalillar ro‘yxatini ko‘ring.'],
            ['dashboard', 'Shaxsiy kabinet', 'Saqlangan holatlar, faol murojaatlar va yaqinlashayotgan muddatlarni kuzating.'],
            ['admin', 'GovTech demo panel', 'Anonimlashtirilgan toifalar, murojaatlar va tizim faolligi ko‘rsatkichlari.'],
          ].map(([route, title, text]) => `
            <a class="service-card" href="#${route}">
              <span class="service-icon">${serviceIcons[route]}</span>
              <h3>${title}</h3><p>${text}</p><span class="link-arrow">Ochish →</span>
            </a>
          `).join('')}
        </div>
      </div>
    </section>

    <section class="page-section" style="background:#eef3f8">
      <div class="container">
        <div class="section-header">
          <div><span class="eyebrow">Tayyor demo holatlar</span><h2>Bir bosishda sinab ko‘ring</h2><p>Quyidagi misollar platformaning tahlil, yo‘naltirish va ariza yaratish jarayonini ko‘rsatish uchun oldindan tayyorlangan.</p></div>
        </div>
        <div class="demo-grid">
          ${state.demos.map((demo) => `
            <article class="demo-card">
              <span class="badge">${escapeHtml(demo.category)}</span>
              <h3>${escapeHtml(demo.title)}</h3>
              <p>${escapeHtml(truncate(demo.description, 155))}</p>
              <button class="button button--soft button--small" data-demo-id="${escapeHtml(demo.id)}">Demo tahlilni ochish</button>
            </article>
          `).join('')}
        </div>
      </div>
    </section>

    <section class="callout-section">
      <div class="container callout-inner">
        <div><h2>Muammoingizni yozishga tayyormisiz?</h2><p>Shaxsiy ma’lumotlarni oshkor qilmasdan vaziyatni tasvirlang. Natija sizga qaysi yo‘nalishda harakat qilishni ko‘rsatadi.</p></div>
        <a class="button button--gold" href="#analyze">Tahlilni boshlash →</a>
      </div>
    </section>
  `;

  document.querySelector('#hero-analyze')?.addEventListener('click', () => {
    const value = document.querySelector('#hero-question').value.trim();
    if (value) {
      state.currentDescription = value;
      state.currentAnalysis = null;
      navigate('analyze');
    } else {
      document.querySelector('#hero-question').focus();
      showToast('Holatingizni qisqacha yozing.', 'error');
    }
  });
  document.querySelector('#hero-question')?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') document.querySelector('#hero-analyze').click();
  });
  document.querySelectorAll('[data-demo-id]').forEach((button) => {
    button.addEventListener('click', () => openDemo(button.dataset.demoId));
  });
}

function analysisResultHtml(analysis) {
  const score = Number(analysis.strength || 0);
  return `
    <div class="result-stack">
      <section class="result-hero">
        <div class="result-topline">
          <div>
            <span class="badge badge--gold">${escapeHtml(analysis.categoryLabel)}</span>
            <h2 style="margin-top:14px">${escapeHtml(analysis.title)}</h2>
            <p>${escapeHtml(analysis.summary)}</p>
          </div>
          <div class="score-circle" style="--score:${score}%" aria-label="Huquqiy asoslanganlik bahosi ${score} foiz"><span>${score}%</span></div>
        </div>
        <div class="button-row" style="margin-top:22px">
          <button id="create-draft-from-analysis" class="button button--gold">Ariza yaratish</button>
          <button id="save-case" class="button button--outline">Holatni saqlash</button>
          <span class="badge ${analysis.urgency === 'yuqori' ? 'badge--red' : 'badge--green'}">Muhimlik: ${escapeHtml(analysis.urgency)}</span>
        </div>
      </section>
      <div class="result-grid">
        <article class="result-card">
          <h3>Qayerga murojaat qilish mumkin?</h3>
          <p><strong style="color:var(--navy-900)">${escapeHtml(analysis.authority)}</strong></p>
          <p style="margin-top:10px">${escapeHtml(analysis.authorityNote || '')}</p>
        </article>
        <article class="result-card">
          <h3>Taxminiy baho</h3>
          <p><strong style="color:var(--navy-900)">${escapeHtml(analysis.strengthLabel || 'O‘rta')}</strong> · ${score}%</p>
          <p style="margin-top:10px">Bu foiz sud natijasi kafolati emas; u faqat tavsif va ko‘rsatilgan dalillar to‘liqligiga asoslangan demo ko‘rsatkich.</p>
        </article>
        <article class="result-card">
          <h3>Tavsiya etilgan qadamlar</h3>
          <ol class="number-list">${(analysis.steps || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ol>
        </article>
        <article class="result-card">
          <h3>Tayyorlab qo‘yiladigan dalillar</h3>
          <ul class="clean-list">${(analysis.evidence || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
        </article>
        <article class="result-card">
          <h3>Huquqiy asoslar</h3>
          <ul class="clean-list">${(analysis.legalBasis || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
        </article>
        <article class="result-card">
          <h3>Aniqlashtirish foydali bo‘lgan savollar</h3>
          ${(analysis.clarifyingQuestions || []).length
            ? `<ul class="clean-list">${analysis.clarifyingQuestions.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
            : '<p>Hozirgi tavsif boshlang‘ich yo‘naltirish uchun yetarli.</p>'}
        </article>
      </div>
      <article class="result-card">
        <h3>Rasmiy va ma’lumot manbalari</h3>
        <div class="source-list" style="margin-top:12px">
          ${(analysis.sourceLinks || []).map((source) => `<a class="source-link" href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">${escapeHtml(source.name)} ↗</a>`).join('')}
        </div>
      </article>
      <div class="disclaimer-box"><span aria-hidden="true">⚠</span><div><strong>Yuridik ogohlantirish</strong><span>${escapeHtml(analysis.disclaimer || state.config?.disclaimer || '')}</span></div></div>
    </div>
  `;
}

function renderAnalyze() {
  app.innerHTML = `
    <section class="page-section">
      <div class="container split-section">
        <aside class="side-intro">
          <span class="eyebrow">ADOLAT AI yordamchisi</span>
          <h2>Vaziyatni oddiy tilda tasvirlang</h2>
          <p>Yaxshi natija uchun voqea sanasi, tashkilot, sizda mavjud dalillar va nimani talab qilayotganingizni yozing.</p>
          <ul>
            <li>Pasport seriyasi va bank karta ma’lumotlarini yozmang.</li>
            <li>Muammo kim bilan bog‘liqligini ko‘rsating.</li>
            <li>Chek, shartnoma yoki qaror borligini ayting.</li>
            <li>Natija yo‘naltiruvchi, yakuniy xulosa emas.</li>
          </ul>
        </aside>
        <div>
          <div class="form-card">
            <span class="eyebrow">1-bosqich</span>
            <h1 style="font-size:clamp(2rem,4vw,3.3rem)">Holatingizni tahlil qiling</h1>
            <p style="margin:12px 0 20px;color:var(--muted)">Kamida 15 ta belgi kiriting. Qanchalik aniq yozsangiz, tavsiya shunchalik foydali bo‘ladi.</p>
            <label for="situation-description">Muammo tavsifi</label>
            <textarea id="situation-description" maxlength="3000" placeholder="Masalan: men xususiy korxonada ishlayman, ikki oydan beri maoshim berilmadi...">${escapeHtml(state.currentDescription)}</textarea>
            <div class="form-toolbar">
              <div><span id="description-count" class="char-count">${state.currentDescription.length}/3000</span></div>
              <div class="button-row">
                <button id="voice-input" class="button button--outline" type="button">🎙 Ovoz bilan</button>
                <button id="analyze-button" class="button button--primary" type="button">✦ Tahlil qilish</button>
              </div>
            </div>
            <div class="demo-chips">
              ${state.demos.slice(0, 6).map((demo) => `<button class="chip-button" data-demo-id="${escapeHtml(demo.id)}">${escapeHtml(demo.title)}</button>`).join('')}
            </div>
          </div>
          <div id="analysis-output">${state.currentAnalysis ? analysisResultHtml(state.currentAnalysis) : ''}</div>
        </div>
      </div>
    </section>
  `;

  const textarea = document.querySelector('#situation-description');
  const counter = document.querySelector('#description-count');
  textarea.addEventListener('input', () => {
    state.currentDescription = textarea.value;
    counter.textContent = `${textarea.value.length}/3000`;
  });
  document.querySelector('#analyze-button').addEventListener('click', runAnalysis);
  document.querySelector('#voice-input').addEventListener('click', startVoiceInput);
  document.querySelectorAll('[data-demo-id]').forEach((button) => button.addEventListener('click', () => {
    const demo = state.demos.find((item) => item.id === button.dataset.demoId);
    if (!demo) return;
    textarea.value = demo.description;
    state.currentDescription = demo.description;
    counter.textContent = `${demo.description.length}/3000`;
    runAnalysis();
  }));
  bindAnalysisResultActions();
}

async function runAnalysis() {
  const textarea = document.querySelector('#situation-description');
  const description = textarea?.value.trim() || state.currentDescription.trim();
  if (description.length < 15) {
    showToast('Holatni kamida 15 ta belgi bilan yozing.', 'error');
    textarea?.focus();
    return;
  }
  state.currentDescription = description;
  const output = document.querySelector('#analysis-output');
  output.innerHTML = '<div class="form-card loading-block"><div><div class="spinner"></div><h3>Holat tahlil qilinmoqda…</h3><p style="color:var(--muted);margin-top:8px">Huquq sohasi, vakolatli organ va dalillar aniqlanmoqda.</p></div></div>';
  try {
    const data = await api('/api/analyze', { method: 'POST', body: JSON.stringify({ description }) });
    state.currentAnalysis = data.analysis;
    state.currentCaseId = null;
    output.innerHTML = analysisResultHtml(data.analysis);
    bindAnalysisResultActions();
    output.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (data.fallbackUsed) showToast('Tashqi AI javob bermadi; ichki demo tahlil ishlatildi.');
  } catch (error) {
    output.innerHTML = `<div class="disclaimer-box"><span>!</span><div><strong>Tahlil bajarilmadi</strong><span>${escapeHtml(error.message)}</span></div></div>`;
  }
}

function bindAnalysisResultActions() {
  document.querySelector('#create-draft-from-analysis')?.addEventListener('click', prepareDraftFromAnalysis);
  document.querySelector('#save-case')?.addEventListener('click', saveCurrentCase);
}

async function saveCurrentCase() {
  if (!state.user) {
    authDialog.showModal();
    showToast('Holatni saqlash uchun demo hisobga kiring.');
    return;
  }
  if (!state.currentAnalysis || !state.currentDescription) return;
  try {
    const data = await api('/api/cases', {
      method: 'POST',
      body: JSON.stringify({ description: state.currentDescription, analysis: state.currentAnalysis }),
    });
    state.currentCaseId = data.case.id;
    showToast('Holat shaxsiy kabinetga saqlandi.', 'success');
  } catch (error) {
    showToast(error.message, 'error');
  }
}

async function prepareDraftFromAnalysis() {
  if (!state.currentAnalysis) return;
  try {
    const data = await api('/api/draft', {
      method: 'POST',
      body: JSON.stringify({ analysis: state.currentAnalysis, description: state.currentDescription }),
    });
    state.draft = data.draft;
    navigate('generator');
  } catch (error) {
    showToast(error.message, 'error');
  }
}

function startVoiceInput() {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) {
    showToast('Bu brauzer ovozli kiritishni qo‘llamaydi. Matn orqali davom eting.', 'error');
    return;
  }
  const button = document.querySelector('#voice-input');
  const textarea = document.querySelector('#situation-description');
  const recognition = new Recognition();
  recognition.lang = state.language === 'ru' ? 'ru-RU' : 'uz-UZ';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  button.disabled = true;
  button.textContent = '🎙 Tinglanmoqda…';
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    textarea.value = `${textarea.value} ${transcript}`.trim();
    textarea.dispatchEvent(new Event('input'));
  };
  recognition.onerror = () => showToast('Ovozli kiritishda xatolik yuz berdi.', 'error');
  recognition.onend = () => {
    button.disabled = false;
    button.textContent = '🎙 Ovoz bilan';
  };
  recognition.start();
}

function renderGenerator() {
  const draft = state.draft || {
    recipient: state.currentAnalysis?.authority || 'Tegishli davlat organi rahbariga',
    applicantName: state.user?.name || 'F.I.Sh.',
    address: state.user?.address || '',
    phone: state.user?.phone || '',
    subject: state.currentAnalysis?.title || 'Huquq buzilishi yuzasidan murojaat',
    body: 'Ariza matnini tahlil natijasidan yarating yoki ushbu maydonda mustaqil yozing.',
  };
  state.draft = { ...draft };
  app.innerHTML = `
    <section class="page-section">
      <div class="container">
        <div class="section-header">
          <div><span class="eyebrow">2-bosqich</span><h1 style="font-size:clamp(2rem,4vw,3.3rem)">Ariza generatori</h1><p>Maydonlarni tahrirlang, qoralama sifatida saqlang yoki yuborilgan deb belgilab kuzatuvga qo‘shing.</p></div>
          ${state.currentAnalysis ? '<span class="badge badge--green">AI tahlildan yaratildi</span>' : '<span class="badge badge--gray">Qo‘lda tahrirlash</span>'}
        </div>
        <div class="generator-layout">
          <div class="form-card generator-form">
            <div class="form-grid">
              <label class="full">Qabul qiluvchi tashkilot<input id="draft-recipient" value="${escapeHtml(draft.recipient)}"></label>
              <label>F.I.Sh.<input id="draft-name" value="${escapeHtml(draft.applicantName)}"></label>
              <label>Telefon<input id="draft-phone" value="${escapeHtml(draft.phone)}"></label>
              <label class="full">Manzil<input id="draft-address" value="${escapeHtml(draft.address)}"></label>
              <label class="full">Mavzu<input id="draft-subject" value="${escapeHtml(draft.subject)}"></label>
              <label class="full">Ariza matni<textarea id="draft-body">${escapeHtml(draft.body)}</textarea></label>
            </div>
            <div class="button-row" style="margin-top:18px">
              <button id="save-draft" class="button button--outline">Qoralama saqlash</button>
              <button id="submit-application" class="button button--primary">Yuborilgan deb belgilash</button>
            </div>
            ${!state.user ? '<p class="field-help" style="margin-top:12px">Saqlash va kuzatuv uchun tizimga kirish kerak. Word/PDF funksiyasi kirishsiz ham ishlaydi.</p>' : ''}
          </div>
          <div>
            <div class="preview-toolbar">
              <strong>Hujjat ko‘rinishi</strong>
              <div class="button-row">
                <button id="download-word" class="button button--soft button--small">Word yuklash</button>
                <button id="print-pdf" class="button button--outline button--small">PDF saqlash / Chop etish</button>
              </div>
            </div>
            <article id="document-preview" class="preview-paper"></article>
          </div>
        </div>
      </div>
    </section>
  `;

  const fields = ['recipient', 'name', 'phone', 'address', 'subject', 'body'];
  fields.forEach((field) => document.querySelector(`#draft-${field}`)?.addEventListener('input', updateDraftPreview));
  updateDraftPreview();
  document.querySelector('#download-word').addEventListener('click', downloadWord);
  document.querySelector('#print-pdf').addEventListener('click', () => window.print());
  document.querySelector('#save-draft').addEventListener('click', () => saveApplication('draft'));
  document.querySelector('#submit-application').addEventListener('click', () => saveApplication('submitted'));
}

function updateDraftPreview() {
  const recipient = document.querySelector('#draft-recipient')?.value || '';
  const name = document.querySelector('#draft-name')?.value || '';
  const phone = document.querySelector('#draft-phone')?.value || '';
  const address = document.querySelector('#draft-address')?.value || '';
  const subject = document.querySelector('#draft-subject')?.value || '';
  let body = document.querySelector('#draft-body')?.value || '';
  if (body.includes('F.I.Sh.') && name && name !== 'F.I.Sh.') body = body.replaceAll('F.I.Sh.', name);
  state.draft = { recipient, applicantName: name, phone, address, subject, body };
  const preview = document.querySelector('#document-preview');
  if (preview) preview.textContent = body;
}

function wordDocumentHtml() {
  const title = escapeHtml(state.draft?.subject || 'ADOLAT arizasi');
  const body = escapeHtml(state.draft?.body || '').replaceAll('\n', '<br>');
  return `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title><style>body{font-family:Times New Roman,serif;font-size:14pt;line-height:1.55;margin:2cm}h1{text-align:center;font-size:16pt}</style></head><body><h1>${title}</h1><p>${body}</p></body></html>`;
}

function downloadWord() {
  updateDraftPreview();
  const blob = new Blob(['\ufeff', wordDocumentHtml()], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ADOLAT-${Date.now()}.doc`;
  link.click();
  URL.revokeObjectURL(url);
  showToast('Word hujjati tayyorlandi.', 'success');
}

async function saveApplication(status) {
  updateDraftPreview();
  if (!state.user) {
    authDialog.showModal();
    showToast('Murojaatni saqlash uchun tizimga kiring.');
    return;
  }
  try {
    const data = await api('/api/applications', {
      method: 'POST',
      body: JSON.stringify({
        caseId: state.currentCaseId,
        recipient: state.draft.recipient,
        subject: state.draft.subject,
        body: state.draft.body,
        status,
        reviewDays: state.currentAnalysis?.recommendedReviewDays || 15,
      }),
    });
    showToast(status === 'draft' ? 'Qoralama saqlandi.' : `Murojaat ${data.application.reference_no} raqami bilan kuzatuvga qo‘shildi.`, 'success');
    await loadApplications();
    if (status !== 'draft') navigate('tracker');
  } catch (error) {
    showToast(error.message, 'error');
  }
}

async function renderTracker() {
  if (!state.user) {
    app.innerHTML = authGate('Murojaatlarni kuzatish uchun tizimga kiring');
    bindAuthGates();
    return;
  }
  app.innerHTML = '<section class="page-section"><div class="container loading-block"><div><div class="spinner"></div><h3>Murojaatlar yuklanmoqda…</h3></div></div></section>';
  await loadApplications();
  const visible = state.trackerFilter === 'all'
    ? state.applications
    : state.applications.filter((item) => item.status === state.trackerFilter);
  app.innerHTML = `
    <section class="dashboard-hero">
      <div class="container dashboard-welcome">
        <div><span class="eyebrow">3-bosqich</span><h1 style="font-size:clamp(2rem,4vw,3.2rem)">Murojaat kuzatuvi</h1><p>Yuborilgan sana, javob muddati va keyingi harakatlarni bir joyda boshqaring.</p></div>
        <a href="#generator" class="button button--gold">+ Yangi ariza</a>
      </div>
    </section>
    <section class="page-section page-section--tight">
      <div class="container">
        <div class="filter-bar">
          <div class="filter-group">
            ${[
              ['all', 'Barchasi'], ['draft', 'Qoralama'], ['submitted', 'Yuborilgan'], ['in_review', 'Jarayonda'],
              ['answered', 'Javob olingan'], ['escalated', 'Eskalatsiya'],
            ].map(([key, label]) => `<button class="filter-button ${state.trackerFilter === key ? 'active' : ''}" data-tracker-filter="${key}">${label}</button>`).join('')}
          </div>
          <span class="badge">${visible.length} ta yozuv</span>
        </div>
        <div class="application-list">
          ${visible.length ? visible.map(applicationCardHtml).join('') : '<div class="empty-state">Tanlangan holatda murojaat topilmadi.</div>'}
        </div>
      </div>
    </section>
  `;
  document.querySelectorAll('[data-tracker-filter]').forEach((button) => button.addEventListener('click', () => {
    state.trackerFilter = button.dataset.trackerFilter;
    renderTracker();
  }));
  document.querySelectorAll('[data-view-application]').forEach((button) => button.addEventListener('click', () => showApplication(Number(button.dataset.viewApplication))));
  document.querySelectorAll('[data-status-select]').forEach((select) => select.addEventListener('change', () => updateApplicationStatus(Number(select.dataset.statusSelect), select.value)));
}

function applicationCardHtml(item) {
  const remaining = daysUntil(item.deadline_at);
  const overdue = remaining !== null && remaining < 0 && !['answered', 'closed'].includes(item.status);
  const deadlineText = item.deadline_at
    ? overdue ? `${Math.abs(remaining)} kun kechikkan` : `${remaining} kun qoldi`
    : 'Muddat belgilanmagan';
  return `
    <article class="application-card">
      <div class="application-card__top">
        <div>
          <span class="badge ${statusClasses[item.status] || ''}">${escapeHtml(statusLabels[item.status] || item.status)}</span>
          <h3>${escapeHtml(item.subject)}</h3>
          <p>${escapeHtml(item.recipient)}</p>
        </div>
        <strong>${escapeHtml(item.reference_no)}</strong>
      </div>
      <div class="application-meta">
        <span>Yaratilgan: ${formatDate(item.created_at)}</span>
        <span>Yuborilgan: ${formatDate(item.submitted_at)}</span>
        <span class="${overdue ? 'deadline-warning' : ''}">Muddat: ${formatDate(item.deadline_at)} · ${deadlineText}</span>
      </div>
      <div class="application-actions">
        <button class="button button--soft button--small" data-view-application="${item.id}">Batafsil</button>
        <label style="display:flex;align-items:center;gap:8px;font-size:.84rem">Holat:
          <select class="status-select" data-status-select="${item.id}">
            ${['draft', 'submitted', 'in_review', 'answered', 'escalated', 'closed'].map((status) => `<option value="${status}" ${item.status === status ? 'selected' : ''}>${statusLabels[status]}</option>`).join('')}
          </select>
        </label>
      </div>
    </article>
  `;
}

async function loadApplications() {
  const data = await api('/api/applications');
  state.applications = data.applications || [];
}

async function updateApplicationStatus(id, status) {
  try {
    await api(`/api/applications/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
    showToast('Murojaat holati yangilandi.', 'success');
    await renderTracker();
  } catch (error) {
    showToast(error.message, 'error');
  }
}

function showApplication(id) {
  const item = state.applications.find((entry) => entry.id === id);
  if (!item) return;
  document.querySelector('#application-dialog-title').textContent = item.subject;
  document.querySelector('#application-dialog-body').innerHTML = `
    <div class="application-meta">
      <span><strong>Raqam:</strong> ${escapeHtml(item.reference_no)}</span>
      <span><strong>Holat:</strong> ${escapeHtml(statusLabels[item.status] || item.status)}</span>
      <span><strong>Muddat:</strong> ${formatDate(item.deadline_at)}</span>
    </div>
    <p style="margin-bottom:12px"><strong>Qabul qiluvchi:</strong> ${escapeHtml(item.recipient)}</p>
    <div class="application-full-text">${escapeHtml(item.body)}</div>
  `;
  applicationDialog.showModal();
}

async function renderDashboard() {
  if (!state.user) {
    app.innerHTML = authGate('Shaxsiy kabinetni ochish uchun tizimga kiring');
    bindAuthGates();
    return;
  }
  app.innerHTML = '<section class="page-section"><div class="container loading-block"><div><div class="spinner"></div><h3>Kabinet yuklanmoqda…</h3></div></div></section>';
  try {
    const [dashboardData, casesData] = await Promise.all([api('/api/dashboard'), api('/api/cases')]);
    state.dashboard = dashboardData;
    state.cases = casesData.cases || [];
  } catch (error) {
    app.innerHTML = `<section class="page-section"><div class="container"><div class="disclaimer-box"><span>!</span><div>${escapeHtml(error.message)}</div></div></div></section>`;
    return;
  }
  const metrics = state.dashboard.metrics;
  app.innerHTML = `
    <section class="dashboard-hero">
      <div class="container">
        <div class="dashboard-welcome">
          <div><span class="eyebrow">Shaxsiy kabinet</span><h1 style="font-size:clamp(2rem,4vw,3.2rem)">Assalomu alaykum, ${escapeHtml(state.user.name.split(' ')[0])}</h1><p>Huquqiy holatlaringiz va faol murojaatlaringiz bo‘yicha umumiy ko‘rinish.</p></div>
          <a href="#analyze" class="button button--gold">+ Yangi tahlil</a>
        </div>
        <div class="metric-grid">
          <div class="metric-card"><span>Saqlangan holatlar</span><strong>${metrics.cases}</strong><small>${metrics.strongCases} tasi kuchli dalilli</small></div>
          <div class="metric-card"><span>Jami murojaatlar</span><strong>${metrics.applications}</strong><small>Qoralama va yuborilganlar</small></div>
          <div class="metric-card"><span>Faol jarayonlar</span><strong>${metrics.active}</strong><small>Javob kutilmoqda</small></div>
          <div class="metric-card"><span>Yakunlangan</span><strong>${metrics.resolved}</strong><small>${metrics.overdue ? `${metrics.overdue} ta kechikkan` : 'Kechikkan murojaat yo‘q'}</small></div>
        </div>
      </div>
    </section>
    <section class="page-section page-section--tight">
      <div class="container dashboard-grid">
        <article class="panel-card">
          <div class="panel-card__header"><h3>So‘nggi huquqiy holatlar</h3><a href="#analyze" class="source-link">Yangi tahlil</a></div>
          <div class="item-list">
            ${state.dashboard.recentCases.length ? state.dashboard.recentCases.map((item) => `
              <div class="item-row"><div><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.category)} · ${formatDate(item.created_at)}</small></div><span class="badge">${item.strength}%</span></div>
            `).join('') : '<div class="empty-state">Hali holat saqlanmagan.</div>'}
          </div>
        </article>
        <article class="panel-card">
          <div class="panel-card__header"><h3>Yaqinlashayotgan muddatlar</h3><a href="#tracker" class="source-link">Barchasi</a></div>
          <div class="item-list">
            ${state.dashboard.upcoming.length ? state.dashboard.upcoming.map((item) => `
              <div class="item-row"><div><strong>${escapeHtml(item.subject)}</strong><small>${escapeHtml(item.reference_no)} · ${statusLabels[item.status] || item.status}</small></div><span class="badge ${daysUntil(item.deadline_at) < 3 ? 'badge--red' : 'badge--gold'}">${daysUntil(item.deadline_at)} kun</span></div>
            `).join('') : '<div class="empty-state">Faol muddat topilmadi.</div>'}
          </div>
        </article>
      </div>
    </section>
    <section class="page-section page-section--tight" style="background:#eef3f8">
      <div class="container">
        <div class="section-header"><div><span class="eyebrow">Saqlangan tarix</span><h2>Holatlarim</h2></div></div>
        <div class="case-list">
          ${state.cases.length ? state.cases.map((item) => `
            <article class="case-card">
              <div class="case-card__top"><div><span class="badge">${escapeHtml(item.category)}</span><h3>${escapeHtml(item.title)}</h3></div><span class="badge ${statusClasses[item.status] || ''}">${statusLabels[item.status] || item.status}</span></div>
              <p>${escapeHtml(truncate(item.description, 220))}</p>
              <div class="application-meta"><span>Asoslanganlik: ${item.strength}%</span><span>${formatDate(item.created_at)}</span><span>${escapeHtml(item.authority)}</span></div>
            </article>
          `).join('') : '<div class="empty-state">Saqlangan holat yo‘q.</div>'}
        </div>
      </div>
    </section>
  `;
}

async function renderKnowledge() {
  app.innerHTML = '<section class="page-section"><div class="container loading-block"><div><div class="spinner"></div><h3>Huquqiy baza yuklanmoqda…</h3></div></div></section>';
  try {
    const params = new URLSearchParams();
    if (state.knowledgeQuery) params.set('q', state.knowledgeQuery);
    if (state.knowledgeCategory) params.set('category', state.knowledgeCategory);
    const data = await api(`/api/knowledge?${params.toString()}`);
    state.knowledge = data.items || [];
  } catch (error) {
    showToast(error.message, 'error');
  }
  const categories = [...new Set(state.knowledge.map((item) => item.category))];
  app.innerHTML = `
    <section class="page-section">
      <div class="container">
        <div class="section-header"><div><span class="eyebrow">Demo huquqiy baza</span><h1 style="font-size:clamp(2rem,4vw,3.3rem)">Amaliy yo‘riqnomalar va manbalar</h1><p>Quyidagi kontent demo xarakterda. Muhim qaror oldidan manbaning amaldagi tahririni rasmiy saytda tekshiring.</p></div></div>
        <div class="knowledge-toolbar">
          <input id="knowledge-search" value="${escapeHtml(state.knowledgeQuery)}" placeholder="Mavzu yoki kalit so‘z bo‘yicha izlash">
          <select id="knowledge-category"><option value="">Barcha toifalar</option>${categories.map((category) => `<option value="${escapeHtml(category)}" ${state.knowledgeCategory === category ? 'selected' : ''}>${escapeHtml(category)}</option>`).join('')}</select>
        </div>
        <div class="knowledge-grid">
          ${state.knowledge.length ? state.knowledge.map((item) => `
            <article class="knowledge-card">
              <span class="badge">${escapeHtml(item.category)}</span>
              <h3>${escapeHtml(item.title)}</h3>
              <p>${escapeHtml(item.summary)}</p>
              <small style="color:var(--muted)">Tekshirilgan sana: ${formatDate(item.reviewed_at)}</small>
              ${item.source_url.startsWith('#') ? `<button class="source-link" data-info-source>${escapeHtml(item.source_name)}</button>` : `<a class="source-link" href="${escapeHtml(item.source_url)}" target="_blank" rel="noreferrer">${escapeHtml(item.source_name)} ↗</a>`}
            </article>
          `).join('') : '<div class="empty-state" style="grid-column:1/-1">Mos ma’lumot topilmadi.</div>'}
        </div>
      </div>
    </section>
  `;
  document.querySelector('#knowledge-search').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      state.knowledgeQuery = event.currentTarget.value.trim();
      renderKnowledge();
    }
  });
  document.querySelector('#knowledge-category').addEventListener('change', (event) => {
    state.knowledgeCategory = event.currentTarget.value;
    renderKnowledge();
  });
  document.querySelectorAll('[data-info-source]').forEach((button) => button.addEventListener('click', () => infoDialog.showModal()));
}

async function renderAdmin() {
  if (!state.user || state.user.role !== 'admin') {
    app.innerHTML = state.user ? '<section class="page-section"><div class="container"><div class="disclaimer-box"><span>!</span><div><strong>Ruxsat yo‘q</strong><span>Bu bo‘lim faqat administrator uchun.</span></div></div></div></section>' : authGate('Administrator paneli uchun tizimga kiring');
    bindAuthGates();
    return;
  }
  app.innerHTML = '<section class="page-section"><div class="container loading-block"><div><div class="spinner"></div><h3>Admin panel yuklanmoqda…</h3></div></div></section>';
  try {
    state.admin = await api('/api/admin/overview');
  } catch (error) {
    showToast(error.message, 'error');
    return;
  }
  const maxCount = Math.max(1, ...state.admin.byCategory.map((item) => item.count));
  app.innerHTML = `
    <section class="dashboard-hero">
      <div class="container">
        <div class="dashboard-welcome"><div><span class="eyebrow">GovTech demo panel</span><h1 style="font-size:clamp(2rem,4vw,3.2rem)">ADOLAT administrator paneli</h1><p>Demo foydalanuvchilar, huquqiy toifalar va murojaatlarning umumiy monitoringi.</p></div><span class="badge badge--gold">Admin: ${escapeHtml(state.user.username)}</span></div>
        <div class="metric-grid">
          <div class="metric-card"><span>Foydalanuvchilar</span><strong>${state.admin.totals.users}</strong><small>Demo va admin hisoblar</small></div>
          <div class="metric-card"><span>Huquqiy holatlar</span><strong>${state.admin.totals.cases}</strong><small>Tahlil qilingan yozuvlar</small></div>
          <div class="metric-card"><span>Murojaatlar</span><strong>${state.admin.totals.applications}</strong><small>Jami ariza va shikoyatlar</small></div>
          <div class="metric-card"><span>Faol jarayonlar</span><strong>${state.admin.totals.active}</strong><small>Javob kutilayotganlar</small></div>
        </div>
      </div>
    </section>
    <section class="page-section page-section--tight">
      <div class="container dashboard-grid">
        <article class="panel-card">
          <div class="panel-card__header"><h3>Muammolar toifalari</h3><span class="badge">Anonim statistika</span></div>
          <div class="category-bars">
            ${state.admin.byCategory.map((item) => `
              <div class="bar-row"><strong>${escapeHtml(item.category)}</strong><div class="bar-track"><div class="bar-fill" style="width:${Math.round((item.count / maxCount) * 100)}%"></div></div><span>${item.count} · ${item.average_strength}%</span></div>
            `).join('') || '<div class="empty-state">Ma’lumot yo‘q.</div>'}
          </div>
        </article>
        <article class="panel-card">
          <div class="panel-card__header"><h3>So‘nggi tizim faoliyati</h3></div>
          <div class="item-list">
            ${state.admin.logs.map((log) => `<div class="item-row"><div><strong>${escapeHtml(log.action)}</strong><small>${escapeHtml(log.username || 'guest')} · ${escapeHtml(log.details || '')}</small></div><small>${formatDate(log.created_at)}</small></div>`).join('') || '<div class="empty-state">Loglar yo‘q.</div>'}
          </div>
        </article>
      </div>
    </section>
    <section class="page-section page-section--tight" style="background:#eef3f8">
      <div class="container">
        <div class="section-header"><div><span class="eyebrow">Operatsion ro‘yxat</span><h2>So‘nggi murojaatlar</h2></div></div>
        <div class="admin-table-wrap">
          <table>
            <thead><tr><th>Raqam</th><th>Foydalanuvchi</th><th>Mavzu</th><th>Qabul qiluvchi</th><th>Holat</th><th>Muddat</th></tr></thead>
            <tbody>${state.admin.applications.map((item) => `<tr><td>${escapeHtml(item.reference_no)}</td><td>${escapeHtml(item.user_name)}<br><small>@${escapeHtml(item.username)}</small></td><td>${escapeHtml(item.subject)}</td><td>${escapeHtml(truncate(item.recipient, 70))}</td><td><span class="badge ${statusClasses[item.status] || ''}">${statusLabels[item.status] || item.status}</span></td><td>${formatDate(item.deadline_at)}</td></tr>`).join('')}</tbody>
          </table>
        </div>
      </div>
    </section>
  `;
}

async function openDemo(id) {
  const demo = state.demos.find((item) => item.id === id);
  if (!demo) return;
  state.currentDescription = demo.description;
  state.currentAnalysis = null;
  navigate('analyze');
  setTimeout(runAnalysis, 40);
}

function bindAuthGates() {
  document.querySelectorAll('[data-open-auth]').forEach((button) => button.addEventListener('click', () => authDialog.showModal()));
}

async function route() {
  renderNavigation();
  mobileNav.hidden = true;
  mobileMenuButton.setAttribute('aria-expanded', 'false');
  const current = currentRoute();
  window.scrollTo({ top: 0, behavior: 'instant' });
  if (current === 'home') renderHome();
  else if (current === 'analyze') renderAnalyze();
  else if (current === 'generator') renderGenerator();
  else if (current === 'tracker') await renderTracker();
  else if (current === 'knowledge') await renderKnowledge();
  else if (current === 'dashboard') await renderDashboard();
  else if (current === 'admin') await renderAdmin();
  else navigate('home');
}

async function login(username, password) {
  const errorBox = document.querySelector('#auth-error');
  if (errorBox) errorBox.textContent = '';
  try {
    const data = await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });
    state.user = data.user;
    authDialog.close();
    renderNavigation();
    showToast(`Xush kelibsiz, ${state.user.name}!`, 'success');
    await route();
  } catch (error) {
    if (errorBox) errorBox.textContent = error.message;
  }
}

async function logout() {
  await api('/api/auth/logout', { method: 'POST', body: '{}' });
  state.user = null;
  state.dashboard = null;
  state.admin = null;
  state.applications = [];
  renderNavigation();
  showToast('Hisobdan chiqildi.');
  navigate('home');
}

function bindGlobalEvents() {
  authButton.addEventListener('click', () => state.user ? logout() : authDialog.showModal());
  document.querySelector('#auth-form').addEventListener('submit', (event) => {
    event.preventDefault();
    login(document.querySelector('#login-username').value, document.querySelector('#login-password').value);
  });
  document.querySelector('#demo-user-login').addEventListener('click', () => login('ozodbek', 'Demo2026!'));
  document.querySelector('#demo-admin-login').addEventListener('click', () => login('admin', 'Adolat2026!'));
  document.querySelector('#notice-details').addEventListener('click', () => infoDialog.showModal());
  document.querySelector('#privacy-link').addEventListener('click', () => infoDialog.showModal());
  document.querySelector('#font-toggle').addEventListener('click', () => document.body.classList.toggle('large-text'));
  document.querySelectorAll('[data-close-dialog]').forEach((button) => button.addEventListener('click', () => document.querySelector(`#${button.dataset.closeDialog}`)?.close()));
  languageSwitcher.addEventListener('change', () => {
    state.language = languageSwitcher.value;
    document.documentElement.lang = state.language;
    route();
  });
  mobileMenuButton.addEventListener('click', () => {
    mobileNav.hidden = !mobileNav.hidden;
    mobileMenuButton.setAttribute('aria-expanded', String(!mobileNav.hidden));
  });
  mobileNav.addEventListener('click', () => {
    mobileNav.hidden = true;
    mobileMenuButton.setAttribute('aria-expanded', 'false');
  });
  window.addEventListener('hashchange', route);
}

async function bootstrap() {
  document.querySelector('#current-year').textContent = new Date().getFullYear();
  bindGlobalEvents();
  try {
    const [configData, authData, demosData] = await Promise.all([
      api('/api/public/config'),
      api('/api/auth/me'),
      api('/api/demo-scenarios'),
    ]);
    state.config = configData;
    state.user = authData.user;
    state.demos = demosData.scenarios || [];
  } catch (error) {
    showToast(`Server bilan aloqa xatosi: ${error.message}`, 'error');
  }
  renderNavigation();
  await route();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
}

bootstrap();
