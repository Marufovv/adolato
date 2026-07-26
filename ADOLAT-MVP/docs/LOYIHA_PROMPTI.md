# LOYIHA PROMPTI: "Xalq Huquqi" — AI-asosidagi fuqarolik huquqiy yo'naltiruvchi platforma

> Bu hujjatni to'liq nusxalab, istalgan AI kodlash vositasiga (Claude Code, Cursor, v0, Lovable va h.k.) joylashtiring — u loyihaning to'liq spetsifikatsiyasi va qurilish prompti sifatida ishlatiladi.

---

## 1. LOYIHA HAQIDA UMUMIY MA'LUMOT

**Nomi:** Xalq Huquqi (vaqtinchalik nom)

**Bir jumlada:** Oddiy fuqarolarga o'z huquqlarini tushunish, qonun buzilishini aniqlash, tegishli davlat organiga to'g'ri va tez murojaat qilishda yordam beruvchi AI-yordamchi platforma.

**Muammo:** O'zbekiston fuqarolari huquqi buzilganda ko'pincha (a) bu huquqiy jihatdan qonunga zidligini bilmaydi, (b) qaysi tashkilotga murojaat qilishni bilmaydi, (c) to'g'ri formatlangan ariza yoza olmaydi, (d) murojaat muddatlarini (15 kun / 1 oy) kuzatib bormaydi va o'z huquqini talab qilmaydi.

**Maqsadli auditoriya:** Oddiy fuqarolar (birinchi navbatda), kichik tadbirkorlar (ikkinchi navbatda). Yosh, savodxonlik darajasi va texnologik ko'nikma bo'yicha keng auditoriya — shu sababli soddalik va past-texnologiyali kirish (SMS/ovozli) muhim.

**Nima uchun hozir:** murojaat.gov.uz kabi tizimlar arizani "yuborish" kanalini ta'minlaydi, lekin fuqaroga "sizning holatingiz qonuniy jihatdan qanday, qayerga borish kerak, qanday yozish kerak" degan tushuntirish qatlami yetishmaydi — bu aynan platformamiz to'ldiradigan bo'shliq.

---

## 2. DIZAYN YO'NALISHI (my.gov.uz uslubida)

Dizayn O'zbekistonning rasmiy davlat portallari (my.gov.uz, soliq.uz)ga o'xshash, ishonch uyg'otuvchi, rasmiy-lekin-do'stona uslubda bo'lishi kerak:

- **Rang palitrasi:** Asosiy — to'q ko'k/navy (#0F3D91 yoki shunga yaqin), fon — oq/och kulrang (#F7F8FA), aksent — och ko'k va yashil (muvaffaqiyat holatlari uchun), ogohlantirish uchun — mo''tadil sariq/qizil (agressiv emas).
- **Tipografiya:** Aniq, o'qilishi oson sans-serif shrift (Inter, Manrope yoki mahalliy Roboto/PT Sans variantlari). Katta shrift o'lchamlari — yoshi kattalar uchun qulaylik.
- **Komponent uslubi:** Yumaloq burchakli kartalar (rounded-xl), yengil soyalar, minimalist ikonalar (davlat idoralari, hujjat, soat kabi). Ortiqcha bezaklarsiz, "rasmiy" tuyg'u.
- **Struktura:** Header'da davlat ramzi uslubidagi logotip + til almashtirgich (UZ/RU/QR), markazda katta qidiruv/savol kiritish maydoni (my.gov.uz'dagi kabi "Sizga qanday yordam kerak?" formatida), pastda xizmat kategoriyalari kartalar shaklida.
- **Ishonch elementlari:** "Rasmiy manba", "Ma'lumotlar himoyalangan" kabi belgilar, va har bir AI javobida aniq "bu yuridik maslahat emas, ma'lumot uchun" ogohlantirish bloki.
- **Mobil-birinchi:** Aholining katta qismi mobil orqali kiradi — barcha ekranlar avval mobil uchun loyihalanadi.

---

## 3. ASOSIY FUNKSIONAL MODULLAR

### MVP (birinchi bosqich)
1. **Holatni tasvirlash va tahlil qilish** — foydalanuvchi o'z muammosini oddiy tilda yozadi (yoki ovozli xabar yuboradi), AI holatni tahlil qilib, qaysi qonun/huquq sohasiga tegishli ekanini aniqlaydi.
2. **Yo'naltirish (routing)** — AI qaysi davlat organiga murojaat qilish kerakligini, va murojaat.gov.uz orqali yuborish yo'lini ko'rsatadi.
3. **Ariza generatori** — AI holatga mos, huquqiy jihatdan to'g'ri formatlangan ariza matnini yaratadi (PDF/Word yuklab olish imkoni bilan).

