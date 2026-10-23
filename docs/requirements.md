# PDF coverage audit — InstituteConnect

Audit date: 23 October 2026 (India). Source: **T005_Assignment_4_Professional_zoomed_class_diagram.pdf**, 42 pages, including Assignments 1–4, functional/non-functional requirements, business rules, use cases, and UML entities.

## Verdict

The backend implements the missing shared database, managed credential authentication, verified email, server authorization, data scoping, protected audit records and transactional registration protection. It passed 41 domain/service tests and 16 real database/authentication checks in an isolated Neon verification branch on 23 October 2026. Production deployment uses a separate branch/database and restricted runtime credentials.

All 51 functional requirements have an implementation path. The operational and cross-browser limits below remain explicit: this is a tested academic prototype, not a claim of a measured production SLA.

## Functional requirements — all 51

| ID | PDF requirement | Status | Evidence / limits |
| --- | --- | --- | --- |
| FR-001 | User Login | Implemented | Managed Neon Auth email/password login, verified email and server sessions. |
| FR-002 | Authentication Failure | Implemented | Managed credential errors, understandable login feedback and server-side inactive-account denial. |
| FR-003 | Logout | Implemented | Managed sign-out invalidates the server session; workspace requests bypass the cookie cache to check session revocation. |
| FR-004 | Role Assignment | Implemented | Administrator edits role and account status; changes are audited centrally. |
| FR-005 | Role-Based Access | Implemented | Server APIs check the managed identity, current role and organizer ownership; UI navigation follows the same roles. |
| FR-006 | Add Institution | Implemented | Coordinator/admin institution form. |
| FR-007 | Institution Information | Implemented | Name, type, region/address, relationship, associated contact details and designated primary contact. |
| FR-008 | Edit Institution | Implemented | Edit institution from its detail dialog. |
| FR-009 | Add Contact | Implemented | Name, designation, email and phone form. |
| FR-010 | Associate Contact with Institution | Implemented | Validated institution association; primary-contact links repaired when moving a contact. |
| FR-011 | Search Institutions/Contacts | Implemented | Search institution name/region and contact name/email/phone. |
| FR-012 | Create Outreach Event | Implemented | Coordinator/admin event form. |
| FR-013 | Outreach Event Information | Implemented | Title, description, category, date, time, mode/venue, organizer, target institutions, registration period, capacity, eligibility and instructions. |
| FR-014 | Save Event Draft | Implemented | Incomplete events can be saved before submission. |
| FR-015 | Edit Event | Implemented | Draft/rejected records editable; published schedule/venue/instructions can be updated by organizer/admin. Approved audience/content/capacity remain fixed. |
| FR-016 | Submit Event | Implemented | Required fields, registration period, dates and times checked before entering Pending. |
| FR-017 | Approve Event | Implemented | Approver/admin decision with reviewer and decision date. |
| FR-018 | Reject Event | Implemented | Approver/admin rejection from Pending. |
| FR-019 | Rejection Reason | Implemented | Blank rejection reasons rejected; history is retained on resubmission. |
| FR-020 | Publish Event | Implemented | Organizer/admin publication requires Approved status. |
| FR-021 | Cancel Event | Implemented | Organizer/admin cancellation closes registration and notifies confirmed participants in-app. |
| FR-022 | Event Listing | Implemented | Published/completed/cancelled records visible to participants; institution contacts see relevant institutions. |
| FR-023 | Event Search | Implemented | Search event title, description and venue. |
| FR-024 | Event Filtering | Implemented | Category and event-status filters. |
| FR-025 | Event Details | Implemented | Description, instructions, eligibility, targets, venue, timing and registration period. |
| FR-026 | Event Status | Implemented | Lifecycle badge plus Registration open / Opens soon / Full / Registration closed / Event ended labels. |
| FR-027 | Event Registration | Implemented | Student/institution contact confirmation with user/event association. |
| FR-028 | Eligibility Validation | Implemented | Education-level and targeted-institution checks. Institutional contacts use their administrator-assigned institution and verified workspace profile. |
| FR-029 | Duplicate Prevention | Implemented | Duplicate confirmed user/event records rejected. |
| FR-030 | Capacity Validation | Implemented | Locked database transactions serialize registration; a unique confirmed-registration index and a database capacity trigger provide additional constraints. The isolated two-user last-place concurrency test passes. |
| FR-031 | Registration Confirmation | Implemented | Confirmation toast, reference, registration list and in-app notification. |
| FR-032 | Registration Cancellation | Implemented | Own registration may be cancelled before event day; capacity is released. |
| FR-033 | Registration Status | Implemented | Own registration states shown in Registrations. |
| FR-034 | Registration List | Implemented | Coordinator/admin participant list, event detail and registration CSV. |
| FR-035 | Record Activity Participation | Implemented | Finished-event attendance for confirmed registrants; participant options follow selected event. |
| FR-036 | Update Participation Record | Implemented | Correct attendance directly; event/user/activity identity retained; correction updates timestamp. |
| FR-037 | View Participation Records | Implemented | Coordinators see workspace attendance; students see their own; institution contacts see own/linked institutional records. |
| FR-038 | Participation Association | Implemented | Event, activity, user and institution association where available. |
| FR-039 | Record Outcome | Implemented | Coordinator/admin outcome form after the scheduled event end. |
| FR-040 | Outcome Categories | Implemented | Institutions engaged, leads, feedback and follow-up text. |
| FR-041 | View Outcomes | Implemented | Coordinator outcome cards; management/admin reports and detailed outcome CSV. |
| FR-042 | Outcome Record | Implemented | Each outcome stores event ID, entry ID and recorded date. |
| FR-043 | Registration Notification | Implemented | Recipient-specific in-app confirmation. |
| FR-044 | Event Update Notification | Implemented | Changes to published schedule, venue or instructions notify confirmed registrants and create an audit entry. |
| FR-045 | Event Reminder | Implemented | Coordinator-triggered in-app reminders for confirmed registrants. No background scheduler; the PDF does not specify a delivery channel. |
| FR-046 | Cancellation Notification | Implemented | Affected registrants receive an in-app cancellation notice. |
| FR-047 | Registration Report | Implemented | Registration list and CSV export for coordinators/admins. |
| FR-048 | Participation Report | Implemented | Attendance records, metrics and separate participation CSV for reporting roles. |
| FR-049 | Event Report | Implemented | Event summary table, CSV export and print view. |
| FR-050 | Outcome Report | Implemented | Management dashboard/lead metrics and separate outcome CSV including feedback/follow-up. |
| FR-051 | Administrative Dashboard | Implemented | Administrator overview, users, pipeline, reports and audit log. |

