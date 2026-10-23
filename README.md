# InstituteConnect

A complete, interactive **academic prototype** of the Admissions and Outreach Management System described in Team T005's CS314 assignments, The LNM Institute of Information Technology, Jaipur.

## Run locally

Requires Node.js 20+ and a modern browser. No npm dependencies or API keys are required.

```bash
npm test
npm run build
npx serve dist
```

Alternatively, after building, serve `dist/` with any static web server. Do not open `index.html` directly as a file; ES modules need HTTP(S).

## Explore the prototype

Select one of the six demo accounts on the welcome screen. No password is required; this is explicitly simulated role selection, not secure authentication.

| Role | Main workflows |
| --- | --- |
| Outreach Coordinator | Event drafts, submission, publication, cancellation, institutions and contacts, registration lists, attendance, outcomes and reports |
| Outreach Approver | Review proposals, approve/reject with comments, review decision history |
| Prospective Student | Discover published events, search/filter, register, cancel, view confirmations and notifications |
| Institution Contact | View institution-relevant events, register on behalf of the demo institution, inspect contacts and engagement history |
| Administrator | Coordinator tools plus approval, user role/status management and audit log |
| Institute Management | Aggregate dashboards and CSV reports |

### Suggested demonstration

1. Enter as Coordinator. Create an event with a future date, valid registration period, venue, description and capacity. Save the draft and submit it for approval.
2. Switch to Approver, open Approvals, and approve the proposal. Rejecting instead requires a reason; rejected proposals can be edited and resubmitted.
3. Switch to Coordinator and publish the approved event.
4. Switch to Student and register. A confirmation appears in Registrations and Notifications. Duplicate, capacity, date and eligibility checks run before confirmation.
5. Switch to Coordinator and review the participant list. Send in-app reminders or cancel an event to notify affected participants.
6. Use the seeded, completed **Engineering Outreach Workshop** for attendance and outcome recording. Reusing an event/participant/activity combination corrects attendance rather than duplicating it.
7. Open Reports and export the event summary, or export the registration list. Open Administrator to test role management and inspect the audit log.

## Working features

- Responsive dashboard, six role-specific workspaces and mobile navigation.
- Complete event form: category, description, date/time, mode/venue, organizer, target institutions, registration dates, capacity, eligibility and instructions.
- Draft → Pending → Approved → Published → Completed lifecycle, rejection/resubmission and cancellation.
- Institution/contact creation and editing, designated primary contacts, search, relationships and engagement history.
- Student/institution registrations, cancellation, duplicate prevention, capacity limits, registration period and eligibility validation.
- Finished-event attendance recording/correction, scoped student participation history and event outcome records.
- In-app registration, approval, published-event-update, reminder and cancellation notifications, with read/unread status.
- Dynamic charts, dashboards, separate registration/event/participation/outcome CSVs and print-friendly reports.
- Administrator role/status controls, event defaults, account profile maintenance and an audit trail.
- Browser persistence and cross-tab refresh.
- Static deployment configuration for Vercel, security response headers, escaped user content and CSV formula neutralization.

## Prototype boundaries

**This is a browser-local demonstration, not a production admissions system.** All records live in `localStorage` on the current browser/origin, while demo login uses `sessionStorage`. They persist across refreshes, but different devices and deployment domains do not share data. Clearing site storage resets the sample workspace. An administrator can export a JSON backup from Settings before clearing it. Sample dates are relative to the first visit.

Demo roles and model permission checks illustrate the requirements; they are **not a security boundary**. Anyone with this static app can inspect its bundled fictional records and change their browser state. Do not enter real student records, passwords, or sensitive information. Real authentication, server-enforced authorization, a central transactional database, concurrent registration protection, background reminders and email/SMS delivery require a backend implementation. Notifications here are in-app; coordinators trigger reminders manually. Backup download is provided; importing backups is not implemented.

The PDF’s real authentication, central database, security and concurrent-user requirements remain incomplete. In-app notifications work; the PDF does not mandate external email/SMS or password recovery. See the complete [51-requirement coverage audit](docs/requirements.md) for implemented, simulated and incomplete items.

## Focused improvements after PDF audit

Published event logistics can now change with in-app notifications to confirmed participants; approved audience/content/capacity remain fixed. Registration availability is shown explicitly. Students can inspect their own attendance. Coordinators can correct attendance directly and export dedicated participation/outcome reports. Institution primary contacts and administrator event defaults complete relevant PDF responsibilities. Attendance/outcome/completion actions wait until the scheduled event end. Existing browser records migrate without clearing registrations.

## Architecture and verification

- `model.mjs`: domain entities, workflow/role rules, deterministic seeded data and notifications.
- `app.mjs`: interface rendering, forms, accessible dialogs, downloads and browser persistence.
- `styles.css`: responsive design, dashboard and print styles.
- `scripts/build.mjs`: reproducible, dependency-free static build to `dist/`.
- `tests/workspace.test.mjs`: domain tests for lifecycle, permissions, dates, registration, capacity, cancellation, attendance, outcomes and account controls.
- `docs/requirements.md`: requirement traceability and known limitations.

Validation: `npm test` runs 31 tests. The create → submit → approve → publish → student registration workflow was also verified through the browser UI. Browser QA caught and fixed compatibility with preview environments where `crypto.randomUUID` is unavailable.

## Deploy on Vercel

Import `divbytes-prog/sd-project` into Vercel. The repository includes `vercel.json` with framework **Other**, build command `npm run build`, and output directory `dist`. No environment variables are needed. Use `main` as the production branch. The linked Vercel Git integration can deploy later commits automatically.

## Project attribution

InstituteConnect · Team T005 · CS314 Software Development Laboratory · LNMIIT, Jaipur.

The implementation follows the supplied assignment document. All preloaded contact details and account emails are fictional demonstration data.
