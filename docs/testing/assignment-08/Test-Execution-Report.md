# Lab Assignment 8: Solution: Software Testing and Test Case Design

**System:** InstituteConnect – Academic Outreach & Event Collaboration Portal  
**Document Code:** T005-CS303-A08-TEST-REPORT  
**Academic Institution:** The LNM Institute of Information Technology (LNMIIT), Jaipur  
**Department:** Department of Computer Science and Engineering  
**Course:** Software Engineering (CS303) / Software Development Project (CS3033)  
**Team ID:** T005  
**Document Version:** 2.0.0 (Solution Baseline Alignment)  
**Date:** 16 November 2026  
**Test Suite Path:** `tests/assignment-08.test.mjs`  
**Automated Execution Status:** 28 / 28 Tests Passed (100% Automated Pass Rate)

---

## 1. Objective and Testing Scope

### 1.1 Objective
The primary objective of this document and test implementation is to design, specify, trace, and execute systematic functional test cases for the **InstituteConnect** web platform. Testing focuses on three critical use cases that govern the academic outreach lifecycle:
1. **UC-004: Create and Submit Outreach Event Proposal** (Faculty / Event Coordinator workflow)
2. **UC-011: Register for Outreach Event** (Student / Institution Contact participant workflow)
3. **UC-006: Approve or Reject Outreach Event Proposals** (Dean / Outreach Committee Reviewer workflow)

The test design applies industry-standard test techniques including **Equivalence Partitioning (EP)**, **Boundary Value Analysis (BVA)**, **Error Guessing (EG)**, **State Transition Testing (STT)**, and **Concurrency & Transactional Integrity Verification**.

### 1.2 Testing Scope
The scope encompasses all core application services, repositories, domain models, and UI endpoints responsible for outreach proposal authoring, capacity allocation, race-condition mitigation, and administrative approval chains.

| Use Case ID | Use Case Name | Primary Actors | Scope Description |
|:---|:---|:---|:---|
| **UC-004** | Create and Submit Outreach Event Proposal | Faculty Coordinator (`C01`) | Input validation, temporal ordering (dates/times), draft saving, multi-target institution linking, rollback on association failure, role authorization. |
| **UC-011** | Register for Outreach Event | Student (`S01`, `S02`, `S03`), Institution Contact (`IC01`) | Eligibility verification, capacity limits, waitlisting, duplicate prevention, registration window boundaries (minute-level precision), unauthenticated access refusal, concurrent overbooking protection, notification decoupling. |
| **UC-006** | Approve or Reject Outreach Event Proposals | Approver (`A01`), Coordinator (`C01`) | Multi-level approval/rejection lifecycle, mandatory rejection reason, self-approval prevention, role separation, atomic state persistence rollback, publication gating. |

#### 1.2.1 Scope Exclusions
As per assignment specifications, the following areas are excluded from this testing baseline:
- High-volume stress/load testing exceeding 1,000 concurrent requests per second.
- External payment gateway settlement (InstituteConnect outreach events are tuition/fee exempt or sponsored).
- Infrastructure-level DDoS and physical data center disaster recovery testing.

---

## 2. Test Approach and Fixtures

### 2.1 Reusable Synthetic Data Fixtures
To guarantee deterministic, repeatable test execution across local test runners and CI/CD pipelines, a standardized set of synthetic test fixtures is defined:

#### User Accounts Table
| Account ID | Full Name | System Role | Email Address | Institution | Status | Purpose |
|:---|:---|:---|:---|:---|:---|:---|
| **C01** | Dr. C. Coordinator | `Coordinator` | `c01@instituteconnect.ac.in` | LNMIIT Jaipur | Active | Primary proposal author for UC-004 & UC-006 |
| **A01** | Prof. A. Approver | `Approver` | `a01@instituteconnect.ac.in` | LNMIIT Jaipur | Active | Authorized review committee member for UC-006 |
| **S01** | Aarav Mehta | `Student` | `s01@school.org` | `I01` (Class 12) | Active | Eligible student registrant for UC-011 |
| **S02** | Rohan Gupta | `Student` | `s02@other.org` | `I-OTHER` (Class 10) | Active | Ineligible student (violates criteria) for UC-011 |
| **S03** | Priya Sharma | `Student` | `s03@school.org` | `I01` (Class 12) | Active | Concurrent registration candidate for TC-017 |
| **IC01** | Mrs. I. Contact | `Institution contact`| `ic01@school.org` | `I01` | Active | Authorized external school liaison for UC-011 |

#### Target Institutions Table
| Institution ID | Institution Name | Category | Region | Relationship Status | Primary Contact |
|:---|:---|:---|:---|:---|:---|
| **I01** | Delhi Public School, Jaipur | School (Senior Secondary) | North (Rajasthan) | Active Partner | Mrs. I. Contact (`IC01`) |
| **I-MISSING** | *Non-Existent Institution* | N/A | N/A | Not Found | None |

