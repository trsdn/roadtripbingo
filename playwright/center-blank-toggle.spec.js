const { test, expect } = require('@playwright/test');

test.describe('Center Blank Toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should be checked by default', async ({ page }) => {
    const toggle = page.locator('#centerBlankToggle');
    await expect(toggle).toBeChecked();
  });

  test('should toggle on and off', async ({ page }) => {
    const toggle = page.locator('#centerBlankToggle');
    
    // Should be checked initially
    await expect(toggle).toBeChecked();
    
    // Uncheck it
    await toggle.click();
    await expect(toggle).not.toBeChecked();
    
    // Check it again
    await toggle.click();
    await expect(toggle).toBeChecked();
  });

  test('should update icon requirements when toggled', async ({ page }) => {
    const availability = page.locator('#iconAvailability');
    
    // Get initial text
    const initialText = await availability.textContent();
    
    // Toggle center blank
    const toggle = page.locator('#centerBlankToggle');
    await toggle.click();
    await page.waitForTimeout(500);
    
    // Text should change (different icon count needed)
    const newText = await availability.textContent();
    expect(newText).not.toBe(initialText);
  });

  test('should only apply to odd grids', async ({ page }) => {
    const gridSelect = page.locator('#gridSize');
    const toggle = page.locator('#centerBlankToggle');
    
    // Test with even grid (4x4)
    await gridSelect.selectOption('4');
    await page.waitForTimeout(300);
    
    // Toggle should still work but not affect even grids
    await expect(toggle).toBeVisible();
    
    // Test with odd grid (5x5)
    await gridSelect.selectOption('5');
    await page.waitForTimeout(300);
    await expect(toggle).toBeVisible();
  });
});
