# Requirement traceability

Source: T005_Assignment_4_Professional_zoomed_class_diagram.pdf, including its earlier assignments, functional requirements, business rules and final UML model.

## Domain model

| Assignment class | Implementation |
| --- | --- |
| User and six specialized roles | `users` records with name, email, role, status, institution and education level; simulated role sessions |
| Institution | Institution directory, region, type, relationship status and event targets |
| Contact | Independent contact records linked to an institution, with name, designation, email and phone |
| OutreachEvent | Full event metadata, organizer, targeted institutions, status and workflow operations |
| Registration | User/event association, registration date and state; eligibility, period, duplicate and capacity checks |
| Approval | Event history entries containing reviewer, decision, comments and timestamp |
| ActivityParticipation | Event, user, named activity, attendance state and recorded date; correctable records |
| Outcome | Event-linked institution engagement, leads, feedback, follow-up and date |
| Notification | Recipient, message, timestamp and read status; generated on workflow actions |

## Functional coverage

| Source requirements | Prototype coverage |
| --- | --- |
| FR-001–005: authentication/accounts | Demo role sessions, logout and administrator role management; production credential authentication is not implemented |
| FR-006–011: institutions and contacts | Add/edit institutions and contacts, linked records and search |
| FR-012–021: event management | Full draft form, submission validation, approve/reject, rejection reason, publication and cancellation |
| FR-022–026: event discovery | Published/finished/cancelled event list for participants, complete details, search and filters |
| FR-027–034: registration | In-app confirmation, status, participant lists, eligibility, dates, duplicate/capacity enforcement and cancellation before event day |
| FR-035–038: participation | Past-event participation entry and correction, associated with event, activity and user |
| FR-039–042: outcomes | Past-event outcomes and engagement/lead/feedback/follow-up records |
| FR-043–046: notifications | In-app registration confirmation, approval updates, manually initiated reminders and event cancellation notifications; no external delivery |
| FR-047–051: reporting | Live role dashboards, CSV registration/event reports, attendance/lead metrics and print-friendly report view |

## Business rules

BR-001–010 are represented by model checks. Client-only checks demonstrate intended behavior and must be reimplemented on a trusted backend for production. Registration capacity is checked against confirmed records. Event cancellation closes registration and updates confirmed registrations. Event completion, attendance and outcomes require a past/present event date. The cancellation policy allows registrants to cancel only before the event day. Dates use the Asia/Kolkata calendar.

## Deliberate scope

Financial transactions, admissions/examinations, course enrollment, ERP, transport, hostel management and AI recommendations are omitted, matching the assignment's excluded scope.

## Remaining production work

1. Replace demo accounts with verified institutional identity and server-managed sessions.
2. Move all domain records to a centralized database with transactional capacity/uniqueness constraints and server-side ownership checks.
3. Implement password reset/account enrollment and institutional membership verification.
4. Add email/SMS provider integration and automatic scheduled reminders.
5. Implement trusted backups, restore and institutional privacy/retention controls.
6. Apply input schemas and authorization to every API; keep contact data and audit logs restricted.
7. Add integration, multi-user concurrency and real-device accessibility/performance testing.

UI smoke test performed: Coordinator draft creation → submission → Approver decision → Coordinator publication → Student discovery → confirmed registration. Automated tests cover both permitted and denied domain transitions.
