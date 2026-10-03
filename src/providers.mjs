import { verifyWebhook } from './security.mjs';

export const providers = {
  twilio: { channels: ['sms'], verify: verifyWebhook, normalize(body) { return { id: body.MessageSid || `twilio_${Date.now()}`, provider: 'twilio', channel: 'sms', subject: body.From, body: body.Body || '', receivedAt: new Date().toISOString() }; } },
  meta: { channels: ['whatsapp'], verify: verifyWebhook, normalize(body) { const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0] || {}; return { id: message.id || `meta_${Date.now()}`, provider: 'meta', channel: 'whatsapp', subject: message.from || 'unknown', body: message.text?.body || '', receivedAt: new Date().toISOString() }; } }
};