## Other role/class responsibilities

- **User account maintenance:** each verified user may update name/contact phone; students can update education level. Users cannot change role/email through this form.
- **Administrator configuration:** default event capacity/mode are editable by admins and apply to new drafts only.
- **Institution participation:** an institution contact registers/cancels its own participation on behalf of its linked institution; records are linked to that user/institution.
- **Audit activity:** domain actions write timestamped records; records are stored centrally; the application database role can insert/read audit records but cannot update/delete them. Database administrators retain privileged maintenance access.

## Non-functional requirements — all 20

| ID | PDF expectation | Source implementation / verification status |
| --- | --- | --- |
| NFR-001 | Normal-operation response time | API timeouts and bounded pools configured; real workload latency measurement pending. |
| NFR-002 | Search/filter response time | Existing client search/filter on authorized snapshots; large-dataset measurement pending. |
| NFR-003 | Concurrent users | Shared transactional database, row locking, duplicate index and capacity trigger implemented; isolated two-user last-place integration test passes. |
| NFR-004 | Protected functions require authentication | Managed verified session required on every workspace request. Isolated authentication checks pass. |
| NFR-005 | Role-controlled functions | Server role, organizer ownership and account-status enforcement; automated unit checks pass. |
| NFR-006 | Sensitive information protected | Server-only credentials, TLS database connection, managed cookies, scoped responses, same-origin mutations and no client storage of records. Core API protection checks pass in the isolated environment. |
| NFR-007 | Auditable administration | Central audit with runtime UPDATE/DELETE denied by database grants. The isolated runtime audit-write denial test passes. |
| NFR-008 | Consistent navigation | Shared role-specific sidebar/header and dialogs retained. |
| NFR-009 | Understandable errors | Form/toast validation, authentication failure and service availability messages. |
| NFR-010 | Minimal registration steps | Discover event, register, receive confirmation. |
| NFR-011 | Reliable registrations | Durable shared storage, transaction rollback and idempotency keys implemented. Cross-device persistence and idempotency checks pass. |
| NFR-012 | Participation/outcomes retained | Stored centrally rather than in browser storage. Live persistence/restore exercise pending. |
| NFR-013 | Availability | Existing site hosted on Vercel; health endpoint added. Uptime/restore monitoring and an availability observation period remain unverified. |
| NFR-014 | Modular architecture | Next.js routes, managed auth, repository, domain service, UI and tests separated. |
| NFR-015 | Version-controlled source | GitHub divbytes-prog/sd-project; backend source versioned alongside the original prototype. |
| NFR-016 | Maintained documentation | README, this audit, schema and tests updated together. |
| NFR-017 | Scalability | Serverless app and pooled database connections implemented; workspace-wide write lock is intentionally conservative and requires benchmarking before larger deployments. |
| NFR-018 | Modern browsers | Previous desktop browser smoke tests passed; Safari/Firefox and real-mobile verification pending. |
| NFR-019 | Authorized data access | Server projects private data by role and recipient, excluding peer contact details; unit checks pass. |
| NFR-020 | Significant actions recorded | Event, account, configuration and profile actions recorded centrally; Isolated central-audit check passes. |

