export const LEGAL_DISCLAIMER =
  "Ushbu javob rasmiy yuridik maslahat yoki yakuniy huquqiy xulosa emas. Aniq qaror qabul qilishdan oldin malakali yurist yoki vakolatli davlat organi bilan maslahatlashish tavsiya etiladi.";

export const AI_SYSTEM_PROMPT = `Sen O‘zbekiston fuqarolik huquqi bo‘yicha yo‘naltiruvchi yordamchisan.
Vazifang:
1. Foydalanuvchi tasvirlagan holatni diqqat bilan o‘qi.
2. Qaysi huquq sohasiga tegishli ekanini aniqlagin.
3. Tegishli qonun hujjatining nomini ko‘rsat, lekin tasdiqlanmagan modda raqamini o‘ylab topma.
4. Qaysi davlat organiga murojaat qilish mumkinligini sodda tilda ayt.
5. Hech qachon qat’iy huquqiy kafolat berma.
6. Javobni huquqiy jargonsiz, bosqichma-bosqich yoz.
7. Holat aniq bo‘lmasa, aniqlashtiruvchi savollar ber.
8. Har bir javob oxirida bu rasmiy yuridik maslahat emasligini eslat.`;

const COMMON_SOURCES = {
  murojaat: {
    name: "Murojaatlar bilan ishlash yagona onlayn platformasi",
    url: "https://murojaat.gov.uz/oz",
  },
  lex: {
    name: "O‘zbekiston Respublikasi qonunchilik ma’lumotlari milliy bazasi",
    url: "https://lex.uz/uz/",
  },
};

