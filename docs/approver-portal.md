# Approver portal and registration decisions

## Architecture and scope

This extends the existing Next.js application, client-rendered workspace, managed Neon authentication, JSON workspace repository, registration index and transaction lock. The Student and Coordinator portals, existing event-proposal review and sample data are retained. No new authentication provider, credentials or database is introduced.

Administrators assign the existing Approver role through Users. A user first creates and verifies their own account as a Student; an administrator then assigns Approver. Select the new Approver portal and sign in using that account. Administrators are also authorized to review. Selecting the portal never grants the role. There are no default approver credentials and no public approver signup.

## Workflow

New participation submissions use the existing registration record with status Pending. They do not reserve capacity. Only acceptance changes the status to Approved and confirms a place. Rejection sets Rejected, with an optional reason. Both decisions record reviewedBy and reviewedAt, create an audit record and use the existing in-app notification infrastructure. Existing Confirmed records are treated as Approved, retain their places and have no fabricated reviewer metadata. No historical record is deleted or forced through reapproval.

An applicant may have only one active Pending/Approved request per event. A rejected request remains a final decision; automatic resubmission is not introduced. A student can withdraw a pending or approved registration before the event date, following the existing cancellation rule. A cancelled registration can be submitted again as Pending. Event cancellation closes pending and approved registrations. Cancelled/withdrawn records remain visible in student/coordinator history and are excluded from the approver's three-state review queue.

Acceptance requires a published event that has not ended and available capacity. An expired pending request may still be rejected. Pending requests cannot be used for attendance. Occupancy, participation selectors and coordinator/report approved totals include Approved and legacy Confirmed records, never Pending or Rejected records.

## Dashboard and API

The Approver dashboard reuses existing summary cards, sidebar, tables, badges, dialogs and errors. Counts represent all authorized active/decided requests; list filters do not change the summary scope. Search matches student name, email/identifier and event title. Status and event filters, details and Previous/Next pagination use real data.

GET /api/workspace?view=registration-requests supports status=All|Pending|Approved|Rejected, search, eventId, page and perPage (maximum 50). The server enforces reviewer authorization and pagination and returns only the relevant student profile fields. POST /api/workspace action reviewRegistration accepts id, decision=accept|reject and an optional reason (maximum 2000 characters). Responses use existing request IDs, JSON errors and no-store headers.

Only active verified Approver or Administrator identities can retrieve the review queue or decide. Student and Coordinator identities cannot self-approve. Existing administrators can still use their broader permission model. Coordinator snapshots remain restricted to their own managed events and related records.

The repository locks the workspace row for the entire read/validate/write transaction. Already decided requests return 409 STALE_REQUEST; full-event acceptance returns 409 CAPACITY_REACHED and leaves the request pending. Existing idempotency keys prevent duplicate action replay. Confirmation-dialog submit buttons disable while the mutation runs; success appears only after backend confirmation.

## Migration and deployment

Apply db/migrations/002-registration-approvals.sql as one owner transaction to each intended environment before deploying this revision. It adds nullable decision metadata to the existing registration index, an active-request uniqueness index, and updates the capacity trigger to count Approved plus legacy Confirmed rows. It does not rewrite or delete existing registrations. The runtime table grants cover the additive columns; no new secret or service is required. New installations use the updated db/schema.sql.

Test the migration in the isolated verification branch first. Production credentials remain restricted; migration credentials must not be configured in production runtime. No review-specific environment variables are needed.

## Significant files

- portal.mjs and app.mjs: third entry option, role-aware login, approver dashboard, filters, details, decision confirmations, student status and approved-only metrics.
- registration.mjs: canonical status and shared active/approved predicates, including legacy compatibility.
- model.mjs: pending submission, cancellation integration, approved capacity and attendance rules.
- lib/errors.mjs, lib/registration-requests.mjs: shared API errors, server queue projection, validation, pagination and review business rules.
- lib/workspace-service.mjs: action permissions, server portal guards and canonical registration snapshots.
- lib/workspace-repository.js and app/api/workspace/route.js: transactional decisions, indexed metadata and authenticated queue queries.
- db/schema.sql and db/migrations/002-registration-approvals.sql: additive database upgrade and fresh-install schema.
- styles.css: matching request actions, pagination and responsive portal cards.
- tests/registration-approval.test.mjs and existing regression tests: approval rules, authorization, filtering, legacy places, stale writes and attendance integration.
- scripts/verify-integration.mjs: real managed-session journeys and concurrent approval/database constraint checks in the isolated environment.

## Verification limits

Authenticated browser credential entry and real-device/Safari/Firefox coverage require separate verification. The managed local preview launcher appends incompatible Next.js flags, so public entry UI checks use the deployed production site. Preview hosting protection is retained. No lint command is configured; use the available tests, syntax checks and Next.js production build. Large-workload benchmarking, availability observation and backup restoration retain the previously documented limits.

## Tests performed

- 64 automated domain/service tests passed, including pending submission, decision persistence, denied roles, stale decisions, capacity, legacy registrations, filtering/pagination, cancellation and attendance integration.
- 26 live integration checks passed in the isolated Neon branch using real managed sessions. These include two approvers competing for one place and two reviewers racing conflicting decisions on the same request, student-visible approval/rejection, role restrictions, persistence, server pagination, idempotency and direct database uniqueness/capacity constraints.
- Next.js production compilation and JavaScript syntax checks passed. No lint command is configured.
