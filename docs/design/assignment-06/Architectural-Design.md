# Lab Assignment 6: Architectural Design Specification

**Project:** InstituteConnect — Outreach Management Prototype  
**Team:** T005 · The LNM Institute of Information Technology (LNMIIT), Jaipur  
**Course:** CS314 Software Development Laboratory  
**Standard:** IEEE 1471 / ISO/IEC/IEEE 42010 Architecture Description  
**Status:** Completed & Integrated  
**Date:** November 2026  

---

## 1. Architectural Style & Principles

InstituteConnect adopts a **Layered Architecture (N-Tier)** augmented with **Domain-Driven Service Decomposition** and **Centralized Transactional Persistence**.

The architecture adheres to three core design principles:
1. **Separation of Concerns (SoC):** User interface interactions, API routing, business invariant enforcement, and physical persistence operate in strictly separated software tiers.
2. **Downward Dependency & Abstraction:** Higher layers depend solely on abstractions provided by immediately lower layers; lower layers never directly call higher-layer components.
3. **Defense in Depth & Server-Side Authority:** The client is treated as an untrusted presentation environment. All authentication, authorization, role enforcement, duplicate prevention, and capacity validations execute authoritatively on the server.

The corresponding architecture diagram is located at:  
`docs/design/assignment-06/diagrams/Architectural-Diagram.png`

---

## 2. Five-Layer Architecture Overview

