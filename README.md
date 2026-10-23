# InstituteConnect

An outreach management website based on Team T005's CS314 assignment PDF: six roles, institutions and contacts, approval-based events, registrations, attendance, outcomes, notifications and reports.

## Current release status

The live site is https://sd-project-gules.vercel.app/. It currently runs the earlier browser-local prototype. This `backend/neon` revision adds managed authentication, verified email, a central Neon database and trusted server permissions. **The backend release is awaiting encrypted deployment configuration and real-database integration verification.** See [the full PDF coverage audit](docs/requirements.md) for all 51 functional and 20 non-functional requirements and remaining checks.

## Run locally

Use Node.js 20.9+ and npm. Copy `.env.example` to `.env.local`, configure a dedicated development Neon database and Managed Neon Auth branch, and apply `db/schema.sql` with its owner connection. Create an unprivileged `ic_web` login role separately, then apply `db/runtime-grants.sql`. Never use production owner credentials as the application connection.

```bash
npm ci
npm test
npm run dev
```

The app opens on port 4173. For a production build, run `npm run build`, then `npm start`. Credentials must remain in ignored local environment files or encrypted hosting configuration.

## Accounts and roles

Sign up with your own email and password, verify the email code, then sign in. New accounts receive the Student role. Only the verified email configured as `IC_OWNER_EMAIL` receives the initial Administrator role. Administrators can assign Coordinator, Approver, Institution contact, Management or Student roles and deactivate accounts. An institution contact must be linked to a valid institution. There is no client-side role selector.

The shared workspace starts empty. Earlier fictional browser sample records are not imported automatically.

## Main workflows

1. A coordinator creates a draft, completes its information and submits it for review.
2. An approver approves or rejects it with a reason. Rejected proposals can be corrected and resubmitted.
3. The coordinator publishes the approved event. Students and relevant institution contacts can discover and register while registration is open.
4. The server checks eligibility, duplicate registration and capacity in a database transaction. Registrations and recipient-specific notifications persist across devices.
5. Coordinators can update published logistics, send in-app reminders, cancel events and inspect participant lists.
6. After an event ends, coordinators record/correct attendance and record outcomes. Reporting roles export separate event, registration, participation and outcome CSVs.
7. Administrators manage accounts, defaults and central audit records.

## Architecture

- `app/`: Next.js page, managed authentication proxy, workspace API and health endpoint.
- `app.mjs`, `styles.css`: responsive role-specific interface, forms and report downloads.
- `model.mjs`: workflow/domain rules. Seed helpers are retained for deterministic tests and are not exposed to live users.
- `lib/workspace-service.mjs`: action allowlist, server authorization, validated fields and role-based response projection.
- `lib/workspace-repository.js`: transactions, request idempotency, role lookup, central storage and audit writes.
- `db/schema.sql`: application schema, confirmed-registration uniqueness and database capacity enforcement.
- `tests/`: 41 passing domain/service checks.
- `scripts/verify-integration.mjs`: isolated real-auth/database tests, including competing users for one place and cross-device persistence.

All workspace requests require a current verified managed session. Mutations validate origin, content type and body size. Credentials remain server-only. The restricted database role cannot rewrite audit records. Database administrators retain normal privileged maintenance access.

## Vercel deployment

Use the existing sd-project Vercel project connected to this repository. Configure framework Next.js, build command `npm run build`, install command `npm ci` and no static output directory. Set encrypted server environment variables from `.env.example` for each environment. Never expose them with a `NEXT_PUBLIC_` prefix.

Production must use a restricted runtime `DATABASE_URL`. `MIGRATION_DATABASE_URL` and `IC_RUN_INTEGRATION_TESTS` belong only in the isolated verification environment; they are not required or allowed in production runtime configuration. Enable the integration runner explicitly for that environment before promoting the tested commit.

Configure the deployed origin as a trusted domain on its Neon Auth branch. `APP_ORIGIN` must match the website's origin. Set `IC_OWNER_EMAIL` to the intended first administrator's email; verification is mandatory before owner bootstrap.

## Operational limits

This is an academic working prototype. Real backend integration, deployment and production smoke checks remain pending. Response-time targets, increasing concurrency, backup restoration, uptime and Safari/Firefox/mobile compatibility need measured verification. The current workspace-wide transaction lock prioritizes consistency for a small outreach team and should be benchmarked before scaling. In-app reminders are coordinator-triggered; a background scheduler and external notification channels are optional future work.

InstituteConnect · Team T005 · CS314 Software Development Laboratory · LNMIIT, Jaipur.
