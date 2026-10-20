import { createHmac, timingSafeEqual } from 'node:crypto';

const cookieName = 'hospital_history';
const hours = 8 * 60 * 60;
const sign = (value, secret) => createHmac('sha256', secret).update(value).digest('hex');
const equal = (a, b) => {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
};

export function passwordMatches(value) {
  const password = process.env.HISTORY_ACCESS_PASSWORD;
  return typeof value === 'string' && Boolean(password && password.length >= 12) && equal(value, password);
}

export function authenticated(req) {
  const password = process.env.HISTORY_ACCESS_PASSWORD;
  if (!password || password.length < 12) return false;
  const cookie = (req.headers.cookie || '').split(';').map((part) => part.trim()).find((part) => part.startsWith(`${cookieName}=`));
  if (!cookie) return false;
  const [expires, signature = ''] = cookie.slice(cookieName.length + 1).split('.');
  return /^\d+$/.test(expires) && Number(expires) > Date.now() && equal(signature, sign(expires, password));
}

export function sessionCookie(clear = false) {
  const expires = String(Date.now() + hours * 1000);
  const value = clear ? '' : `${expires}.${sign(expires, process.env.HISTORY_ACCESS_PASSWORD)}`;
  const secure = process.env.VERCEL || process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${cookieName}=${value}; HttpOnly; SameSite=Strict; Path=/api; Max-Age=${clear ? 0 : hours}${secure}`;
}

export function sameOrigin(req) {
  try { return new URL(req.headers.origin).host === req.headers.host; } catch { return false; }
}