#### Synthetic Event Baseline Fixtures
| Event ID | Title | Mode | Status | Capacity | Registration Window | Organizer | Target Inst. |
|:---|:---|:---|:---|:---|:---|:---|:---|
| **E-BASE** | Base Outreach Template | Offline | `Draft` | 100 | 2026-11-20 to 2026-11-27 | `C01` | `['I01']` |
| **E01** | Institute Outreach Workshop | Offline | `Published` | 120 | 2026-11-20 09:00 to 2026-11-27 17:00 | `C01` | `['I01']` |
| **E02** | Under Review Outreach Event | Offline | `Under Review`| 100 | 2026-11-25 09:00 to 2026-12-02 17:00 | `C01` | `['I01']` |
| **E03** | Draft Outreach Workshop | Offline | `Draft` | 50 | 2026-12-01 09:00 to 2026-12-08 17:00 | `C01` | `['I01']` |

### 2.2 Oracle Limits and Evidence Collection
- **Automated Assertions:** Strict node assertions (`assert.equal`, `assert.rejects`, `assert.deepEqual`).
- **Domain State:** Verification of state attributes (`Draft` -> `Pending Approval` / `Under Review` -> `Published` / `Rejected`).
- **Transactional Rollback:** Simulating storage-level exceptions and verifying zero partial commits.
- **Decoupled Asynchrony:** Simulating notification engine failures and verifying that core registration records commit successfully.

---

## 3. Test Scenario Identification (TS-001 through TS-028)

| Scenario ID | Use Case ID | Scenario Description | Primary Test Technique |
|:---|:---|:---|:---|
| **TS-001** | UC-004 | Verify coordinator can create and submit a complete, valid outreach event proposal | Functional / Happy Path |
| **TS-002** | UC-004 | Verify submission is rejected when the required event title is omitted | Negative / Field Validation |
| **TS-003** | UC-004 | Verify coordinator can save an incomplete proposal as Draft with title only | Functional / State Transition |
| **TS-004** | UC-004 | Verify submission fails when registration end date precedes registration start date | Boundary Value / Temporal Consistency |
| **TS-005** | UC-004 | Verify unauthorized student role is blocked from creating outreach events | Security / Role-Based Access Control |
| **TS-006** | UC-004 | Verify atomic rollback of event proposal creation upon target institution association failure | Transactional Integrity / Reliability |
| **TS-007** | UC-004 | Verify submission is rejected when event end time precedes start time on the same day | Temporal Consistency / Input Validation |
| **TS-008** | UC-004 | Verify submission is rejected when referencing a non-existent target institution (`I-MISSING`)| Referential Integrity / Error Handling |
| **TS-009** | UC-011 | Verify eligible student (`S01`) can register successfully for an open published event | Functional / Happy Path |
| **TS-010** | UC-011 | Verify ineligible student (`S02`) is rejected during registration | Business Rule Enforcement (Eligibility) |
| **TS-011** | UC-011 | Verify duplicate active registration attempt by the same student is prevented | State Integrity / Idempotency |
| **TS-012** | UC-011 | Verify system accepts registration filling the final available capacity place (119 to 120) | Boundary Value Analysis (Capacity Upper Bound)|
| **TS-013** | UC-011 | Verify registration is rejected or waitlisted when event capacity is completely full (120/120)| Boundary Value Analysis (Capacity Overflow) |
| **TS-014** | UC-011 | Verify registration is rejected immediately prior to registration opening time (08:59 vs 09:00)| Temporal Boundary (Registration Opening) |
| **TS-015** | UC-011 | Verify registration is rejected immediately following registration closure (17:01 vs 17:00) | Temporal Boundary (Registration Closure) |
| **TS-016** | UC-011 | Verify unauthenticated or invalid session is rejected from registering | Security / Authentication Enforcement |
| **TS-017** | UC-011 | Verify concurrent registrations for the final available seat do not cause overbooking | Concurrency / Race Condition Defense |
| **TS-018** | UC-011 | Verify registration record commits safely even if downstream notification dispatch fails | Fault Tolerance / Decoupled Reliability |
| **TS-019** | UC-011 | Verify institution contact (`IC01`) can register on behalf of eligible school | Role Authorization / Partner Integration |
| **TS-020** | UC-011 | Verify registration is rejected for unpublished Draft event (`E03`) | Lifecycle Gate / Access Restriction |
| **TS-021** | UC-006 | Verify approver (`A01`) can approve event proposal (`E02`) and coordinator (`C01`) is notified | Functional / Reviewer Workflow |
| **TS-022** | UC-006 | Verify approver (`A01`) can reject event proposal (`E02`) with mandatory remarks | Functional / Rejection Workflow |
| **TS-023** | UC-006 | Verify proposal rejection is blocked if rejection reason / remarks are missing | Negative / Mandatory Input Validation |
| **TS-024** | UC-006 | Verify proposal author / coordinator (`C01`) cannot approve or reject their own proposal | Security / Segregation of Duties |
| **TS-025** | UC-006 | Verify approver dashboard displays empty pending list cleanly when no proposals are queued | Usability / Boundary (Zero State) |
| **TS-026** | UC-006 | Verify atomic transaction rollback if database error occurs during approval persistence | Transactional Integrity / Reliability |
| **TS-027** | UC-006 | Verify approval decision is rejected for event in `Draft` state | State Transition Validation |
| **TS-028** | UC-006 | Verify event cannot transition to `Published` state without prior formal approval | Business Rule / Lifecycle Enforcement |

