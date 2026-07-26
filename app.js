const appState = {
  step: 1,
  category: "",
  situation: "",
  evidence: [],
  result: null
};

const legalData = {
  labor: {
    label: "Mehnat huquqi",
    title: "Ish haqi yoki mehnat munosabati bo‘yicha harakat rejasi",
    summary: "Vaziyatingiz mehnat huquqiga tegishli ko‘rinadi. Ish beruvchiga yozma talab yuborish va dalillarni saqlash birinchi muhim qadam hisoblanadi.",
    agency: "Davlat mehnat inspeksiyasi",
    link: "https://gov.uz/oz/bv/activity_page/inspectorate",
    actions: ["Mehnat shartnomasi va to‘lov dalillarini jamlang.", "Ish beruvchiga yozma talab yuboring va nusxasini saqlang.", "Muammo hal bo‘lmasa Davlat mehnat inspeksiyasiga murojaat qiling."],
    documents: ["Mehnat shartnomasi", "Bank ko‘chirmasi yoki hisob-kitob", "Ish beruvchi bilan yozishmalar"]
  },
  consumer: {
    label: "Iste’molchi huquqi",
    title: "Tovar yoki xizmat bo‘yicha talab rejangiz",
    summary: "Sotuvchi yoki xizmat ko‘rsatuvchiga aniq talab bilan yozma murojaat yuborish tavsiya etiladi. Xaridni tasdiqlovchi boshqa dalillar chek o‘rnini to‘ldirishi mumkin.",
    agency: "Raqobatni rivojlantirish va iste’molchilar huquqlarini himoya qilish qo‘mitasi",
    link: "https://raqobat.gov.uz/uz/",
    actions: ["Nuqsonni foto yoki videoda qayd eting.", "Sotuvchiga almashtirish, tuzatish yoki pulni qaytarish talabini yozma yuboring.", "Rad javobi bo‘lsa vakolatli qo‘mitaga murojaat qiling."],
    documents: ["Chek yoki to‘lov tasdig‘i", "Kafolat taloni", "Foto-video va yozma talab"]
  },
  housing: {
    label: "Uy-joy va mulk huquqi",
    title: "Mulk va kadastr masalasi bo‘yicha yo‘l xaritasi",
    summary: "Mulkka oid masalalarda huquqni tasdiqlovchi hujjatlar va davlat xizmatiga berilgan ariza raqami asosiy dalil bo‘ladi.",
    agency: "Kadastr agentligi yoki Davlat xizmatlari markazi",
    link: "https://my.gov.uz/uz",
    actions: ["Mulk huquqini tasdiqlovchi hujjatlarni jamlang.", "Ariza holati va qonuniy muddatni tekshiring.", "Muddat buzilgan bo‘lsa yuqori turuvchi organga yozma shikoyat yuboring."],
    documents: ["Kadastr hujjati", "Shartnoma yoki qaror", "Davlat xizmati ariza raqami"]
  },
  utility: {
    label: "Kommunal xizmatlar",
    title: "Kommunal hisob-kitob bo‘yicha e’tiroz rejasi",
    summary: "Noto‘g‘ri qarzdorlik yoki xizmat sifati bo‘yicha hisob-kitob tafsilotini talab qilish va ko‘rsatkichlarni qayd etish kerak.",
    agency: "Hududiy kommunal xizmat tashkiloti",
    link: "https://murojaat.gov.uz/oz",
    actions: ["Hisoblagich ko‘rsatkichi va to‘lovlarni qayd eting.", "Tashkilotdan qarzdorlik hisob-kitobini yozma talab qiling.", "Javob qoniqtirmasa hududiy boshqarma yoki murojaat portaliga yozing."],
    documents: ["To‘lov cheklari", "Hisoblagich fotosi", "Oldingi murojaat va javoblar"]
  },
  fine: {
    label: "Ma’muriy jarima",
    title: "Jarimaga e’tiroz bildirish bo‘yicha reja",
    summary: "Jarima qarori, uning sanasi va e’tirozni tasdiqlovchi dalillarni tekshiring. Shikoyat muddati o‘tib ketmasligi muhim.",
    agency: "Jarimani chiqargan vakolatli organ yoki sud",
    link: "https://my.gov.uz/uz",
    actions: ["Jarima qarori va xabarnomani yuklab oling.", "Qarordagi vaqt, joy va asoslarni dalillar bilan solishtiring.", "Vakolatli organga yoki sudga belgilangan muddatda shikoyat yuboring."],
    documents: ["Jarima qarori", "Foto-video dalillar", "Transport yoki shaxsga oid tasdiqlovchi hujjat"]
  },
  family: {
    label: "Oila huquqi",
    title: "Oilaviy masala bo‘yicha dastlabki yo‘nalish",
    summary: "Oilaviy masalalar holatga qarab FHDYO, vasiylik organi yoki fuqarolik sudida ko‘rib chiqiladi.",
    agency: "Fuqarolik ishlari bo‘yicha sud yoki FHDYO",
    link: "https://my.gov.uz/uz",
    actions: ["Holatga aloqador guvohnoma va hujjatlarni tayyorlang.", "Kelishuv imkoni bo‘lsa talablarni yozma rasmiylashtiring.", "Zarur bo‘lsa hududingizdagi vakolatli organ yoki sudga murojaat qiling."],
    documents: ["Nikoh yoki tug‘ilganlik guvohnomasi", "Daromad va xarajat dalillari", "Oldingi kelishuv yoki qarorlar"]
  },
  other: {
    label: "Umumiy huquqiy masala",
    title: "Muammo bo‘yicha umumiy harakat rejasi",
    summary: "Vaziyatingiz uchun aniq vakolatli organni rasmiy murojaatlar portali orqali aniqlash mumkin. Barcha dalillarni saqlab, talabni yozma shaklda yuboring.",
    agency: "Yagona onlayn murojaatlar platformasi",
    link: "https://murojaat.gov.uz/oz",
    actions: ["Voqealar ketma-ketligini sana bilan yozib chiqing.", "Mavjud dalil va hujjatlarni bir joyga jamlang.", "Murojaat.gov.uz orqali tegishli tashkilotga yozma murojaat yuboring."],
    documents: ["Voqealar xronologiyasi", "Mavjud rasmiy hujjatlar", "Yozishma va boshqa dalillar"]
  }
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

document.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) lucide.createIcons();
  initNavigation();
  initAssistant();
  initArticles();
  initLetters();
  renderCases();
});

