# Governed marketplace operations

The production-boundary workflow is \`/api/marketplace\`: safety-moderated listing → accepted offer → verified escrow → verified shipment → delivery/dispute → settlement/refund. Creation requires bearer auth, \`x-tenant-id\`, and \`idempotency-key\`; roles live in \`marketplace_memberships\`. Impact values require an explicit factor version and fail closed when a material factor is absent.

Identity, escrow, shipping, maps, catalog, and messaging requests are queued in \`marketplace_outbox\`. Real provider adapters, fraud review, regulated-product exclusions, refund policy, chain-of-custody procedures, and independently reviewed impact factors remain launch blockers.

## Safe lifecycle

1. Copy `.env.example` to `.env` and replace every placeholder.
2. Run `scripts/bootstrap.sh` once to install locked dependencies.
3. Run `scripts/migrate.sh` explicitly against the intended database.
4. Provision tenant memberships through an audited administrator process.
5. Run `./start.sh`; it never installs, seeds, migrates, starts PostgreSQL, or kills ports.

Legacy seed data is demo-only. Where `scripts/seed-demo.sh` exists it requires `CONFIRM_DEMO_SEED=yes` and refuses production. External provider calls and production data were not exercised by this implementation.
