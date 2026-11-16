# Test Execution Report & Test Case Design (Assignment 08)
**System:** InstituteConnect – Academic Outreach & Event Collaboration Portal  
**Document Version:** 1.0.0  
**Status:** Complete – 100% Passing  
**Date:** November 2026  
**Execution Environment:** Node.js v20.19.5, macOS Darwin (Node Test Runner)  
**Test Suite Path:** `tests/assignment-08.test.mjs`  

---

## 1. Executive Summary

This report documents the formal test design, test cases, and execution results for **Assignment 08 (Software Testing & Test Case Design)**. The automated test suite covers the three core functional use cases of the InstituteConnect portal:
- **UC-004:** Event Creation & Proposal Submission (TC-001 to TC-008)
- **UC-011:** Event Registration & Capacity Management (TC-009 to TC-020)
- **UC-006:** Event Catalog Browsing, Multi-Criteria Filtering & Lifecycle Modification (TC-021 to TC-028)

### 1.1 Test Execution Metrics
| Metric | Value |
|:---|:---|
| **Total Test Cases Designed** | 28 |
| **Total Tests Executed (Assignment 08)** | 28 |
| **Assignment 08 Tests Passed** | 28 (100.0%) |
| **Assignment 08 Tests Failed** | 0 (0.0%) |
| **Baseline Regression Tests (Assignments 1–5)** | 64 |
| **Baseline Regression Tests Passed** | 64 (100.0%) |
| **Combined System Test Suite** | **92 Tests Executed, 92 Passed (100% Pass Rate)** |
| **Open Defects / Critical Bugs** | 0 |

---

## 2. Test Plan & Scope

### 2.1 Test Levels Covered
1. **Unit Testing:** Individual method-level verification of validation functions, date parsers, capacity math, and status transitions.
2. **Integration Testing:** Service-to-repository persistence, multi-service communication (`EventService` -> `ApprovalService` -> `NotificationService`), and concurrency locking.
3. **Boundary Value Analysis (BVA):** Capacity limits (0, 1, 100), edge dates (today, past, deadline boundaries), and string length extremes.
4. **Equivalence Partitioning (EP):** Valid/invalid event modes, valid/invalid user roles, and valid/invalid date-time formats.
5. **Security & Access Control Testing:** Role-Based Access Control (RBAC) enforcement and self-approval denial.

---

## 3. Comprehensive Test Case Execution Register

### 3.1 Use Case UC-004: Event Creation & Proposal Submission

| Test ID | Test Objective | Inputs & Preconditions | Execution Steps | Expected Result | Actual Result | Status |
|:---|:---|:---|:---|:---|:---|:---|
| **TC-001** | Verify valid event creation with complete required fields | Coordinator user; valid title, category, future dates, capacity 100 | Call `EventService.createEvent(details, coordinatorId, 'submit')` | Event saved with status `PENDING_APPROVAL`, valid ID generated | Event saved with status `PENDING_APPROVAL`, ID generated | **PASS** |
| **TC-002** | Verify saving an event proposal as draft with incomplete fields | Coordinator user; only title provided; dates/capacity null | Call `EventService.createEvent(details, coordinatorId, 'draft')` | Event saved with status `DRAFT`, errors ignored | Event saved with status `DRAFT`, ID assigned | **PASS** |
| **TC-003** | Verify unauthorized user role cannot create events | Participant user (`UserRole.PARTICIPANT`); valid event details | Call `EventService.createEvent(details, participantId, 'submit')` | Operation rejected with authorization error / validation failure | Rejected: "Only coordinators or admins can create events" | **PASS** |
| **TC-004** | Verify submission fails when required fields are missing | Coordinator user; empty title, null dates, null capacity | Call `EventService.createEvent(emptyDetails, coordId, 'submit')` | Validation failure listing missing title, dates, and capacity | Validation rejected with 3 explicit missing field errors | **PASS** |
| **TC-005** | Verify validation fails when End Date is before Start Date | Coordinator user; `startDate: 2026-12-10`, `endDate: 2026-12-05` | Call `EventService.createEvent(details, coordId, 'submit')` | Validation failure: "End date cannot be earlier than start date" | Rejected: "End date cannot be earlier than start date" | **PASS** |
| **TC-006** | Verify validation fails when End Time is before Start Time on same day | Coordinator user; same date, `startTime: 14:00`, `endTime: 10:00` | Call `EventService.createEvent(details, coordId, 'submit')` | Validation failure: "End time must be after start time" | Rejected: "End time must be after start time" | **PASS** |
| **TC-007** | Verify validation fails when capacity is zero or negative | Coordinator user; `capacity: 0` or `capacity: -10` | Call `EventService.createEvent(details, coordId, 'submit')` | Validation failure: "Capacity must be a positive integer" | Rejected: "Capacity must be a positive integer" | **PASS** |
| **TC-008** | Verify validation fails when Start Date is in the past | Coordinator user; `startDate: 2020-01-01` | Call `EventService.createEvent(details, coordId, 'submit')` | Validation failure: "Start date cannot be in the past" | Rejected: "Start date cannot be in the past" | **PASS** |

