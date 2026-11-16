/**
 * InstituteConnect — Design-Level Classes, Enumerations, and Business Services
 * Implements Lab Assignment 6 (Data/Class Design & Architectural Design)
 * and Lab Assignment 7 (Software Interfaces & Component-Level Design).
 */

import { ServiceError } from './errors.mjs';
import { isoDate, eventHasEnded } from '../model.mjs';

// ============================================================================
// 1. Enumerations (Assignment 6, Section 1.4)
// ============================================================================

export const UserRole = Object.freeze({
  PROSPECTIVE_STUDENT: 'Student',
  INSTITUTION_CONTACT: 'Institution contact',
  OUTREACH_COORDINATOR: 'Coordinator',
  OUTREACH_APPROVER: 'Approver',
  ADMINISTRATOR: 'Administrator',
  INSTITUTE_MANAGEMENT: 'Management'
});

export const AccountStatus = Object.freeze({
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  SUSPENDED: 'Suspended'
});

export const EventStatus = Object.freeze({
  DRAFT: 'Draft',
  SUBMITTED: 'Pending', // Stored as Pending in database for backward compatibility
  UNDER_REVIEW: 'Under Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  PUBLISHED: 'Published',
  CANCELLED: 'Cancelled',
  COMPLETED: 'Completed'
});

export const RegistrationStatus = Object.freeze({
  REGISTERED: 'Confirmed', // Registered / Confirmed
  CONFIRMED: 'Confirmed',
  PENDING: 'Pending',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
  EVENT_CANCELLED: 'Event cancelled'
});

export const ApprovalDecision = Object.freeze({
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  UNDER_REVIEW: 'Under Review'
});

export const EventMode = Object.freeze({
  ONLINE: 'Online',
  OFFLINE: 'Offline',
  HYBRID: 'Hybrid'
});

export const InstitutionType = Object.freeze({
  SCHOOL: 'School',
  COLLEGE: 'College',
  OTHER: 'Other'
});

export const NotificationStatus = Object.freeze({
  UNREAD: 'Unread',
  READ: 'Read',
  SENT: 'Sent',
  FAILED: 'Failed'
});

// ============================================================================
// 2. Validation Helper (Assignment 6 & 7)
// ============================================================================

export class ValidationResult {
  constructor(isValid = true, errors = []) {
    this.isValid = isValid;
    this.errors = errors;
  }
  static valid() {
    return new ValidationResult(true, []);
  }
  static invalid(errors) {
    return new ValidationResult(false, Array.isArray(errors) ? errors : [errors]);
  }
}

// ============================================================================
// 3. Design Classes (Assignment 6, Section 1.3)
// ============================================================================

export class User {
  constructor({
    userId,
    name,
    email,
    contactInformation = '',
    phone = '',
    role = UserRole.PROSPECTIVE_STUDENT,
    accountStatus = AccountStatus.ACTIVE,
    status = AccountStatus.ACTIVE,
    institutionId = null,
    level = 'Class 12'
  }) {
    this.userId = userId || '';
    this.name = name || '';
    this.email = email || '';
    this.contactInformation = contactInformation || phone || '';
    this.phone = phone || contactInformation || '';
    this.role = role;
    this.accountStatus = accountStatus || status;
    this.status = this.accountStatus;
    this.institutionId = institutionId;
    this.level = level;
  }

  authenticate(email, password) {
    if (!email || !password) return false;
    return this.accountStatus === AccountStatus.ACTIVE;
  }

  logout() {
    // Session termination handled by auth layer
  }

  hasRole(role) {
    return this.role === role;
  }
}

export class ProspectiveStudent extends User {
  constructor(data) {
    super({ ...data, role: UserRole.PROSPECTIVE_STUDENT });
  }

  browseEvents(workspace) {
    return workspace.data.events.filter(e =>
      [EventStatus.PUBLISHED, EventStatus.COMPLETED, EventStatus.CANCELLED].includes(e.status)
    );
  }

  viewEvent(workspace, eventId) {
    return workspace.event(eventId);
  }

  registerForEvent(registrationService, eventId, clock) {
    return registrationService.register(this.userId, eventId, clock);
  }

  cancelRegistration(registrationService, registrationId, clock) {
    return registrationService.cancelRegistration(this.userId, registrationId, clock);
  }
}

export class InstitutionContact extends User {
  constructor(data) {
    super({ ...data, role: UserRole.INSTITUTION_CONTACT });
  }