const DOMAINS = [
  {
    id: "mehnat",
    label: "Mehnat huquqi",
    icon: "briefcase",
    keywords: [
      "oylik", "maosh", "ish haqi", "ishdan bo'shat", "ishdan hayda", "mehnat shartnoma",
      "ta'til", "ish beruvchi", "xodim", "ish vaqti", "overtime", "majburiy mehnat",
    ],
    summary: "Holat mehnat munosabatlari, ish haqi yoki ish beruvchining majburiyatlari bilan bog‘liq ko‘rinadi.",
    authority: "Hududiy Davlat mehnat inspeksiyasi yoki mehnat nizolari bo‘yicha vakolatli organ",
    authorityNote: "Avval ish beruvchiga yozma talab yuborish, natija bo‘lmasa Mehnat inspeksiyasiga murojaat qilish mumkin.",
    legalBasis: [
      "O‘zbekiston Respublikasi Mehnat kodeksi",
      "Jismoniy va yuridik shaxslarning murojaatlari to‘g‘risidagi Qonun",
    ],
    steps: [
      "Mehnat shartnomasi, buyruqlar, hisob-kitob varaqasi va yozishmalarni yig‘ing.",
      "Ish beruvchiga talabingizni aniq ko‘rsatgan yozma murojaat yuboring.",
      "Javob bo‘lmasa hududiy Davlat mehnat inspeksiyasiga shikoyat yuboring.",
      "Zarurat tug‘ilsa, yakka tartibdagi mehnat nizosi bo‘yicha sud yoki yuristga murojaat qiling.",
    ],
    evidence: ["Mehnat shartnomasi", "Ish haqi hisob-kitobi", "Bank ko‘chirmasi", "Buyruq nusxasi", "Yozishmalar"],
    sourceLinks: [
      { name: "Mehnat inspeksiyasi", url: "https://gov.uz/oz/bv/activity_page/inspectorate" },
      COMMON_SOURCES.murojaat,
      COMMON_SOURCES.lex,
    ],
    strength: 78,
    urgency: "o‘rta",
  },
  {
    id: "istemolchi",
    label: "Iste’molchi huquqi",
    icon: "shopping-bag",
    keywords: [
      "sotib oldim", "tovar", "mahsulot", "kafolat", "qaytar", "pulni qaytar", "nuqson",
      "buzuq", "chek", "do'kon", "market", "xizmat sifati", "yetkazib ber",
    ],
    summary: "Holat tovar yoki xizmat sifati hamda iste’molchining talablarini qondirish bilan bog‘liq ko‘rinadi.",
    authority: "Raqobatni rivojlantirish va iste’molchilar huquqlarini himoya qilish qo‘mitasi",
    authorityNote: "Sotuvchiga yozma talab berilgach, masala hal bo‘lmasa vakolatli qo‘mitaga murojaat qilish mumkin.",
    legalBasis: [
      "Iste’molchilarning huquqlarini himoya qilish to‘g‘risidagi Qonun",
      "Fuqarolik kodeksining oldi-sotdi va xizmat ko‘rsatishga oid qoidalari",
    ],
    steps: [
      "Chek, shartnoma, kafolat taloni va nuqsonni ko‘rsatuvchi foto-videoni saqlang.",
      "Sotuvchi yoki xizmat ko‘rsatuvchiga aniq talab bilan yozma murojaat yuboring.",
      "Rad javobi yoki javobsizlik bo‘lsa vakolatli qo‘mitaga murojaat qiling.",
      "Katta zarar yoki bahs bo‘lsa yurist bilan da’vo tartibini baholang.",
    ],
    evidence: ["Kassa cheki", "Shartnoma", "Kafolat taloni", "Foto/video", "Sotuvchi bilan yozishmalar"],
    sourceLinks: [
      { name: "Raqobat qo‘mitasi", url: "https://raqobat.gov.uz/uz/" },
      COMMON_SOURCES.murojaat,
      COMMON_SOURCES.lex,
    ],
    strength: 74,
    urgency: "o‘rta",
  },
  {
    id: "kommunal",
    label: "Kommunal xizmatlar",
    icon: "home",
    keywords: [
      "elektr", "gaz", "suv", "kommunal", "hisoblagich", "qarzdorlik", "noto'g'ri hisob",
      "tok", "issiq suv", "chiqindi", "ta'minot", "uzib qo'y",
    ],
    summary: "Holat kommunal xizmat, hisob-kitob yoki ta’minot sifati bilan bog‘liq ko‘rinadi.",
    authority: "Xizmat ko‘rsatuvchi tashkilot, hududiy nazorat organi yoki mahalliy hokimlik",
    authorityNote: "Birinchi murojaat xizmat ko‘rsatuvchi tashkilotga, keyingi shikoyat esa tegishli nazorat organiga yuboriladi.",
    legalBasis: [
      "Kommunal xizmat ko‘rsatishga oid amaldagi qoidalar",
      "Iste’molchilarning huquqlarini himoya qilish to‘g‘risidagi Qonun",
      "Jismoniy va yuridik shaxslarning murojaatlari to‘g‘risidagi Qonun",
    ],
    steps: [
      "Hisob-kitob varaqalari, to‘lov cheklari va hisoblagich ko‘rsatkichlarini yig‘ing.",
      "Xizmat ko‘rsatuvchi tashkilotdan yozma qayta hisob-kitob yoki tekshiruv talab qiling.",
      "Dalolatnoma tuzdiring va murojaat raqamini saqlang.",
      "Masala hal bo‘lmasa tegishli inspeksiya yoki hokimlikka shikoyat yuboring.",
    ],
    evidence: ["Hisob-faktura", "To‘lov cheklari", "Hisoblagich fotosi", "Dalolatnoma", "Murojaat raqami"],
    sourceLinks: [COMMON_SOURCES.murojaat, COMMON_SOURCES.lex],
    strength: 70,
    urgency: "o‘rta",
  },
  {
    id: "mulk",
    label: "Uy-joy, yer va mulk",
    icon: "building",
    keywords: [
      "yer", "uy", "kvartira", "mulk", "kadastr", "ijara", "meros", "qo'shni", "buzib tashla",
      "egalik", "hujjat", "notarius", "ro'yxatdan o'tkaz",
    ],
    summary: "Holat ko‘chmas mulk, yer, kadastr, ijara yoki egalik huquqi bilan bog‘liq bo‘lishi mumkin.",
    authority: "Kadastr organi, tuman/shahar hokimligi, notarius yoki fuqarolik ishlari bo‘yicha sud",
    authorityNote: "Vakolatli organ mulkning turi va nizo mazmuniga qarab aniqlanadi; hujjatlarni yuristga ko‘rsatish foydali.",
    legalBasis: [
      "O‘zbekiston Respublikasi Fuqarolik kodeksi",
      "Yer va ko‘chmas mulkka oid amaldagi qonunchilik",
      "Uy-joy kodeksi",
    ],
    steps: [
      "Kadastr hujjati, shartnoma, qaror va to‘lov dalillarini bir joyga to‘plang.",
      "Mulkning amaldagi ro‘yxat holatini vakolatli organdan tekshiring.",
      "Nizo taraflariga yozma talab yoki e’tiroz yuboring.",
      "Nizo hal bo‘lmasa yurist orqali sudgacha talab va da’vo istiqbolini baholang.",
    ],
    evidence: ["Kadastr hujjati", "Oldi-sotdi/ijara shartnomasi", "Hokim qarori", "Notarial hujjat", "To‘lov dalili"],
    sourceLinks: [COMMON_SOURCES.murojaat, COMMON_SOURCES.lex],
    strength: 66,
    urgency: "yuqori",
  },
  {
    id: "sogliq",
    label: "Sog‘liqni saqlash",
    icon: "heart-pulse",
    keywords: [
      "shifokor", "kasalxona", "poliklinika", "dori", "davolash", "tibbiy", "operatsiya",
      "tez yordam", "diagnoz", "sog'liq", "bemor", "tibbiyot",
    ],
    summary: "Holat tibbiy xizmat sifati, bemor huquqi yoki sog‘liqni saqlash tashkiloti faoliyati bilan bog‘liq ko‘rinadi.",
    authority: "Tibbiyot muassasasi rahbariyati, hududiy sog‘liqni saqlash boshqarmasi yoki Sog‘liqni saqlash vazirligi",
    authorityNote: "Shoshilinch xavf bo‘lsa avvalo tibbiy yordam oling; shikoyatni keyin yozma ravishda rasmiylashtiring.",
    legalBasis: [
      "Fuqarolar sog‘lig‘ini saqlashga oid qonunchilik",
      "Tibbiy xizmat ko‘rsatish standartlari va bemor huquqlariga oid qoidalar",
    ],
    steps: [
      "Tibbiy karta, xulosa, retsept va to‘lov hujjatlarining nusxasini oling.",
      "Muassasa rahbariga xizmat tekshiruvi o‘tkazish haqida yozma murojaat yuboring.",
      "Javob qoniqarsiz bo‘lsa hududiy boshqarma yoki vazirlikka murojaat qiling.",
      "Sog‘liqqa zarar yetgan bo‘lsa malakali tibbiy va yuridik ekspertiza oling.",
    ],
    evidence: ["Tibbiy karta", "Shifokor xulosasi", "Retsept", "To‘lov hujjati", "Foto/video yoki guvohlar"],
    sourceLinks: [COMMON_SOURCES.murojaat, COMMON_SOURCES.lex],
    strength: 64,
    urgency: "yuqori",
  },
  {
    id: "tadbirkor",
    label: "Tadbirkorlik huquqi",
    icon: "store",
    keywords: [
      "tadbirkor", "firma", "soliq", "litsenziya", "tekshiruv", "jarima", "yakka tartib",
      "mchj", "biznes", "ruxsatnoma", "hisob raqam", "bank",
    ],
    summary: "Holat tadbirkorlik faoliyati, davlat xizmati, tekshiruv yoki majburiy to‘lov bilan bog‘liq ko‘rinadi.",
    authority: "Tegishli davlat organi, Biznes-ombudsman yoki ma’muriy sud",
    authorityNote: "Qaysi organ qaror chiqargan bo‘lsa, avval o‘sha organga yoki yuqori turuvchi organga e’tiroz berish mumkin.",
    legalBasis: [
      "Tadbirkorlik faoliyati erkinligining kafolatlari to‘g‘risidagi qonunchilik",
      "Ma’muriy tartib-taomillar to‘g‘risidagi Qonun",
      "Soliq kodeksi — masalaga tegishli bo‘lsa",
    ],
    steps: [
      "Qaror, dalolatnoma, bildirishnoma va shartnomalarni yig‘ing.",
      "Qarorning huquqiy asosi va shikoyat muddatini tekshiring.",
      "Yuqori turuvchi organ yoki Biznes-ombudsmanga murojaat tayyorlang.",
      "Moliyaviy xavf katta bo‘lsa, ma’muriy sudga murojaat qilishdan oldin yurist bilan maslahatlash­ing.",
    ],
    evidence: ["Davlat organi qarori", "Tekshiruv dalolatnomasi", "Soliq xabarnomasi", "Shartnoma", "Bank hujjatlari"],
    sourceLinks: [COMMON_SOURCES.murojaat, COMMON_SOURCES.lex],
    strength: 68,
    urgency: "yuqori",
  },
  {
    id: "mamuriy",
    label: "Ma’muriy huquq",
    icon: "shield",
    keywords: [
      "jarima", "protokol", "ichki ishlar", "yo'l harakati", "ypx", "ma'muriy", "qaror",
      "davlat organi", "mansabdor", "rad etdi", "ruxsat bermadi",
    ],
    summary: "Holat davlat organi qarori, ma’muriy jarima yoki mansabdor shaxs harakati bilan bog‘liq ko‘rinadi.",
    authority: "Qarorni chiqargan organning yuqori turuvchi bo‘g‘ini, prokuratura yoki ma’muriy sud",
    authorityNote: "Shikoyat muddatlari qisqa bo‘lishi mumkin; qaror nusxasidagi tartib va muddatni darhol tekshiring.",
    legalBasis: [
      "Ma’muriy javobgarlik to‘g‘risidagi kodeks — jarima bo‘lsa",
      "Ma’muriy sud ishlarini yuritish to‘g‘risidagi kodeks",
      "Ma’muriy tartib-taomillar to‘g‘risidagi Qonun",
    ],
    steps: [
      "Qaror yoki bayonnomaning to‘liq nusxasini oling.",
      "Undagi shikoyat berish muddati va organini tekshiring.",
      "Dalillarni ilova qilgan holda yuqori turuvchi organ yoki sudga shikoyat tayyorlang.",
      "Muddat o‘tib ketish xavfi bo‘lsa tezda yuristga murojaat qiling.",
    ],
    evidence: ["Qaror nusxasi", "Bayonnoma", "Foto/video", "Guvoh ma’lumoti", "To‘lov kvitansiyasi"],
    sourceLinks: [COMMON_SOURCES.murojaat, COMMON_SOURCES.lex],
    strength: 62,
    urgency: "yuqori",
  },
  {
    id: "oila",
    label: "Oila va aliment",
    icon: "users",
    keywords: [
      "aliment", "nikoh", "ajrim", "bola", "vasiylik", "otalik", "onlik", "oila", "turmush",
      "farzand", "mol-mulk bo'lish",
    ],
    summary: "Holat nikoh, ajrim, aliment, bola manfaatlari yoki oilaviy majburiyatlar bilan bog‘liq ko‘rinadi.",
    authority: "Fuqarolik ishlari bo‘yicha sud, FHDYO organi yoki vasiylik va homiylik organi",
    authorityNote: "Bola manfaatlariga oid masalalarda vasiylik organi va sudning vakolati alohida ahamiyatga ega.",
    legalBasis: ["O‘zbekiston Respublikasi Oila kodeksi", "Fuqarolik protsessual kodeksi"],
    steps: [
      "Nikoh, tug‘ilganlik va mulkka oid hujjatlarni tayyorlang.",
      "Talabingizni aniq belgilang: aliment, ajrim, uchrashuv tartibi yoki mulk masalasi.",
      "Zarur bo‘lsa vasiylik organidan xulosa yoki ma’lumot oling.",
      "Sudga ariza berishdan oldin yurist bilan hujjatlarni tekshirtiring.",
    ],
    evidence: ["Nikoh guvohnomasi", "Tug‘ilganlik guvohnomasi", "Daromad ma’lumoti", "Mulk hujjatlari", "Yozishmalar"],
    sourceLinks: [COMMON_SOURCES.murojaat, COMMON_SOURCES.lex],
    strength: 69,
    urgency: "o‘rta",
  },
];

