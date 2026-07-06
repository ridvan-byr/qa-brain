# QA Brain Validation Report

Generated: 2026-07-06T10:50:53.729Z

## Summary

- Repositories configured: 10
- Framework: Playwright
- Files reviewed: 239
- Findings: 10
- Average review time: 2ms
- LLM provider comparison: Deferred

## Repository Selection

- Minimum selection criteria satisfied.

## Repository Results

| Repository | Size | Files | Findings | Critical/High | Avg Time | Notes |
| :--- | :--- | ---: | ---: | ---: | ---: | :--- |
| microsoft/playwright-mcp | small | 3 | 0 | 0 | 11ms | LLM provider comparison skipped. Set runGeminiComparison=true to enable it. |
| imbhargav5/nextbase-nextjs-supabase-starter | small | 4 | 0 | 0 | 5ms | LLM provider comparison skipped. Set runGeminiComparison=true to enable it. |
| MarcusFelling/demo.playwright | medium | 19 | 0 | 0 | 2ms | LLM provider comparison skipped. Set runGeminiComparison=true to enable it. |
| vitalets/playwright-bdd | medium | 17 | 0 | 0 | 3ms | LLM provider comparison skipped. Set runGeminiComparison=true to enable it. |
| synpress-io/synpress | large | 50 | 1 | 0 | 1ms | LLM provider comparison skipped. Set runGeminiComparison=true to enable it. |
| allure-framework/allure-js | large | 50 | 0 | 0 | 1ms | LLM provider comparison skipped. Set runGeminiComparison=true to enable it. |
| serenity-js/serenity-js | enterprise | 50 | 0 | 0 | 1ms | LLM provider comparison skipped. Set runGeminiComparison=true to enable it. |
| microsoft/playwright-vscode | medium | 21 | 0 | 0 | 3ms | LLM provider comparison skipped. Set runGeminiComparison=true to enable it. |
| antiwork/shortest | medium | 13 | 8 | 1 | 3ms | LLM provider comparison skipped. Set runGeminiComparison=true to enable it. |
| akshayp7/playwright-typescript-playwright-test | medium | 12 | 1 | 0 | 3ms | LLM provider comparison skipped. Set runGeminiComparison=true to enable it. |

## Accuracy Matrix

| Category | Precision | Recall |
| :--- | :--- | :--- |
| Locator | Requires manual triage | Requires manual triage |
| Waiting | Requires manual triage | Requires manual triage |
| POM | Requires manual triage | Requires manual triage |
| Repository | Requires manual triage | Requires manual triage |
| Assertions | Requires manual triage | Requires manual triage |
| Fixtures | Requires manual triage | Requires manual triage |
| Isolation | Requires manual triage | Requires manual triage |

## Rule Coverage

| Rule | Trigger Count | Confidence |
| :--- | ---: | :--- |
| knowledge/google/flaky-tests.md | 1 | Low |
| knowledge/google/maintainability.md | 94 | High |
| knowledge/google/test-isolation.md | 2 | Low |
| knowledge/istqb/boundary-value-analysis.md | 16 | High |
| knowledge/owasp/authentication-testing.md | 16 | High |
| knowledge/owasp/input-validation.md | 19 | High |
| knowledge/playwright/fundamentals/assertions.md | 9 | Medium |
| knowledge/playwright/fundamentals/auto-waiting.md | 1 | Low |
| knowledge/playwright/fundamentals/locators.md | 94 | High |
| knowledge/playwright/README.md | 147 | High |
| knowledge/playwright/review-rules/assertion-review.md | 9 | Medium |
| knowledge/playwright/review-rules/isolation-review.md | 2 | Low |
| knowledge/playwright/review-rules/locator-review.md | 94 | High |
| knowledge/playwright/review-rules/parallel-review.md | 2 | Low |
| knowledge/playwright/review-rules/waiting-review.md | 1 | Low |
| knowledge/unicode/unicode-testing.md | 19 | High |

## Calibration Actions

- Rules To Keep: Requires manual triage
- Rules To Modify: Requires manual triage
- Rules To Merge: Requires manual triage
- Rules To Remove: Requires manual triage

## Findings Requiring Triage

### F1: Missing Assertion

