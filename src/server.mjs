import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Store } from './store.mjs';
import { providers } from './providers.mjs';
import { verifyWebhook } from './security.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(root, '..', 'public');
const store = new Store();
const secret = process.env.WEBHOOK_SIGNING_SECRET || 'local-demo-secret';
const sendJson = (res, status, body) => { res.writeHead(status, {'content-type':'application/json; charset=utf-8', 'cache-control':'no-store'}); res.end(JSON.stringify(body)); };
async function body(req) { const chunks = []; for await (const c of req) chunks.push(c); return Buffer.concat(chunks); }
async function handler(req, res) {
  const url = new URL(req.url, 'http://localhost');
  try {
    if (req.method === 'GET' && url.pathname === '/api/state') return sendJson(res, 200, store.state());
    if (req.method === 'POST' && url.pathname === '/api/link/challenge') { const p = JSON.parse((await body(req)).toString() || '{}'); return sendJson(res, 200, store.createChallenge(p.phone || '+15555550100', secret)); }
    if (req.method === 'POST' && url.pathname === '/api/link/complete') { const p = JSON.parse((await body(req)).toString() || '{}'); return sendJson(res, 200, store.consumeChallenge(p.token, p.phone)); }
    if (req.method === 'POST' && url.pathname === '/api/link/unlink') { const p = JSON.parse((await body(req)).toString() || '{}'); return sendJson(res, 200, store.unlink(p.id)); }
    if (req.method === 'POST' && url.pathname === '/api/messages') { const p = JSON.parse((await body(req)).toString() || '{}'); const bodyText = String(p.body || '').trim(); if (!bodyText || bodyText.length > 4096) return sendJson(res, 400, {error:'message must be 1-4096 chars'}); if (/^stop$/i.test(bodyText)) store.optedOut.add(p.channel || 'sms'); if (/^start$/i.test(bodyText)) store.optedOut.delete(p.channel || 'sms'); const msg = store.addMessage('inbound', p.channel || 'sms', bodyText, 'received'); if (/\b(change|update|configure|set)\b/i.test(bodyText)) store.proposal(`Draft requested: ${bodyText}`, /delete|payment|security/i.test(bodyText) ? 'high' : 'low'); if (/\bperson|human|support\b/i.test(bodyText)) { store.escalations.push({id:`esc_${store.escalations.length+1}`, status:'open', reason:bodyText}); store.event('escalation.opened', {reason:bodyText}); } return sendJson(res, 200, {message: msg, state: store.state()}); }
    if (req.method === 'POST' && url.pathname.startsWith('/api/proposals/') && url.pathname.endsWith('/confirm')) { const p = JSON.parse((await body(req)).toString() || '{}'); const id = url.pathname.split('/')[3]; return sendJson(res, 200, store.confirm(id, p.digest)); }
    if (req.method === 'POST' && url.pathname === '/api/export') return sendJson(res, 200, {exportId:`export_${Date.now()}`, status:'queued', note:'Production export must be generated from encrypted storage.'});
    if (req.method === 'POST' && url.pathname === '/api/delete') { store.event('privacy.deletion_requested'); return sendJson(res, 202, {status:'queued'}); }
    const match = url.pathname.match(/^\/webhooks\/v1\/(twilio|meta)$/);
    if (req.method === 'POST' && match) { const raw = await body(req); const key = req.headers['x-idempotency-key'] || `${match[1]}:${raw.toString('base64')}`; const prior = store.receipts.get(key); const d = verifyWebhook(raw, req.headers['x-arbis-signature'], secret); if (prior && prior !== d) return sendJson(res, 409, {error:'idempotency conflict'}); if (prior) return sendJson(res, 202, {duplicate:true}); store.receipts.set(key, d); const event = providers[match[1]].normalize(JSON.parse(raw.toString())); if (store.optedOut.has(event.channel)) return sendJson(res, 202, {suppressed:true}); store.addMessage('inbound', event.channel, event.body, 'received'); store.event('webhook.accepted', {provider:match[1], id:event.id}); return sendJson(res, 202, {accepted:true, eventId:event.id}); }
    if (req.method === 'GET') { let file = url.pathname === '/' ? '/index.html' : url.pathname; if (!file.includes('..')) { const data = await fs.readFile(path.join(publicDir, file)); const type = file.endsWith('.css') ? 'text/css' : file.endsWith('.js') ? 'text/javascript' : 'text/html'; res.writeHead(200, {'content-type':`${type}; charset=utf-8`}); return res.end(data); } }
    sendJson(res, 404, {error:'not found'});
  } catch (e) { sendJson(res, 400, {error:e.message}); }
}
if (process.argv[1] === fileURLToPath(import.meta.url)) { const port = Number(process.env.PORT || 8787); http.createServer(handler).listen(port, () => console.log(`Arbis demo listening on http://localhost:${port}`)); }
export { handler, store };
