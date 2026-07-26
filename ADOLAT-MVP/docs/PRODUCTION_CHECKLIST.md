# Production checklist

- [ ] Demo foydalanuvchilar va parollar almashtirildi.
- [ ] `SESSION_SECRET` kuchli tasodifiy qiymatga o‘zgartirildi.
- [ ] HTTPS yoqildi va `NODE_ENV=production` o‘rnatildi.
- [ ] SQLite uchun persistent disk ulandi yoki PostgreSQL’ga migratsiya qilindi.
- [ ] Qonun kontenti amaldagi LexUZ manbalari bo‘yicha yurist tomonidan tekshirildi.
- [ ] Maxfiylik siyosati va foydalanuvchi roziligi tasdiqlandi.
- [ ] Nozik ma’lumotlarni maskalash va ma’lumotlarni saqlash muddati belgilandi.
- [ ] AI provayderi bilan ma’lumotlarni qayta ishlash shartlari tekshirildi.
- [ ] ONE ID, SMS va davlat portallari integratsiyasi faqat rasmiy ruxsat bilan qo‘shildi.
- [ ] `/api/health`, login, tahlil, ariza va admin oqimlari production’da sinovdan o‘tkazildi.
