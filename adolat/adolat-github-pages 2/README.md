# ADOLAT

O‘zbekiston fuqarolari uchun server va ro‘yxatdan o‘tishni talab qilmaydigan statik huquqiy yordamchi.

## Ishga tushirish

Fayllarni oddiy statik server orqali oching yoki repozitoriyni GitHub Pages’ga ulang. Hech qanday build bosqichi va tashqi kutubxona kerak emas.

## Tuzilma

- `index.html` — semantik sahifa va barcha asosiy komponentlar.
- `assets/css/styles.css` — mobile-first dizayn, dark mode va printga mos UI.
- `assets/js/content.js` — har bir yo‘nalish uchun 5 tadan modda, kalit iboralar, idoralar, eskalatsiya va muddatlar.
- `assets/js/i18n.js` — ro‘yxatdan o‘tish, lokal profil hamda O‘zbek/Rus/Ingliz/Qoraqalpoq interfeysi.
- `assets/js/app.js` — vaziyatga mos modda tanlash, shaxsiy reja, PDF/Word hujjat generatori va localStorage.
- `assets/images/adolat-logo.png` — foydalanuvchi taqdim etgan ADOLAT logotipi.

## Kontentni yangilash

Qonun yoki idora ma’lumoti o‘zgarsa, `assets/js/content.js` ichidagi tegishli yo‘nalishni yangilang va `updated` sanasini almashtiring. Har bir `laws` yozuvidagi `keywords` foydalanuvchi vaziyatiga mos moddalarni tanlash uchun ishlatiladi. Huquqiy kontentni nashrdan oldin mutaxassis tekshiruvidan o‘tkazish tavsiya etiladi.

## Maxfiylik

Kiritilgan ma’lumotlar tarmoqqa yuborilmaydi. Saqlangan murojaatlar faqat brauzerning `localStorage` xotirasida qoladi.

Ro‘yxatdan o‘tish lokal profil yaratadi; haqiqiy SMS/OTP tasdiqlash uchun alohida backend va SMS provayder integratsiyasi kerak.
