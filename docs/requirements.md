# PDF coverage audit — InstituteConnect

Audit date: 23 October 2026 (India). Source: **T005_Assignment_4_Professional_zoomed_class_diagram.pdf**, 42 pages, including Assignments 1–4, functional/non-functional requirements, business rules, use cases, and UML entities.

## Verdict

**The deployed website is a functional academic prototype, not a complete implementation of every production requirement in the PDF.** All 51 functional requirements are accounted for below. Credential authentication is absent; role enforcement is simulated on the client. The other listed functional workflows can be demonstrated using fictional, browser-local data. The central database assumption and several security/reliability/concurrency requirements remain incomplete.

“Demo” means working browser behavior, not production security or shared storage. No percentage of production completeness is claimed.

## Functional requirements — all 51

| ID | PDF requirement | Status | Evidence / limits |
| --- | --- | --- | --- |
| FR-001 | User Login | Missing | Role/account selection only; no credential verification or server session. |
| FR-002 | Authentication Failure | Missing | Inactive-account errors exist, but there is no real credential login or failure handling. |
| FR-003 | Logout | Demo | Switching accounts clears the sessionStorage demo session. |
| FR-004 | Role Assignment | Demo | Administrator edits role and account status; changes are audited locally. |
| FR-005 | Role-Based Access | Partial | Navigation and domain operations check roles; browser code/data can be changed by its user. Server enforcement is missing. |
| FR-006 | Add Institution | Demo | Coordinator/admin institution form. |
| FR-007 | Institution Information | Demo | Name, type, region/address, relationship, associated contact details and designated primary contact. |
| FR-008 | Edit Institution | Demo | Edit institution from its detail dialog. |
| FR-009 | Add Contact | Demo | Name, designation, email and phone form. |
| FR-010 | Associate Contact with Institution | Demo | Validated institution association; primary-contact links repaired when moving a contact. |
| FR-011 | Search Institutions/Contacts | Demo | Search institution name/region and contact name/email/phone. |
| FR-012 | Create Outreach Event | Demo | Coordinator/admin event form. |
| FR-013 | Outreach Event Information | Demo | Title, description, category, date, time, mode/venue, organizer, target institutions, registration period, capacity, eligibility and instructions. |
| FR-014 | Save Event Draft | Demo | Incomplete events can be saved before submission. |
| FR-015 | Edit Event | Demo | Draft/rejected records editable; published schedule/venue/instructions can be updated by organizer/admin. Approved audience/content/capacity remain fixed. |
| FR-016 | Submit Event | Demo | Required fields, registration period, dates and times checked before entering Pending. |
| FR-017 | Approve Event | Demo | Approver/admin decision with reviewer and decision date. |
| FR-018 | Reject Event | Demo | Approver/admin rejection from Pending. |
| FR-019 | Rejection Reason | Demo | Blank rejection reasons rejected; history is retained on resubmission. |
| FR-020 | Publish Event | Demo | Organizer/admin publication requires Approved status. |
| FR-021 | Cancel Event | Demo | Organizer/admin cancellation closes registration and notifies confirmed participants in-app. |
| FR-022 | Event Listing | Demo | Published/completed/cancelled records visible to participants; institution contacts see relevant institutions. |
| FR-023 | Event Search | Demo | Search event title, description and venue. |
| FR-024 | Event Filtering | Demo | Category and event-status filters. |
| FR-025 | Event Details | Demo | Description, instructions, eligibility, targets, venue, timing and registration period. |
| FR-026 | Event Status | Demo | Lifecycle badge plus Registration open / Opens soon / Full / Registration closed / Event ended labels. |
| FR-027 | Event Registration | Demo | Student/institution contact confirmation with user/event association. |
| FR-028 | Eligibility Validation | Demo | Education-level and targeted-institution checks. Institutional contact eligibility uses its demo profile. |
| FR-029 | Duplicate Prevention | Demo | Duplicate confirmed user/event records rejected. |
| FR-030 | Capacity Validation | Demo | Confirmed records counted before entry; no cross-device/database transaction or concurrency protection. |
| FR-031 | Registration Confirmation | Demo | Confirmation toast, reference, registration list and in-app notification. |
| FR-032 | Registration Cancellation | Demo | Own registration may be cancelled before event day; capacity is released. |
| FR-033 | Registration Status | Demo | Own registration states shown in Registrations. |
| FR-034 | Registration List | Demo | Coordinator/admin participant list, event detail and registration CSV. |
| FR-035 | Record Activity Participation | Demo | Finished-event attendance for confirmed registrants; participant options follow selected event. |
| FR-036 | Update Participation Record | Demo | Correct attendance directly; event/user/activity identity retained; correction updates timestamp. |
| FR-037 | View Participation Records | Demo | Coordinators see workspace attendance; students see their own; institution contacts see own/linked institutional records. |
| FR-038 | Participation Association | Demo | Event, activity, user and institution association where available. |
| FR-039 | Record Outcome | Demo | Coordinator/admin outcome form after the scheduled event end. |
| FR-040 | Outcome Categories | Demo | Institutions engaged, leads, feedback and follow-up text. |
| FR-041 | View Outcomes | Demo | Coordinator outcome cards; management/admin reports and detailed outcome CSV. |
| FR-042 | Outcome Record | Demo | Each outcome stores event ID, entry ID and recorded date. |
| FR-043 | Registration Notification | Demo | Recipient-specific in-app confirmation. |
| FR-044 | Event Update Notification | Demo | Changes to published schedule, venue or instructions notify confirmed registrants and create an audit entry. |
| FR-045 | Event Reminder | Demo | Coordinator-triggered in-app reminders for confirmed registrants. No background scheduler; the PDF does not specify a delivery channel. |
| FR-046 | Cancellation Notification | Demo | Affected registrants receive an in-app cancellation notice. |
| FR-047 | Registration Report | Demo | Registration list and CSV export for coordinators/admins. |
| FR-048 | Participation Report | Demo | Attendance records, metrics and separate participation CSV for reporting roles. |
| FR-049 | Event Report | Demo | Event summary table, CSV export and print view. |
| FR-050 | Outcome Report | Demo | Management dashboard/lead metrics and separate outcome CSV including feedback/follow-up. |
| FR-051 | Administrative Dashboard | Demo | Administrator overview, users, pipeline, reports and audit log. |

