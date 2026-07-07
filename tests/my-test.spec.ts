import { test } from '@playwright/test';

test('submit feedback form without assertions', async ({ page }) => {
  await page.goto('https://example.com/feedback');
  await page.getByPlaceholder('Name').fill('John Doe');
  await page.getByRole('button', { name: 'Submit' }).click();
});
