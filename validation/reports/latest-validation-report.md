# QA Cortex Validation Report

Generated: 2026-07-06T16:47:44.415Z

## Summary

- Repositories configured: 10
- Framework: Playwright
- Files reviewed: 231
- Findings: 2
- Average review time: 1ms
- LLM provider comparison: Deferred

## Repository Selection

- Minimum selection criteria satisfied.

## Repository Results

| Repository | Size | Files | Findings | Critical/High | Avg Time | Notes |
| :--- | :--- | ---: | ---: | ---: | ---: | :--- |
| microsoft/playwright-mcp | small | 3 | 0 | 0 | 3ms | LLM provider comparison skipped. Set runGeminiComparison=true to enable it. |
| imbhargav5/nextbase-nextjs-supabase-starter | small | 4 | 0 | 0 | 2ms | LLM provider comparison skipped. Set runGeminiComparison=true to enable it. |
| MarcusFelling/demo.playwright | medium | 19 | 0 | 0 | 2ms | LLM provider comparison skipped. Set runGeminiComparison=true to enable it. |
| vitalets/playwright-bdd | medium | 17 | 0 | 0 | 1ms | LLM provider comparison skipped. Set runGeminiComparison=true to enable it. |
| synpress-io/synpress | large | 50 | 1 | 0 | 1ms | LLM provider comparison skipped. Set runGeminiComparison=true to enable it. |
| allure-framework/allure-js | large | 50 | 0 | 0 | 1ms | LLM provider comparison skipped. Set runGeminiComparison=true to enable it. |
| serenity-js/serenity-js | enterprise | 50 | 0 | 0 | 1ms | LLM provider comparison skipped. Set runGeminiComparison=true to enable it. |
| microsoft/playwright-vscode | medium | 21 | 0 | 0 | 2ms | LLM provider comparison skipped. Set runGeminiComparison=true to enable it. |
| antiwork/shortest | medium | 5 | 0 | 0 | 1ms | LLM provider comparison skipped. Set runGeminiComparison=true to enable it. |
| akshayp7/playwright-typescript-playwright-test | medium | 12 | 1 | 0 | 2ms | LLM provider comparison skipped. Set runGeminiComparison=true to enable it. |

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
| knowledge/google/maintainability.md | 87 | High |
| knowledge/google/test-isolation.md | 1 | Low |
| knowledge/istqb/boundary-value-analysis.md | 14 | High |
| knowledge/owasp/authentication-testing.md | 14 | High |
| knowledge/owasp/input-validation.md | 18 | High |
| knowledge/playwright/fundamentals/assertions.md | 1 | Low |
| knowledge/playwright/fundamentals/locators.md | 87 | High |
| knowledge/playwright/README.md | 140 | High |
| knowledge/playwright/review-rules/assertion-review.md | 1 | Low |
| knowledge/playwright/review-rules/isolation-review.md | 1 | Low |
| knowledge/playwright/review-rules/locator-review.md | 87 | High |
| knowledge/playwright/review-rules/parallel-review.md | 1 | Low |
| knowledge/unicode/unicode-testing.md | 18 | High |

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

- Repository: akshayp7/playwright-typescript-playwright-test
- File: tests/db/DB.test.ts
- Severity: Medium
- Evidence: `test('Connect to Postgres DB', async () => {`
- Recommendation: Add an assertion for the expected UI state, navigation, response, or persisted data after the action.
- Triage: TBD
- Action: New benchmark / Rule improvement / Documented justification

## False Positive / False Negative Learning

Every false positive and false negative must produce one of: new benchmark, rule improvement, or documented justification.