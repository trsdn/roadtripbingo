const { test, expect } = require('@playwright/test');

test.describe('Show Labels Toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have show labels toggle visible', async ({ page }) => {
    const toggle = page.locator('#showLabelsToggle');
    await expect(toggle).toBeVisible();
  });

  test('should be checked by default', async ({ page }) => {
    const toggle = page.locator('#showLabelsToggle');
    await expect(toggle).toBeChecked();
  });

  test('should toggle on and off', async ({ page }) => {
    const toggle = page.locator('#showLabelsToggle');
    
    // Should be checked initially
    await expect(toggle).toBeChecked();
    
    // Uncheck it
    await toggle.click();
    await expect(toggle).not.toBeChecked();
    
    // Check it again
    await toggle.click();
    await expect(toggle).toBeChecked();
  });
});

test.describe('Same Card Toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have same card toggle visible', async ({ page }) => {
    const toggle = page.locator('#sameCardToggle');
    await expect(toggle).toBeVisible();
  });

  test('should be unchecked by default', async ({ page }) => {
    const toggle = page.locator('#sameCardToggle');
    await expect(toggle).not.toBeChecked();
  });

  test('should toggle on and off', async ({ page }) => {
    const toggle = page.locator('#sameCardToggle');
    
    // Check it
    await toggle.click();
    await expect(toggle).toBeChecked();
    
    // Uncheck it
    await toggle.click();
    await expect(toggle).not.toBeChecked();
  });
});