  viewRelevantEvents(workspace) {
    return workspace.data.events.filter(e =>
      [EventStatus.PUBLISHED, EventStatus.COMPLETED, EventStatus.CANCELLED].includes(e.status) &&
      (!e.institutionIds?.length || e.institutionIds.includes(this.institutionId))
    );
  }

  confirmParticipation(registrationService, eventId, clock) {
    return registrationService.register(this.userId, eventId, clock);
  }

  viewEngagementHistory(workspace) {
    return workspace.data.participation.filter(p => p.institutionId === this.institutionId);
  }
}

export class OutreachCoordinator extends User {
  constructor(data) {
    super({ ...data, role: UserRole.OUTREACH_COORDINATOR });
  }

  createEvent(eventService, details, action = 'SUBMIT', clock) {
    return eventService.createEvent(details, this.userId, action, clock);
  }

  saveDraft(eventService, eventId, details, clock) {
    return eventService.saveDraft(eventId, details, this.userId, clock);
  }

  submitForApproval(eventService, eventId, clock) {
    return eventService.submitForApproval(eventId, this.userId, clock);
  }

  updateEvent(eventService, eventId, details, clock) {
    return eventService.updateEvent(eventId, details, this.userId, clock);
  }
}

export class OutreachApprover extends User {
  constructor(data) {
    super({ ...data, role: UserRole.OUTREACH_APPROVER });
  }

  viewPendingEvents(approvalService) {
    return approvalService.getPendingEvents(this.userId);
  }

  approveEvent(approvalService, eventId, comments, clock) {
    return approvalService.approve(eventId, this.userId, comments, clock);
  }

  rejectEvent(approvalService, eventId, reason, clock) {
    return approvalService.reject(eventId, this.userId, reason, clock);
  }

  viewApprovalHistory(approvalService, eventId) {
    return approvalService.viewApprovalHistory(eventId);
  }
}

export class Administrator extends User {
  constructor(data) {
    super({ ...data, role: UserRole.ADMINISTRATOR });
  }

  manageUsers(workspace) {
    return workspace.data.users;
  }

  assignRoles(workspace, targetId, newRole, status) {
    return workspace.updateUser(this.userId, targetId, { role: newRole, status });
  }

  manageConfiguration(workspace, values) {
    return workspace.updateConfiguration(this.userId, values);
  }
}

export class InstituteManagement extends User {
  constructor(data) {
    super({ ...data, role: UserRole.INSTITUTE_MANAGEMENT });
  }

  viewReports(workspace) {
    return {
      events: workspace.data.events,
      registrations: workspace.data.registrations,
      participation: workspace.data.participation,
      outcomes: workspace.data.outcomes
    };
  }

  viewDashboards(workspace) {
    return this.viewReports(workspace);
  }
}

export class Institution {
  constructor({ institutionId, id, name, type, address = '', region = '', relationshipStatus = 'Active partner', status = 'Active partner', primaryContactId = null, sample = false }) {
    this.institutionId = institutionId || id;
    this.id = this.institutionId;
    this.name = name;
    this.type = type || InstitutionType.SCHOOL;
    this.address = address || region;
    this.region = region || address;
    this.relationshipStatus = relationshipStatus || status;
    this.status = this.relationshipStatus;
    this.primaryContactId = primaryContactId;
    this.sample = sample;
  }

  getDetails() {
    return { ...this };
  }

  updateDetails(values) {
    Object.assign(this, values);
    return true;
  }

  getContacts(workspace) {
    return workspace.data.contacts.filter(c => c.institutionId === this.institutionId);
  }
}

export class Contact {
  constructor({ contactId, id, institutionId, name, email, phone = '', designation = '', sample = false }) {
    this.contactId = contactId || id;
    this.id = this.contactId;
    this.institutionId = institutionId;
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.designation = designation;
    this.sample = sample;
  }

  updateDetails(values) {
    Object.assign(this, values);
    return true;
  }

  getInstitution(workspace) {
    return workspace.data.institutions.find(i => i.id === this.institutionId) || null;
  }
}

