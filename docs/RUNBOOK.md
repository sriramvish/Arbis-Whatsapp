# Private deployment and rollback runbook

1. Provision private Postgres, durable queue/outbox, secret manager, WAF, and log redaction.
2. Apply `db/001_initial.sql`, run unit/integration/adversarial tests, and validate provider sandbox fixtures.
3. Configure secrets by reference, never in `.env` or source control. Enable one tenant in shadow mode.
4. Gate live ingress behind the feature flags described in `src/config.mjs`; monitor delivery, opt-outs, quarantine, spend, and queue lag.
5. Roll back by disabling ingress, draining outbound work, preserving audit/export records, reverting the application image, and only then applying a backwards-compatible migration rollback.

Open decisions: GitHub organization/visibility, hosted identity provider, queue/database vendor, agent API contract, retention periods by jurisdiction, support SLA, and counsel/provider approval.
