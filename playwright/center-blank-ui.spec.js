const { test, expect } = require('@playwright/test');

test.describe('Center Blank Toggle UI Feature', () => {
  test('checkbox is visible and checked by default', async ({ page }) => {
    await page.goto('/');
    const toggle = page.locator('#centerBlankToggle');
    await expect(toggle).toBeVisible();
    await expect(toggle).toBeChecked();
  });
});
