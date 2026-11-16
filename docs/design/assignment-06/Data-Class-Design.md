# Lab Assignment 6: Data and Class Design Specification

**Project:** InstituteConnect — Outreach Management Prototype  
**Team:** T005 · The LNM Institute of Information Technology (LNMIIT), Jaipur  
**Course:** CS314 Software Development Laboratory  
**Status:** Completed & Integrated  
**Date:** November 2026  

---

## 1. Executive Summary & Design Objective

The purpose of this document is to specify the design-level classes, system enumerations, data models, and database constraints for the **InstituteConnect** system, transitioning the conceptual analysis model (Assignments 1–5) into an extensible object-oriented and relational design architecture.

The design implements the domain model with explicit visibility modifiers (`+` public, `-` private, `#` protected), strongly typed attributes, complete method signatures with parameter lists and return types, and business validation invariants.

The corresponding UML diagram is available at:  
`docs/design/assignment-06/diagrams/Design-Class-Diagram.png`

---

## 2. System Enumerations

The system defines 8 standard enumerations enforcing domain integrity and role-based policies:

| Enumeration | Allowed Values | Semantic Meaning |
| :--- | :--- | :--- |
| `UserRole` | `Student`, `Institution contact`, `Coordinator`, `Approver`, `Administrator`, `Management` | Core security principal discriminator governing workspace scoping and action permissions. |
| `AccountStatus` | `Active`, `Inactive`, `Suspended` | Account lifecycle state. Only `Active` accounts can authenticate and perform mutations. |
| `EventStatus` | `Draft`, `Pending`, `Under Review`, `Approved`, `Rejected`, `Published`, `Cancelled`, `Completed` | Outreach event lifecycle states. `Pending` corresponds to user-facing `Submitted`. |
| `RegistrationStatus` | `Confirmed`, `Pending`, `Rejected`, `Cancelled`, `Event cancelled` | Participant registration status. `Confirmed` and `Approved` grant entry and consume capacity. |
| `ApprovalDecision` | `Approved`, `Rejected`, `Under Review` | Formal review decisions recorded by authorized Approvers. |
| `EventMode` | `Offline`, `Online`, `Hybrid` | Logistics delivery mode for outreach sessions. |
| `InstitutionType` | `School`, `College`, `Other` | Educational institution categorization. |
| `NotificationStatus` | `Unread`, `Read`, `Sent`, `Failed` | Delivery and read tracking for in-app user notifications. |

---

## 3. Detailed Class Specifications

### 3.1 `User` (Abstract Base Class)
Represents any authenticated system identity within the InstituteConnect ecosystem.

- **Attributes:**
  - `- userId: String` (Unique system identifier, e.g., `U1`, UUID)
  - `- name: String` (User full name)
  - `- email: String` (Verified corporate or institutional email)
  - `- phone: String` (Contact telephone number)
  - `- role: UserRole` (Assigned security role)
  - `- accountStatus: AccountStatus` (Current account status)
  - `- institutionId: String` (Optional foreign key to Institution)
  - `- level: String` (Education level for students, e.g., `Class 12`)
- **Operations:**
  - `+ authenticate(email: String, password: String): Boolean`
  - `+ logout(): Void`
  - `+ hasRole(requiredRole: UserRole): Boolean`
  - `+ getProfile(): Object`

---

### 3.2 `ProspectiveStudent` (Specialization of `User`)
Specialized actor representing students exploring undergraduate programmes and registering for campus events.

- **Inherits from:** `User`
- **Specific Attributes:**
  - `- level: String` (`Class 10`, `Class 11`, `Class 12`, `Undergraduate`)
- **Operations:**
  - `+ browseEvents(workspace: Workspace): OutreachEvent[]`
  - `+ viewEvent(workspace: Workspace, eventId: String): OutreachEvent`
  - `+ registerForEvent(service: RegistrationService, eventId: String): Registration`
  - `+ cancelRegistration(service: RegistrationService, registrationId: String): Boolean`

---

### 3.3 `InstitutionContact` (Specialization of `User`)
Designated representative from partner schools or junior colleges coordinating group visits and institutional engagements.

- **Inherits from:** `User`
- **Specific Attributes:**
  - `- institutionId: String` (Foreign key to `Institution.institutionId`)
- **Operations:**
  - `+ viewRelevantEvents(workspace: Workspace): OutreachEvent[]`
  - `+ confirmParticipation(service: RegistrationService, eventId: String): Registration`
  - `+ viewEngagementHistory(workspace: Workspace): ActivityParticipation[]`

---

### 3.4 `OutreachCoordinator` (Specialization of `User`)
Faculty or outreach staff responsible for drafting, coordinating, updating, and evaluating outreach events.

- **Inherits from:** `User`
- **Operations:**
  - `+ createEvent(service: EventService, details: Object, action: String): OutreachEvent`
  - `+ saveDraft(service: EventService, eventId: String, details: Object): OutreachEvent`
  - `+ submitForApproval(service: EventService, eventId: String): OutreachEvent`
  - `+ updateEvent(service: EventService, eventId: String, details: Object): OutreachEvent`
  - `+ recordOutcomes(workspace: Workspace, values: Object): Outcome`

