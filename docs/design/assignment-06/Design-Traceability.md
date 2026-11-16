# Design Traceability Matrix (Assignment 06 & 07)
**System:** InstituteConnect – Academic Outreach & Event Collaboration Portal  
**Document Version:** 1.0.0  
**Status:** Approved / Implemented  
**Date:** November 2026  

---

## 1. Overview & Traceability Objectives

The Requirements Traceability Matrix (RTM) establishes bidirectional traceability between system requirements (Functional Requirements, Non-Functional Requirements, and Business Rules) established in Assignments 1–5, and the architectural elements, design classes, component interfaces, and UI screens developed in Assignments 6 and 7.

This ensures:
1. **Zero Scope Creep & Zero Scope Omission:** Every functional requirement maps to at least one concrete architectural component and design class.
2. **Impact Analysis:** Any modification in business requirements can be traced directly to affected classes, methods, and UI views.
3. **Verification Completeness:** Every component has testable verification points traced directly to test cases in Assignment 8.

---

## 2. Functional Requirements to Design Traceability Matrix

| Req ID | Requirement Description | Use Case ID | Design Class / Service | UI Screen ID | Database Table / Entity |
|:---|:---|:---|:---|:---|:---|
| **FR-001** | User authentication with email & password | UC-001 | `User`, `AuthService` | Screen S1 (`UI-SCR-001`) | `users` |
| **FR-002** | Single Sign-On (SSO) via institute credentials | UC-002 | `User`, `OAuthGateway` | Screen S1 (`UI-SCR-001`) | `users` |
| **FR-003** | Password recovery and reset mechanism | UC-003 | `AuthService`, `NotificationService` | Screen S1 (`UI-SCR-001`) | `password_resets` |
| **FR-004** | Role-based dashboard personalization | UC-001 | `User`, `RoleAccessPolicy` | S1 / App Shell | `users`, `user_roles` |
| **FR-005** | Save event proposal as draft | UC-004 | `Event`, `EventService` | Screen S2 (`UI-SCR-002`) | `events` |
| **FR-006** | Complete multi-section event creation | UC-004 | `Event`, `Schedule`, `EventService` | Screen S2 (`UI-SCR-002`) | `events`, `event_schedules` |
| **FR-007** | Mode selection (In-Person, Virtual, Hybrid) | UC-004 | `Event`, `EventMode` | Screen S2 (`UI-SCR-002`) | `events` |
| **FR-008** | Capacity quota and seat limit specification | UC-004 | `Event`, `EventService` | Screen S2 (`UI-SCR-002`) | `events` |
| **FR-009** | Target institution categorization & tagging | UC-004 | `Event`, `InstitutionType` | Screen S2 (`UI-SCR-002`) | `event_target_institutions`|
| **FR-010** | Schedule and venue conflict detection | UC-004 | `EventService`, `ConflictEngine`| Screen S2 (`UI-SCR-002`) | `events`, `venues` |
| **FR-011** | Submit event proposal for administrative review | UC-005 | `EventService`, `ApprovalService` | Screen S2 (`UI-SCR-002`) | `events`, `approval_reviews` |
| **FR-012** | Pending event proposals queue with filtering | UC-008 | `ApprovalService`, `EventRepository`| Screen S4 (`UI-SCR-004`) | `events` |
| **FR-013** | Two-pane proposal inspection and comparison | UC-008 | `ApprovalService`, `Event` | Screen S4 (`UI-SCR-004`) | `events` |
| **FR-014** | Administrative event approval with remarks | UC-009 | `ApprovalService`, `ApprovalReview` | Screen S4 (`UI-SCR-004`) | `approval_reviews`, `events`|
| **FR-015** | Administrative event rejection with mandatory reason| UC-009 | `ApprovalService`, `ApprovalReview` | Screen S4 (`UI-SCR-004`) | `approval_reviews`, `events`|
| **FR-016** | Coordinator notification on approval/rejection | UC-010 | `NotificationService`, `Notification`| Screen S4 / Nav Alerts | `notifications` |
| **FR-017** | Public event catalog browsing & multi-filter search | UC-006 | `EventRepository`, `Event` | Screen S3 (`UI-SCR-003`) | `events` |
| **FR-018** | Event detail view with comprehensive agenda | UC-006 | `Event`, `Schedule` | Screen S3 (`UI-SCR-003`) | `events`, `event_schedules` |
| **FR-019** | Dynamic occupancy & seats remaining meter | UC-006 | `Event`, `RegistrationService` | Screen S3 (`UI-SCR-003`) | `events`, `registrations` |
| **FR-020** | Participant one-click event registration | UC-011 | `RegistrationService`, `Registration`| Screen S3 (`UI-SCR-003`) | `registrations`, `events` |
| **FR-021** | Concurrency control & over-capacity prevention | UC-011 | `RegistrationService`, `LockManager`| Screen S3 (`UI-SCR-003`) | `registrations` |
| **FR-022** | Automated waitlist allocation upon full capacity | UC-011 | `RegistrationService`, `Registration`| Screen S3 (`UI-SCR-003`) | `registrations` |
| **FR-023** | Digital registration ticket generation | UC-011 | `RegistrationService`, `TicketGenerator`| Screen S3 (`UI-SCR-003`) | `registrations` |
| **FR-024** | Self-service registration cancellation & seat release | UC-012 | `RegistrationService`, `NotificationService`| Screen S3 / My Events | `registrations`, `events` |
| **FR-025** | Target institution profile and directory management | UC-013 | `Institution`, `InstitutionRepository`| Directory Views | `institutions` |
| **FR-026** | Audit logging of all administrative review actions | UC-014 | `ApprovalReview`, `AuditLogger` | Screen S4 (`UI-SCR-004`) | `approval_reviews`, `audit_logs`|
| **FR-027** | Coordinator event edit restriction (locked when approved)| UC-004 | `EventService`, `Event` | Screen S2 (`UI-SCR-002`) | `events` |
| **FR-028** | Multi-channel notifications (In-app, Email) | UC-015 | `NotificationService`, `Notification`| Global Nav / Alerts | `notifications` |