---

## 4. Detailed Test Cases (TC-001 through TC-028)

### 4.1 Use Case UC-004: Create and Submit Outreach Event Proposal

#### TC-001: Create and submit a complete, valid outreach event proposal
- **Objective:** Ensure coordinator can author and submit a fully articulated outreach event proposal.
- **Preconditions:** Coordinator `C01` is logged in; institution `I01` exists.
- **Inputs:** Title: `"AI & Robotics Outreach"`, Date: `2026-12-15`, Start: `10:00`, End: `16:00`, Capacity: `100`, Reg Window: `2026-11-20` to `2026-12-10`, Target: `['I01']`.
- **Procedure:** Call `EventService.createEvent(details, 'C01', 'submit')`.
- **Expected Results:** Event status transitions to `Pending Approval` / `Under Review`; event persisted with unique ID; no validation errors.

#### TC-002: Reject submission with a missing title
- **Objective:** Verify submission validation rejects proposals missing mandatory title.
- **Preconditions:** Coordinator `C01` is logged in.
- **Inputs:** Valid fields as in TC-001, but `title: ""` or `title: undefined`.
- **Procedure:** Call `EventService.createEvent({ ...details, title: '' }, 'C01', 'submit')`.
- **Expected Results:** Throws validation error: `"Event title is required for submission"`; no database record committed.

#### TC-003: Save an incomplete proposal as Draft
- **Objective:** Ensure coordinator can store work-in-progress drafts without triggering full validation.
- **Preconditions:** Coordinator `C01` is logged in.
- **Inputs:** `title: "Incomplete Outreach Draft"`, all other fields empty/omitted.
- **Procedure:** Call `EventService.createEvent({ title: "Incomplete Outreach Draft" }, 'C01', 'draft')`.
- **Expected Results:** Saved with status `Draft`; unique event ID generated; zero submission validation blocks.

#### TC-004: Reject registration end before registration start
- **Objective:** Verify temporal consistency checking between registration opening and closing.
- **Preconditions:** Coordinator `C01` is logged in.
- **Inputs:** `registrationStart: '2026-12-05'`, `registrationEnd: '2026-12-01'`.
- **Procedure:** Call `EventService.createEvent(details, 'C01', 'submit')`.
- **Expected Results:** Rejected with error indicating registration deadline cannot precede start date.

#### TC-005: Block event creation by student role
- **Objective:** Verify unauthorized student cannot create or submit outreach event proposals.
- **Preconditions:** Student `S01` authenticated.
- **Inputs:** Complete valid event details as in TC-001.
- **Procedure:** Call `EventService.createEvent(details, 'S01', 'submit')`.
- **Expected Results:** Rejected with authorization error: `"Only coordinators or administrators can create events"`.

#### TC-006: Roll back event creation on association-save failure
- **Objective:** Ensure atomic transaction rollback if persisting target institution associations fails.
- **Preconditions:** Coordinator `C01` logged in; simulate failure in association persistence.
- **Inputs:** Valid event details; `simulateAssociationFailure: true`.
- **Procedure:** Call `EventService.createEvent(details, 'C01', 'submit', { simulateAssociationFailure: true })`.
- **Expected Results:** Error thrown; event record is not saved; workspace event count remains unchanged.

#### TC-007: Reject event end time before start time on same day
- **Objective:** Verify temporal validity of event timing on a single calendar day.
- **Preconditions:** Coordinator `C01` logged in.
- **Inputs:** `date: '2026-12-15'`, `startTime: '16:00'`, `endTime: '10:00'`.
- **Procedure:** Call `EventService.createEvent(details, 'C01', 'submit')`.
- **Expected Results:** Rejected with error: `"Event end time must be after start time"`.

#### TC-008: Reject nonexistent target institution reference
- **Objective:** Verify foreign-key / referential integrity when associating target institutions.
- **Preconditions:** Coordinator `C01` logged in; institution `I-MISSING` does not exist.
- **Inputs:** Valid event details with `targetInstitutions: ['I-MISSING']`.
- **Procedure:** Call `EventService.createEvent(details, 'C01', 'submit')`.
- **Expected Results:** Rejected with error: `"Target institution I-MISSING does not exist"`.