---

### 3.5 `OutreachApprover` (Specialization of `User`)
Department heads or academic deans reviewing submitted proposals to ensure pedagogical value, venue safety, and resource feasibility.

- **Inherits from:** `User`
- **Operations:**
  - `+ viewPendingEvents(service: ApprovalService): OutreachEvent[]`
  - `+ approveEvent(service: ApprovalService, eventId: String, comments: String): OutreachEvent`
  - `+ rejectEvent(service: ApprovalService, eventId: String, reason: String): OutreachEvent`
  - `+ viewApprovalHistory(service: ApprovalService, eventId: String): Approval[]`

---

### 3.6 `Administrator` (Specialization of `User`)
System administrator overseeing access governance, role elevation, institutional directory curation, and global configurations.

- **Inherits from:** `User`
- **Operations:**
  - `+ manageUsers(workspace: Workspace): User[]`
  - `+ assignRoles(workspace: Workspace, targetId: String, newRole: UserRole, status: AccountStatus): Void`
  - `+ manageConfiguration(workspace: Workspace, values: Object): Void`
  - `+ createBackup(workspace: Workspace): Object`

---

### 3.7 `InstituteManagement` (Specialization of `User`)
Executive leadership inspecting high-level enrollment conversion pipelines, partner institutional reach, and engagement metrics.

- **Inherits from:** `User`
- **Operations:**
  - `+ viewReports(workspace: Workspace): Object`
  - `+ viewDashboards(workspace: Workspace): Object`

---

### 3.8 `Institution`
Represents an external secondary school, junior college, or academy collaborating with LNMIIT.

- **Attributes:**
  - `- institutionId: String` (Primary Key, e.g., `I1`)
  - `- name: String` (Official institution title)
  - `- type: InstitutionType` (`School`, `College`, `Other`)
  - `- address: String` / `- region: String` (Geographic city and state)
  - `- relationshipStatus: String` (`Active partner`, `In conversation`, `New lead`, `Inactive`)
  - `- primaryContactId: String` (Foreign key to `Contact.contactId`)
- **Operations:**
  - `+ getDetails(): Object`
  - `+ updateDetails(values: Object): Boolean`
  - `+ getContacts(workspace: Workspace): Contact[]`

---

### 3.9 `Contact`
Individual educator, principal, or career counsellor affiliated with a partner institution.

- **Attributes:**
  - `- contactId: String` (Primary Key, e.g., `C1`)
  - `- institutionId: String` (Foreign key to `Institution.institutionId`)
  - `- name: String` (Contact full name)
  - `- designation: String` (e.g., `Career Counsellor`, `Principal`)
  - `- email: String` (Verified contact email)
  - `- phone: String` (Direct telephone number)
- **Operations:**
  - `+ updateDetails(values: Object): Boolean`
  - `+ getInstitution(workspace: Workspace): Institution`

---

### 3.10 `OutreachEvent`
Central aggregate root encapsulating event parameters, scheduling, target restrictions, and lifecycle status.

- **Attributes:**
  - `- eventId: String` (Primary Key, e.g., `E1`)
  - `- title: String` (Mandatory title, 1–200 characters)
  - `- description: String` (Detailed narrative of activities)
  - `- category: String` (`Workshop`, `Campus visit`, `School visit`, `Webinar`, etc.)
  - `- eventDate: Date` (Scheduled event date in `YYYY-MM-DD` IST)
  - `- startTime: Time` (`HH:MM` 24-hr format)
  - `- endTime: Time` (`HH:MM` 24-hr format, strictly > startTime)
  - `- mode: EventMode` (`Offline`, `Online`, `Hybrid`)
  - `- venue: String` (Physical or virtual location)
  - `- capacity: Integer` (Positive whole number representing seat limit)
  - `- registrationStart: Date` (Opening date of registration window)
  - `- registrationEnd: Date` (Closing date, >= start and <= eventDate)
  - `- eligibilityCriteria: String` (Eligibility filter, e.g., `All students`, `Class 12`)
  - `- instructions: String` (Participant guidelines, dress code, ID rules)
  - `- status: EventStatus` (Current lifecycle state)
  - `- organizerId: String` (Foreign key to `User.userId`)
  - `- institutionIds: String[]` (List of targeted institution IDs)
  - `- contactIds: String[]` (Associated contacts)
  - `- history: Approval[]` (Audit chain of approval decisions)
- **Operations:**
  - `+ validateDetails(): ValidationResult`
  - `+ isRegistrationOpen(currentTime: Date): Boolean`
  - `+ hasCapacity(currentConfirmedCount: Integer): Boolean`

---

### 3.11 `Registration`
Association class linking a participant (`ProspectiveStudent` or `InstitutionContact`) to an `OutreachEvent`.