---

## 3. Business Rules (BR) Traceability Matrix

| Rule ID | Business Rule Description | Enforcing Component / Method | Validation Failure Outcome |
|:---|:---|:---|:---|
| **BR-001** | **Chronological Consistency:** Event `End Date & Time` must be strictly greater than `Start Date & Time`. | `EventService.createEvent`, `Event.validateDates` | HTTP 400 `ValidationException`: "End date/time must be strictly after start date/time." |
| **BR-002** | **Future Scheduling:** Events cannot be created in the past. | `EventService.createEvent` | HTTP 400: "Start date cannot be in the past." |
| **BR-003** | **Self-Approval Prohibition:** Coordinators cannot approve or reject their own event proposals. | `ApprovalService.approve`, `ApprovalService.reject` | HTTP 403 `PolicyViolationException`: "Coordinators cannot approve their own events." |
| **BR-004** | **Mandatory Rejection Justification:** Rejecting an event proposal requires explicit explanatory feedback. | `ApprovalService.reject` | HTTP 400: "Rejection reason is mandatory." |
| **BR-005** | **Capacity Bound:** Confirmed registrations cannot exceed the maximum event capacity. | `RegistrationService.register` | Automatically sets status to `WAITLISTED` or throws capacity error. |
| **BR-006** | **Unique Registration:** A user can register at most once per active event. | `RegistrationService.register` | HTTP 409 `DuplicateRegistrationException`: "User is already registered for this event." |
| **BR-007** | **Locked Lifecycle:** Approved and published events cannot have critical parameters (dates/venue) altered without administrative recertification. | `EventService.updateEvent` | HTTP 400: "Approved events require approval before modification." |
| **BR-008** | **Registration Deadline Enforcement:** Registrations are rejected if the current time exceeds the event deadline. | `RegistrationService.register` | HTTP 400: "Registration deadline has passed." |
| **BR-009** | **Role Authorization:** Only Dean, HoD, and designated Admin roles can access the Approval Review Console. | `RoleAccessPolicy`, `ApprovalService` | HTTP 403: "Access denied. Insufficient reviewer permissions." |
| **BR-010** | **Audit Trail Immutability:** Once an approval review record is committed, it cannot be modified or deleted. | `ApprovalReviewRepository.save` | Enforced via append-only database constraint. |

---

## 4. Non-Functional Requirements (NFR) Traceability Matrix

| NFR ID | Quality Attribute | Target Metric / Requirement | Architectural Mechanism & Design Pattern | Verification Method |
|:---|:---|:---|:---|:---|
| **NFR-001** | **Performance** | Event catalog and search responses < 200ms at 95th percentile | In-memory indexing, paginated database queries, indexing on `category`, `status`, `dates`. | Automated load testing |
| **NFR-002** | **Concurrency** | Concurrent seat reservations handled with zero overbooking | Atomic database transactions, optimistic/pessimistic locking in `RegistrationService`. | Unit test TC-015 |
| **NFR-003** | **Security** | Role-Based Access Control (RBAC) across all endpoints | Token-based auth, `RoleAccessPolicy` interceptor on Gateway layer. | Unit test TC-003 |
| **NFR-004** | **Data Integrity** | Foreign key constraints and transaction rollback on failure | 3NF PostgreSQL schema, relational integrity, ACID compliance. | Repository unit tests |
| **NFR-005** | **Usability** | WCAG 2.1 AA accessibility, intuitive 4-section form layout | Semantic HTML5, accessible color contrast (4.5:1), ARIA labels, responsive CSS Grid. | Screen validation |
| **NFR-006** | **Maintainability** | Clean 5-layer separation; services decoupled from UI and DB | Layered Architecture, Inversion of Control, Generic `Repository<T>`. | Code inspection |
| **NFR-007** | **Auditability** | Complete historical logs of all administrative approval decisions | `ApprovalReview` entity recording reviewer ID, timestamp, and decision. | Screen S4 Audit Table & TC-020 |
| **NFR-008** | **Availability** | Graceful degradation on database connectivity drops | Circuit breakers, cached fallback state, standard error toast messages. | Stress testing |

---

## 5. UI Screen to Use Case Traceability

| UI Screen | Screen Title | Use Cases Realized | Wireframe Document | Implemented Source Code |
|:---|:---|:---|:---|:---|
| **Screen S1** | User Authentication & SSO | UC-001, UC-002, UC-003 | `UI-Wireframe-01.png` | `app.mjs` (login form, SSO button) |
| **Screen S2** | Event Creation & Proposal | UC-004, UC-005, UC-007 | `UI-Wireframe-02.png` | `app.mjs` (4-section event form) |
| **Screen S3** | Event Details & Registration | UC-006, UC-011, UC-012 | `UI-Wireframe-03.png` | `app.mjs` (agenda table, seat meter) |
| **Screen S4** | Event Approval Review Console | UC-008, UC-009, UC-010, UC-014 | `UI-Wireframe-04.png` | `app.mjs` (two-pane split review hub) |
