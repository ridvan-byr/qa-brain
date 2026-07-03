import { test } from '@playwright/test';

test('dashboard load test with hardcoded timeout', async ({ page }) => {
  await page.goto('https://example.com/dashboard');
  
  // Redundant sleep wait (violates auto-waiting rules)
  await page.waitForTimeout(5000);
  
  await page.click('text=Logout');
});
