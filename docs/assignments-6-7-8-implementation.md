# Assignments 6, 7 and 8: implementation map

The existing repository already contains the design classes and UI. This revision
closes a live registration-time gap and a hosted-configuration fallback gap.

| Assignment area | Implementation path | Verification / limits |
| --- | --- | --- |
| 6: design/domain classes | model.mjs; lib/design-services.mjs | Existing design adapter tests plus live domain tests. Helpers are not independent authentication providers. |
| 6: layered architecture | app.mjs -> app/api/workspace/route.js -> lib/workspace-service.mjs -> lib/workspace-repository.js -> Neon PostgreSQL | Existing runtime path retained. New build/HTTP checks do not claim a new real-database integration run. |
| 7: interfaces/screens | Coordinator event form, participant event details, Approver workflow | Optional registration times are now editable and visible in IST. Blank times preserve older date-only records. |
| 7: component validation | lib/registration-window.mjs; Workspace.register/registrationState; executeAction saveEvent | Same helper used by runtime state display and registration decision; new live-path checks pass. |
| 7: authentication/access | lib/auth.js; lib/local-auth-handler.js; lib/runtime-config.mjs | Missing hosted configuration fails closed. Password-free demo is explicitly local-development only. |
| 7: persistence and role control | lib/workspace-repository.js; db/schema.sql | No migration or production data seeding in this revision; existing transaction/participation-review design retained. |
| 8: traceable service tests | tests/assignment-08.test.mjs | 28 passing service-adapter checks, not 28 browser system tests. |
| 8: live-path regressions | tests/registration-window.test.mjs; tests/runtime-config.test.mjs | 14 additional passing checks; full suite 106 passing. |
| 8: execution/reporting | docs/testing/assignment-08/Test-Execution-Report.md; scripts/smoke-http.mjs | Actual measured totals, scope limits, RTM and six HTTP guards documented. |
| CI / deploy | .github/workflows/verify.yml; vercel.json | Node 22/24 tests, Node 24 build and HTTP guards. Deploy through the existing sd-project Vercel project. |

## Remaining application acceptance

The live application currently routes participation requests through approval,
while the older design adapter immediately marks a registration Confirmed.
This change preserves the live review behavior. Service-adapter success must
not be presented as proof of that full user journey.

The current revision does not add out-of-scope waitlists or invent quantitative
performance requirements. Authenticated cross-device UI acceptance and a fresh
isolated real-database integration run still need their own evidence.

The supplied combined PDF's original Assignments 1-7 are unchanged.
