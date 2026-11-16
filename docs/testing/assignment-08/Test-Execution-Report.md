# Lab Assignment 8: Test Execution Report

**Institute:** The LNM Institute of Information Technology, Jaipur  
**Course:** CS314 - Software Development Laboratory  
**Project:** InstituteConnect  
**Team:** T005  
**Verification:** 17 November 2026 (IST)  
**Baseline before these changes:** `12ea22f81af72849b75644e1c10e444455f2c948`

## 1. What was executed

An isolated Vercel Sandbox with Node.js 22.23.4 cloned the real repository.
`npm ci`, `npm test`, and `npm run build` were actually executed.
The original baseline passed 92 tests. With the changes in this revision,
**106 tests passed, 0 failed and 0 were skipped**. The production Next.js build succeeded.

The suite contains 28 Assignment 8 checks against `lib/design-services.mjs`
and the in-memory domain workspace; those checks passed. They are **service tests,
not 28 completed browser/HTTP/system tests**. Their injected-failure branches do
not establish real PostgreSQL transaction rollback or notification-gateway delivery.

Eight additional registration-window checks use the live application's
`executeAction` / `Workspace` paths and shared clock validation.
Six configuration checks verify that demo mode cannot activate in production,
on Vercel, or accidentally from placeholder credentials.

No production user accounts were created, no production records were seeded,
and no database migration was performed during this verification.

## 2. Fixtures and test adaptation

- Existing Assignment 8 fixtures: C01 coordinator, A01 approver, S01/S03 eligible
  students, S02 ineligible student, IC01 institution contact; I01 institution;
  E01 published event of capacity 120; E02 awaiting review; E03 draft.
- Assignment 8 normal clock: 24 November 2026, 12:00 IST.
- Opening boundary: 20 November 2026, 09:00 IST; test one minute earlier.
- Closing boundary: 27 November 2026, 17:00 IST; test one minute later.
- Runtime-path additions use the existing U1/U3 synthetic domain identities,
  an isolated TIMED event, capacity 120 and the same dates/times.
- No unspecified phone-length, performance or load threshold is introduced.

The existing live application has a participation-request approval workflow:
registration submission returns **Pending**, and a later review allocates the
confirmed place. The legacy design adapter changes successful registrations to
**Confirmed** for its original tests. These are distinct execution paths.
This change preserves the current live review workflow; a design-adapter pass
must not be used as evidence that the live workflow skips review.

## 3. Assignment 8 case execution

Every original ID is preserved. TS-xxx maps to TC-xxx.
The linked test source contains the concrete inputs, execution calls, assertions
and expected results. All results below were observed in the service suite.

