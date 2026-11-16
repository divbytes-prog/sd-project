/**
 * InstituteConnect — Assignment 8 Automated Test Suite
 * Executes 28 Test Cases (TC-001 to TC-028) covering:
 * - UC-004: Create Outreach Event (TC-001 to TC-008)
 * - UC-011: Register for Outreach Event (TC-009 to TC-020)
 * - UC-006: Approve Outreach Event (TC-021 to TC-028)
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { Workspace, seed, isoDate } from '../model.mjs';
import {
  UserRole,
  AccountStatus,
  EventStatus,
  RegistrationStatus,
  ApprovalDecision,
  EventMode,
  InstitutionType,
  NotificationStatus,
  User,
  ProspectiveStudent,
  InstitutionContact,
  OutreachCoordinator,
  OutreachApprover,
  Administrator,
  InstituteManagement,
  Institution,
  Contact,
  OutreachEvent,
  Registration,
  Approval,
  Notification,
  ValidationResult,
  EventService,
  RegistrationService,
  ApprovalService,
  NotificationService,
  Repository
} from '../lib/design-services.mjs';

const fixedNow = new Date('2026-10-25T12:00:00+05:30');
const createTestWorkspace = () => new Workspace(seed(fixedNow), () => fixedNow);

const validEventPayload = {
  title: 'Robotics Workshop 2026',
  description: 'Hands-on robotics session for aspiring engineering students.',
  category: 'Workshop',
  date: '2026-11-20',
  startTime: '10:00',
  endTime: '13:00',
  mode: 'Offline',
  venue: 'LNMIIT Jaipur, Lab 3',
  capacity: 120,
  registrationStart: '2026-10-01',
  registrationEnd: '2026-11-15',
  eligibility: 'All students',
  instructions: 'Please bring your photo ID card.',
  institutionIds: ['I1', 'I2']
};

// ============================================================================
// UC-004: Create Outreach Event (TC-001 to TC-008)
// ============================================================================

test('TC-001: [UC-004] Successful event creation and submission with all valid details', () => {
  const ws = createTestWorkspace();
  const eventService = new EventService(ws);
  const result = eventService.createEvent(validEventPayload, 'U1', 'SUBMIT', () => fixedNow);

  assert.ok(result.id, 'Created event must have a generated ID');
  assert.equal(result.title, validEventPayload.title);
  assert.equal(result.status, 'Pending'); // Submitted stored as Pending
  assert.equal(result.organizerId, 'U1');
  assert.equal(result.capacity, 120);

  // Verifying approvers received notification
  const approverNotifications = ws.data.notifications.filter(
    n => (n.userId === 'U2' || n.userId === 'U5') && n.message.includes(validEventPayload.title)
  );
  assert.ok(approverNotifications.length > 0, 'Approvers should be notified upon submission');
});

test('TC-002: [UC-004] Save event as draft with minimal valid details', () => {
  const ws = createTestWorkspace();
  const eventService = new EventService(ws);
  const draftPayload = {
    title: 'Future Tech Talk Draft',
    capacity: 60
  };
  const result = eventService.saveDraft(null, draftPayload, 'U1', () => fixedNow);

  assert.ok(result.id, 'Draft event must have an ID');
  assert.equal(result.title, 'Future Tech Talk Draft');
  assert.equal(result.status, 'Draft');
  assert.equal(result.organizerId, 'U1');

  // Verify no approval notifications sent for drafts
  const notifs = ws.data.notifications.filter(n => n.message.includes('Future Tech Talk Draft'));
  assert.equal(notifs.length, 0, 'No review notification should be sent for a draft');
});

test('TC-003: [UC-004] Negative validation: Event submission fails when required title is missing', () => {
  const ws = createTestWorkspace();
  const eventService = new EventService(ws);
  const invalidPayload = { ...validEventPayload, title: '' };

  assert.throws(
    () => eventService.createEvent(invalidPayload, 'U1', 'SUBMIT', () => fixedNow),
    /title/i
  );
});

test('TC-004: [UC-004] Negative validation: Event submission fails when end time precedes start time', () => {
  const ws = createTestWorkspace();
  const eventService = new EventService(ws);
  const invalidPayload = {
    ...validEventPayload,
    startTime: '14:00',
    endTime: '12:00'
  };

  assert.throws(
    () => eventService.createEvent(invalidPayload, 'U1', 'SUBMIT', () => fixedNow),
    /times/i
  );
});

test('TC-005: [UC-004] Negative validation: Event submission fails when registration window is invalid', () => {
  const ws = createTestWorkspace();
  const eventService = new EventService(ws);

  // End date before start date
  const invalidPayload1 = {
    ...validEventPayload,
    registrationStart: '2026-11-15',
    registrationEnd: '2026-11-01'
  };
  assert.throws(
    () => eventService.createEvent(invalidPayload1, 'U1', 'SUBMIT', () => fixedNow),
    /Registration end date must not precede registration start date|date/i
  );

  // Registration end date after event date
  const invalidPayload2 = {
    ...validEventPayload,
    date: '2026-11-10',
    registrationEnd: '2026-11-15'
  };
  assert.throws(
    () => eventService.createEvent(invalidPayload2, 'U1', 'SUBMIT', () => fixedNow),
    /date/i
  );
});

test('TC-006: [UC-004] Negative validation: Event creation fails when capacity is zero or negative', () => {
  const ws = createTestWorkspace();
  const eventService = new EventService(ws);

  const zeroCapacity = { ...validEventPayload, capacity: 0 };
  assert.throws(
    () => eventService.createEvent(zeroCapacity, 'U1', 'SUBMIT', () => fixedNow),
    /capacity/i
  );

  const negativeCapacity = { ...validEventPayload, capacity: -10 };
  assert.throws(
    () => eventService.createEvent(negativeCapacity, 'U1', 'SUBMIT', () => fixedNow),
    /capacity/i
  );
});

test('TC-007: [UC-004] Negative validation: Event creation fails when target institution does not exist', () => {
  const ws = createTestWorkspace();
  const eventService = new EventService(ws);
  const invalidInstitutionPayload = {
    ...validEventPayload,
    institutionIds: ['NON_EXISTENT_INSTITUTION_ID']
  };

  assert.throws(
    () => eventService.createEvent(invalidInstitutionPayload, 'U1', 'SUBMIT', () => fixedNow),
    /target institution does not exist|institution/i
  );
});

test('TC-008: [UC-004] Security validation: Prospective Student cannot create or submit outreach events', () => {
  const ws = createTestWorkspace();
  const eventService = new EventService(ws);

  // U3 is a Student
  assert.throws(
    () => eventService.createEvent(validEventPayload, 'U3', 'SUBMIT', () => fixedNow),
    /not authorized|role/i
  );
});

// ============================================================================
// UC-011: Register for Outreach Event (TC-009 to TC-020)
// ============================================================================

test('TC-009: [UC-011] Successful event registration by Prospective Student for open published event', () => {
  const ws = createTestWorkspace();
  const regService = new RegistrationService(ws);

  // E2 is Published, open, within registration window
  const reg = regService.register('U3', 'E2', () => fixedNow);

  assert.ok(reg.id, 'Registration should have an ID');
  assert.equal(reg.userId, 'U3');
  assert.equal(reg.eventId, 'E2');
  assert.ok(['Confirmed', 'Pending'].includes(reg.status));

  // Notification sent to student
  const studentNotif = ws.data.notifications.find(
    n => n.userId === 'U3' && n.message.includes(ws.event('E2').title)
  );
  assert.ok(studentNotif, 'Student should receive a registration notification');
});

test('TC-010: [UC-011] Successful registration by Institution Contact for targeted event', () => {
  const ws = createTestWorkspace();
  const regService = new RegistrationService(ws);

  // U4 belongs to institution I1. E2 targets I1.
  ws.event('E2').institutionIds = ['I1'];
  const reg = regService.register('U4', 'E2', () => fixedNow);

  assert.ok(reg.id);
  assert.equal(reg.userId, 'U4');
  assert.equal(reg.eventId, 'E2');
});

test('TC-011: [UC-011] Negative validation: Registration rejected after registration closing date', () => {
  const ws = createTestWorkspace();
  const regService = new RegistrationService(ws);

  // Set event E2 registrationEnd in the past
  ws.event('E2').registrationEnd = '2026-10-10';

  assert.throws(
    () => regService.register('U3', 'E2', () => fixedNow),
    /closed/i
  );
});

test('TC-012: [UC-011] Negative validation: Registration rejected before registration opening date', () => {
  const ws = createTestWorkspace();
  const regService = new RegistrationService(ws);

  // Set event E2 registrationStart in the future
  ws.event('E2').registrationStart = '2026-11-01';

  assert.throws(
    () => regService.register('U3', 'E2', () => fixedNow),
    /closed/i
  );
});

test('TC-013: [UC-011] Negative validation: Registration rejected when event is at full capacity', () => {
  const ws = createTestWorkspace();
  const regService = new RegistrationService(ws);

  // E2 capacity set to 1, fill it
  ws.event('E2').capacity = 1;
  ws.data.registrations.push({
    id: 'R-EXISTING',
    userId: 'U6',
    eventId: 'E2',
    status: 'Confirmed',
    date: fixedNow.toISOString()
  });

  assert.throws(
    () => regService.register('U3', 'E2', () => fixedNow),
    /capacity|full/i
  );
});

test('TC-014: [UC-011] Negative validation: Duplicate registration by same user is rejected', () => {
  const ws = createTestWorkspace();
  const regService = new RegistrationService(ws);

  // U3 is already registered for E1 in sample seed
  assert.throws(
    () => regService.register('U3', 'E1', () => fixedNow),
    /already/i
  );
});

test('TC-015: [UC-011] Negative validation: Registration rejected for non-targeted institution contact', () => {
  const ws = createTestWorkspace();
  const regService = new RegistrationService(ws);

  // U4 belongs to institution I1. Event E2 targets only I4.
  ws.event('E2').institutionIds = ['I4'];

  assert.throws(
    () => regService.register('U4', 'E2', () => fixedNow),
    /eligibility|institution/i
  );
});

test('TC-016: [UC-011] Negative validation: Registration rejected when student does not meet eligibility criteria', () => {
  const ws = createTestWorkspace();
  const regService = new RegistrationService(ws);

  // U3 is Class 12. Set event criteria to Undergraduate
  ws.event('E2').eligibility = 'Undergraduate';
  ws.event('E2').eligibilityCriteria = 'Undergraduate';

  assert.throws(
    () => regService.register('U3', 'E2', () => fixedNow),
    /eligibility/i
  );
});

test('TC-017: [UC-011] Capacity boundary: Registration succeeds at capacity N - 1 (119th seat)', () => {
  const ws = createTestWorkspace();
  const regService = new RegistrationService(ws);

  ws.event('E2').capacity = 120;
  // Seed with 118 existing registrations
  for (let i = 1; i <= 118; i++) {
    ws.data.registrations.push({
      id: `R-SEAT-${i}`,
      userId: `USER-${i}`,
      eventId: 'E2',
      status: 'Confirmed',
      date: fixedNow.toISOString()
    });
  }

  // 119th seat registration
  const reg119 = regService.register('U3', 'E2', () => fixedNow);
  assert.ok(reg119.id);
  assert.equal(reg119.userId, 'U3');
});

test('TC-018: [UC-011] Capacity boundary: Registration succeeds at capacity N (120th seat, full threshold)', () => {
  const ws = createTestWorkspace();
  const regService = new RegistrationService(ws);

  ws.event('E2').capacity = 120;
  // Seed with 119 existing registrations
  for (let i = 1; i <= 119; i++) {
    ws.data.registrations.push({
      id: `R-SEAT-${i}`,
      userId: `USER-${i}`,
      eventId: 'E2',
      status: 'Confirmed',
      date: fixedNow.toISOString()
    });
  }

  // 120th seat registration
  const reg120 = regService.register('U3', 'E2', () => fixedNow);
  assert.ok(reg120.id);
  assert.equal(reg120.userId, 'U3');
});

test('TC-019: [UC-011] Capacity boundary: Registration fails at capacity N + 1 (121st seat overflow)', () => {
  const ws = createTestWorkspace();
  const regService = new RegistrationService(ws);

  ws.event('E2').capacity = 120;
  // Seed with 120 existing registrations
  for (let i = 1; i <= 120; i++) {
    ws.data.registrations.push({
      id: `R-SEAT-${i}`,
      userId: `USER-${i}`,
      eventId: 'E2',
      status: 'Confirmed',
      date: fixedNow.toISOString()
    });
  }

  // 121st registration attempt must be rejected
  assert.throws(
    () => regService.register('U3', 'E2', () => fixedNow),
    /capacity|full/i
  );
});

test('TC-020: [UC-011] Negative validation: Registration rejected for Draft or unapproved events', () => {
  const ws = createTestWorkspace();
  const regService = new RegistrationService(ws);

  // E5 is Draft
  assert.equal(ws.event('E5').status, 'Draft');
  assert.throws(
    () => regService.register('U3', 'E5', () => fixedNow),
    /available for registration|published/i
  );

  // E4 is Pending
  assert.equal(ws.event('E4').status, 'Pending');
  assert.throws(
    () => regService.register('U3', 'E4', () => fixedNow),
    /available for registration|published/i
  );
});

// ============================================================================
// UC-006: Approve Outreach Event (TC-021 to TC-028)
// ============================================================================

test('TC-021: [UC-006] Successful event approval by Outreach Approver with comments', () => {
  const ws = createTestWorkspace();
  const approvalService = new ApprovalService(ws);

  // E4 is Pending
  assert.equal(ws.event('E4').status, 'Pending');
  const result = approvalService.approve('E4', 'U2', 'Excellent proposal, approved for scheduling.', () => fixedNow);

  assert.equal(result.status, 'Approved');
  assert.ok(result.history.length > 0);
  const lastHistory = result.history.at(-1);
  assert.equal(lastHistory.decision, 'Approved');
  assert.equal(lastHistory.by, 'U2');
  assert.equal(lastHistory.comments, 'Excellent proposal, approved for scheduling.');

  // Notification sent to coordinator U1
  const coordinatorNotif = ws.data.notifications.find(
    n => n.userId === 'U1' && n.message.includes('Approved')
  );
  assert.ok(coordinatorNotif, 'Coordinator should be notified upon approval');
});

test('TC-022: [UC-006] Successful event rejection by Outreach Approver with mandatory reason', () => {
  const ws = createTestWorkspace();
  const approvalService = new ApprovalService(ws);

  // E4 is Pending
  const result = approvalService.reject('E4', 'U2', 'Please revise the venue and provide laboratory safety details.', () => fixedNow);

  assert.equal(result.status, 'Rejected');
  const lastHistory = result.history.at(-1);
  assert.equal(lastHistory.decision, 'Rejected');
  assert.equal(lastHistory.by, 'U2');
  assert.equal(lastHistory.comments, 'Please revise the venue and provide laboratory safety details.');

  // Notification sent to coordinator U1
  const coordinatorNotif = ws.data.notifications.find(
    n => n.userId === 'U1' && n.message.includes('Rejected')
  );
  assert.ok(coordinatorNotif, 'Coordinator should be notified upon rejection');
});

test('TC-023: [UC-006] Negative validation: Event rejection fails when reason is empty or whitespace', () => {
  const ws = createTestWorkspace();
  const approvalService = new ApprovalService(ws);

  assert.throws(
    () => approvalService.reject('E4', 'U2', '', () => fixedNow),
    /reason/i
  );

  assert.throws(
    () => approvalService.reject('E4', 'U2', '    ', () => fixedNow),
    /reason/i
  );
});

test('TC-024: [UC-006] Security validation: Outreach Coordinator cannot approve outreach events', () => {
  const ws = createTestWorkspace();
  const approvalService = new ApprovalService(ws);

  // U1 is Coordinator
  assert.throws(
    () => approvalService.approve('E4', 'U1', 'Attempting self approval', () => fixedNow),
    /not authorized|role/i
  );
});

test('TC-025: [UC-006] Negative validation: Approver cannot review or approve events in Draft status', () => {
  const ws = createTestWorkspace();
  const approvalService = new ApprovalService(ws);

  // E5 is Draft
  assert.equal(ws.event('E5').status, 'Draft');
  assert.throws(
    () => approvalService.approve('E5', 'U2', 'Premature approval', () => fixedNow),
    /not available for review|awaiting/i
  );
});

test('TC-026: [UC-006] Query verification: Approver retrieves only Pending and Under Review events', () => {
  const ws = createTestWorkspace();
  const approvalService = new ApprovalService(ws);

  const pendingEvents = approvalService.getPendingEvents('U2');
  assert.ok(Array.isArray(pendingEvents));
  assert.ok(pendingEvents.length > 0);
  assert.ok(
    pendingEvents.every(e => ['Pending', 'Under Review'].includes(e.status)),
    'List must contain only Pending or Under Review events'
  );
  assert.ok(!pendingEvents.some(e => e.status === 'Draft'));
  assert.ok(!pendingEvents.some(e => e.status === 'Published'));
});

test('TC-027: [UC-006] Traceability: Multi-step lifecycle preserves full audit and decision history', () => {
  const ws = createTestWorkspace();
  const eventService = new EventService(ws);
  const approvalService = new ApprovalService(ws);

  // 1. Create Draft
  const event = eventService.saveDraft(null, { ...validEventPayload, title: 'Multi-Step Event' }, 'U1', () => fixedNow);
  assert.equal(event.status, 'Draft');

  // 2. Submit for Approval
  eventService.submitForApproval(event.id, 'U1', () => fixedNow);
  assert.equal(ws.event(event.id).status, 'Pending');

  // 3. Reject with Reason
  approvalService.reject(event.id, 'U2', 'Initial proposal needs budget breakdown.', () => fixedNow);
  assert.equal(ws.event(event.id).status, 'Rejected');
  assert.equal(ws.event(event.id).history.length, 1);
  assert.equal(ws.event(event.id).history[0].decision, 'Rejected');

  // 4. Update details and Resubmit
  eventService.updateEvent(event.id, { description: 'Updated with complete budget details.' }, 'U1', () => fixedNow);
  eventService.submitForApproval(event.id, 'U1', () => fixedNow);
  assert.equal(ws.event(event.id).status, 'Pending');

  // 5. Final Approval
  approvalService.approve(event.id, 'U2', 'Budget verified. Proposal approved.', () => fixedNow);
  assert.equal(ws.event(event.id).status, 'Approved');
  assert.equal(ws.event(event.id).history.length, 2);
  assert.equal(ws.event(event.id).history[1].decision, 'Approved');
});

test('TC-028: [UC-006] Lifecycle enforcement: Publication requires prior approval', () => {
  const ws = createTestWorkspace();

  // E5 is Draft; cannot be published
  assert.equal(ws.event('E5').status, 'Draft');
  assert.throws(
    () => ws.transition('U1', 'E5', 'publish'),
    /Approval/i
  );

  // E4 is Pending; cannot be published
  assert.equal(ws.event('E4').status, 'Pending');
  assert.throws(
    () => ws.transition('U1', 'E4', 'publish'),
    /Approval/i
  );
});
