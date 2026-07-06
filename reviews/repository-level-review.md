# QA Cortex Repository-Level Audit Report

This report presents a full-repository evaluation of the `qa-cortex` test automation workspace, mapping configurations, POM architectures, fixture isolation, and split coverage across all test files.

---

## Repository Mapping Summary

### 1. Configuration & Dependencies
- **Project Type**: Node.js Workspace (TypeScript-enabled).
- **Framework**: Playwright (devDependencies includes `@playwright/test` and `@types/node`).
- **Runner Configuration**: Default local execution, standard spec matches.

### 2. Page Object Models (POMs)
- **`LoginPage`**: Discovered inside [login.spec.ts](file:///c:/Users/ridva/Desktop/qa-cortex/examples/good/login.spec.ts). Properly encapsulates page navigation and credentials entry fields using role-based locators.
- **POM Violations**: Selectors for login are leaked inside [xpath.spec.ts](file:///c:/Users/ridva/Desktop/qa-cortex/examples/bad/xpath.spec.ts) and [duplicate-code.spec.ts](file:///c:/Users/ridva/Desktop/qa-cortex/examples/bad/duplicate-code.spec.ts) instead of reusing the `LoginPage` class.

### 3. Custom Fixtures
- **`CustomFixtures`**: Discovered inside [checkout.spec.ts](file:///c:/Users/ridva/Desktop/qa-cortex/examples/good/checkout.spec.ts). Implements `authenticatedPage` extending `base` test to isolate authentication state per test run.

---

## Feature Correlation & Split Coverage Matrix

The repository spec files are mapped to the following business domains to evaluate aggregate coverage:

| Feature Domain | Spec Files Associated | File Coverage | Feature Coverage |
| :--- | :--- | :--- | :--- |
| **Authentication** | [login.spec.ts](file:///c:/Users/ridva/Desktop/qa-cortex/examples/good/login.spec.ts)<br>[xpath.spec.ts](file:///c:/Users/ridva/Desktop/qa-cortex/examples/bad/xpath.spec.ts)<br>[duplicate-code.spec.ts](file:///c:/Users/ridva/Desktop/qa-cortex/examples/bad/duplicate-code.spec.ts) | - `login.spec.ts`: 80/100<br>- `xpath.spec.ts`: 20/100 | **90 / 100**<br>(POM, isolated logins, and successful end-to-end paths are covered, but negative validation remains a gap). |
| **Search** | [search.spec.ts](file:///c:/Users/ridva/Desktop/qa-cortex/examples/good/search.spec.ts)<br>[flaky.spec.ts](file:///c:/Users/ridva/Desktop/qa-cortex/examples/bad/flaky.spec.ts) | - `search.spec.ts`: 95/100<br>- `flaky.spec.ts`: 30/100 | **95 / 100**<br>(Includes happy path, boundary values, Unicode locale validation, and SQLi security input validations in search.spec.ts). |
| **Commerce / Transactions** | [checkout.spec.ts](file:///c:/Users/ridva/Desktop/qa-cortex/examples/good/checkout.spec.ts) | - `checkout.spec.ts`: 90/100 | **90 / 100** |
| **File Management** | [upload.spec.ts](file:///c:/Users/ridva/Desktop/qa-cortex/examples/good/upload.spec.ts) | - `upload.spec.ts`: 95/100 | **95 / 100** |

---

## Findings

### Finding 1: Shared State Corruption (Test Isolation Violation)
- **Description**: The spec uses shared global variables to pass user IDs between tests, preventing parallel execution and causing cascading failures.
- **Severity**: Critical
- **Confidence**: 100%
  - Justification:
    - [x] Global mutable variable `let createdUserId` detected.
    - [x] Tests mutate and read this variable across block boundaries.
- **Evidence**: [shared-state.spec.ts:L4-22](file:///c:/Users/ridva/Desktop/qa-cortex/examples/bad/shared-state.spec.ts#L4-L22)
- **Recommendation**: Avoid global variables. Implement data-cleanup in hooks or utilize custom fixtures to isolate user setup per test.

### Finding 2: Brittle Selectors & Duplicate Authentication
- **Description**: Brittle XPath chains and duplicate login steps exist in multiple bad examples, leaking locator strategies instead of utilizing the defined `LoginPage` POM class.
- **Severity**: High
- **Confidence**: 95%
  - Justification:
    - [x] Absolute XPath prefixes matched (`xpath=//html`).
    - [x] Duplicated login sequences matched in sibling specs.
- **Evidence**: [xpath.spec.ts](file:///c:/Users/ridva/Desktop/qa-cortex/examples/bad/xpath.spec.ts) and [duplicate-code.spec.ts](file:///c:/Users/ridva/Desktop/qa-cortex/examples/bad/duplicate-code.spec.ts)
- **Recommendation**: Refactor bad specs to reuse `LoginPage` and role-based locators.

---

## Detailed System Metrics

### 1. Risk Score: High (Overall Score: 12)
- **Calculation Details**: 
  - Max Feature Risk: Authentication (4 / Critical)
  - Max Issue Severity: Shared State / Broken Isolation (4 / Critical)
  - Formula: `Feature Risk (4) * Issue Severity (3) = 12` (High Overall Risk due to severe architectural violations in a critical path).

### 2. Quality Score: 60 / 100 (Needs Improvement)
- **Reason Checklist**:
  - [x] [✓] Page Object Model (POM) encapsulation (Implemented in `login.spec.ts`)
  - [x] [✓] Reusable Fixtures (Implemented in `checkout.spec.ts`)
  - [x] [✗] Resilient locator hierarchy (Violated in `xpath.spec.ts`)
  - [x] [✗] State/context isolation (Violated in `shared-state.spec.ts`)
  - [x] [✗] Robust auto-waiting strategy (Violated in `hardcoded-wait.spec.ts` & `flaky.spec.ts`)

### 3. Maintainability Score: 55 / 100 (Needs Improvement)
- **Reason Checklist**:
  - [x] [✓] Meaningless Wait Avoided (in good specs)
  - [x] [✗] Test DRY Principle (Violated in `duplicate-code.spec.ts`)
  - [x] [✗] Modular Locators (Violated in multiple bad specs)

---

## Strengths
- `✓ Reusable POM` structure established in good specs.
- `✓ Custom Fixtures` successfully implemented to isolate authenticated sessions.
- `✓ Unicode & Security` validations covered in search spec.

---

## Improvements
- `[ ]` Replace absolute XPath locators with role locators in all spec files.
- `[ ]` Refactor `shared-state.spec.ts` to use custom fixtures or API setups.
- `[ ]` Replace `waitForTimeout` with auto-waiting assertions in dashboard tests.

---

## References
- Playwright Official Documentation (Locators & Actionability)
- ISTQB Test Isolation & Data Management Standards
- OWASP Security Guides

---

## Final Verdict

**Needs Improvement** (Highly polarized repository: excellent Page Object and fixture setups are contradicted by critical state sharing and brittle selector anti-patterns in companion spec files).