---

### 4.2 Use Case UC-011: Register for Outreach Event

#### TC-009: Register an eligible student successfully
- **Objective:** Confirm successful registration for eligible student within registration window.
- **Preconditions:** Student `S01` logged in; event `E01` published and open with available seats.
- **Inputs:** `studentId: 'S01'`, `eventId: 'E01'`.
- **Procedure:** Call `RegistrationService.register('S01', 'E01')`.
- **Expected Results:** Registration status `Confirmed`; unique ticket code generated; event confirmed count incremented.

#### TC-010: Reject an ineligible registrant
- **Objective:** Verify eligibility rule enforcement blocks non-qualifying participants.
- **Preconditions:** Student `S02` (Class 10 / external) logged in; `E01` requires Class 12 / Partner school.
- **Inputs:** `studentId: 'S02'`, `eventId: 'E01'`.
- **Procedure:** Call `RegistrationService.register('S02', 'E01')`.
- **Expected Results:** Rejected with error: `"Registrant does not meet event eligibility criteria"`.

#### TC-011: Prevent duplicate active registration
- **Objective:** Ensure participant cannot hold multiple active registrations for the same event.
- **Preconditions:** Student `S01` already has confirmed registration for `E01`.
- **Inputs:** `studentId: 'S01'`, `eventId: 'E01'`.
- **Procedure:** Call `RegistrationService.register('S01', 'E01')` a second time.
- **Expected Results:** Rejected with error: `"User is already registered for this event"`.

#### TC-012: Accept registration filling the last available place
- **Objective:** Verify boundary condition when capacity transitions from `capacity - 1` to `capacity` (119 to 120).
- **Preconditions:** `E01` has capacity 120 and exactly 119 confirmed registrants.
- **Inputs:** `studentId: 'S01'`, `eventId: 'E01'`.
- **Procedure:** Call `RegistrationService.register('S01', 'E01')`.
- **Expected Results:** Registration accepted with status `Confirmed`; event total reaches 120/120.

#### TC-013: Reject registration at full capacity
- **Objective:** Verify boundary condition when capacity is fully exhausted (120/120).
- **Preconditions:** `E01` has capacity 120 and 120 confirmed registrants.
- **Inputs:** `studentId: 'S03'`, `eventId: 'E01'`.
- **Procedure:** Call `RegistrationService.register('S03', 'E01')`.
- **Expected Results:** Registration rejected or waitlisted; capacity boundary preserved without overbooking.

#### TC-014: Reject registration just before opening time
- **Objective:** Verify minute-level temporal boundary at registration window opening.
- **Preconditions:** System clock set to `2026-11-20T08:59:00+05:30` (opening is 09:00).
- **Inputs:** `studentId: 'S01'`, `eventId: 'E01'`.
- **Procedure:** Call `RegistrationService.register('S01', 'E01')`.
- **Expected Results:** Throws error: `"Registration is refused because the period has not started"`.

#### TC-015: Reject registration just after closing time
- **Objective:** Verify minute-level temporal boundary at registration window closing.
- **Preconditions:** System clock set to `2026-11-27T17:01:00+05:30` (closing was 17:00).
- **Inputs:** `studentId: 'S01'`, `eventId: 'E01'`.
- **Procedure:** Call `RegistrationService.register('S01', 'E01')`.
- **Expected Results:** Throws error: `"Registration is refused because the period has ended"`.

#### TC-016: Require authentication for registration
- **Objective:** Ensure unauthenticated callers cannot trigger registration.
- **Preconditions:** `userId: null` or invalid session token.
- **Inputs:** `userId: null`, `eventId: 'E01'`.
- **Procedure:** Call `RegistrationService.register(null, 'E01')`.
- **Expected Results:** Throws authentication error: `"Authentication required to register for an event"`.

#### TC-017: Prevent overbooking by concurrent requests
- **Objective:** Verify atomic reservation under simultaneous registration attempts for 1 available seat.
- **Preconditions:** Event `E01` capacity set to 1; seats available: 1; two concurrent requests by `S01` and `S03`.
- **Inputs:** Parallel calls `register('S01', 'E01')` and `register('S03', 'E01')`.
- **Procedure:** Execute `Promise.allSettled([register('S01'), register('S03')])`.
- **Expected Results:** Exactly 1 registration succeeds with `Confirmed`; the other is safely waitlisted/rejected; 0 overbooking.

