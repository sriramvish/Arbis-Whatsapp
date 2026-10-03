# Arbis Messaging Agent

Private, provider-neutral prototype for safe SMS and WhatsApp conversations with an Arbis agent. This repository is self-contained and contains no Canonical customer data, credentials, trademarks, deployment coupling, or live-provider calls.

## Working vertical slice

`npm run dev` starts a responsive Arbis web surface and a dependency-free Node API. The demo supports:

- SMS and WhatsApp sandbox adapters with raw-body HMAC verification, timestamp checks, replay protection, idempotency, and outbound delivery simulation.
- Phone linking with a short-lived, single-use challenge, signed state, explicit consent, unlinking, and independent-link audit notifications.
- Normal messages, a safe configuration draft/preview flow, confirmation/correction/cancellation, and escalation. High-impact changes are browser-only.
- STOP/START/HELP, quiet-hours and opt-out suppression, delivery status, export/deletion requests, attachment and SSRF-safe media checks, rate limits, abuse quarantine, and spend circuit breakers.
- A Postgres-ready schema, OpenAPI contract, JSON Schemas, Docker Compose, demo data, adversarial tests, and a rollout/rollback runbook.

## Run

```sh
npm test
npm run check
npm run dev
```

Then open http://localhost:8787. The demo uses in-memory storage; production must use the SQL schema plus a transactional inbox/outbox and external secret manager.

## Provider onboarding

Set up provider apps and approved sender identities only after legal/provider review. Configure webhook URLs for `/webhooks/v1/twilio-sms` and `/webhooks/v1/meta-whatsapp`, store secrets in a vault, and validate official provider fixtures before enabling live ingress. Provider adapters are replaceable behind `src/providers.mjs`.

## Safety gates and limitations

This is not production-authorized messaging software. Legal counsel/provider approval is required for consent language, quiet hours, regional retention, minors, automated decisioning, WhatsApp templates, A2P registration, and country-specific messaging law. Paid traffic, cloud resources, DNS, and provider accounts are intentionally untouched.

## Provenance and license inventory

See `docs/PROVENANCE.md`. The implementation is original Arbis code informed by publicly reusable safety patterns in the supplied reference service. No source files or Canonical data/secrets were copied into this repository.

## Deploy/rollback

See `docs/RUNBOOK.md`. Recommended repository name: `arbis-messaging-agent-prototype`; visibility should be **private** until the Arbis team confirms the owning GitHub organization and access policy. No remote was created because that decision was not supplied.
