import { test, expect } from '@playwright/test';

test('form submission with brittle css selector chain', async ({ page }) => {
  await page.goto('https://example.com/form');
  
  // Brittle CSS selector chain
  await page.locator('div > div.form-container > form > div:nth-child(3) > input').fill('test');
  await page.click('button[type="submit"]');
});