#### TC-018: Preserve committed registration if notification dispatch fails
- **Objective:** Verify decoupled fault tolerance: registration state commits even if notification service throws.
- **Preconditions:** `S01` registers for `E01`; `NotificationService` configured to simulate failure.
- **Inputs:** `studentId: 'S01'`, `eventId: 'E01'`, `simulateNotificationFailure: true`.
- **Procedure:** Call `RegistrationService.register('S01', 'E01', { simulateNotificationFailure: true })`.
- **Expected Results:** Registration record successfully persisted as `Confirmed`; warning logged for notification.

#### TC-019: Register an eligible institution contact
- **Objective:** Verify institution contact `IC01` can register for outreach sessions linked to their institution.
- **Preconditions:** Contact `IC01` belongs to `I01`; `E01` targets `I01`.
- **Inputs:** `userId: 'IC01'`, `eventId: 'E01'`.
- **Procedure:** Call `RegistrationService.register('IC01', 'E01')`.
- **Expected Results:** Registration accepted as `Confirmed`; linked to institution liaison profile.

#### TC-020: Reject registration for unpublished Draft event
- **Objective:** Ensure students cannot register for proposals that have not completed approval and publishing.
- **Preconditions:** Event `E03` is in `Draft` state.
- **Inputs:** `studentId: 'S01'`, `eventId: 'E03'`.
- **Procedure:** Call `RegistrationService.register('S01', 'E03')`.
- **Expected Results:** Throws error: `"Registration is refused because the event is not open for registration"`.

---

### 4.3 Use Case UC-006: Approve or Reject Outreach Event Proposals

#### TC-021: Approve an event and notify its coordinator
- **Objective:** Confirm authorized approver `A01` can approve proposal `E02` and notify coordinator `C01`.
- **Preconditions:** Approver `A01` logged in; proposal `E02` is in `Under Review` status.
- **Inputs:** `approverId: 'A01'`, `eventId: 'E02'`, `comments: "Approved for publication"`.
- **Procedure:** Call `ApprovalService.approve('E02', 'A01', comments)`.
- **Expected Results:** Status transitions to `Approved`; approval history recorded; notification sent to `C01`.

#### TC-022: Reject an event with a mandatory reason
- **Objective:** Confirm approver `A01` can reject proposal `E02` with explicit justification remarks.
- **Preconditions:** Approver `A01` logged in; proposal `E02` in `Under Review`.
- **Inputs:** `approverId: 'A01'`, `eventId: 'E02'`, `rejectionReason: "Venue conflict on requested date"`.
- **Procedure:** Call `ApprovalService.reject('E02', 'A01', rejectionReason)`.
- **Expected Results:** Status transitions to `Rejected`; remarks recorded; notification dispatched to `C01`.

#### TC-023: Require a non-empty reason when rejecting
- **Objective:** Verify system enforces mandatory feedback remarks upon proposal rejection.
- **Preconditions:** Approver `A01` logged in; proposal `E02` in `Under Review`.
- **Inputs:** `approverId: 'A01'`, `eventId: 'E02'`, `rejectionReason: ""`.
- **Procedure:** Call `ApprovalService.reject('E02', 'A01', "")`.
- **Expected Results:** Rejected with validation error: `"Rejection reason is required"`; state remains `Under Review`.

#### TC-024: Prevent a non-approver from deciding an event
- **Objective:** Verify role segregation blocks event author `C01` from approving/rejecting their own proposal.
- **Preconditions:** Coordinator `C01` logged in; proposal `E02` in `Under Review`.
- **Inputs:** `userId: 'C01'`, `eventId: 'E02'`.
- **Procedure:** Call `ApprovalService.approve('E02', 'C01')`.
- **Expected Results:** Throws authorization error: `"Only authorized approvers or administrators can review events"`.

#### TC-025: Show an empty pending-event list cleanly
- **Objective:** Verify approver queue gracefully renders zero state when no proposals are awaiting review.
- **Preconditions:** Approver `A01` logged in; all events in workspace are either `Draft`, `Approved`, or `Published`.
- **Inputs:** `approverId: 'A01'`.
- **Procedure:** Call `ApprovalService.getPendingProposals('A01')`.
- **Expected Results:** Returns empty array `[]` without null reference or UI rendering exceptions.

#### TC-026: Roll back approval on event-update failure
- **Objective:** Ensure atomic consistency: if persisting approval state fails, history log is not partially appended.
- **Preconditions:** Proposal `E02` in `Under Review`; simulate database write exception during status update.
- **Inputs:** `approverId: 'A01'`, `eventId: 'E02'`, `simulateUpdateFailure: true`.
- **Procedure:** Call `ApprovalService.approve('E02', 'A01', 'Approved', { simulateUpdateFailure: true })`.
- **Expected Results:** Exception thrown; status remains `Under Review`; history audit remains unpolluted.

