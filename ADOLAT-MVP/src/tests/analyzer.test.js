import assert from 'node:assert/strict';
import test from 'node:test';
import { analyzeSituation, buildApplicationDraft } from '../src/analyzer.js';

test('mehnat holatini aniqlaydi', () => {
  const result = analyzeSituation('Ish beruvchi ikki oylik maoshimni bermadi, mehnat shartnomam va bank ko‘chirmam bor.');
  assert.equal(result.category, 'mehnat');
  assert.ok(result.strength >= 70);
  assert.match(result.authority, /mehnat/i);
});

test('iste’molchi holatini aniqlaydi', () => {
  const result = analyzeSituation('Do‘kondan buzuq telefon sotib oldim, chek va kafolat bor, pulni qaytarishmayapti.');
  assert.equal(result.category, 'istemolchi');
});

test('ariza loyihasini yaratadi', () => {
  const analysis = analyzeSituation('Elektr uchun noto‘g‘ri qarzdorlik yozilgan, to‘lov cheklarim bor.');
  const draft = buildApplicationDraft({
    analysis,
    description: 'Elektr uchun noto‘g‘ri qarzdorlik yozilgan.',
    profile: { name: 'Demo Foydalanuvchi', phone: '+998 90 000 00 00' },
  });
  assert.match(draft.body, /SO‘RAYMAN/);
  assert.match(draft.body, /Demo Foydalanuvchi/);
});
