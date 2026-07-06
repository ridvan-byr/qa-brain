// MOCK SPEC FOR QA CORTEX SELF-TESTING
// Hedef: brain/repository/page-object-analysis.md (Selector Leak Detection)
//
// Expected QA Cortex Output:
// 1. Finding -> Selector Leak (Seçici Sızıntısı) detected.
// 2. Severity -> Medium / High (depending on feature risk).
// 3. Evidence -> `await page.locator('//button[@id="login-btn"]').click();` (Mandatory Code Evidence).
// 4. Recommendation -> Encapsulate the login button selector inside the LoginPage class and invoke it via method.

import { test } from '@playwright/test';
import { LoginPage } from '../../../examples/good/login.spec';

test('login test with selector leakage', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.navigate();
  
  // Selector Leak: LoginPage POM is imported and instantiated,
  // but we still write a raw xpath locator directly in the test file.
  await page.locator('//button[@id="login-btn"]').click();
});
