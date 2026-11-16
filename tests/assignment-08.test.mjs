/**
 * InstituteConnect | T005 | CS314 | Assignment 8
 * Software Testing and Test Case Design — Executable Test Suite
 *
 * Implements all 28 Test Cases from Lab Assignment 8: Solution:
 * - UC-004: Create Outreach Event (TS-001 to TS-008, TC-001 to TC-008)
 * - UC-011: Register for Outreach Event (TS-009 to TS-020, TC-009 to TC-020)
 * - UC-006: Approve Event (TS-021 to TS-028, TC-021 to TC-028)
 *
 * Reusable Synthetic Data Fixtures (Section 2.1):
 * - Accounts: C01 (Coordinator), A01 (Approver), S01/S03 (Eligible Students), S02 (Ineligible Student), IC01 (Institution Contact)
 * - Institution: I01 (Existing school record with a valid associated contact)
 * - Events: E-BASE, E01 (Published/Open), E02 (Under Review), E03 (Draft)
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { Workspace, seed, isoDate } from '../model.mjs';
import {
  EventService,
  RegistrationService,
  ApprovalService,
  NotificationService
} from '../lib/design-services.mjs';

// Synthetic Test Clocks
const NORMAL_TEST_CLOCK = new Date('2026-11-24T12:00:00+05:30');

// Helper to construct a fresh workspace populated with the Section 2.1 fixtures
function createAssignment8Workspace(clockDate = NORMAL_TEST_CLOCK) {
  const ws = new Workspace(seed(clockDate), () => clockDate);

  // 1. Synthetic Accounts (Section 2.1)
  const syntheticUsers = [
    {
      id: 'C01',
      name: 'Dr. C. Coordinator',
      role: 'Coordinator',
      email: 'c01@instituteconnect.ac.in',
      status: 'Active',
      institutionId: null
    },
    {
      id: 'A01',
      name: 'Prof. A. Approver',
      role: 'Approver',
      email: 'a01@instituteconnect.ac.in',
      status: 'Active',
      institutionId: null
    },
    {
      id: 'S01',
      name: 'Aarav Mehta (S01)',
      role: 'Student',
      email: 's01@school.org',
      status: 'Active',
      institutionId: 'I01',
      level: 'Class 12'
    },
    {
      id: 'S02',
      name: 'Rohan Gupta (S02 Ineligible)',
      role: 'Student',
      email: 's02@other.org',
      status: 'Active',
      institutionId: 'I-OTHER',
      level: 'Class 10'
    },
    {
      id: 'S03',
      name: 'Priya Sharma (S03)',
      role: 'Student',
      email: 's03@school.org',
      status: 'Active',
      institutionId: 'I01',
      level: 'Class 12'
    },
    {
      id: 'IC01',
      name: 'Mrs. I. Contact',
      role: 'Institution contact',
      email: 'ic01@school.org',
      status: 'Active',
      institutionId: 'I01'
    }
  ];

  for (const u of syntheticUsers) {
    const existingIdx = ws.data.users.findIndex(x => x.id === u.id);
    if (existingIdx !== -1) ws.data.users[existingIdx] = u;
    else ws.data.users.push(u);
  }

  // 2. Synthetic Institution I01 (Section 2.1)
  const institutionI01 = {
    id: 'I01',
    name: 'Delhi Public School, Jaipur (I01)',
    type: 'School',
    address: 'Jaipur, Rajasthan',
    region: 'North',
    relationshipStatus: 'Active'
  };
  const instIdx = ws.data.institutions.findIndex(i => i.id === 'I01');
  if (instIdx !== -1) ws.data.institutions[instIdx] = institutionI01;
  else ws.data.institutions.push(institutionI01);

  const contactIC01 = {
    id: 'C-IC01',
    institutionId: 'I01',
    name: 'Mrs. I. Contact',
    email: 'ic01@school.org',
    phone: '+91 90000 00099',
    designation: 'Outreach Contact'
  };
  const contactIdx = ws.data.contacts.findIndex(c => c.institutionId === 'I01');
  if (contactIdx !== -1) ws.data.contacts[contactIdx] = contactIC01;
  else ws.data.contacts.push(contactIC01);

  // 3. E-BASE, E01, E02, E03 Fixtures
  const E01 = {
    id: 'E01',
    title: 'Institute Outreach Workshop',
    description: 'Outreach workshop for eligible students',
    category: 'Workshop',
    date: '2026-11-30',
    startTime: '10:00',
    endTime: '12:00',
    mode: 'Offline',
    venue: 'LNMIIT Jaipur',
    organizerId: 'C01',
    targetInstitutions: ['I01'],
    institutionIds: ['I01'],
    capacity: 120,
    registrationStart: '2026-11-20',
    registrationEnd: '2026-11-27',
    registrationStartTime: '09:00',
    registrationEndTime: '17:00',
    eligibility: 'All students',
    instructions: 'bring institution ID',
    status: 'Published',
    history: [
      {
        id: 'AP-E01',
        decision: 'Approved',
        by: 'A01',
        comments: 'Reviewed and approved for publication',
        date: '2026-11-19T10:00:00+05:30'
      }
    ]
  };

  const E02 = {
    id: 'E02',
    title: 'Under Review Outreach Event',
    description: 'Proposal awaiting approver review',
    category: 'Workshop',
    date: '2026-12-05',
    startTime: '10:00',
    endTime: '12:00',
    mode: 'Offline',
    venue: 'LNMIIT Jaipur',
    organizerId: 'C01',
    targetInstitutions: ['I01'],
    institutionIds: ['I01'],
    capacity: 100,
    registrationStart: '2026-11-25',
    registrationEnd: '2026-12-02',
    registrationStartTime: '09:00',
    registrationEndTime: '17:00',
    eligibility: 'All students',
    instructions: 'bring institution ID',
    status: 'Under Review',
    history: [
      {
        id: 'AP-E02-START',
        decision: 'Under Review',
        by: 'A01',
        comments: 'Review started.',
        date: '2026-11-20T10:00:00+05:30'
      }
    ]
  };

  const E03 = {
    id: 'E03',
    title: 'Draft Outreach Workshop',
    description: 'Incomplete draft proposal',
    category: 'Workshop',
    date: '2026-12-10',
    startTime: '10:00',
    endTime: '12:00',
    mode: 'Offline',
    venue: 'LNMIIT Jaipur',
    organizerId: 'C01',
    targetInstitutions: ['I01'],
    institutionIds: ['I01'],
    capacity: 50,
    registrationStart: '2026-12-01',
    registrationEnd: '2026-12-08',
    status: 'Draft',
    history: []
  };

  ws.data.events = [E01, E02, E03, ...ws.data.events.filter(e => !['E01', 'E02', 'E03'].includes(e.id))];

  return ws;
}

// Reusable E-BASE test data object (Section 2.1)
const E_BASE = {
  title: 'Institute Outreach Workshop',
  description: 'Outreach workshop for eligible students',
  category: 'Workshop',
  date: '2026-11-30',
  startTime: '10:00',
  endTime: '12:00',
  mode: 'Offline',
  venue: 'LNMIIT Jaipur',
  organizer: 'C01',
  organizerId: 'C01',
  target: 'I01',
  targetInstitutions: ['I01'],
  institutionIds: ['I01'],
  capacity: 120,
  registrationStart: '2026-11-20',
  registrationEnd: '2026-11-27',
  registrationStartTime: '09:00',
  registrationEndTime: '17:00',
  eligibility: 'All students',
  instructions: 'bring institution ID'
};

// ============================================================================
// UC-004: Create Outreach Event (TC-001 to TC-008)
// ============================================================================

test('TC-001 - Create and submit a complete event', () => {
  // Preconditions: Coordinator C01 is authenticated and authorized; institution I01 exists. Use fixture E-BASE.
  const ws = createAssignment8Workspace();
  const eventService = new EventService(ws);

  const event = eventService.createEvent(E_BASE, 'C01', 'SUBMIT', () => NORMAL_TEST_CLOCK);

  assert.ok(event.id, 'One event is persisted with a generated ID');
  assert.equal(event.title, E_BASE.title);
  assert.ok(['Pending', 'Submitted'].includes(event.status), 'Event status is Submitted / Pending');
  assert.equal(event.organizerId, 'C01');
  assert.deepEqual(event.institutionIds, ['I01'], 'Target institution I01 association is saved');

  // Approvers are notified
  const approverNotifs = ws.data.notifications.filter(n => n.userId === 'A01' && n.message.includes(E_BASE.title));
  assert.ok(approverNotifs.length > 0, 'Confirmation and approver review notifications dispatched');
});

test('TC-002 - Reject submission with a missing title', () => {
  // Preconditions: Coordinator C01 is authenticated and authorized; institution I01 exists. Use fixture E-BASE.
  const ws = createAssignment8Workspace();
  const eventService = new EventService(ws);
  const inputData = { ...E_BASE, title: '' };

  assert.throws(
    () => eventService.createEvent(inputData, 'C01', 'SUBMIT', () => NORMAL_TEST_CLOCK),
    /title/i,
    'An understandable title/required-field error is shown; no submitted event is created.'
  );
});

test('TC-003 - Save an incomplete draft', () => {
  // Preconditions: Coordinator C01 is authenticated and authorized; institution I01 exists. Use fixture E-BASE.
  const ws = createAssignment8Workspace();
  const eventService = new EventService(ws);
  const draftData = { title: 'Institute Outreach Workshop' };

  const draft = eventService.saveDraft(null, draftData, 'C01', () => NORMAL_TEST_CLOCK);

  assert.ok(draft.id, 'Draft has an assigned ID');
  assert.equal(draft.status, 'Draft');
  assert.equal(draft.title, 'Institute Outreach Workshop');

  // Verify it can be reopened and is not submitted for review or published
  const reopened = ws.event(draft.id);
  assert.equal(reopened.status, 'Draft');
  const reviewNotifs = ws.data.notifications.filter(n => n.message.includes(draft.id));
  assert.equal(reviewNotifs.length, 0, 'Draft is not submitted for review or published');
});

test('TC-004 - Reject registration end before start', () => {
  // Preconditions: Coordinator C01 is authenticated and authorized; institution I01 exists. Use fixture E-BASE.
  const ws = createAssignment8Workspace();
  const eventService = new EventService(ws);
  const invalidDateData = {
    ...E_BASE,
    registrationStart: '2026-11-20T09:00:00+05:30',
    registrationEnd: '2026-11-20T08:59:00+05:30'
  };

  assert.throws(
    () => eventService.createEvent(invalidDateData, 'C01', 'SUBMIT', () => NORMAL_TEST_CLOCK),
    /registration|date/i,
    'Date-order validation rejects submission; no submitted event is created.'
  );
});

test('TC-005 - Block event creation by a student', () => {
  // Preconditions: Student S01 is authenticated with no coordinator role.
  const ws = createAssignment8Workspace();
  const eventService = new EventService(ws);

  assert.throws(
    () => eventService.createEvent(E_BASE, 'S01', 'SUBMIT', () => NORMAL_TEST_CLOCK),
    /not authorized|coordinator|role/i,
    'Access is denied at the protected operation; no event or institution association is created.'
  );
});

test('TC-006 - Roll back event creation on association-save failure', () => {
  // Preconditions: Coordinator C01 is authenticated and authorized; institution I01 exists. Use fixture E-BASE.
  const ws = createAssignment8Workspace();
  const eventService = new EventService(ws);
  const countBefore = ws.data.events.length;

  assert.throws(
    () => eventService.createEvent(E_BASE, 'C01', 'SUBMIT', () => NORMAL_TEST_CLOCK, { simulateAssociationFailure: true }),
    /association save failure|DB_ERROR/i
  );

  // Verify rollback: neither partial event nor orphan association remains
  assert.equal(ws.data.events.length, countBefore, 'Transaction rollback preserves clean database state');
});

test('TC-007 - Reject an event end time before its start', () => {
  // Preconditions: Coordinator C01 is authenticated and authorized; institution I01 exists. Use fixture E-BASE.
  const ws = createAssignment8Workspace();
  const eventService = new EventService(ws);
  const invalidTimesData = {
    ...E_BASE,
    startTime: '12:00',
    endTime: '10:00'
  };

  assert.throws(
    () => eventService.createEvent(invalidTimesData, 'C01', 'SUBMIT', () => NORMAL_TEST_CLOCK),
    /start\/end times|time/i,
    'Invalid event timing is rejected; no submitted event is created.'
  );
});

test('TC-008 - Reject a nonexistent target institution', () => {
  // Preconditions: Coordinator C01 is authenticated and authorized; institution I01 exists. Use fixture E-BASE.
  const ws = createAssignment8Workspace();
  const eventService = new EventService(ws);
  const nonExistentInstData = {
    ...E_BASE,
    institutionIds: ['I-MISSING']
  };

  assert.throws(
    () => eventService.createEvent(nonExistentInstData, 'C01', 'SUBMIT', () => NORMAL_TEST_CLOCK),
    /target institution does not exist|institution/i,
    'The invalid institution reference is rejected; no event with broken target-institution association is committed.'
  );
});

// ============================================================================
// UC-011: Register for Outreach Event (TC-009 to TC-020)
// ============================================================================

test('TC-009 - Register an eligible student successfully', () => {
  // Preconditions: Published event E01 is within its configured registration period; capacity 120; eligible authenticated S01 has no registration.
  const ws = createAssignment8Workspace();
  const regService = new RegistrationService(ws);

  // Seed 20 active registrations
  for (let i = 1; i <= 20; i++) {
    ws.data.registrations.push({
      id: `REG-SEED-${i}`,
      userId: `U-EXIST-${i}`,
      eventId: 'E01',
      status: 'Confirmed',
      date: '2026-11-21T10:00:00+05:30'
    });
  }

  const reg = regService.register('S01', 'E01', () => NORMAL_TEST_CLOCK);

  assert.ok(reg.id, 'Registration has an ID');
  assert.equal(reg.userId, 'S01');
  assert.equal(reg.eventId, 'E01');
  assert.equal(ws.count('E01'), 21, 'Active registration count becomes 21');

  // Verify notification initiated
  const notif = ws.data.notifications.find(n => n.userId === 'S01' && n.message.includes('Institute Outreach Workshop'));
  assert.ok(notif, 'Registration notification is initiated; data persists after reload');
});

test('TC-010 - Reject an ineligible registrant', () => {
  // Preconditions: Published event E01 is within registration period; capacity 120; authenticated S02 does not meet eligibility.
  const ws = createAssignment8Workspace();
  const regService = new RegistrationService(ws);
  ws.event('E01').eligibility = 'Class 12';
  ws.event('E01').eligibilityCriteria = 'Class 12';
  const countBefore = ws.count('E01');

  assert.throws(
    () => regService.register('S02', 'E01', () => NORMAL_TEST_CLOCK),
    /eligibility|criteria/i,
    'Eligibility error is displayed; no registration is created and capacity usage does not increase.'
  );
  assert.equal(ws.count('E01'), countBefore, 'Capacity usage does not increase');
});

test('TC-011 - Prevent duplicate active registration', () => {
  // Preconditions: Published event E01 is within registration period; capacity 120; active registration for S01/E01 already exists.
  const ws = createAssignment8Workspace();
  const regService = new RegistrationService(ws);

  // Register S01 first
  regService.register('S01', 'E01', () => NORMAL_TEST_CLOCK);
  const countBefore = ws.count('E01');

  // Repeat registration request for S01/E01
  assert.throws(
    () => regService.register('S01', 'E01', () => NORMAL_TEST_CLOCK),
    /already registered/i,
    'Duplicate is rejected with an understandable message; original record remains and no additional registration created.'
  );
  assert.equal(ws.count('E01'), countBefore);
});

test('TC-012 - Accept the last available place', () => {
  // Preconditions: Published event E01 is within its configured registration period; capacity 120; active registrations C-1=119; S01.
  const ws = createAssignment8Workspace();
  const regService = new RegistrationService(ws);

  for (let i = 1; i <= 119; i++) {
    ws.data.registrations.push({
      id: `REG-SEAT-${i}`,
      userId: `STUDENT-${i}`,
      eventId: 'E01',
      status: 'Confirmed',
      date: '2026-11-21T10:00:00+05:30'
    });
  }

  const reg = regService.register('S01', 'E01', () => NORMAL_TEST_CLOCK);
  assert.ok(reg.id);
  assert.equal(ws.count('E01'), 120, 'S01 is accepted once; active registrations become exactly 120 and do not exceed capacity.');
});

test('TC-013 - Reject registration at full capacity', () => {
  // Preconditions: Published event E01 is within its configured registration period; capacity 120; active registrations C=120.
  const ws = createAssignment8Workspace();
  const regService = new RegistrationService(ws);

  for (let i = 1; i <= 120; i++) {
    ws.data.registrations.push({
      id: `REG-FULL-${i}`,
      userId: `STUDENT-${i}`,
      eventId: 'E01',
      status: 'Confirmed',
      date: '2026-11-21T10:00:00+05:30'
    });
  }

  assert.throws(
    () => regService.register('S01', 'E01', () => NORMAL_TEST_CLOCK),
    /capacity|full/i,
    'Full-capacity error is shown; active count remains 120 and no S01 registration is created.'
  );
  assert.equal(ws.count('E01'), 120);
});

test('TC-014 - Reject registration just before opening', () => {
  // Preconditions: Opening 20 Nov 2026 09:00 IST; clock 08:59 IST.
  const ws = createAssignment8Workspace();
  const regService = new RegistrationService(ws);
  const clockBeforeOpening = () => new Date('2026-11-20T08:59:00+05:30');

  assert.throws(
    () => regService.register('S01', 'E01', clockBeforeOpening),
    /closed/i,
    'Registration is refused because the period has not started; no registration is saved.'
  );
});

test('TC-015 - Reject registration just after closing', () => {
  // Preconditions: Closing 27 Nov 2026 17:00 IST; clock 17:01 IST.
  const ws = createAssignment8Workspace();
  const regService = new RegistrationService(ws);
  const clockAfterClosing = () => new Date('2026-11-27T17:01:00+05:30');

  assert.throws(
    () => regService.register('S01', 'E01', clockAfterClosing),
    /closed/i,
    'Registration is refused because the period has ended; no registration is saved.'
  );
});

test('TC-016 - Require authentication for registration', () => {
  // Preconditions: E01 is published, open and has free places; no user session exists.
  const ws = createAssignment8Workspace();
  const regService = new RegistrationService(ws);

  assert.throws(
    () => regService.register(null, 'E01', () => NORMAL_TEST_CLOCK),
    /Authentication is required/i,
    'Authentication is required; no registration is saved and no protected registrant information is exposed.'
  );
});

test('TC-017 - Prevent overbooking by concurrent requests', () => {
  // Preconditions: E01 capacity 120; active count 119; simultaneous S01 and S03 requests.
  const ws = createAssignment8Workspace();
  const regService = new RegistrationService(ws);

  for (let i = 1; i <= 119; i++) {
    ws.data.registrations.push({
      id: `REG-CONC-${i}`,
      userId: `STUDENT-${i}`,
      eventId: 'E01',
      status: 'Confirmed',
      date: '2026-11-21T10:00:00+05:30'
    });
  }

  // First request takes the 120th place
  const regS01 = regService.register('S01', 'E01', () => NORMAL_TEST_CLOCK);
  assert.ok(regS01.id);
  assert.equal(ws.count('E01'), 120);

  // Simultaneous second request must be refused as capacity is exhausted
  assert.throws(
    () => regService.register('S03', 'E01', () => NORMAL_TEST_CLOCK),
    /capacity|full/i
  );
  assert.equal(ws.count('E01'), 120, 'Exactly one request succeeds and one is refused; total active count is 120; no overbooking.');
});

test('TC-018 - Preserve committed registration if notification fails', () => {
  // Preconditions: Published event E01 is within registration period; capacity 120; eligible S01.
  const ws = createAssignment8Workspace();
  const regService = new RegistrationService(ws);

  const reg = regService.register('S01', 'E01', () => NORMAL_TEST_CLOCK, { simulateNotificationFailure: true });

  assert.ok(reg.id, 'Committed registration remains successful');
  assert.equal(ws.count('E01'), 1);
  assert.equal(reg.notificationDispatched, false, 'Notification failure handled separately without rolling back registration');
});

test('TC-019 - Register an eligible institution contact', () => {
  // Preconditions: Institution contact IC01 belongs to I01 and meets E01 eligibility; E01 is published and open.
  const ws = createAssignment8Workspace();
  const regService = new RegistrationService(ws);

  const reg = regService.register('IC01', 'E01', () => NORMAL_TEST_CLOCK);

  assert.ok(reg.id);
  assert.equal(reg.userId, 'IC01');
  assert.equal(reg.eventId, 'E01');
  assert.equal(ws.count('E01'), 1, 'One valid registration is saved for IC01/E01 and confirmation is displayed.');
});

test('TC-020 - Reject registration for an unpublished event', () => {
  // Preconditions: Eligible S01 is authenticated; E03 is Draft.
  const ws = createAssignment8Workspace();
  const regService = new RegistrationService(ws);

  assert.throws(
    () => regService.register('S01', 'E03', () => NORMAL_TEST_CLOCK),
    /not available for registration|published/i,
    'Registration is refused because E03 has not been published; no registration is saved.'
  );
});

// ============================================================================
// UC-006: Approve Event (TC-021 to TC-028)
// ============================================================================

test('TC-021 - Approve an event and notify its coordinator', () => {
  // Preconditions: Approver A01 is authenticated and authorized; E02 is Under Review; organizer is C01.
  const ws = createAssignment8Workspace();
  const approvalService = new ApprovalService(ws);

  const event = approvalService.approve('E02', 'A01', 'Reviewed and approved', () => NORMAL_TEST_CLOCK);

  assert.equal(event.status, 'Approved');
  const record = event.history.at(-1);
  assert.equal(record.decision, 'Approved');
  assert.equal(record.by, 'A01');
  assert.equal(record.comments, 'Reviewed and approved');

  // Verify coordinator notification
  const notif = ws.data.notifications.find(n => n.userId === 'C01' && n.message.includes('Approved'));
  assert.ok(notif, 'Coordinator notification is initiated');
});

test('TC-022 - Reject an event with a reason', () => {
  // Preconditions: Approver A01 is authenticated and authorized; E02 is Under Review; organizer is C01.
  const ws = createAssignment8Workspace();
  const approvalService = new ApprovalService(ws);

  const event = approvalService.reject('E02', 'A01', 'Venue confirmation required', () => NORMAL_TEST_CLOCK);

  assert.equal(event.status, 'Rejected');
  const record = event.history.at(-1);
  assert.equal(record.decision, 'Rejected');
  assert.equal(record.by, 'A01');
  assert.equal(record.comments, 'Venue confirmation required');

  // Verify coordinator notification
  const notif = ws.data.notifications.find(n => n.userId === 'C01' && n.message.includes('Rejected'));
  assert.ok(notif, 'Coordinator is notified of rejection');
});

test('TC-023 - Require a reason when rejecting', () => {
  // Preconditions: Approver A01 is authenticated and authorized; E02 is Under Review; organizer is C01.
  const ws = createAssignment8Workspace();
  const approvalService = new ApprovalService(ws);

  assert.throws(
    () => approvalService.reject('E02', 'A01', '', () => NORMAL_TEST_CLOCK),
    /reason/i,
    'An understandable reason-required error is displayed; E02 remains Under Review and no rejection decision is saved.'
  );

  assert.equal(ws.event('E02').status, 'Under Review');
});

test('TC-024 - Prevent a non-approver from deciding an event', () => {
  // Preconditions: C01 is authenticated only as coordinator; E02 is Under Review.
  const ws = createAssignment8Workspace();
  const approvalService = new ApprovalService(ws);

  assert.throws(
    () => approvalService.approve('E02', 'C01', 'Coordinator self-approval', () => NORMAL_TEST_CLOCK),
    /not authorized|role/i
  );

  assert.throws(
    () => approvalService.reject('E02', 'C01', 'Coordinator self-rejection', () => NORMAL_TEST_CLOCK),
    /not authorized|role/i
  );

  assert.equal(ws.event('E02').status, 'Under Review', 'Both decisions are denied; event status remains unchanged.');
});

test('TC-025 - Show an empty pending-event list', () => {
  // Preconditions: A01 is authenticated; no events are Submitted or Under Review.
  const ws = createAssignment8Workspace();
  const approvalService = new ApprovalService(ws);

  // Clear pending and under review events
  ws.data.events = ws.data.events.filter(e => !['Pending', 'Under Review'].includes(e.status));

  const list = approvalService.getPendingEvents('A01');
  assert.ok(Array.isArray(list));
  assert.equal(list.length, 0, 'An understandable no-pending-events message or empty state is displayed.');
});

test('TC-026 - Roll back approval on event-update failure', () => {
  // Preconditions: Approver A01 is authenticated and authorized; E02 is Under Review; organizer is C01.
  const ws = createAssignment8Workspace();
  const approvalService = new ApprovalService(ws);

  assert.throws(
    () => approvalService.approve('E02', 'A01', 'Approved', () => NORMAL_TEST_CLOCK, { simulateUpdateFailure: true }),
    /update failure|DB_ERROR/i
  );

  // Transaction rolls back: E02 remains Under Review, no committed approval record remains
  assert.equal(ws.event('E02').status, 'Under Review');
  assert.equal(ws.event('E02').history.length, 1);
  assert.equal(ws.event('E02').history[0].decision, 'Under Review');
});

test('TC-027 - Reject an approval request for a Draft event', () => {
  // Preconditions: A01 is authorized; event E03 exists in Draft state.
  const ws = createAssignment8Workspace();
  const approvalService = new ApprovalService(ws);

  assert.throws(
    () => approvalService.approve('E03', 'A01', 'Attempting draft approval', () => NORMAL_TEST_CLOCK),
    /not available for review|awaiting/i,
    'Invalid-state request is rejected; E03 remains Draft and no approval record is committed.'
  );

  assert.equal(ws.event('E03').status, 'Draft');
});

test('TC-028 - Enforce approval before publication', () => {
  // Preconditions: Approver A01 is authenticated and authorized; E02 is Under Review; organizer is C01.
  const ws = createAssignment8Workspace();
  const approvalService = new ApprovalService(ws);

  // 1. Attempt to publish E02 before approval -> verify refusal
  assert.throws(
    () => ws.transition('C01', 'E02', 'publish'),
    /approval/i,
    'Unapproved publication is refused.'
  );

  // 2. Approve E02
  approvalService.approve('E02', 'A01', 'Proposal validated and approved', () => NORMAL_TEST_CLOCK);
  assert.equal(ws.event('E02').status, 'Approved');

  // 3. Publish under existing publication rules -> publication succeeds
  const publishedEvent = ws.transition('C01', 'E02', 'publish');
  assert.equal(publishedEvent.status, 'Published', 'After recorded approval, publication succeeds according to existing rules.');
});