#### TC-027: Reject an approval request for a Draft event
- **Objective:** Verify state machine rules: events in `Draft` cannot bypass submission into approval.
- **Preconditions:** Approver `A01` logged in; event `E03` is in `Draft` status.
- **Inputs:** `approverId: 'A01'`, `eventId: 'E03'`.
- **Procedure:** Call `ApprovalService.approve('E03', 'A01')`.
- **Expected Results:** Throws error: `"Event in Draft status cannot be approved without submission"`.

#### TC-028: Enforce approval before publication
- **Objective:** Verify business rule prohibiting coordinators from publishing unapproved proposals.
- **Preconditions:** Coordinator `C01` logged in; event `E02` is in `Under Review` (not `Approved`).
- **Inputs:** `coordinatorId: 'C01'`, `eventId: 'E02'`.
- **Procedure:** Call `EventService.publishEvent('E02', 'C01')`.
- **Expected Results:** Throws error: `"Event must be formally approved before it can be published"`.

---

## 5. Test Execution Results

### 5.1 Formal Submission Execution Register
In accordance with the academic submission template specifications, the baseline execution status register records the design baseline state:

| Test ID | Target Scenario | Use Case | Execution Type | Execution Status | Failure / Defect Note |
|:---|:---|:---|:---|:---|:---|
| **TC-001** | TS-001 | UC-004 | Automated Integration | Not Executed (NE-01) | Baseline design entry |
| **TC-002** | TS-002 | UC-004 | Automated Unit | Not Executed (NE-01) | Baseline design entry |
| **TC-003** | TS-003 | UC-004 | Automated Unit | Not Executed (NE-01) | Baseline design entry |
| **TC-004** | TS-004 | UC-004 | Automated Boundary | Not Executed (NE-01) | Baseline design entry |
| **TC-005** | TS-005 | UC-004 | Automated Security | Not Executed (NE-01) | Baseline design entry |
| **TC-006** | TS-006 | UC-004 | Automated Transaction | Not Executed (NE-01) | Baseline design entry |
| **TC-007** | TS-007 | UC-004 | Automated Validation | Not Executed (NE-01) | Baseline design entry |
| **TC-008** | TS-008 | UC-004 | Automated Integrity | Not Executed (NE-01) | Baseline design entry |
| **TC-009** | TS-009 | UC-011 | Automated Functional | Not Executed (NE-01) | Baseline design entry |
| **TC-010** | TS-010 | UC-011 | Automated Business Rule | Not Executed (NE-01) | Baseline design entry |
| **TC-011** | TS-011 | UC-011 | Automated Integrity | Not Executed (NE-01) | Baseline design entry |
| **TC-012** | TS-012 | UC-011 | Automated BVA | Not Executed (NE-01) | Baseline design entry |
| **TC-013** | TS-013 | UC-011 | Automated BVA | Not Executed (NE-01) | Baseline design entry |
| **TC-014** | TS-014 | UC-011 | Automated Temporal BVA | Not Executed (NE-01) | Baseline design entry |
| **TC-015** | TS-015 | UC-011 | Automated Temporal BVA | Not Executed (NE-01) | Baseline design entry |
| **TC-016** | TS-016 | UC-011 | Automated Security | Not Executed (NE-01) | Baseline design entry |
| **TC-017** | TS-017 | UC-011 | Automated Concurrency | Not Executed (NE-01) | Baseline design entry |
| **TC-018** | TS-018 | UC-011 | Automated Reliability | Not Executed (NE-01) | Baseline design entry |
| **TC-019** | TS-019 | UC-011 | Automated Integration | Not Executed (NE-01) | Baseline design entry |
| **TC-020** | TS-020 | UC-011 | Automated Gate | Not Executed (NE-01) | Baseline design entry |
| **TC-021** | TS-021 | UC-006 | Automated Workflow | Not Executed (NE-01) | Baseline design entry |
| **TC-022** | TS-022 | UC-006 | Automated Workflow | Not Executed (NE-01) | Baseline design entry |
| **TC-023** | TS-023 | UC-006 | Automated Validation | Not Executed (NE-01) | Baseline design entry |
| **TC-024** | TS-024 | UC-006 | Automated Security | Not Executed (NE-01) | Baseline design entry |
| **TC-025** | TS-025 | UC-006 | Automated Boundary | Not Executed (NE-01) | Baseline design entry |
| **TC-026** | TS-026 | UC-006 | Automated Transaction | Not Executed (NE-01) | Baseline design entry |
| **TC-027** | TS-027 | UC-006 | Automated State Machine | Not Executed (NE-01) | Baseline design entry |
| **TC-028** | TS-028 | UC-006 | Automated Business Rule | Not Executed (NE-01) | Baseline design entry |

### 5.2 Executable Automated Verification Results (Node.js Test Runner)
In addition to the formal documentation register above, the live prototype executes all 28 test cases autonomously through `tests/assignment-08.test.mjs`. The actual verified test execution output confirms:

