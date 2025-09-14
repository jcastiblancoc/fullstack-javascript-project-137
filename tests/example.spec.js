import { test, expect } from '@playwright/test';

test('dummy test - page loads', async ({ page }) => {
  await page.goto('https://example.com');
  await expect(page).toHaveTitle(/Example/);
});
