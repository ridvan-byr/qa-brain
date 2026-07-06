// MOCK SPEC FOR QA CORTEX SELF-TESTING
// Hedef: brain/repository/fixture-analysis.md (Test Isolation Violation)
//
// Expected QA Cortex Output:
// 1. Finding -> Test Isolation Violation (Shared Mutable State / Dependency).
// 2. Severity -> Critical.
// 3. Evidence -> `let globalSessionId = '';` (Mandatory Code Evidence).
// 4. Recommendation -> Isolate test state by logging in via isolated custom fixtures per test run.

import { test, expect } from '@playwright/test';

// Shared state across test blocks (breaks isolation and prevents parallel execution)
let globalSessionId = '';

test('step 1: authenticate and save session', async ({ page }) => {
  await page.goto('https://example.com/login');
  await page.getByLabel('Email Address').fill('user@example.com');
  await page.getByRole('button', { name: 'Log in' }).click();
  
  globalSessionId = await page.locator('#session-id').innerText();
});

test('step 2: fetch profile details using session', async ({ page }) => {
  // Breaks isolation: depends on step 1 running first to set globalSessionId
  await page.goto(`https://example.com/profile?session=${globalSessionId}`);
  await expect(page.locator('#profile-header')).toBeVisible();
});