- Repository: synpress-io/synpress
- File: wallets/metamask/test/playwright/e2e/resetAccount.spec.ts
- Severity: Medium
- Evidence: `test('reset the account', async ({ context, metamaskPage }) => {`
- Recommendation: Add an assertion for the expected UI state, navigation, response, or persisted data after the action.
- Triage: TBD
- Action: New benchmark / Rule improvement / Documented justification

### F2: Missing Assertion

- Repository: antiwork/shortest
- File: packages/shortest/src/core/runner/test-case.ts
- Severity: Medium
- Evidence: `C:\tmp\qa-brain-validation-repos\shortest\packages\shortest\src\core\runner\test-case.ts`
- Recommendation: Add an assertion for the expected UI state, navigation, response, or persisted data after the action.
- Triage: TBD
- Action: New benchmark / Rule improvement / Documented justification

### F3: Missing Assertion

- Repository: antiwork/shortest
- File: packages/shortest/tests/e2e/test-ai.ts
- Severity: Medium
- Evidence: `C:\tmp\qa-brain-validation-repos\shortest\packages\shortest\tests\e2e\test-ai.ts`
- Recommendation: Add an assertion for the expected UI state, navigation, response, or persisted data after the action.
- Triage: TBD
- Action: New benchmark / Rule improvement / Documented justification

### F4: Missing Assertion

- Repository: antiwork/shortest
- File: packages/shortest/tests/e2e/test-browser.ts
- Severity: Medium
- Evidence: `C:\tmp\qa-brain-validation-repos\shortest\packages\shortest\tests\e2e\test-browser.ts`
- Recommendation: Add an assertion for the expected UI state, navigation, response, or persisted data after the action.
- Triage: TBD
- Action: New benchmark / Rule improvement / Documented justification

### F5: Missing Assertion

- Repository: antiwork/shortest
- File: packages/shortest/tests/e2e/test-email-rendering.ts
- Severity: Medium
- Evidence: `C:\tmp\qa-brain-validation-repos\shortest\packages\shortest\tests\e2e\test-email-rendering.ts`
- Recommendation: Add an assertion for the expected UI state, navigation, response, or persisted data after the action.
- Triage: TBD
- Action: New benchmark / Rule improvement / Documented justification

### F6: Redundant Hardcoded Timeout (waitForTimeout)

- Repository: antiwork/shortest
- File: packages/shortest/tests/e2e/test-github-login.ts
- Severity: High
- Evidence: `await newPage.waitForTimeout(2000);`
- Recommendation: Remove hardcoded wait and rely on Playwright auto-waiting assertions.
- Triage: TBD
- Action: New benchmark / Rule improvement / Documented justification

### F7: Missing Assertion

- Repository: antiwork/shortest
- File: packages/shortest/tests/e2e/test-helpers.ts
- Severity: Medium
- Evidence: `C:\tmp\qa-brain-validation-repos\shortest\packages\shortest\tests\e2e\test-helpers.ts`
- Recommendation: Add an assertion for the expected UI state, navigation, response, or persisted data after the action.
- Triage: TBD
- Action: New benchmark / Rule improvement / Documented justification

### F8: Missing Assertion

- Repository: antiwork/shortest
- File: packages/shortest/tests/e2e/test-keyboard.ts
- Severity: Medium
- Evidence: `C:\tmp\qa-brain-validation-repos\shortest\packages\shortest\tests\e2e\test-keyboard.ts`
- Recommendation: Add an assertion for the expected UI state, navigation, response, or persisted data after the action.
- Triage: TBD
- Action: New benchmark / Rule improvement / Documented justification

### F9: Missing Assertion

- Repository: antiwork/shortest
- File: packages/shortest/tests/e2e/test-loop.ts
- Severity: Medium
- Evidence: `C:\tmp\qa-brain-validation-repos\shortest\packages\shortest\tests\e2e\test-loop.ts`
- Recommendation: Add an assertion for the expected UI state, navigation, response, or persisted data after the action.
- Triage: TBD
- Action: New benchmark / Rule improvement / Documented justification

### F10: Missing Assertion

- Repository: akshayp7/playwright-typescript-playwright-test
- File: tests/db/DB.test.ts
- Severity: Medium
- Evidence: `test('Connect to Postgres DB', async () => {`
- Recommendation: Add an assertion for the expected UI state, navigation, response, or persisted data after the action.
- Triage: TBD
- Action: New benchmark / Rule improvement / Documented justification

## False Positive / False Negative Learning

Every false positive and false negative must produce one of: new benchmark, rule improvement, or documented justification.