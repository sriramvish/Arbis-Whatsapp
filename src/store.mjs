import { digest, hashSubject } from './security.mjs';

export class Store {
  constructor() { this.bindings = new Map(); this.receipts = new Map(); this.messages = []; this.audit = []; this.proposals = new Map(); this.challenge = null; this.optedOut = new Set(); this.escalations = []; }
  event(type, metadata = {}) { this.audit.push({ id: `audit_${this.audit.length + 1}`, type, metadata, at: new Date().toISOString() }); }
  createChallenge(phone, secret) { const id = `link_${Date.now()}`; this.challenge = { id, phone, token: `${id}_demo`, exp: Date.now() + 300000, used: false }; this.event('link.challenge_created', { id }); return this.challenge; }
  consumeChallenge(token, phone) { if (!this.challenge || this.challenge.token !== token || this.challenge.phone !== phone || this.challenge.used || this.challenge.exp < Date.now()) throw new Error('invalid or expired link challenge'); this.challenge.used = true; const binding = { id: `binding_${Date.now()}`, channel: 'sms', phone, subjectHash: hashSubject(phone), permissions: ['agent:chat', 'config:propose'], status: 'active', linkedAt: new Date().toISOString() }; this.bindings.set(binding.id, binding); this.event('link.created', { bindingId: binding.id }); return binding; }
  addMessage(direction, channel, body, status = 'delivered') { const row = { id: `msg_${this.messages.length + 1}`, direction, channel, body, status, at: new Date().toISOString() }; this.messages.push(row); return row; }
  proposal(summary, impact = 'low') { const id = `proposal_${this.proposals.size + 1}`; const row = { id, summary, impact, digest: digest(`${id}:${summary}`), status: 'draft', createdAt: new Date().toISOString() }; this.proposals.set(id, row); this.event('proposal.created', { id, impact }); return row; }
  confirm(id, expectedDigest) { const p = this.proposals.get(id); if (!p || p.digest !== expectedDigest) throw new Error('proposal digest mismatch'); if (p.impact === 'high') throw new Error('high-impact changes require browser confirmation'); p.status = 'confirmed'; this.event('proposal.confirmed', { id }); return p; }
  unlink(id) { const b = this.bindings.get(id); if (!b) throw new Error('binding not found'); b.status = 'revoked'; b.revokedAt = new Date().toISOString(); this.event('link.revoked', { id }); return b; }
  state() { return { bindings: [...this.bindings.values()], messages: this.messages, proposals: [...this.proposals.values()], audit: this.audit.slice(-8), escalations: this.escalations, optedOut: this.optedOut.size > 0 }; }
}