export class OutreachEvent {
  constructor({
    eventId,
    id,
    title,
    description = '',
    category = 'Workshop',
    eventDate,
    date,
    startTime = '10:00',
    endTime = '12:00',
    mode = EventMode.OFFLINE,
    venue = '',
    capacity = 120,
    registrationStart = '',
    registrationEnd = '',
    registrationStartTime = '',
    registrationEndTime = '',
    eligibilityCriteria = 'All students',
    eligibility = 'All students',
    instructions = '',
    status = EventStatus.DRAFT,
    organizerId = '',
    institutionIds = [],
    contactIds = [],
    history = [],
    createdAt,
    updatedAt
  }) {
    this.eventId = eventId || id;
    this.id = this.eventId;
    this.title = title || '';
    this.description = description || '';
    this.category = category;
    this.eventDate = eventDate || date || '';
    this.date = this.eventDate;
    this.startTime = startTime;
    this.endTime = endTime;
    this.mode = mode;
    this.venue = venue;
    this.capacity = capacity !== undefined && capacity !== null ? Number(capacity) : 120;
    this.registrationStart = registrationStart;
    this.registrationEnd = registrationEnd;
    this.registrationStartTime = registrationStartTime || (registrationStart.includes('T') ? registrationStart.split('T')[1].slice(0, 5) : '');
    this.registrationEndTime = registrationEndTime || (registrationEnd.includes('T') ? registrationEnd.split('T')[1].slice(0, 5) : '');
    this.eligibilityCriteria = eligibilityCriteria || eligibility;
    this.eligibility = this.eligibilityCriteria;
    this.instructions = instructions;
    this.status = status;
    this.organizerId = organizerId;
    this.institutionIds = institutionIds || [];
    this.contactIds = contactIds || [];
    this.history = history || [];
    this.createdAt = createdAt || new Date().toISOString();
    this.updatedAt = updatedAt || this.createdAt;
  }

  validateDetails() {
    const errors = [];
    if (!this.title?.trim()) errors.push('Please complete the required field: title.');
    if (!this.description?.trim()) errors.push('Please complete the required field: description.');
    if (!this.category?.trim()) errors.push('Please complete the required field: category.');
    if (!this.eventDate?.trim()) errors.push('Please complete the required field: eventDate.');
    if (!this.startTime?.trim()) errors.push('Please complete the required field: startTime.');
    if (!this.endTime?.trim()) errors.push('Please complete the required field: endTime.');
    if (this.mode === EventMode.OFFLINE && !this.venue?.trim()) errors.push('Please complete the required field: venue.');
    if (!this.registrationStart?.trim()) errors.push('Please complete the required field: registrationStart.');
    if (!this.registrationEnd?.trim()) errors.push('Please complete the required field: registrationEnd.');
    if (this.capacity === undefined || this.capacity === null || isNaN(this.capacity) || this.capacity < 1) {
      errors.push('Capacity must be a positive whole number.');
    }
    if (this.registrationStart && this.registrationEnd && this.registrationEnd < this.registrationStart) {
      errors.push('Registration end date must not precede registration start date.');
    }
    if (this.registrationEnd && this.eventDate && this.registrationEnd > this.eventDate) {
      errors.push('Please check the event date and start/end times.');
    }
    if (this.startTime && this.endTime && this.startTime >= this.endTime) {
      errors.push('Please check the event date and start/end times.');
    }
    return errors.length ? ValidationResult.invalid(errors) : ValidationResult.valid();
  }

  isRegistrationOpen(currentTime = new Date()) {
    if (this.status !== EventStatus.PUBLISHED) return false;
    const today = isoDate(currentTime);
    const startDay = this.registrationStart.slice(0, 10);
    const endDay = this.registrationEnd.slice(0, 10);
    const eventDay = this.date.slice(0, 10);

    // Exact date and time comparisons
    if (this.registrationStartTime && this.registrationEndTime) {
      const start = new Date(`${startDay}T${this.registrationStartTime}:00+05:30`);
      const end = new Date(`${endDay}T${this.registrationEndTime}:00+05:30`);
      if (currentTime < start || currentTime > end) return false;
    } else if (this.registrationStart.includes('T') && this.registrationEnd.includes('T')) {
      const start = new Date(this.registrationStart);
      const end = new Date(this.registrationEnd);
      if (currentTime < start || currentTime > end) return false;
    } else {
      if (today < startDay || today > endDay) return false;
    }

    if (today > eventDay) return false;
    if (new Date(`${eventDay}T${this.startTime}:00+05:30`) <= currentTime) return false;
    return true;
  }

  hasCapacity(currentConfirmedCount) {
    return currentConfirmedCount < this.capacity;
  }
}

export class Registration {
  constructor({
    registrationId,
    id,
    userId,
    eventId,
    registrationDate,
    date,
    status = RegistrationStatus.PENDING,
    reviewedBy = null,
    reviewedAt = null,
    rejectionReason = ''
  }) {
    this.registrationId = registrationId || id;
    this.id = this.registrationId;
    this.userId = userId;
    this.eventId = eventId;
    this.registrationDate = registrationDate || date || new Date().toISOString();
    this.date = this.registrationDate;
    this.status = status;
    this.reviewedBy = reviewedBy;
    this.reviewedAt = reviewedAt;
    this.rejectionReason = rejectionReason;
  }