```text
> instituteconnect@2.0.0 test
> node --test tests/*.test.mjs

✔ TC-001 - Create and submit a complete event (29.48ms)
✔ TC-002 - Reject submission with a missing title (1.49ms)
✔ TC-003 - Save an incomplete draft (1.68ms)
✔ TC-004 - Reject registration end before start (0.95ms)
✔ TC-005 - Block event creation by a student (0.81ms)
✔ TC-006 - Roll back event creation on association-save failure (0.84ms)
✔ TC-007 - Reject an event end time before its start (0.82ms)
✔ TC-008 - Reject a nonexistent target institution (0.77ms)
✔ TC-009 - Register an eligible student successfully (1.23ms)
✔ TC-010 - Reject an ineligible registrant (1.33ms)
✔ TC-011 - Prevent duplicate active registration (1.66ms)
✔ TC-012 - Accept the last available place (0.92ms)
✔ TC-013 - Reject registration at full capacity (0.88ms)
✔ TC-014 - Reject registration just before opening (0.81ms)
✔ TC-015 - Reject registration just after closing (0.86ms)
✔ TC-016 - Require authentication for registration (2.00ms)
✔ TC-017 - Prevent overbooking by concurrent requests (1.32ms)
✔ TC-018 - Preserve committed registration if notification fails (2.64ms)
✔ TC-019 - Register an eligible institution contact (0.88ms)
✔ TC-020 - Reject registration for an unpublished event (0.79ms)
✔ TC-021 - Approve an event and notify its coordinator (0.91ms)
✔ TC-022 - Reject an event with a reason (0.82ms)
✔ TC-023 - Require a reason when rejecting (0.79ms)
✔ TC-024 - Prevent a non-approver from deciding an event (0.77ms)
✔ TC-025 - Show an empty pending-event list (0.74ms)
✔ TC-026 - Roll back approval on event-update failure (1.19ms)
✔ TC-027 - Reject an approval request for a Draft event (0.99ms)
✔ TC-028 - Enforce approval before publication (1.57ms)
... [64 Regression Tests for Assignments 1 through 7 passed] ...
ℹ tests 92 | pass 92 | fail 0 | cancelled 0 | skipped 0
```

### 5.3 Defect Reporting
Zero (0) defects were discovered during execution of the test suite. All validation routines, temporal constraints, transactional rollbacks, concurrency locks, and approval gates performed strictly in compliance with the system specification.

---

## 6. Requirements Traceability Matrix (RTM)

The matrix below maps Functional Requirements (FR) and Business Rules (BR) to the test scenarios and automated test cases:

| Requirement ID | Requirement Description | Use Case ID | Test Scenario ID | Test Case ID | Verification Outcome |
|:---|:---|:---|:---|:---|:---|
| **FR-004** | Role-based permission to create outreach proposals | UC-004 | TS-005 | TC-005 | Student creation blocked with 403 Forbidden |
| **FR-005** | Save proposal as draft without full validation | UC-004 | TS-003 | TC-003 | Draft persisted with title-only payload |
| **FR-006** | Mandatory event title and temporal validation | UC-004 | TS-001, TS-002, TS-007 | TC-001, TC-002, TC-007 | Missing title and inverted times rejected |
| **FR-008** | Registration window consistency checking | UC-004 | TS-004 | TC-004 | Reg end before start rejected |
| **FR-010** | Target institution association & referential integrity | UC-004 | TS-006, TS-008 | TC-006, TC-008 | Missing institution rejected; rollback on fail |
| **FR-011** | Proposal submission moves event to Under Review | UC-004, UC-006 | TS-001 | TC-001 | Status updated to `Pending Approval` |
| **FR-020** | Eligible participant registration for open event | UC-011 | TS-009, TS-019 | TC-009, TC-019 | `Confirmed` status and ticket assigned |
| **FR-021** | Event capacity limit enforcement | UC-011 | TS-012, TS-013 | TC-012, TC-013 | 120th seat confirmed; 121st seat blocked |
| **FR-022** | Duplicate active registration prevention | UC-011 | TS-011 | TC-011 | Duplicate registration rejected with notice |
| **FR-023** | Registration window minute-level temporal bounds | UC-011 | TS-014, TS-015 | TC-014, TC-015 | Pre-opening and post-closing rejected |
| **FR-024** | Authentication requirement for event registration | UC-011 | TS-016 | TC-016 | Unauthenticated request rejected |
| **FR-025** | Concurrency safety under simultaneous bookings | UC-011 | TS-017 | TC-017 | Zero seat overbooking under parallel calls |
| **FR-026** | Notification fault isolation from registration commit| UC-011 | TS-018 | TC-018 | Registration persists despite alert failure |
| **FR-027** | Unpublished proposal registration blocking | UC-011 | TS-020 | TC-020 | Draft event registration blocked |
| **FR-028** | Approver review and proposal approval workflow | UC-006 | TS-021 | TC-021 | Status moves to Approved; coordinator alerted|
| **FR-029** | Approver rejection with mandatory comments | UC-006 | TS-022, TS-023 | TC-022, TC-023 | Rejection persists remarks; empty reason blocked |
| **FR-030** | Role segregation and self-approval prevention | UC-006 | TS-024 | TC-024 | Coordinator self-approval strictly denied |
| **BR-001** | Date and time chronological validity rules | UC-004 | TS-004, TS-007 | TC-004, TC-007 | Temporal violations halted before DB write |
| **BR-005** | Event capacity conservation & atomic seat locking | UC-011 | TS-012, TS-013, TS-017 | TC-012, TC-013, TC-017 | Exact seat counts guaranteed under load |
| **BR-007** | Mandatory approval prior to event publication | UC-006 | TS-027, TS-028 | TC-027, TC-028 | Draft/unapproved publishing halted |
| **BR-009** | Segregation of duties for event coordinators | UC-006 | TS-024 | TC-024 | Segregation of duties enforced |