const GENERAL_DOMAIN = {
  id: "umumiy",
  label: "Umumiy huquqiy murojaat",
  icon: "scale",
  summary: "Holat bir nechta huquq sohasiga tegishli bo‘lishi mumkin. Qo‘shimcha tafsilotlar vakolatli organni aniq belgilashga yordam beradi.",
  authority: "Tegishli davlat organi yoki Xalq qabulxonasi",
  authorityNote: "Murojaat.gov.uz orqali masala yo‘nalishini tanlash va tegishli tashkilotga yuborish mumkin.",
  legalBasis: ["Jismoniy va yuridik shaxslarning murojaatlari to‘g‘risidagi Qonun"],
  steps: [
    "Voqea qachon, qayerda va kim bilan sodir bo‘lganini yozing.",
    "Huquqingiz buzilganini tasdiqlovchi hujjat va yozishmalarni to‘plang.",
    "Talabingizni aniq shakllantiring: tekshiruv, qayta hisob-kitob, javob yoki huquqni tiklash.",
    "Murojaat.gov.uz yoki Xalq qabulxonasi orqali tegishli organga murojaat yuboring.",
  ],
  evidence: ["Shaxsni tasdiqlovchi ma’lumot", "Voqea hujjatlari", "Foto/video", "Yozishmalar", "Guvoh ma’lumoti"],
  sourceLinks: [COMMON_SOURCES.murojaat, COMMON_SOURCES.lex],
  strength: 52,
  urgency: "o‘rta",
};