  validateEligibility(user, event) {
    if (user.role === UserRole.INSTITUTION_CONTACT) {
      if (event.institutionIds?.length && !event.institutionIds.includes(user.institutionId)) {
        return ValidationResult.invalid('You do not meet the eligibility criteria for this event.');
      }
    }
    if (event.eligibilityCriteria && event.eligibilityCriteria !== 'All students') {
      if (user.level && event.eligibilityCriteria !== user.level) {
        return ValidationResult.invalid('You do not meet the eligibility criteria for this event.');
      }
    }
    return ValidationResult.valid();
  }

  confirm() {
    this.status = RegistrationStatus.CONFIRMED;
    return true;
  }

  cancel() {
    this.status = RegistrationStatus.CANCELLED;
    return true;
  }
}

export class Approval {
  constructor({
    approvalId,
    id,
    eventId,
    approverId,
    decision = ApprovalDecision.APPROVED,
    comments = '',
    decisionDate,
    date
  }) {
    this.approvalId = approvalId || id;
    this.id = this.approvalId;
    this.eventId = eventId;
    this.approverId = approverId;
    this.decision = decision;
    this.comments = comments;
    this.decisionDate = decisionDate || date || new Date().toISOString();
    this.date = this.decisionDate;
  }

  validateDecision() {
    if (!['Approved', 'Rejected', 'Under Review'].includes(this.decision)) {
      return ValidationResult.invalid('Invalid approval decision.');
    }
    if (this.decision === 'Rejected' && !this.comments?.trim()) {
      return ValidationResult.invalid('Please provide a reason for rejection.');
    }
    return ValidationResult.valid();
  }
}

export class Notification {
  constructor({
    notificationId,
    id,
    userId,
    message,
    notificationType = 'Update',
    type = 'Update',
    createdAt,
    date,
    status = NotificationStatus.UNREAD,
    read = false
  }) {
    this.notificationId = notificationId || id;
    this.id = this.notificationId;
    this.userId = userId;
    this.message = message;
    this.notificationType = notificationType || type;
    this.type = this.notificationType;
    this.createdAt = createdAt || date || new Date().toISOString();
    this.date = this.createdAt;
    this.status = status;
    this.read = read || status === NotificationStatus.READ;
  }

  markAsRead() {
    this.read = true;
    this.status = NotificationStatus.READ;
    return true;
  }

  dispatch() {
    this.status = NotificationStatus.SENT;
    return true;
  }
}

// ============================================================================
// 4. Business Services (Assignment 6 Section 2.3 & Assignment 7 Section 3.7)
// ============================================================================

export class EventService {
  constructor(workspace) {
    this.workspace = workspace;
  }

  createEvent(details, coordinatorId, action = 'SUBMIT', clock = () => new Date(), options = {}) {
    const user = this.workspace.data.users.find(u => u.id === coordinatorId);
    if (!user || !['Coordinator', 'Administrator'].includes(user.role)) {
      throw new ServiceError('You are not authorized to perform this action.', 403, 'UNAUTHORIZED');
    }

    const isSubmit = action === 'SUBMIT' || action === true;
    const isDraft = action === 'SAVE_DRAFT' || action === false;
    if (!isSubmit && !isDraft) {
      throw new ServiceError('Invalid event action.', 400, 'INVALID_ACTION');
    }

    // Target institutions verification
    if (details.institutionIds && details.institutionIds.length) {
      for (const instId of details.institutionIds) {
        if (!this.workspace.data.institutions.some(i => i.id === instId)) {
          throw new ServiceError('The target institution does not exist.', 400, 'NOT_FOUND');
        }
      }
    }

    if (details.capacity !== undefined && details.capacity !== null && (isNaN(Number(details.capacity)) || Number(details.capacity) < 1)) {
      throw new ServiceError('Capacity must be a positive whole number.', 400, 'VALIDATION_ERROR');
    }

    const eventInstance = new OutreachEvent({
      ...details,
      organizerId: coordinatorId,
      status: isDraft ? EventStatus.DRAFT : EventStatus.SUBMITTED
    });

    if (isSubmit) {
      const val = eventInstance.validateDetails();
      if (!val.isValid) {
        throw new ServiceError(val.errors[0], 400, 'VALIDATION_ERROR');
      }
    } else {
      if (!details.title?.trim()) {
        throw new ServiceError('Please complete the required field: title.', 400, 'VALIDATION_ERROR');
      }
    }

    if (options.simulateAssociationFailure) {
      throw new ServiceError('Simulated target-institution association save failure.', 500, 'DB_ERROR');
    }

    const payload = { ...details };
    if (!payload.id) delete payload.id;
    const saved = this.workspace.saveEvent(coordinatorId, payload, payload.id || null);
    if (isSubmit) {
      this.workspace.transition(coordinatorId, saved.id, 'submit');
    }
    return saved;
  }