## Other role/class responsibilities

- **User account maintenance:** each demo user may update name/contact phone; students can update education level. Users cannot change role/email through this form.
- **Administrator configuration:** default event capacity/mode are editable by admins and apply to new drafts only.
- **Institution participation:** an institution contact registers/cancels its own participation on behalf of its linked institution; records are linked to that user/institution.
- **Audit activity:** domain actions write timestamped records; this is a local, editable demonstration rather than a tamper-resistant server audit.

## Non-functional requirements — all 20

| ID | PDF expectation | Audit result |
| --- | --- | --- |
| NFR-001 | Normal-operation response time | Responsive with sample data; no agreed workload/SLA or load testing. |
| NFR-002 | Search/filter response time | Works locally with sample records; large-dataset performance unverified. |
| NFR-003 | Concurrent users | Incomplete: no shared database, multi-user transaction or concurrency guarantees. |
| NFR-004 | Protected functions require authentication | Incomplete: demo session is not authentication. |
| NFR-005 | Role-controlled functions | Partial: UI/model checks only; trusted server enforcement missing. |
| NFR-006 | Sensitive information protected | Incomplete for real use: browser-local bundled records are inspectable. Fictional data only. |
| NFR-007 | Auditable administration | Partial: local audit exists; central, protected audit storage missing. |
| NFR-008 | Consistent navigation | Demonstrated with shared role-specific sidebar/header and dialogs. |
| NFR-009 | Understandable errors | Demonstrated with form/toast validation messages and negative-path tests. |
| NFR-010 | Minimal registration steps | Demonstrated: view event, register, see confirmation. |
| NFR-011 | Reliable registrations | Partial: local persistence works; server durability and transactional consistency missing. |
| NFR-012 | Participation/outcomes retained | Partial: retained across refresh in current browser; clearing storage loses records. |
| NFR-013 | Availability | Hosted on Vercel; no application uptime monitoring/SLA verification. |
| NFR-014 | Modular architecture | Domain model, UI, styling, build and tests separated. |
| NFR-015 | Version-controlled source | GitHub repository divbytes-prog/sd-project. |
| NFR-016 | Maintained documentation | README, this audit and tests committed with implementation. |
| NFR-017 | Scalability | Incomplete: static delivery scales, browser-local domain storage is not a multi-user backend. |
| NFR-018 | Modern browsers | Chrome desktop smoke tests passed; responsive CSS exists. Cross-browser/real mobile testing not completed. |
| NFR-019 | Authorized access to personal/institutional data | Incomplete for real use: client-only role checks are not a privacy boundary. |
| NFR-020 | Record significant administrative actions | Partial: local role/config/profile/event changes recorded; logs are not server-protected. |

