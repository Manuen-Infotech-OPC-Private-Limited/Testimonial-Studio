import crypto from 'crypto';

export const SESSION_COOKIE_NAME = 'ts_session';
export const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret || secret.length < 32) {
    throw new Error(
      'FATAL: JWT_SECRET environment variable must be configured (minimum 32 characters).'
    );
  }
  return secret;
}

export function assertSecurityConfig() {
  return getJwtSecret();
}

export function isSecureRequest(req) {
  const forwardedProto = String(req.headers['x-forwarded-proto'] || '')
    .split(',')[0]
    .trim()
    .toLowerCase();
  return Boolean(
    req.secure ||
      forwardedProto === 'https' ||
      process.env.COOKIE_SECURE === 'true'
  );
}

export function parseCookies(cookieHeader) {
  const cookies = {};
  if (typeof cookieHeader !== 'string' || !cookieHeader) return cookies;
  for (const part of cookieHeader.split(';')) {
    const eqIdx = part.indexOf('=');
    if (eqIdx === -1) continue;
    const key = part.slice(0, eqIdx).trim();
    const val = part.slice(eqIdx + 1).trim();
    if (!key) continue;
    try {
      cookies[key] = decodeURIComponent(val);
    } catch {
      cookies[key] = val;
    }
  }
  return cookies;
}

export function extractSessionToken(req) {
  const cookies = parseCookies(req.headers.cookie);
  if (cookies[SESSION_COOKIE_NAME]) {
    return cookies[SESSION_COOKIE_NAME];
  }
  const authHeader = req.headers.authorization || '';
  return authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
}

function isCrossOriginHttpsRequest(req) {
  const origin = typeof req.headers.origin === 'string' ? req.headers.origin : '';
  const host = typeof req.get === 'function' ? req.get('host') : req.headers.host;
  if (!origin || !host) return false;
  try {
    const originUrl = new URL(origin);
    return originUrl.protocol === 'https:' && originUrl.host !== host && isSecureRequest(req);
  } catch {
    return false;
  }
}

export function getSessionCookieOptions(req) {
  const envSameSite = process.env.COOKIE_SAME_SITE?.trim().toLowerCase();
  const useSameSiteNone =
    envSameSite === 'none' ||
    (!envSameSite && isCrossOriginHttpsRequest(req));

  return {
    httpOnly: true,
    sameSite: useSameSiteNone ? 'none' : envSameSite === 'strict' ? 'strict' : 'lax',
    secure: useSameSiteNone ? true : isSecureRequest(req),
    path: '/',
  };
}

export function setSessionCookie(req, res, token) {
  res.cookie(SESSION_COOKIE_NAME, token, {
    ...getSessionCookieOptions(req),
    maxAge: SESSION_TTL_SECONDS * 1000,
  });
}

export function clearSessionCookie(req, res) {
  res.clearCookie(SESSION_COOKIE_NAME, getSessionCookieOptions(req));
}

export function normalizeMobileNumber(raw) {
  if (typeof raw !== 'string') return '';
  const cleaned = raw.trim().replace(/[\s\-().]/g, '');
  if (cleaned.startsWith('+')) {
    return '+' + cleaned.slice(1).replace(/\D/g, '');
  }
  return cleaned.replace(/\D/g, '');
}

export function isValidMobileNumber(mobile) {
  return /^\+?\d{10,15}$/.test(mobile);
}

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, keyHex] = storedHash.split(':');
  if (!salt || !keyHex) return false;
  const derived = crypto.scryptSync(password, salt, 64);
  const keyBuf = Buffer.from(keyHex, 'hex');
  if (derived.length !== keyBuf.length) return false;
  return crypto.timingSafeEqual(derived, keyBuf);
}

function toBase64Url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function fromBase64Url(input) {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((input.length + 3) % 4);
  return Buffer.from(padded, 'base64').toString('utf8');
}

export function signJwt(payload, expiresInSeconds = SESSION_TTL_SECONDS) {
  const header = toBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const now = Math.floor(Date.now() / 1000);
  const body = toBase64Url(
    JSON.stringify({
      ...payload,
      jti: payload?.jti || crypto.randomUUID(),
      iat: now,
      exp: now + expiresInSeconds,
    })
  );
  const signingInput = `${header}.${body}`;
  const sig = crypto
    .createHmac('sha256', getJwtSecret())
    .update(signingInput)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${signingInput}.${sig}`;
}

export function verifyJwt(token) {
  if (typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [header, body, sig] = parts;
  const signingInput = `${header}.${body}`;
  const expectedSig = crypto
    .createHmac('sha256', getJwtSecret())
    .update(signingInput)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }

  try {
    const parsedHeader = JSON.parse(fromBase64Url(header));
    if (parsedHeader?.alg !== 'HS256') {
      return null;
    }
    const decoded = JSON.parse(fromBase64Url(body));
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