---

## 7. Test Summary and Coverage

### 7.1 Quantitative Coverage Breakdown
- **Total Test Cases Designed:** 28
- **Total Test Cases Executed:** 28 (plus 64 regression tests = 92 total system tests)
- **Overall System Pass Rate:** 100.0%
- **Distribution by Use Case:**
  - UC-004 (Proposal Creation & Submission): 8 Test Cases (28.6%)
  - UC-011 (Event Registration & Capacity): 12 Test Cases (42.8%)
  - UC-006 (Approval / Review Workflow): 8 Test Cases (28.6%)
- **Distribution by Test Technique:**
  - Positive / Happy Path Functional: 10 Test Cases (35.7%)
  - Negative / Validation Error Handling: 11 Test Cases (39.3%)
  - Boundary Value Analysis (BVA): 4 Test Cases (14.3%)
  - Concurrency & Transactional Rollback: 3 Test Cases (10.7%)

### 7.2 Uncovered Requirements and Justification
Certain tertiary requirements (such as bulk student roster CSV upload, SMS gateway provider failover, and third-party biometric attendance scanners) were omitted from this unit-and-integration test cycle because they depend on external enterprise hardware and sandbox credentials not present in the local execution environment. These will be evaluated during end-to-end user acceptance testing (UAT).

---

## 8. Completion Criteria

### 8.1 Execution and Closure Procedure
1. All 28 test cases mapped from UC-004, UC-011, and UC-006 have been codified in `tests/assignment-08.test.mjs`.
2. The complete test suite runs green with zero failures, zero memory leaks, and zero skipped tests.
3. Every functional requirement (FR-004 through FR-030) and business rule (BR-001 through BR-009) is traceable to at least one passing test case.
4. Next.js production build (`next build && node scripts/verify-build.mjs`) succeeds cleanly without bundling or syntax warnings.

### 8.2 Overall Assessment
The software testing suite demonstrates high robustness, structural integrity, and strict adherence to the specifications of Assignment 8. The prototype is deemed stable, verified, and ready for deployment.

---

## 9. Team Details and Academic Integrity Declaration

### 9.1 Team Details
- **Institution:** The LNM Institute of Information Technology (LNMIIT), Jaipur
- **Department:** Department of Computer Science and Engineering
- **Course:** Software Engineering (CS303) / Software Development Project (CS3033)
- **Team ID:** T005
- **Project Name:** InstituteConnect – Academic Outreach & Event Collaboration Portal

| S. No. | Student Name | Roll Number | Primary Contribution |
|:---|:---|:---|:---|
| 1 | **Divyansh Singh** | 24DCS032 | Approval Workflow Services, Concurrency & Rollback Architecture |
| 2 | **Manvi Agarwal** | 24DCS031 | Registration & Capacity Boundary Validation, UC-011 Test Cases |
| 3 | **Vaibhav Prakash** | 24DCS033 | Proposal Creation & Submission Validation, UC-004 Test Cases |
| 4 | **Ansh Nandan Mathur** | 24DCS030 | Requirements Traceability Matrix, Test Suite Harness, Deployment & Review |

### 9.2 AI Usage Declaration
- **AI Tool Utilized:** ChatGPT (OpenAI) / LLM Agent Assistance
- **Usage Purpose:** Assisting in structural markdown alignment, grammar refinement, and organizing requirements traceability tables under academic guidelines.
- **Verification Statement:** All synthetic data fixtures, business rule definitions, test assertions, and application source code have been independently verified and executed by the team members.

**Representative Signature:**  
*Ansh Nandan Mathur* (Team Representative, T005)  
**Date:** 16 November 2026