## Business rules — BR-001–010

All ten are demonstrated in domain tests: authorized creation, approval before publication, published/open-period registration, duplicate/capacity checks, authorized participation, outcomes after event end, reporting-role checks and blocked cancelled-event registration. These domain rules now execute through trusted server APIs; duplicate/capacity rules also have database constraints. The core event/registration/notification flows passed isolated end-to-end checks. Attendance, completion and outcomes now check the scheduled end timestamp in Asia/Kolkata, rather than just the calendar day.

## UML and lifecycle mapping

| UML class / relationship | Implementation |
| --- | --- |
| User and six specializations | User records with role discriminators and role-specific operations; not literal JavaScript inheritance subclasses. |
| Institution — Contact (1 to many) | Contact institutionId plus designated primaryContactId. |
| Coordinator — OutreachEvent | organizerId ownership check. |
| Event — Institution (many to many) | institutionIds array; contact institution association used for relevance. |
| User/Event — Registration | userId/eventId records with status/date. |
| Event/Approver — Approval | Event history entries with ID, reviewer, decision, comments and timestamp. |
| User — Notification | Recipient-specific notifications with ID, type, message, date and read state. |
| Event — ActivityParticipation | Event/user/institution links, named activity, attendance and timestamp. |
| Event — Outcome | Event-linked outcome entries with engagement metrics and follow-up. |

The UI uses **Pending** for the document's Submitted/Under Review stages, and **Rejected** for revision. This collapses intermediate review states; it does not implement reviewer assignment or a separate review-start action. Registration Open/Closed are derived from dates, event status, start time and capacity. Completed events can record outcomes/reports; a new draft starts the next outreach cycle.

The core scenarios UC-004 (create event), UC-006 (approve/reject) and UC-011 (registration) can be demonstrated end-to-end. Their authentication precondition now uses managed, verified server sessions; the core authenticated create/review/publish/register flow passes isolated integration verification.

## Changes from the first deployment

1. Added published logistics updates and affected-participant notifications (FR-015/044).
2. Added student/institution participation history, direct attendance correction and event-specific participant selection (FR-035–038).
3. Added separate participation/outcome CSV reports (FR-048/050).
4. Added designated primary contacts and primary-link repair on contact moves (FR-007/010).
5. Added account contact/education maintenance and administrator event defaults (User/Administrator responsibilities).
6. Added registration availability badges and disabled unavailable registration actions (FR-026).
7. Fixed end-time validation for attendance, outcomes and event completion; registration closes at event start.
8. Restricted full-workspace backup action to the administrator role.

The shared database starts empty. Browser-local fictional sample records are not automatically imported into the shared workspace.

## Deployment and operational verification

Encrypted variables are configured on the existing sd-project Vercel project. Preview verification uses its own Neon branch, database and managed Auth endpoint. Production uses the restricted runtime role and does not receive the migration connection or the integration-test flag. The initial administrator must sign up and verify the configured owner email; other accounts start as Student and receive elevated roles only through an administrator.

Sixteen isolated live checks pass: database health, unauthenticated denial, email verification enforcement, role restoration, role escalation denial, approval lifecycle, last-place concurrency, duplicate denial, cross-device persistence/privacy, ownership protection, update notifications, idempotency, cross-origin denial, logout revocation, central audit and audit write protection.

Remaining operational validation: define and measure a representative response-time/concurrency workload, exercise backup restoration, observe availability over time and test Safari/Firefox and real mobile devices. These are not grounds for claiming complete production certification today. The conservative shared workspace write lock requires benchmarking before a larger deployment.

The PDF does not require email/SMS notification delivery specifically. Workspace notifications are in-app and reminders are triggered by a coordinator. Managed authentication uses email verification codes. Password recovery, account self-enrollment and backup import are not explicit functional requirements in this PDF.

## Intentionally excluded / future scope

Payment processing, admissions/exams, ERP, housing, transport, native mobile app and AI recommendations stay excluded as stated. Bulk import, waitlists, calendar integration, advanced analytics, personalized recommendations and automated lead scoring are future/could-have items, not unfinished core prototype requirements. UML diagram images themselves are design documentation, not additional website screens.

## Verification

- 41 automated domain/service tests pass, including allowed/denied actions, lifecycle rules, payload injection and role-based data projection.
- Next.js production compilation passes locally.
- A real-database integration runner is included in scripts/verify-integration.mjs and scripts/verify-build.mjs. It runs only when explicitly enabled against the isolated verification database. All 16 checks passed against the isolated verification database and managed Auth branch.
- Previous browser tests apply to the earlier prototype, not proof of the new backend's live behavior.
- No load, uptime, restore or cross-browser certification is claimed.