## Business rules — BR-001–010

All ten are demonstrated in domain tests: authorized creation, approval before publication, published/open-period registration, duplicate/capacity checks, authorized participation, outcomes after event end, reporting-role checks and blocked cancelled-event registration. **These checks require trusted server equivalents and database constraints for production.** Attendance, completion and outcomes now check the scheduled end timestamp in Asia/Kolkata, rather than just the calendar day.

## UML and lifecycle mapping

| UML class / relationship | Browser implementation |
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

The core scenarios UC-004 (create event), UC-006 (approve/reject) and UC-011 (registration) can be demonstrated end-to-end. Their authentication precondition is simulated.

## Changes from the first deployment

1. Added published logistics updates and affected-participant notifications (FR-015/044).
2. Added student/institution participation history, direct attendance correction and event-specific participant selection (FR-035–038).
3. Added separate participation/outcome CSV reports (FR-048/050).
4. Added designated primary contacts and primary-link repair on contact moves (FR-007/010).
5. Added account contact/education maintenance and administrator event defaults (User/Administrator responsibilities).
6. Added registration availability badges and disabled unavailable registration actions (FR-026).
7. Fixed end-time validation for attendance, outcomes and event completion; registration closes at event start.
8. Restricted full-workspace backup action to the administrator demo role.

Existing version-1 browser records receive compatible defaults without clearing registrations.

## Remaining required infrastructure

To satisfy the PDF beyond an academic demonstration:

1. Implement valid-credential institutional login, login-failure handling, and server-managed sessions (FR-001/002, NFR-004).
2. Move records into a **central shared database**, as assumed in Section 8, with transactional capacity/duplicate constraints and reliable backups.
3. Enforce roles, organizer ownership and data privacy on server APIs; protect audit records (FR-005, NFR-005/006/007/019/020).
4. Validate real multi-user concurrency, durability, scalability, browser/device compatibility and availability against a defined workload.

The PDF does **not** require email/SMS specifically. In-app delivery satisfies the demonstrated notification channel; external delivery and a scheduler would be deployment choices. Password reset, account self-enrollment and backup import are not explicit functional requirements in this PDF.

## Intentionally excluded / future scope

Payment processing, admissions/exams, ERP, housing, transport, native mobile app and AI recommendations stay excluded as stated. Bulk import, waitlists, calendar integration, advanced analytics, personalized recommendations and automated lead scoring are future/could-have items, not unfinished core prototype requirements. UML diagram images themselves are design documentation, not additional website screens.

## Verification

- Automated: 31 domain tests pass, covering both allowed and denied actions.
- Browser: original draft → submit → approve → publish → student registration flow verified previously. This update additionally verifies published-venue notification delivery, student attendance view, attendance correction, participation/outcome CSV downloads and configured defaults appearing in new drafts.
- No backend, concurrent-user or cross-browser certification is claimed.
