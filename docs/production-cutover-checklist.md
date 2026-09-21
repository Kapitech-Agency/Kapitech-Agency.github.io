# Production Cutover Checklist

The AMS production cutover gate is `GET /api/system/production-readiness`.

Before switching production to PostgreSQL, verify:

- `NODE_ENV=production`
- `APP_URL` uses HTTPS.
- `KAPITECH_DATA_SOURCE=postgres`
- `KAPITECH_DATA_ENCRYPTION_KEY` is valid.
- `KAPITECH_RELATIONAL_RECONCILIATION_VERIFIED_AT` records completed and reviewed data reconciliation.
- PostgreSQL migration prefixes 001 through 013 are present in `schema_migrations`.
- Every active AMS user has TOTP MFA enabled.
- PostgreSQL backup provider reports a backup inside the configured RPO.
- The latest restore rehearsal is still fresh.
- Durable document storage is configured, healthy, and all private documents have integrity checksums.

Application CI passing does not replace these infrastructure and operational checks.

Do not publish production traffic to PostgreSQL while the readiness endpoint returns HTTP 409 or `productionReady=false`.