function initNavigation() {
  const menuBtn = $("#menuBtn");
  const mobileMenu = $("#mobileMenu");
  menuBtn.addEventListener("click", () => {
    const open = mobileMenu.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(open));
  });
  $$("#mobileMenu a").forEach(a => a.addEventListener("click", () => {
    mobileMenu.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
  }));
  $("#language").addEventListener("change", e => {
    if (e.target.value !== "uz") toast("Bu til tarjimasi keyingi versiyada qo‘shiladi");
  });
  $("#privacyLink").addEventListener("click", e => {
    e.preventDefault();
    alert("Maxfiylik: kiritilgan ma’lumotlar serverga yuborilmaydi va faqat shu brauzerning localStorage xotirasida saqlanadi.");
  });
  $("#disclaimerLink").addEventListener("click", e => {
    e.preventDefault();
    alert("ADOLAT axborot va yo‘naltirish xizmati. Natijalar rasmiy yuridik maslahat yoki sud qarori o‘rnini bosmaydi.");
  });
}

function initAssistant() {
  $$("[data-category]").forEach(btn => btn.addEventListener("click", () => {
    appState.category = btn.dataset.category;
    showStep(2);
    $("#yordam").scrollIntoView({ behavior: "smooth" });
  }));
  $("[data-start]").addEventListener("click", () => {
    $("#yordam").scrollIntoView({ behavior: "smooth" });
  });
  $$(".choice").forEach(btn => btn.addEventListener("click", () => {
    $$(".choice").forEach(x => x.classList.remove("selected"));
    btn.classList.add("selected");
    appState.category = btn.dataset.value;
    window.setTimeout(() => showStep(2), 180);
  }));
  const situation = $("#situation");
  situation.addEventListener("input", () => {
    $("#charCount").textContent = situation.value.length;
    if (situation.value.length > 1000) situation.value = situation.value.slice(0, 1000);
  });
  $$(".suggestions button").forEach(btn => btn.addEventListener("click", () => {
    situation.value = btn.dataset.example;
    situation.dispatchEvent(new Event("input"));
    situation.focus();
  }));
  $$(".back").forEach(btn => btn.addEventListener("click", () => showStep(appState.step - 1)));
  $(".next").addEventListener("click", () => {
    if (situation.value.trim().length < 15) return toast("Vaziyatni kamida 15 ta belgi bilan tushuntiring");
    appState.situation = situation.value.trim();
    showStep(3);
  });
  $("#analyzeBtn").addEventListener("click", buildResult);
  $("#restart").addEventListener("click", resetAssistant);
}

