import { createHmac, timingSafeEqual } from 'node:crypto';
function sign(value: string) { const secret = process.env.SUPABASE_SERVICE_ROLE_KEY; if (!secret) throw new Error('Server credentials missing'); return createHmac('sha256', secret).update('landing-visit:' + value).digest('hex'); }
export function createVisitToken(now = Date.now()) { const expires = String(now + 60 * 60 * 1000); return `${expires}.${sign(expires)}`; }
export function validVisitToken(token: unknown, now = Date.now()) {
  if (typeof token !== 'string' || !/^\d{13}\.[a-f0-9]{64}$/.test(token)) return false;
  const [expires, signature] = token.split('.');
  if (Number(expires) < now || Number(expires) > now + 60 * 60 * 1000) return false;
  return timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(sign(expires), 'hex'));
}