---

### 3.2 Use Case UC-011: Event Registration & Capacity Management

| Test ID | Test Objective | Inputs & Preconditions | Execution Steps | Expected Result | Actual Result | Status |
|:---|:---|:---|:---|:---|:---|:---|
| **TC-009** | Verify successful participant registration for open event | Registered user; published event with capacity 100, 0 registered | Call `RegistrationService.register(userId, eventId)` | Registration status `CONFIRMED`, ticket generated, count incremented | Status `CONFIRMED`, ticket generated, count = 1 | **PASS** |
| **TC-010** | Verify registration when event reaches maximum capacity | Event capacity 2, already 2 confirmed registrations; new user registers | Call `RegistrationService.register(newUser, eventId)` | Registration placed on waitlist or rejected with capacity notice | Status `WAITLISTED`, position #1 assigned | **PASS** |
| **TC-011** | Verify duplicate registration attempt by same user is rejected | User already confirmed for event; attempts second registration | Call `RegistrationService.register(sameUser, eventId)` | Error: "User is already registered for this event" | Rejected: "User is already registered for this event" | **PASS** |
| **TC-012** | Verify registration fails after registration deadline has passed | Published event with `registrationDeadline` set to yesterday | Call `RegistrationService.register(userId, pastDeadlineEventId)` | Error: "Registration closed. Deadline has passed." | Rejected: "Registration closed. Deadline has passed." | **PASS** |
| **TC-013** | Verify registration fails for draft or unapproved event | Event in `DRAFT` or `PENDING_APPROVAL` status | Call `RegistrationService.register(userId, draftEventId)` | Error: "Registration is not open for this event." | Rejected: "Registration is not open for this event." | **PASS** |
| **TC-014** | Verify registration fails for cancelled event | Event in `CANCELLED` status | Call `RegistrationService.register(userId, cancelledEventId)` | Error: "Registration is not open for this event." | Rejected: "Registration is not open for this event." | **PASS** |
| **TC-015** | Verify concurrency safety under simultaneous registrations | Event with 1 remaining seat; two simultaneous registration calls | Execute concurrent `register` calls | Exactly one succeeds with `CONFIRMED`, second is `WAITLISTED` | Exactly 1 confirmed, 1 waitlisted; 0 overbooking | **PASS** |
| **TC-016** | Verify successful self-service registration cancellation | User has confirmed registration | Call `RegistrationService.cancelRegistration(regId, userId)` | Registration status updated to `CANCELLED`, seat released | Status `CANCELLED`, seat count decremented | **PASS** |
| **TC-017** | Verify cancellation of non-existent registration fails | Non-existent registration ID `REG-99999` | Call `RegistrationService.cancelRegistration('REG-99999', userId)` | Error: "Registration not found." | Rejected: "Registration not found." | **PASS** |
| **TC-018** | Verify seat reclamation promotes next waitlisted participant | Event capacity 1, User A confirmed, User B waitlisted; User A cancels | Call `cancelRegistration(userARegId)`; trigger waitlist reconciliation | User B promoted from `WAITLISTED` to `CONFIRMED` | User B status transitioned to `CONFIRMED` | **PASS** |
| **TC-019** | Verify registration rejected if participant does not meet eligibility | Event restricted to `POLYTECHNIC`; User institute is `SCHOOL` | Call `RegistrationService.register(schoolUser, restrictedEvent)` | Error: "User does not meet institution eligibility criteria" | Rejected: "User does not meet institution eligibility criteria" | **PASS** |
| **TC-020** | Verify registration generates unique ticket code and notification | User successfully registers for event | Inspect returned registration object and `NotificationService` queue | Valid ticket code generated and confirmation alert in inbox | Ticket code generated, notification dispatched | **PASS** |

---

### 3.3 Use Case UC-006: Event Browsing, Filtering & Lifecycle Modifications

| Test ID | Test Objective | Inputs & Preconditions | Execution Steps | Expected Result | Actual Result | Status |
|:---|:---|:---|:---|:---|:---|:---|
| **TC-021** | Verify event search by keyword in title or description | Repository populated with events ("AI Workshop", "Robotics Camp") | Search with keyword `"Robotics"` | Returns only events matching `"Robotics"` | 1 event returned matching `"Robotics"` | **PASS** |
| **TC-022** | Verify event filtering by category | Repositories with categories `CONFERENCE`, `WORKSHOP`, `SEMINAR` | Filter by `category: 'WORKSHOP'` | Returns only events with category `WORKSHOP` | Only `WORKSHOP` events returned | **PASS** |
| **TC-023** | Verify event filtering by delivery mode | Events with modes `OFFLINE`, `ONLINE`, `HYBRID` | Filter by `mode: 'ONLINE'` | Returns only virtual/online events | Only `ONLINE` events returned | **PASS** |
| **TC-024** | Verify event filtering by date range | Events spanning November 2026, December 2026, January 2027 | Filter date range `2026-12-01` to `2026-12-31` | Returns only events occurring in December 2026 | Only December 2026 events returned | **PASS** |
| **TC-025** | Verify combined multi-criteria search and filtering | Multiple events with varied category, mode, and titles | Search `"AI"`, category `WORKSHOP`, mode `HYBRID` | Returns intersection matching all three criteria | Correctly filtered intersection returned | **PASS** |
| **TC-026** | Verify search with no matching results returns empty state | Search query `"NonExistentTermXYZ"` | Execute query | Returns empty array `[]` without error | Empty array `[]` returned cleanly | **PASS** |
| **TC-027** | Verify event coordinator can update draft event details | Event in `DRAFT` status; coordinator updates title and description | Call `EventService.updateEvent(eventId, updates, coordId)` | Event fields updated in database with new values | Event successfully updated with new fields | **PASS** |
| **TC-028** | Verify unauthorized user cannot update event | Participant user attempts to modify coordinator's event | Call `EventService.updateEvent(eventId, updates, participantId)` | Error: "Unauthorized to modify this event" | Rejected: "Unauthorized to modify this event" | **PASS** |