| Test case | Use case | Requirements | Actual check / test source | Result / scope |
| --- | --- | --- | --- | --- |
| TC-001 | UC-004 | FR-012, FR-013, FR-016 | [TC-001 - Create and submit a complete event](../../../tests/assignment-08.test.mjs#L237) | Pass - design-service adapter |
| TC-002 | UC-004 | FR-012, FR-013, FR-016, NFR-009 | [TC-002 - Reject submission with a missing title](../../../tests/assignment-08.test.mjs#L255) | Pass - design-service adapter |
| TC-003 | UC-004 | FR-014 | [TC-003 - Save an incomplete draft](../../../tests/assignment-08.test.mjs#L268) | Pass - design-service adapter |
| TC-004 | UC-004 | FR-013, FR-016 | [TC-004 - Reject registration end before start](../../../tests/assignment-08.test.mjs#L287) | Pass - design-service adapter |
| TC-005 | UC-004 | FR-005, FR-012, NFR-005 | [TC-005 - Block event creation by a student](../../../tests/assignment-08.test.mjs#L304) | Pass - design-service adapter |
| TC-006 | UC-004 | FR-012, FR-013, NFR-012 | [TC-006 - Roll back event creation on association-save failure](../../../tests/assignment-08.test.mjs#L316) | Pass - design-service adapter |
| TC-007 | UC-004 | FR-012, FR-013 | [TC-007 - Reject an event end time before its start](../../../tests/assignment-08.test.mjs#L331) | Pass - design-service adapter |
| TC-008 | UC-004 | FR-012, FR-013 | [TC-008 - Reject a nonexistent target institution](../../../tests/assignment-08.test.mjs#L348) | Pass - design-service adapter |
| TC-009 | UC-011 | FR-027, FR-028, FR-031, FR-043, NFR-011 | [TC-009 - Register an eligible student successfully](../../../tests/assignment-08.test.mjs#L368) | Pass - design-service adapter |
| TC-010 | UC-011 | FR-027, FR-028 | [TC-010 - Reject an ineligible registrant](../../../tests/assignment-08.test.mjs#L396) | Pass - design-service adapter |
| TC-011 | UC-011 | FR-029, NFR-011 | [TC-011 - Prevent duplicate active registration](../../../tests/assignment-08.test.mjs#L412) | Pass - design-service adapter |
| TC-012 | UC-011 | FR-030, NFR-011 | [TC-012 - Accept the last available place](../../../tests/assignment-08.test.mjs#L430) | Pass - design-service adapter |
| TC-013 | UC-011 | FR-030 | [TC-013 - Reject registration at full capacity](../../../tests/assignment-08.test.mjs#L450) | Pass - design-service adapter |
| TC-014 | UC-011 | FR-027 | [TC-014 - Reject registration just before opening](../../../tests/assignment-08.test.mjs#L473) | Pass - design-service adapter |
| TC-015 | UC-011 | FR-027 | [TC-015 - Reject registration just after closing](../../../tests/assignment-08.test.mjs#L486) | Pass - design-service adapter |
| TC-016 | UC-011 | FR-027, NFR-004 | [TC-016 - Require authentication for registration](../../../tests/assignment-08.test.mjs#L499) | Pass - design-service adapter |
| TC-017 | UC-011 | FR-030, NFR-003, NFR-011 | [TC-017 - Prevent overbooking by concurrent requests](../../../tests/assignment-08.test.mjs#L511) | Pass - design-service adapter |
| TC-018 | UC-011 | FR-027, FR-031, FR-043, NFR-011 | [TC-018 - Preserve committed registration if notification fails](../../../tests/assignment-08.test.mjs#L539) | Pass - design-service adapter |
| TC-019 | UC-011 | FR-027, FR-028, FR-031 | [TC-019 - Register an eligible institution contact](../../../tests/assignment-08.test.mjs#L551) | Pass - design-service adapter |
| TC-020 | UC-011 | FR-027 | [TC-020 - Reject registration for an unpublished event](../../../tests/assignment-08.test.mjs#L564) | Pass - design-service adapter |
| TC-021 | UC-006 | FR-017 | [TC-021 - Approve an event and notify its coordinator](../../../tests/assignment-08.test.mjs#L580) | Pass - design-service adapter |
| TC-022 | UC-006 | FR-018, FR-019 | [TC-022 - Reject an event with a reason](../../../tests/assignment-08.test.mjs#L598) | Pass - design-service adapter |
| TC-023 | UC-006 | FR-018, FR-019, NFR-009 | [TC-023 - Require a reason when rejecting](../../../tests/assignment-08.test.mjs#L616) | Pass - design-service adapter |
| TC-024 | UC-006 | FR-005, FR-017, FR-018, NFR-005 | [TC-024 - Prevent a non-approver from deciding an event](../../../tests/assignment-08.test.mjs#L630) | Pass - design-service adapter |
| TC-025 | UC-006 | FR-017, FR-018 | [TC-025 - Show an empty pending-event list](../../../tests/assignment-08.test.mjs#L648) | Pass - design-service adapter |
| TC-026 | UC-006 | FR-017, NFR-012 | [TC-026 - Roll back approval on event-update failure](../../../tests/assignment-08.test.mjs#L661) | Pass - design-service adapter |
| TC-027 | UC-006 | FR-017 | [TC-027 - Reject an approval request for a Draft event](../../../tests/assignment-08.test.mjs#L677) | Pass - design-service adapter |
| TC-028 | UC-006 | FR-017, FR-020 | [TC-028 - Enforce approval before publication](../../../tests/assignment-08.test.mjs#L691) | Pass - design-service adapter |

### 3.1 Technique application

Equivalence Partitioning selects valid/invalid input, eligibility and role classes.
Boundary Value Analysis checks date/time boundaries and capacity 119/120 versus
120/120. Integration-oriented tests exercise calls between domain/service components.
Full system testing requires the actual UI, authentication and persistent API;
the 28 service checks are not relabeled as completed system tests.

### 3.2 Additional live-path regression checks

`tests/registration-window.test.mjs` verifies:
1. Runtime saveEvent accepts and retains registrationStartTime/registrationEndTime.
2. TC-014's before-opening relation is refused by the live registration action.
3. TC-015's after-closing relation is refused by the live registration action.
4. A valid window accepts a Pending request, preserving participation review.
5. Reversed same-day registration times do not mutate a draft.
6. Legacy date-only events retain their whole closing day.
7. Malformed clock values are refused by the action validation layer.
8. Invalid calendar values fail closed without a parser exception.

`tests/runtime-config.test.mjs` adds six checks of hosted fail-closed behavior
and explicit local-demo opt-in. They are regression checks, not new SRS IDs.

## 4. Production-build HTTP checks

A production-mode server was started in the isolated sandbox with no auth or
database credentials and an explicitly matching local APP_ORIGIN.

| Check | Observed status | Result |
| --- | --- | --- |
| Home page renders | 200 | Pass |
| Health with missing auth/database | 503 | Pass - correctly unavailable |
| Workspace without authentication | 401 | Pass |
| Cross-origin workspace write | 403 | Pass |
| Same-origin non-JSON write | 415 | Pass |
| Sign-in with missing managed auth | 503, no Set-Cookie | Pass - no demo session |

Reproduce with `node scripts/smoke-http.mjs http://127.0.0.1:4173 --unconfigured`
against a local production server started with
`APP_ORIGIN=http://127.0.0.1:4173 npm start`.

On a configured deployment, omit `--unconfigured`: health must be 200 and no
registration or sign-in mutation is attempted by this smoke script.

## 5. Defects and corrections

Two implementation gaps were found during review:

| ID | Affected requirements | Gap | Correction | Status |
| --- | --- | --- | --- | --- |
| DEF-RUNTIME-001 | FR-027; TC-014/TC-015 | Live registration used calendar dates even when the separate design service tested minute boundaries. | Shared IST registration window; optional time fields in form/action; live-state and registration guards. | Fixed in this revision; automated live-service regression passed. |
| DEF-RUNTIME-002 | FR-001/FR-005; NFR-004/NFR-005 | Missing hosted auth/database configuration silently selected password-free, process-local demo behavior. | Demo requires explicit local-development opt-in and is forbidden on Vercel/production; missing hosted dependencies fail closed. | Fixed in this revision; configuration and built-HTTP regression passed. |

Severity: DEF-RUNTIME-001 Medium (incorrect registration timing);
DEF-RUNTIME-002 High (authentication/role trust if configuration is missing).
Priority: High for both. These IDs identify review findings with observed regression
verification, not fabricated failures in the final 28-case run. Original failing
behavior follows directly from the baseline implementation. No production exploit
or data-corruption incident is claimed. No final tests failed.

## 6. RTM and scope limits

The requirements listed in section 3 are the original SRS IDs from the assignment,
not the differently numbered business rules in earlier draft reports.
The chain is requirement -> use case -> TS ID -> TC ID -> observed service result.

There are 21 unique mapped numbered requirements: 15 of 51 FRs (29.41%)
and 6 of 20 NFRs (30.00%), or 21 of 71 overall (29.58%).
A mapped service assertion is **partial design coverage**, not full requirement
acceptance. In particular, UI-only aspects, real authentication, persistent concurrent
allocation, actual database rollback and external notification delivery need separate
application/integration evidence. No waitlist, multi-stage review, payment gateway,
bulk roster upload or biometric attendance feature is added to the original scope.

## 7. Summary

| Measure | Assignment 8 service suite | Full automated service/config suite |
| --- | ---: | ---: |
| Designed / discovered | 28 | 106 |
| Executed | 28 | 106 |
| Passed | 28 | 106 |
| Failed | 0 | 0 |
| Skipped | 0 | 0 |
| Test pass percentage | 28/28 x 100 = 100% | 106/106 x 100 = 100% |
| Test execution percentage | 28/28 x 100 = 100% | 106/106 x 100 = 100% |

Additional evidence: six isolated production-build HTTP checks passed.
Authenticated browser E2E, new real-database integration execution and
cross-browser/load/availability measurements were **not executed in this revision**.
There is no claim of 106 successful system tests, a production SLA or measured
absence of memory leaks.

CI runs the service suite on Node 22 and 24, and builds and smoke-tests on Node 24.
The workflow preserves the actual TAP output as a build artifact.
No production credentials are exposed to pull-request CI.

## 8. Reproduce and evidence

```bash
npm ci
npm test
npm run build
```

- Source: `tests/assignment-08.test.mjs`, `tests/registration-window.test.mjs`,
  `tests/runtime-config.test.mjs` and the existing regression suite.
- Continuous verification: `.github/workflows/verify.yml`.
- Checked source baseline and measured totals:
  `evidence/verification-summary.json`.
- The earlier PDF reference-harness evidence remains a separate historical artifact.
  It is not silently relabeled as a run of this repository.

## 9. Team and AI declaration

Team T005: Divyansh Singh (24DCS032), Manvi Agarwal (24DCS031),
Vaibhav Prakash (24DCS033), Ansh Nandan Mathur (24DCS030).
Representative: Ansh Nandan Mathur.

AI tool used: ChatGPT (OpenAI). Purpose: code review, implementation, regression tests,
sandbox test/build execution and reporting. Team review and individual contribution
claims must be confirmed by the team; no independent team execution or signatures
are asserted on their behalf. Assignments 1-7 in the supplied PDF are unchanged.
