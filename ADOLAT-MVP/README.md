# ADOLAT — huquqiy yo‘naltiruvchi platforma MVP

ADOLAT O‘zbekiston fuqarolariga muammoni oddiy tilda bayon qilish, huquq sohasini taxminiy aniqlash, tegishli tashkilotga yo‘naltirish, ariza loyihasini tayyorlash va murojaat muddatini kuzatishda yordam beruvchi ishlaydigan MVP.

> Muhim: platforma rasmiy yuridik maslahat, advokatlik xizmati yoki davlat portali emas. Tahlil yo‘naltiruvchi va demo xarakterda.

## Tayyor modullar

- Mobil, planshet va kompyuter uchun responsive bosh sahifa.
- ADOLAT logotipi, navy/gold brend uslubi va PWA ikonkalari.
- Oddiy matn yoki brauzer qo‘llasa ovoz orqali holat kiritish.
- API kalitisiz ishlaydigan ichki demo huquqiy tahlil mexanizmi.
- Ixtiyoriy OpenAI-compatible tashqi AI ulash va avtomatik fallback.
- Huquq sohasi, organ, qadamlar, dalillar, manbalar va demo kuch bahosi.
- Ariza/shikoyat generatori.
- Word `.doc` yuklash va brauzer orqali PDF saqlash/chop etish.
- Foydalanuvchi kabineti, saqlangan holatlar va murojaat kuzatuvi.
- 15/30 kunlik demo muddat kuzatuvi va kechikish indikatori.
- Administrator paneli va anonimlashtirilgan toifa statistikasi.
- Huquqiy bilim bazasi va rasmiy manba havolalari.
- UZ/RU/QR interfeys almashtirgichi.
- SQLite ma’lumotlar bazasi, xavfsiz cookie sessiyasi va audit loglar.
- Demo ma’lumotlar, foydalanuvchi va administrator hisobi.
- Testlar va `/api/health` sog‘liq tekshiruvi.

## Windows’da ishga tushirish

Talab: **Node.js 22.5 yoki undan yangi**. Sizdagi Node.js 24 versiyasi mos keladi.

PowerShell’da:

```powershell
cd C:\yo‘l\ADOLAT-MVP
Copy-Item .env.example .env
npm start
```

Brauzerda oching:

```text
http://localhost:3000
```

Bu loyihada tashqi npm paketlari yo‘q, shu sababli `npm install` majburiy emas.

Dasturlash rejimi:

```powershell
npm run dev
```

Test:

```powershell
npm test
```

## Demo kirish ma’lumotlari

### Oddiy foydalanuvchi

- Login: `ozodbek`
- Parol: `Demo2026!`

### Administrator

- Login: `admin`
- Parol: `Adolat2026!`

Production’ga chiqarishdan oldin demo hisoblarni o‘chiring yoki parollarini almashtiring.

## Demo holatlar

1. Ikki oylik ish haqi berilmagan.
2. Nuqsonli telefonni qaytarish rad etilgan.
3. Elektr uchun noto‘g‘ri qarzdorlik yozilgan.
4. Kadastr hujjati sababsiz cho‘zilgan.
5. Tibbiy xizmat bo‘yicha hujjatlar berilmagan.
6. Ma’muriy jarimaga dalillar bilan e’tiroz.

Bundan tashqari, demo foydalanuvchi kabinetida oldindan yaratilgan holatlar, faol murojaatlar va javob olingan ariza mavjud.

## Tashqi AI ulash

`.env` faylida quyidagilarni kiriting:

```env
AI_API_URL=https://provider.example/v1
AI_API_KEY=your-secret-key
AI_MODEL=your-model-name
```

Server `chat/completions` formatidagi OpenAI-compatible endpoint’ga so‘rov yuboradi. Xizmat javob bermasa, loyiha ichki demo tahlil mexanizmiga avtomatik qaytadi.

AI kalitini hech qachon `public/` ichiga yoki GitHub’ga joylamang.

## Ma’lumotlar bazasi

Baza birinchi ishga tushishda avtomatik yaratiladi:

```text
data/adolat.sqlite
```

Demo bazani qayta yaratish uchun serverni to‘xtating va quyidagi fayllarni o‘chiring:

```powershell
Remove-Item .\data\adolat.sqlite* -Force
npm start
```

## PDF va Word

- **Word yuklash** tugmasi tahrirlanadigan `.doc` hujjat yaratadi.
- **PDF saqlash / Chop etish** tugmasi brauzerning chop etish oynasini ochadi. Printer sifatida `Save as PDF` yoki `Microsoft Print to PDF` ni tanlang.

## Production sozlamalari

`.env` ichida kamida quyidagilarni o‘zgartiring:

```env
NODE_ENV=production
SESSION_SECRET=kamida-48-belgili-tasodifiy-maxfiy-qator
DB_PATH=./data/adolat.sqlite
```

Production tekshiruvi:

```text
GET /api/health
```

Server persistent diskka ega bo‘lishi kerak, aks holda SQLite bazasi qayta deploy paytida o‘chishi mumkin.

## Render yoki Railway

- Build command: bo‘sh yoki `npm test`
- Start command: `npm start`
- Node version: `22` yoki `24`
- Environment variables: `.env.example` dagi qiymatlar
- Persistent volume: `/app/data` yoki hosting platformasi ko‘rsatgan doimiy disk yo‘li
- `DB_PATH` ni persistent disk ichiga yo‘naltiring

## Tuzilma

```text
ADOLAT-MVP/
├── server.js                 # HTTP server va API route’lari
├── src/
│   ├── analyzer.js           # Demo AI tahlil va ariza generatori
│   ├── security.js           # Parol hash va cookie sessiyasi
│   └── storage.js            # SQLite schema, seed va so‘rovlar
├── public/
│   ├── index.html            # SPA karkasi va dialoglar
│   ├── app.js                # Sahifalar va frontend logikasi
│   ├── styles.css            # ADOLAT responsive dizayni
│   ├── sw.js                 # Offline static cache
│   ├── manifest.webmanifest  # PWA manifest
│   └── assets/               # Logo va app ikonkalari
├── tests/
│   └── analyzer.test.js      # Tahlil va ariza testlari
├── docs/
│   └── LOYIHA_PROMPTI.md     # Boshlang‘ich loyiha prompti
└── data/                     # Ish jarayonida SQLite baza
```

## Keyingi production bosqichlari

MVP ichida ONE ID, SMS va davlat tizimiga real yuborish xavfsiz demo sifatida taqlid qilinmagan. Ularni production bosqichida rasmiy integratsiya hujjatlari, shaxsiy ma’lumotlar auditi va vakolatli hamkor bilan qo‘shish kerak.

Qonun bazasini muntazam yangilash, barcha tavsiyalarni yurist tekshiruvidan o‘tkazish va foydalanuvchi roziligi/maxfiylik siyosatini ishlab chiqish shart.
