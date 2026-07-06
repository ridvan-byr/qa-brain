# QA Cortex Review: examples/bad/hardcoded-wait.spec.ts

## Summary

This review analyzes the `examples/bad/hardcoded-wait.spec.ts` test case. The analysis identified critical test smells, specifically the use of hardcoded waits (`waitForTimeout`), which degrades test stability and performance.

---

## Findings

### Finding 1: Hardcoded Wait Usage
- **Title:** Redundant Hardcoded Timeout (`waitForTimeout`)
- **Description:** The test utilizes `page.waitForTimeout(5000)` to wait for dashboard components to load. This causes the test to halt execution for a flat 5 seconds, slowing down the test run and causing potential flakiness if the network or CPU takes longer than 5 seconds.
- **Severity:** High
- **Confidence:** 98%
- **Evidence:** 
  ```typescript
  // Hardcoded wait: waits for 5 seconds arbitrarily (very bad smell)
  await page.waitForTimeout(5000);
  ```
- **Recommendation:** Remove `page.waitForTimeout()` entirely. Playwright's assertions (like `toBeVisible()`) auto-wait for elements to appear before resolving.

### Finding 2: Generic Selector
- **Title:** Brittle ID Selector Used
- **Description:** The assertion references a generic ID selector `#chart-container` instead of a semantic role-based locator.
- **Severity:** Medium
- **Confidence:** 85%
- **Evidence:** 
  ```typescript
  await expect(page.locator('#chart-container')).toBeVisible();
  ```
- **Recommendation:** Refactor selector to use `page.getByRole()` or `page.getByTestId()`. For example, `page.getByRole('region', { name: 'Chart' })`.

---

## Metrics

- **Coverage Score:** 40 / 100 (Only happy path dashboard navigation is covered. Missing boundary validation, error state testing, data variations, or security checks).
- **Quality Score:** 65 / 100 (Acceptable, but heavily penalized due to hardcoded wait and brittle selector choice).
- **Risk Score:** Medium (Dashboard navigation has low-to-medium business risk).
- **Maintainability Score:** 60 / 100 (Poor due to timing dependency).

---

## Strengths

- Test structure is simple and clean.
- Uses basic Playwright test runner structures and handles navigation correctly.

---

## Improvements

- [ ] Remove `page.waitForTimeout(5000)` and rely on Playwright's built-in auto-waiting mechanism.
- [ ] Migrate from ID selector `#chart-container` to a user-facing role locator.

---

## References

- [playwright-best-practices](file:///c:/Users/ridva/Desktop/qa-cortex/knowledge/playwright/README.md)
- [waiting-review.md](file:///c:/Users/ridva/Desktop/qa-cortex/knowledge/playwright/review-rules/waiting-review.md)
- [locator-review.md](file:///c:/Users/ridva/Desktop/qa-cortex/knowledge/playwright/review-rules/locator-review.md)

---

## Final Verdict

**Needs Improvement**