```
┌───────────────────────────────────────────────────────────────────────────┐
│                     Layer 1: Presentation Layer                           │
│     Next.js 16 Client · React 19 UI · Responsive Dashboards (S1–S4)       │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │ HTTP/HTTPS (JSON-RPC over REST)
┌─────────────────────────────────────▼─────────────────────────────────────┐
│                 Layer 2: API & Controller Gateway Layer                   │
│   Next.js Route Handlers (/api/workspace, /api/auth, /api/health) · Auth  │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │ In-Memory Invocation & Typed DTOs
┌─────────────────────────────────────▼─────────────────────────────────────┐
│                 Layer 3: Core Domain & Business Services                  │
│   EventService · RegistrationService · ApprovalService · NotificationSvc  │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │ Data Access Abstraction (IRepository)
┌─────────────────────────────────────▼─────────────────────────────────────┐
│                   Layer 4: Data Access & Repository Layer                 │
│      WorkspaceRepository · Repository<T> · Query Serializer & Mappers     │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │ TLS 1.3 Connection Pooling (pg / Pool)
┌─────────────────────────────────────▼─────────────────────────────────────┐
│               Layer 5: Enterprise Shared Database Layer                   │
│   PostgreSQL (Neon) · ACID Row Locks · Foreign Keys · Unique Triggers    │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Detailed Layer Descriptions & Responsibilities

### 3.1 Layer 1: Presentation Layer (UI & Client Logic)
- **Technology:** Next.js 16 (App Router), React 19, Vanilla CSS Design System, Responsive HTML5.
- **Components:**
  - **Screen S1 (`login`):** Portal selection, managed authentication, password reset trigger, and Institute SSO integration.
  - **Screen S2 (`eventForm`):** 4-section event authoring modal with validation hints, category pickers, and multiselect institution chips.
  - **Screen S3 (`eventDetail`):** Comprehensive event discovery view with schedule tables, important notes, contact details, real-time occupancy gauge, and registration action cards.
  - **Screen S4 (`approvalsPage`):** High-efficiency two-pane review desk featuring pending proposals queue on the left and full event inspection + decision console on the right.
- **Responsibilities:** Renders authorized data projections, captures user intents, formats dates in Indian Standard Time (IST / Asia/Kolkata), and handles reactive updates.

---

### 3.2 Layer 2: API Gateway & Controller Layer
- **Technology:** Next.js Route Handlers (`src/app/api/...`), HTTP Cookie Sessions, Neon Managed Auth SDK.
- **Endpoints:**
  - `POST /api/auth/[...path]`: Authentication, verification codes, session issuance and revocation.
  - `GET /api/workspace`: Scoped snapshot queries and filtered registration review queues.
  - `POST /api/workspace`: Atomic JSON-RPC mutation endpoint (`saveEvent`, `transition`, `register`, `cancelRegistration`, etc.).
  - `GET /api/health`: Liveness and database connectivity probe.
- **Security & Authorization Gate:**
  - Validates session tokens on every request via `authClient.getSession()`.
  - Enforces role-based portal access through `authorizePortal()` and action-level authorization through `authorizeAction()`.
  - Denies student attempts to trigger administrative or coordinator mutations with `HTTP 403 Forbidden`.

---

### 3.3 Layer 3: Core Business & Domain Service Layer
- **Technology:** ES Modules (`lib/design-services.mjs`, `lib/workspace-service.mjs`, `model.mjs`).
- **Core Services:**
  - **`EventService`:** Governs event creation, draft persistence, submission invariants, publication prerequisites, and logistics revisions.
  - **`RegistrationService`:** Enforces registration windows, student level eligibility, target institution mapping, duplicate prevention, and seat capacity limits.
  - **`ApprovalService`:** Orchestrates proposal reviews, mandatory rejection reasons, state transitions (`Draft` → `Pending` → `Approved` / `Rejected`), and coordinator feedback.
  - **`NotificationService`:** Dispatches contextual in-app notifications to participants, coordinators, and approvers.
- **Domain Invariants Enforced:**
  - Events cannot be published without prior `Approved` decision (BR-002).
  - Rejection requires a mandatory, non-empty explanation (BR-003).
  - Registrations strictly close once event scheduled start time is reached (BR-005).
  - Attendance and outcomes can only be recorded after scheduled event end time (BR-007, BR-008).

---

### 3.4 Layer 4: Data Access & Repository Layer
- **Technology:** `lib/workspace-repository.js`, Generic `Repository<T>`, PostgreSQL client pool (`pg.Pool`).
- **Responsibilities:**
  - Abstracting physical storage operations behind typed repository contracts.
  - Providing transactional boundaries with explicit `BEGIN`, `COMMIT`, and `ROLLBACK`.
  - Serializing concurrent write operations via transactional row locking (`SELECT ... FOR UPDATE`) on the workspace aggregate record.
  - Providing in-memory mock fallback for offline local verification.

---

### 3.5 Layer 5: Enterprise Database Layer
- **Technology:** Serverless PostgreSQL on Neon.
- **Features:**
  - Declarative integrity: Foreign key cascading, positive whole number checks (`CHECK (capacity > 0)`), start/end time validations (`CHECK (end_time > start_time)`).
  - Concurrency guarantees: Serializable isolation and partial unique indexes (`idx_unique_active_registration`) preventing double-booking during concurrent registration bursts.
  - Centralized append-only audit trail logging administrative actions.

---

## 4. Communication Protocols & Data Contracts

| Boundary | Protocol / Transport | Data Format | Security Controls |
| :--- | :--- | :--- | :--- |
| **Layer 1 ↔ Layer 2** | HTTPS / Fetch | JSON (RPC Request/Response) | TLS 1.3, SameSite=Lax HttpOnly Cookies, Origin verification, X-Institute-Portal header |
| **Layer 2 ↔ Layer 3** | In-Process Memory Call | Typed Parameters & Objects | Server-side role inspection, Account status check |
| **Layer 3 ↔ Layer 4** | In-Process Method Call | Entity Instances & Criteria | ValidationResult checks, Error bubbling |
| **Layer 4 ↔ Layer 5** | PostgreSQL Wire Protocol | Parameterized SQL Statements | TLS Encryption, Pooled Connections, Parameterized queries (SQL injection prevention) |

---

## 5. Non-Functional Requirements (NFR) Realization

- **NFR-003 (Concurrent Users & Capacity Protection):** Serialized database transactions and partial unique indexes ensure that when multiple users apply for the final seat simultaneously, exactly one succeeds and the other is cleanly notified of event capacity exhaustion.
- **NFR-004 & NFR-005 (Authentication & Role Control):** Managed verified credentials on every workspace mutation; strict role checks (`authorizeAction`) block privilege escalation.
- **NFR-006 (Data Protection & Privacy):** Server-side data projection (`projectState`) redacts personal contact information, peer applications, and internal notes from unauthorized participants.
- **NFR-011 (Reliable Persistence & Idempotency):** Workspace mutations execute within ACID database transactions; failed operations trigger full rollback without leaving orphan records.