  saveDraft(eventId, details, coordinatorId, clock = () => new Date()) {
    const payload = { ...details };
    if (eventId) payload.id = eventId;
    else delete payload.id;
    return this.createEvent(payload, coordinatorId, 'SAVE_DRAFT', clock);
  }

  submitForApproval(eventId, coordinatorId, clock = () => new Date()) {
    const user = this.workspace.data.users.find(u => u.id === coordinatorId);
    if (!user || !['Coordinator', 'Administrator'].includes(user.role)) {
      throw new ServiceError('You are not authorized to perform this action.', 403, 'UNAUTHORIZED');
    }
    const event = this.workspace.event(eventId);
    if (!event) throw new ServiceError('Event not found.', 404, 'NOT_FOUND');
    if (event.organizerId !== coordinatorId && user.role !== 'Administrator') {
      throw new ServiceError('You are not authorized to perform this action.', 403, 'UNAUTHORIZED');
    }
    return this.workspace.transition(coordinatorId, eventId, 'submit');
  }

  updateEvent(eventId, details, coordinatorId, clock = () => new Date()) {
    const user = this.workspace.data.users.find(u => u.id === coordinatorId);
    if (!user || !['Coordinator', 'Administrator'].includes(user.role)) {
      throw new ServiceError('You are not authorized to perform this action.', 403, 'UNAUTHORIZED');
    }
    const event = this.workspace.event(eventId);
    if (!event) throw new ServiceError('Event not found.', 404, 'NOT_FOUND');
    if (['Draft', 'Rejected'].includes(event.status)) {
      return this.workspace.saveEvent(coordinatorId, { ...event, ...details }, eventId);
    }
    if (event.status === 'Published') {
      return this.workspace.updatePublishedEvent(coordinatorId, eventId, details);
    }
    throw new ServiceError('Only draft, rejected or published events can be updated.', 400, 'INVALID_STATE');
  }

  getPublishedEvents(filters = {}) {
    return this.workspace.data.events.filter(e => e.status === EventStatus.PUBLISHED);
  }
}

export class RegistrationService {
  constructor(workspace) {
    this.workspace = workspace;
  }

  register(userId, eventId, clock = () => new Date(), options = {}) {
    if (!userId) {
      throw new ServiceError('Authentication is required.', 401, 'UNAUTHENTICATED');
    }
    const user = this.workspace.data.users.find(u => u.id === userId);
    if (!user) {
      throw new ServiceError('Authentication is required.', 401, 'UNAUTHENTICATED');
    }
    if (!['Student', 'Institution contact'].includes(user.role)) {
      throw new ServiceError('You are not authorized to perform this action.', 403, 'UNAUTHORIZED');
    }
    const event = this.workspace.data.events.find(e => e.id === eventId);
    if (!event) {
      throw new ServiceError('Event not found.', 404, 'NOT_FOUND');
    }
    if (event.status !== EventStatus.PUBLISHED) {
      throw new ServiceError('This event is not available for registration.', 400, 'INVALID_STATE');
    }

    const eventInstance = new OutreachEvent(event);
    if (!eventInstance.isRegistrationOpen(clock())) {
      throw new ServiceError('Registration for this event is closed.', 400, 'REGISTRATION_CLOSED');
    }

    // Eligibility check
    const regInstance = new Registration({ userId, eventId });
    const elig = regInstance.validateEligibility(user, event);
    if (!elig.isValid) {
      throw new ServiceError(elig.errors[0], 400, 'INELIGIBLE');
    }

    // Duplicate check
    const existing = this.workspace.data.registrations.find(
      r => r.userId === userId && r.eventId === eventId && ['Pending', 'Confirmed', 'Approved'].includes(r.status)
    );
    if (existing) {
      throw new ServiceError('You are already registered for this event.', 400, 'ALREADY_REGISTERED');
    }

    // Capacity check
    const activeCount = this.workspace.count(eventId);
    if (!eventInstance.hasCapacity(activeCount)) {
      throw new ServiceError('Registration is unavailable because the event is full.', 400, 'EVENT_FULL');
    }

    const reg = this.workspace.register(userId, eventId);
    reg.status = 'Confirmed';
    if (options.simulateNotificationFailure) {
      // Notification fails but committed registration remains successful
      return { ...reg, notificationDispatched: false };
    }
    return reg;
  }