### Ikkinchi bosqich
4. **Murojaat holatini kuzatish** — foydalanuvchi yuborgan arizasining muddatini (15 kun/1 oy) kuzatib boradi, muddat tugashiga yaqin eslatma yuboradi va keyingi qadam (eskalatsiya)ni taklif qiladi.
5. **"Huquq qanchalik kuchli" bahosi** — AI tegishli qonun moddalariga asoslanib, da'voning taxminiy asoslilik darajasini ko'rsatadi (doim "yakuniy qaror uchun yuristga murojaat qiling" ogohlantirishi bilan).

### Uchinchi bosqich (kengaytirish)
6. **Jamoat statistikasi / govtech panel** — hududlar bo'yicha eng ko'p uchraydigan muammolar tahlili (anonim, agregatlangan), hokimiyat organlariga taqdim etish uchun.
7. **Ko'p tilli va past-texnologiyali kirish** — o'zbek/rus/qoraqalpoq tillari, SMS-bot rejimi internet zaif hududlar uchun.

---

## 4. TEXNIK STACK TAVSIYASI

- **Frontend:** React + Tailwind CSS (mobil-birinchi, responsive)
- **Backend:** Node.js/Python (FastAPI) + PostgreSQL (foydalanuvchi holatlari, murojaatlar tarixi uchun)
- **AI qatlami:** LLM (Claude) — quyidagi tizim prompti asosida ishlaydi (pastga qarang)
- **Hujjat generatsiyasi:** Ariza/PDF shabloni + AI to'ldiruvchi matn
- **Bildirishnomalar:** Push (web/mobil) + SMS integratsiyasi (Eskiz.uz yoki shunga o'xshash mahalliy SMS-shlyuz)
- **Autentifikatsiya:** ONE ID (davlat yagona identifikatsiya tizimi) bilan integratsiya — ishonchni oshiradi va real ma'lumotlarga (murojaat holati) kirish imkonini beradi

---

## 5. AI TIZIM PROMPTI (asosiy modul uchun)

Quyidagi promptni AI backend'ida "holatni tahlil qilish" moduli uchun ishlating:

```
Sen O'zbekiston fuqarolik huquqi bo'yicha yo'naltiruvchi yordamchisan. Vazifang:
1. Foydalanuvchi tasvirlagan holatni diqqat bilan o'qi.
2. Qaysi huquq sohasiga tegishli ekanini aniqla (mehnat, kommunal xizmat, sog'liqni saqlash, mulk, ma'muriy huquqbuzarlik va h.k.)
3. Agar mumkin bo'lsa, tegishli qonun/modda nomini ko'rsat (lekin har doim "aniq tasdiq uchun malakali yuristga murojaat qiling" deb qo'sh).
4. Qaysi davlat organiga murojaat qilish kerakligini aniq ayt (masalan: tuman hokimligi, Xalq qabulxonasi, Mehnat inspeksiyasi).
5. HECH QACHON qat'iy huquqiy xulosa yoki kafolat berma — faqat yo'naltiruvchi ma'lumot ber.
6. Javobni oddiy, tushunarli tilda, huquqiy jargonsiz yoz.
7. Agar holat aniq bo'lmasa, aniqlashtiruvchi savol ber.
```

---

## 6. MUHIM CHEKLOVLAR VA OGOHLANTIRISHLAR

- Platforma **rasmiy yuridik maslahat emas** — bu har bir sahifada, har bir AI javobida aniq ko'rsatilishi shart.
- Qonun matnlari muntazam yangilanib turishi kerak (qonun bazasi lex.uz bilan integratsiya yoki muntazam qo'lda yangilash jarayoni).
- Shaxsiy ma'lumotlar himoyasi (fuqarolarning nozik ma'lumotlari) — O'zbekiston shaxsiy ma'lumotlar to'g'risidagi qonunchiligiga muvofiq saqlanishi shart.

---

## 7. BOSQICHMA-BOSQICH ISHLAB CHIQISH REJASI

1. **Hafta 1-2:** Dizayn maketi (Figma) + AI prompt-engineering va test (10-15 real holat bilan)
2. **Hafta 3-5:** MVP — holatni tahlil qilish + yo'naltirish + ariza generatori
3. **Hafta 6-7:** Foydalanuvchi testi (10-15 real foydalanuvchi bilan), fikr-mulohaza asosida tuzatish
4. **Hafta 8+:** Murojaat kuzatuvi, eslatmalar, keyin govtech panel va ko'p tilli qo'llab-quvvatlash
