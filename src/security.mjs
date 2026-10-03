import crypto from 'node:crypto';

export function digest(value) { return crypto.createHash('sha256').update(value).digest('hex'); }
export function signState(payload, secret) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${body}.${crypto.createHmac('sha256', secret).update(body).digest('base64url')}`;
}
export function verifyState(token, secret, now = Date.now()) {
  const [body, sig] = String(token).split('.');
  if (!body || !sig) throw new Error('invalid state');
  const expected = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) throw new Error('invalid state');
  const payload = JSON.parse(Buffer.from(body, 'base64url'));
  if (payload.exp < now) throw new Error('expired state');
  return payload;
}
export function verifyWebhook(raw, header, secret, now = Date.now()) {
  const match = String(header || '').match(/^v1=(\d+):([a-f0-9]+)$/i);
  if (!match || Math.abs(now - Number(match[1]) * 1000) > 300000) throw new Error('stale or malformed signature');
  const expected = crypto.createHmac('sha256', secret).update(`${match[1]}.${raw}`).digest('hex');
  if (expected.length !== match[2].length || !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(match[2]))) throw new Error('invalid signature');
  return digest(raw);
}
export function hashSubject(subject) { return crypto.createHash('sha256').update(subject).digest('hex'); }