function showStep(step) {
  appState.step = step;
  $$(".form-step").forEach(el => el.classList.toggle("active", Number(el.dataset.step) === step));
  $$("#progressList li").forEach((li, i) => {
    li.classList.toggle("active", i + 1 === step);
    li.classList.toggle("done", i + 1 < step);
  });
}

function buildResult() {
  appState.evidence = $$(".check-grid input:checked").map(input => input.value);
  const data = legalData[appState.category] || legalData.other;
  appState.result = data;
  $("#resultTitle").textContent = data.title;
  $("#resultSummary").textContent = data.summary;
  $("#agencyName").textContent = data.agency;
  $("#agencyLink").href = data.link;
  $("#actionList").innerHTML = data.actions.map(item => `<li>${escapeHtml(item)}</li>`).join("");
  const docs = [...new Set([...data.documents, ...appState.evidence.filter(x => x !== "Hujjat yo‘q")])];
  $("#documentList").innerHTML = docs.map(item => `<li>${escapeHtml(item)}</li>`).join("");
  showStep(4);
  if (window.lucide) lucide.createIcons();
}

function resetAssistant() {
  appState.step = 1;
  appState.category = "";
  appState.situation = "";
  appState.evidence = [];
  appState.result = null;
  $("#situation").value = "";
  $("#charCount").textContent = "0";
  $$(".choice").forEach(x => x.classList.remove("selected"));
  $$(".check-grid input").forEach(x => x.checked = false);
  showStep(1);
}

function initArticles() {
  let activeFilter = "all";
  const applyFilter = () => {
    const search = $("#articleSearch").value.trim().toLowerCase();
    $$("#articleGrid article").forEach(card => {
      const kindMatch = activeFilter === "all" || card.dataset.kind === activeFilter;
      const textMatch = card.textContent.toLowerCase().includes(search);
      card.classList.toggle("hidden", !kindMatch || !textMatch);
    });
  };
  $$(".filter-row button").forEach(btn => btn.addEventListener("click", () => {
    $$(".filter-row button").forEach(x => x.classList.remove("active"));
    btn.classList.add("active");
    activeFilter = btn.dataset.filter;
    applyFilter();
  }));
  $("#articleSearch").addEventListener("input", applyFilter);
}

function initLetters() {
  const modal = $("#letterModal");
  $("#createLetter").addEventListener("click", () => {
    const data = appState.result || legalData.other;
    $("#letterText").value = generateLetter(data);
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  });
  $$("[data-close]").forEach(el => el.addEventListener("click", closeModal));
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
  });
  $("#copyLetter").addEventListener("click", async () => {
    await navigator.clipboard.writeText($("#letterText").value);
    toast("Ariza matni nusxalandi");
  });
  $("#downloadLetter").addEventListener("click", () => {
    updateLetterHeader();
    const blob = new Blob([$("#letterText").value], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ADOLAT-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast("Ariza yuklab olindi");
  });
  $("#saveCase").addEventListener("click", saveCase);
  ["fullName", "address", "phone", "letterType"].forEach(id => {
    $(`#${id}`).addEventListener("input", updateLetterHeader);
  });
  $("#clearCases").addEventListener("click", () => {
    if (!getCases().length) return toast("Saqlangan murojaat yo‘q");
    if (confirm("Barcha saqlangan murojaatlarni o‘chirasizmi?")) {
      localStorage.removeItem("adolat_cases");
      renderCases();
      toast("Murojaatlar tozalandi");
    }
  });
}