const normalize = (value = "") => value
  .toLocaleLowerCase("uz-UZ")
  .replace(/[ʻʼ’`]/g, "'")
  .replace(/\s+/g, " ")
  .trim();

function scoreDomain(text, domain) {
  return domain.keywords.reduce((score, keyword) => {
    const normalizedKeyword = normalize(keyword);
    if (!normalizedKeyword) return score;
    if (text.includes(normalizedKeyword)) {
      return score + (normalizedKeyword.includes(" ") ? 4 : 2);
    }
    return score;
  }, 0);
}

function inferUrgency(text, domainUrgency) {
  const urgentTerms = [
    "bugun", "hozir", "darhol", "haydab yubordi", "uzib qo'ydi", "tahdid", "zo'ravon",
    "sog'lig'im", "hayot", "sud", "muddat", "ertaga", "jarima",
  ];
  return urgentTerms.some((term) => text.includes(normalize(term))) ? "yuqori" : domainUrgency;
}

function buildClarifyingQuestions(text, domainId) {
  const questions = [];
  if (!/\b(20\d{2}|19\d{2})\b/.test(text) && !/(bugun|kecha|oy|kun|hafta)/.test(text)) {
    questions.push("Voqea qachon sodir bo‘lgan?");
  }
  if (text.length < 120) {
    questions.push("Sizda ushbu holatni tasdiqlovchi qaysi hujjatlar yoki yozishmalar bor?");
  }
  if (domainId === "umumiy") {
    questions.push("Muammo qaysi tashkilot yoki shaxs bilan bog‘liq?");
  }
  return questions.slice(0, 3);
}

function estimateStrength(base, text, evidenceHints = []) {
  let strength = base;
  const evidenceWords = ["shartnoma", "chek", "foto", "video", "yozishma", "guvoh", "qaror", "dalolatnoma", "bank"];
  for (const word of evidenceWords) {
    if (text.includes(word)) strength += 3;
  }
  if (text.length > 250) strength += 4;
  if (text.length < 60) strength -= 8;
  if (evidenceHints.length === 0) strength -= 3;
  return Math.max(25, Math.min(92, strength));
}

export function analyzeSituation(description, options = {}) {
  const original = String(description || "").trim();
  if (original.length < 15) {
    const error = new Error("Holatni kamida 15 ta belgi bilan batafsilroq yozing.");
    error.statusCode = 400;
    throw error;
  }

  const text = normalize(original);
  const ranked = DOMAINS
    .map((domain) => ({ domain, score: scoreDomain(text, domain) }))
    .sort((a, b) => b.score - a.score);
  const selected = ranked[0]?.score > 0 ? ranked[0].domain : GENERAL_DOMAIN;
  const secondary = ranked[1]?.score > 1 ? ranked[1].domain.label : null;
  const urgency = inferUrgency(text, selected.urgency);
  const strength = estimateStrength(selected.strength, text, selected.evidence);
  const deadlineDays = urgency === "yuqori" ? 15 : 30;

  const titleSeed = original.replace(/[.!?].*$/, "").slice(0, 72).trim();
  const title = titleSeed || `${selected.label} bo‘yicha murojaat`;

  return {
    engine: options.engine || "demo-rule-engine",
    title,
    summary: selected.summary,
    category: selected.id,
    categoryLabel: selected.label,
    secondaryCategory: secondary,
    authority: selected.authority,
    authorityNote: selected.authorityNote,
    legalBasis: selected.legalBasis,
    steps: selected.steps,
    evidence: selected.evidence,
    strength,
    strengthLabel: strength >= 75 ? "Nisbatan kuchli" : strength >= 55 ? "O‘rta" : "Qo‘shimcha dalil kerak",
    urgency,
    recommendedReviewDays: deadlineDays,
    clarifyingQuestions: buildClarifyingQuestions(text, selected.id),
    sourceLinks: selected.sourceLinks,
    disclaimer: LEGAL_DISCLAIMER,
    generatedAt: new Date().toISOString(),
  };
}

export function buildApplicationDraft({ analysis, description, profile = {}, extra = {} }) {
  const recipient = extra.recipient || analysis?.authority || "Tegishli davlat organi rahbariga";
  const applicantName = profile.name || extra.applicantName || "F.I.Sh.";
  const address = profile.address || extra.address || "Manzil ko‘rsatiladi";
  const phone = profile.phone || extra.phone || "Telefon raqami";
  const subject = extra.subject || analysis?.title || "Huquq buzilishi yuzasidan murojaat";
  const date = new Intl.DateTimeFormat("uz-UZ", { dateStyle: "long" }).format(new Date());
  const evidence = (analysis?.evidence || []).slice(0, 5);
  const legalBasis = (analysis?.legalBasis || []).join(", ");

  const body = `${recipient}\n\nAriza beruvchi: ${applicantName}\nManzil: ${address}\nTelefon: ${phone}\n\nARIZA / SHIKOYAT\n${subject}\n\nMen quyidagi holat yuzasidan murojaat qilaman:\n\n${String(description || "Holat tavsifi kiritiladi.").trim()}\n\nMazkur holatni ko‘rib chiqishda ${legalBasis || "amaldagi qonunchilik hujjatlari"} talablarini inobatga olishingizni so‘rayman.\n\nSO‘RAYMAN:\n1. Bayon qilingan holatni vakolat doirasida o‘rganib chiqish;\n2. Zarur bo‘lsa hujjatlar va mas’ul shaxslar faoliyatini tekshirish;\n3. Buzilgan huquqlarni tiklash bo‘yicha qonuniy choralar ko‘rish;\n4. Ko‘rib chiqish natijasi haqida menga yozma yoki elektron shaklda javob yuborish.\n\nIlovalar:\n${evidence.length ? evidence.map((item, index) => `${index + 1}. ${item} — mavjud bo‘lsa`).join("\n") : "1. Tasdiqlovchi hujjatlar — mavjud bo‘lsa"}\n\nSana: ${date}\nImzo: __________________ ${applicantName}`;

  return {
    recipient,
    applicantName,
    address,
    phone,
    subject,
    body,
    disclaimer: LEGAL_DISCLAIMER,
  };
}

export const DEMO_SCENARIOS = [
  {
    id: "salary",
    title: "Oylik ish haqi berilmadi",
    category: "Mehnat huquqi",
    description: "Men xususiy korxonada 3 oy ishladim. Mehnat shartnomam bor, lekin oxirgi ikki oylik maoshim berilmadi. Bank ko‘chirmasi va rahbar bilan yozishmalarim saqlangan.",
  },
  {
    id: "consumer",
    title: "Nuqsonli telefonni qaytarish",
    category: "Iste’molchi huquqi",
    description: "Do‘kondan telefon sotib oldim. Ikki kundan keyin ekran ishlamay qoldi. Chek va kafolat taloni bor, ammo do‘kon pulni qaytarishdan bosh tortmoqda.",
  },
  {
    id: "utilities",
    title: "Elektr uchun noto‘g‘ri qarzdorlik",
    category: "Kommunal xizmat",
    description: "Elektr ta’minoti korxonasi hisobimga katta qarzdorlik yozdi. To‘lov cheklarim va hisoblagichning hozirgi ko‘rsatkichi fotosi bor. Qayta hisob-kitob so‘rovimga javob kelmadi.",
  },
  {
    id: "property",
    title: "Kadastr hujjati cho‘zilmoqda",
    category: "Mulk huquqi",
    description: "Uyim bo‘yicha kadastr hujjatini rasmiylashtirish uchun ariza berganman. Bir necha oy bo‘ldi, aniq sabab ko‘rsatilmasdan jarayon cho‘zilmoqda. Ariza raqami va to‘lov kvitansiyasi bor.",
  },
  {
    id: "medical",
    title: "Tibbiy xizmat bo‘yicha shikoyat",
    category: "Sog‘liqni saqlash",
    description: "Xususiy klinikada pullik davolanish oldim, ammo menga xizmat va tashxis bo‘yicha to‘liq hujjatlar berilmadi. To‘lov cheki va yozishmalar mavjud.",
  },
  {
    id: "administrative",
    title: "Ma’muriy jarimaga e’tiroz",
    category: "Ma’muriy huquq",
    description: "Menga ma’muriy jarima qarori yuborildi, lekin qarorda ko‘rsatilgan vaqtda boshqa joyda bo‘lganman. Qaror nusxasi va joylashuvni tasdiqlovchi hujjatlar bor.",
  },
];
