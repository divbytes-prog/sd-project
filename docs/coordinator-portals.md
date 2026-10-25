# Student and coordinator portals

The existing application is Next.js with a client-rendered workspace in app.mjs, shared domain rules in model.mjs, server authorization/projection in lib/workspace-service.mjs, a transactional Neon repository, and managed Neon Auth. The established light/dark theme, profile controls, student event cards and registration flow are retained.

## Entry and access

The first screen offers Prospective Student and Outreach Coordinator. The selection is retained as a non-sensitive session preference. A Back action changes it. It never assigns a role or bypasses email/password authentication or email verification. New accounts start as Student; an existing administrator assigns Coordinator access through Users. Do not share demonstration passwords.

The Coordinator choice also serves the pre-existing Administrator, Approver and Management accounts. No additional public login choice or new reviewer role was introduced. Existing roles remain available to preserve the original PDF workflows. Only authorized reviewers can start or decide review; coordinators cannot approve their own proposals.

Requests carry the selected portal and the server checks it against the current assigned role. Current identity, account activity, event ownership and operation permissions are checked independently. Coordinator snapshots and exports include only their managed events, related registrations, participation and outcomes. Institutions and contacts remain the shared outreach directory.

## Coordinator workflow

Dashboard summary cards, upcoming events, recent changes and awaiting-review proposals use current database records. The sidebar exposes event management, Create Event, institutions/contacts, registrations, participation, outcomes/reports and logout. Empty workspaces show explanatory states.

The existing event dialog adds linked contact selection, Other category, Save as Draft and Submit for Approval. Submission validates and persists atomically: an invalid proposal does not leave a partially created event. Existing field values remain in the dialog after an error. Drafts require a title and positive capacity; other fields can remain incomplete. Only valid proposals enter Submitted (the stored Pending status). Existing Pending records remain compatible; Under Review is now an explicit state begun by an authorized reviewer. Rejection comments remain visible, and only approved events can be published.

Event lists include date, time, location, target institutions, occupancy and actions. Search/category/status/date filters apply to authorized records. Registration views filter by event and status, show registration dates and authorized participant details, and export the filtered records. Institution/contact search includes institution type and relationship filters, duplicate checks, valid contact emails and optional phone validation.

Attendance retains its existing post-event and confirmed-participant checks. Outcomes now also record participants reached, follow-up required and notes; reports keep CSV and print support.

## Configuration and limits

All deployed access uses managed Neon Auth and the shared database. Missing configuration fails closed with a service error. The previously merged credential-free fallback is disabled; it cannot silently substitute for production authentication or persistence. The merged theme, profile and metadata improvements are retained.

There is no background approval service: a pre-existing authorized reviewer/administrator must make an actual decision. The app does not simulate approval or grant coordinator status during signup. Mobile layouts and keyboard-labelled controls use the existing responsive style. Long-term availability, larger-load benchmarking and broader browser/device certification retain their previously documented limits.

## Validation

53 automated domain/service checks and 20 isolated real-auth/database checks pass. The live checks cover portal mismatch denial, coordinator draft/submission, explicit authorized review, approved publication, student registration, ownership scoping, last-seat concurrency, persistence, notifications and session revocation. The Next.js production build passes. No lint command is configured.

The production role chooser, coordinator sign-in destination, Back action and student sign-in entry were checked in Chrome. Authenticated student/coordinator journeys were exercised through real API sessions, not through interactive browser credential entry. Additional mobile/device/browser certification remains unverified. The local preview daemon appends flags incompatible with Next.js, so browser entry checks used the deployed public site. Hosting preview protection remains enabled.