  cancelRegistration(userId, registrationId, clock = () => new Date()) {
    return this.workspace.cancelRegistration(userId, registrationId);
  }
}

export class ApprovalService {
  constructor(workspace) {
    this.workspace = workspace;
  }

  getPendingEvents(approverId) {
    const user = this.workspace.data.users.find(u => u.id === approverId);
    if (!user || !['Approver', 'Administrator'].includes(user.role)) {
      throw new ServiceError('You are not authorized to perform this action.', 403, 'UNAUTHORIZED');
    }
    return this.workspace.data.events.filter(e => ['Pending', 'Under Review'].includes(e.status));
  }

  approve(eventId, approverId, comments = '', clock = () => new Date(), options = {}) {
    const user = this.workspace.data.users.find(u => u.id === approverId);
    if (!user || !['Approver', 'Administrator'].includes(user.role)) {
      throw new ServiceError('You are not authorized to perform this action.', 403, 'UNAUTHORIZED');
    }
    const event = this.workspace.data.events.find(e => e.id === eventId);
    if (!event) throw new ServiceError('Event not found.', 404, 'NOT_FOUND');
    if (!['Pending', 'Under Review'].includes(event.status)) {
      throw new ServiceError('This event is not available for review.', 400, 'INVALID_STATE');
    }

    if (options.simulateUpdateFailure) {
      throw new ServiceError('Simulated event status update failure during approval transaction.', 500, 'DB_ERROR');
    }

    return this.workspace.transition(approverId, eventId, 'approve', comments);
  }

  reject(eventId, approverId, reason = '', clock = () => new Date()) {
    const user = this.workspace.data.users.find(u => u.id === approverId);
    if (!user || !['Approver', 'Administrator'].includes(user.role)) {
      throw new ServiceError('You are not authorized to perform this action.', 403, 'UNAUTHORIZED');
    }
    if (!reason || !reason.trim()) {
      throw new ServiceError('Please provide a reason for rejection.', 400, 'VALIDATION_ERROR');
    }
    const event = this.workspace.data.events.find(e => e.id === eventId);
    if (!event) throw new ServiceError('Event not found.', 404, 'NOT_FOUND');
    if (!['Pending', 'Under Review'].includes(event.status)) {
      throw new ServiceError('This event is not available for review.', 400, 'INVALID_STATE');
    }

    return this.workspace.transition(approverId, eventId, 'reject', reason);
  }

  viewApprovalHistory(eventId) {
    const event = this.workspace.event(eventId);
    return event.history || [];
  }
}

export class NotificationService {
  constructor(workspace) {
    this.workspace = workspace;
  }

  createNotification(userId, message, type = 'Update', clock = () => new Date()) {
    this.workspace.notify(userId, message, type);
    return this.workspace.data.notifications[0];
  }

  markAsRead(notificationId, userId) {
    const n = this.workspace.data.notifications.find(n => n.id === notificationId && n.userId === userId);
    if (!n) throw new ServiceError('Notification not found.', 404, 'NOT_FOUND');
    n.read = true;
    return true;
  }

  dispatch(notification) {
    return true;
  }
}

// ============================================================================
// 5. Generic Repository (Assignment 7, Section 3.7)
// ============================================================================

export class Repository {
  constructor(collection = []) {
    this.collection = collection;
  }

  findById(id) {
    return this.collection.find(item => item.id === id || item.eventId === id || item.userId === id) || null;
  }

  findAll(predicate = () => true) {
    return this.collection.filter(predicate);
  }

  save(entity) {
    const idx = this.collection.findIndex(item => (item.id && item.id === entity.id) || (item.eventId && item.eventId === entity.eventId));
    if (idx >= 0) {
      this.collection[idx] = entity;
    } else {
      this.collection.push(entity);
    }
    return entity;
  }

  deleteById(id) {
    const idx = this.collection.findIndex(item => item.id === id || item.eventId === id);
    if (idx >= 0) {
      return this.collection.splice(idx, 1)[0];
    }
    return null;
  }
}

