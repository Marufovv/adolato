import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;

export function hashPassword(password, salt = randomBytes(16).toString('hex')) {
  const hash = scryptSync(String(password), salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  try {
    const [salt, expectedHex] = String(stored).split(':');
    if (!salt || !expectedHex) return false;
    const actual = scryptSync(String(password), salt, 64);
    const expected = Buffer.from(expectedHex, 'hex');
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

function b64url(value) {
  return Buffer.from(value).toString('base64url');
}

export function createSessionToken(user, secret) {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: user.id,
    role: user.role,
    username: user.username,
    iat: now,
    exp: now + TOKEN_TTL_SECONDS,
  };
  const encoded = b64url(JSON.stringify(payload));
  const signature = createHmac('sha256', secret).update(encoded).digest('base64url');
  return `${encoded}.${signature}`;
}

export function verifySessionToken(token, secret) {
  try {
    const [encoded, signature] = String(token || '').split('.');
    if (!encoded || !signature) return null;
    const expected = createHmac('sha256', secret).update(encoded).digest('base64url');
    const actualBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);
    if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) return null;
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function parseCookies(header = '') {
  return Object.fromEntries(
    String(header)
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const index = part.indexOf('=');
        if (index < 0) return [part, ''];
        return [decodeURIComponent(part.slice(0, index)), decodeURIComponent(part.slice(index + 1))];
      }),
  );
}

export function sessionCookie(token, isProduction = false) {
  const secure = isProduction ? '; Secure' : '';
  return `adolat_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${TOKEN_TTL_SECONDS}${secure}`;
}

export function clearSessionCookie(isProduction = false) {
  const secure = isProduction ? '; Secure' : '';
  return `adolat_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}