function generateLetter(data) {
  return `${data.agency} rahbariga

ARIZA

Men quyidagi masala yuzasidan murojaat qilaman:

${appState.situation || "Vaziyat tafsilotlarini shu yerga yozing."}

Yuqoridagilardan kelib chiqib, holatni qonunchilikda belgilangan tartibda ko‘rib chiqishingizni va natijasi haqida menga yozma ravishda ma’lum qilishingizni so‘rayman.

Ilovalar:
${[...data.documents, ...appState.evidence].filter((x, i, a) => x !== "Hujjat yo‘q" && a.indexOf(x) === i).map((x, i) => `${i + 1}. ${x}`).join("\n") || "1. Mavjud dalillar."}

Sana: ${new Date().toLocaleDateString("uz-UZ")}
Imzo: __________________`;
}

function updateLetterHeader() {
  const data = appState.result || legalData.other;
  const name = $("#fullName").value.trim() || "__________________";
  const address = $("#address").value.trim() || "__________________";
  const phone = $("#phone").value.trim() || "__________________";
  const type = $("#letterType").value;
  const current = $("#letterText").value;
  const bodyStart = current.indexOf("Men quyidagi");
  const body = bodyStart >= 0 ? current.slice(bodyStart) : current;
  $("#letterText").value = `${data.agency} rahbariga
Arizachi: ${name}
Manzil: ${address}
Telefon: ${phone}

${type}

${body}`;
}

function saveCase() {
  updateLetterHeader();
  const data = appState.result || legalData.other;
  const cases = getCases();
  const due = new Date();
  due.setDate(due.getDate() + 15);
  cases.unshift({
    id: `ADL-${String(Date.now()).slice(-6)}`,
    agency: data.agency,
    topic: data.label,
    created: new Date().toISOString(),
    due: due.toISOString(),
    status: "Ko‘rib chiqilmoqda",
    text: $("#letterText").value
  });
  localStorage.setItem("adolat_cases", JSON.stringify(cases));
  renderCases();
  closeModal();
  toast("Murojaat kuzatuvga qo‘shildi");
}

function getCases() {
  try { return JSON.parse(localStorage.getItem("adolat_cases")) || []; }
  catch { return []; }
}

function renderCases() {
  const cases = getCases();
  $("#totalCases").textContent = cases.length;
  $("#activeCases").textContent = cases.filter(x => x.status !== "Javob olindi").length;
  $("#doneCases").textContent = cases.filter(x => x.status === "Javob olindi").length;
  $("#emptyCases").style.display = cases.length ? "none" : "block";
  $("#caseList").innerHTML = cases.map(item => `
    <article class="case-item">
      <div><h3>${escapeHtml(item.topic)}</h3><p>${escapeHtml(item.id)} · ${escapeHtml(item.agency)}</p></div>
      <small>Muddat: ${new Date(item.due).toLocaleDateString("uz-UZ")}</small>
      <span class="case-status">${escapeHtml(item.status)}</span>
      <button class="icon-btn delete-case" data-id="${escapeHtml(item.id)}" aria-label="Murojaatni o‘chirish"><i data-lucide="trash-2"></i></button>
    </article>`).join("");
  $$(".delete-case").forEach(btn => btn.addEventListener("click", () => {
    const next = getCases().filter(item => item.id !== btn.dataset.id);
    localStorage.setItem("adolat_cases", JSON.stringify(next));
    renderCases();
    toast("Murojaat o‘chirildi");
  }));
  if (window.lucide) lucide.createIcons();
}

function closeModal() {
  $("#letterModal").classList.remove("open");
  $("#letterModal").setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function toast(message) {
  const el = $("#toast");
  $("span", el).textContent = message;
  el.classList.add("show");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[char]);
}