- **Attributes:**
  - `- registrationId: String` (Primary Key, e.g., `R1`)
  - `- userId: String` (Foreign key to `User.userId`)
  - `- eventId: String` (Foreign key to `OutreachEvent.eventId`)
  - `- registrationDate: DateTime` (ISO 8601 creation timestamp)
  - `- status: RegistrationStatus` (`Confirmed`, `Pending`, `Rejected`, `Cancelled`)
  - `- reviewedBy: String` (Approver userId if decided)
  - `- reviewedAt: DateTime` (Decision timestamp)
  - `- rejectionReason: String` (Feedback if rejected)
- **Operations:**
  - `+ validateEligibility(user: User, event: OutreachEvent): ValidationResult`
  - `+ confirm(): Boolean`
  - `+ cancel(): Boolean`

---

### 3.12 `Approval`
Immutable audit record capturing reviewer action on an outreach proposal.

- **Attributes:**
  - `- approvalId: String` (Primary Key, e.g., `AP-1`)
  - `- eventId: String` (Foreign key to `OutreachEvent.eventId`)
  - `- approverId: String` (Foreign key to `User.userId`)
  - `- decision: ApprovalDecision` (`Approved`, `Rejected`, `Under Review`)
  - `- comments: String` (Mandatory for rejection, optional for approval)
  - `- decisionDate: DateTime` (ISO timestamp)
- **Operations:**
  - `+ validateDecision(): ValidationResult`

---

### 3.13 `Notification`
In-app communication record dispatched to specific users upon lifecycle events.

- **Attributes:**
  - `- notificationId: String` (Primary Key, e.g., `N1`)
  - `- userId: String` (Recipient userId)
  - `- message: String` (Notification body text)
  - `- notificationType: String` (`Update`, `Registration pending`, `Event update`, etc.)
  - `- createdAt: DateTime` (Timestamp)
  - `- status: NotificationStatus` (`Unread`, `Read`, `Sent`)
- **Operations:**
  - `+ markAsRead(): Boolean`
  - `+ dispatch(): Boolean`

---

## 4. Logical Schema & Relational Integrity Constraints

The persistent schema guarantees referential integrity, concurrency protection, and ACID consistency:

```sql
-- 1. Users Table
CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(32),
    role VARCHAR(32) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'Active',
    institution_id VARCHAR(64),
    level VARCHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Institutions Table
CREATE TABLE institutions (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(32) NOT NULL,
    region VARCHAR(255) NOT NULL,
    status VARCHAR(64) NOT NULL DEFAULT 'Active partner',
    primary_contact_id VARCHAR(64)
);

-- 3. Contacts Table
CREATE TABLE contacts (
    id VARCHAR(64) PRIMARY KEY,
    institution_id VARCHAR(64) NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    designation VARCHAR(128),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(32)
);

-- 4. Outreach Events Table
CREATE TABLE events (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(64) NOT NULL,
    event_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    mode VARCHAR(32) NOT NULL,
    venue VARCHAR(255) NOT NULL,
    capacity INT NOT NULL CHECK (capacity > 0),
    registration_start DATE NOT NULL,
    registration_end DATE NOT NULL,
    eligibility VARCHAR(128) NOT NULL DEFAULT 'All students',
    instructions TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'Draft',
    organizer_id VARCHAR(64) NOT NULL REFERENCES users(id),
    institution_ids JSONB DEFAULT '[]',
    contact_ids JSONB DEFAULT '[]',
    history JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_times CHECK (end_time > start_time),
    CONSTRAINT valid_reg_window CHECK (registration_end >= registration_start AND registration_end <= event_date)
);

-- 5. Registrations Table (Serialized via unique index & triggers)
CREATE TABLE registrations (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    event_id VARCHAR(64) NOT NULL REFERENCES events(id) ON DELETE RESTRICT,
    status VARCHAR(32) NOT NULL DEFAULT 'Pending',
    registration_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_by VARCHAR(64) REFERENCES users(id),
    reviewed_at TIMESTAMPTZ,
    rejection_reason TEXT
);

-- Unique index preventing duplicate active registrations per user per event
CREATE UNIQUE INDEX idx_unique_active_registration 
ON registrations (user_id, event_id) 
WHERE status IN ('Confirmed', 'Approved', 'Pending');
```

---

## 5. Traceability to Requirements

| Class / Entity | Traceable Requirements | Implemented Methods / Rules |
| :--- | :--- | :--- |
| `OutreachEvent` | FR-012, FR-013, FR-014, FR-015, FR-016, FR-026 | `validateDetails()`, `saveDraft()`, `submit()`, `updatePublishedEvent()` |
| `Approval` | FR-017, FR-018, FR-019, FR-020, BR-002 | `approve()`, `reject()`, rejection reason enforcement, audit tracking |
| `Registration` | FR-027, FR-028, FR-029, FR-030, FR-032 | `validateEligibility()`, capacity checking, duplicate prevention |
| `Institution` / `Contact` | FR-006, FR-007, FR-008, FR-009, FR-010 | Primary contact link integrity, institutional relevance filtering |
| `User` hierarchy | FR-001, FR-002, FR-004, FR-005, NFR-005 | Role discrimination, server-side authorization gates, session scoping |