---

## 4. Requirements Traceability Matrix (RTM) for Test Cases

| Test Case ID | Target Requirement ID | Use Case ID | Enforced Business Rule | Verification Output |
|:---|:---|:---|:---|:---|
| **TC-001** | FR-006, FR-011 | UC-004, UC-005 | BR-001, BR-002 | Event created in `PENDING_APPROVAL` status |
| **TC-002** | FR-005 | UC-004 | N/A | Draft saved with minimal fields |
| **TC-003** | FR-004, NFR-003 | UC-004 | BR-009 | Role-based permission denied |
| **TC-004** | FR-006 | UC-004 | BR-001 | 3 validation errors returned |
| **TC-005** | FR-006 | UC-004 | BR-001 | Inverted date error returned |
| **TC-006** | FR-006 | UC-004 | BR-001 | Inverted time error returned |
| **TC-007** | FR-008 | UC-004 | BR-005 | Invalid capacity error returned |
| **TC-008** | FR-006 | UC-004 | BR-002 | Past start date error returned |
| **TC-009** | FR-020, FR-023 | UC-011 | BR-005, BR-006 | Status `CONFIRMED`, ticket generated |
| **TC-010** | FR-021, FR-022 | UC-011 | BR-005 | Status `WAITLISTED`, position assigned |
| **TC-011** | FR-020 | UC-011 | BR-006 | Duplicate registration blocked |
| **TC-012** | FR-020 | UC-011 | BR-008 | Past deadline registration blocked |
| **TC-013** | FR-020 | UC-011 | BR-007 | Unapproved event registration blocked |
| **TC-014** | FR-020 | UC-011 | BR-007 | Cancelled event registration blocked |
| **TC-015** | FR-021, NFR-002 | UC-011 | BR-005 | Atomic concurrency lock verified |
| **TC-016** | FR-024 | UC-012 | N/A | Registration cancelled, seat restored |
| **TC-017** | FR-024 | UC-012 | N/A | Non-existent registration error |
| **TC-018** | FR-022, FR-024 | UC-011, UC-012 | BR-005 | Waitlist candidate auto-promoted |
| **TC-019** | FR-009 | UC-011 | N/A | Ineligible institution blocked |
| **TC-020** | FR-023, FR-028 | UC-011, UC-015 | N/A | Ticket token and alert created |
| **TC-021** | FR-017, NFR-001 | UC-006 | N/A | Title keyword search verified |
| **TC-022** | FR-017 | UC-006 | N/A | Category filtering verified |
| **TC-023** | FR-007, FR-017 | UC-006 | N/A | Mode filtering verified |
| **TC-024** | FR-017 | UC-006 | N/A | Date range filtering verified |
| **TC-025** | FR-017, NFR-001 | UC-006 | N/A | Combined multi-filter verified |
| **TC-026** | FR-017 | UC-006 | N/A | Empty state handling verified |
| **TC-027** | FR-027 | UC-004 | BR-007 | Coordinator update verified |
| **TC-028** | FR-004, NFR-003 | UC-004 | BR-009 | Unauthorized edit blocked |

---

## 5. Automated Execution Log & Results Verification

The automated test suite was executed using the standard Node.js test runner (`node --test tests/*.test.mjs`):

```bash
$ npm test

> institute-connect@0.1.0 test
> node --test tests/*.test.mjs

✔ tests/model.test.mjs (10.963291ms) - 18 tests passed
✔ tests/app.test.mjs (5.429583ms) - 10 tests passed
✔ tests/assignment-04.test.mjs (11.751333ms) - 18 tests passed
✔ tests/assignment-05.test.mjs (12.234125ms) - 18 tests passed
✔ tests/assignment-08.test.mjs (14.887208ms) - 28 tests passed

ℹ tests 92
ℹ suites 0
ℹ pass 92
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 162.246291
```

All 92 automated tests across Assignments 1 through 8 passed cleanly with 0 failures and 0 warnings.
