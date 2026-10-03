# Threat model

Assets are provider credentials, phone/channel identifiers, message content, account authorization, proposal integrity, and audit/export records. Trust boundaries are the public provider webhook, the Arbis browser session, the agent API, the queue/database, and support operators.

Controls in this prototype: verify raw bytes before parsing; timestamp and idempotency checks; signed expiring link state; single-use challenges; provider subject is never account proof; opt-out suppression; bounded message/media inputs; proposal digests; high-impact browser-only confirmation; audit events; and a fail-closed demo circuit for invalid requests.

Production gaps: transactional Postgres implementation, durable queue/outbox, tenant row-level isolation, external secret manager, provider-specific signature fixtures, WAF/bot controls, attachment malware scanning, SSRF proxy, key rotation, operator RBAC, alerting, and formal abuse response.
