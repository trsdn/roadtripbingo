const { test, expect } = require('@playwright/test');

test.describe('Multi-Hit Mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have multi-hit toggle visible', async ({ page }) => {
    const toggle = page.locator('#multiHitToggle');
    await expect(toggle).toBeVisible();
    await expect(toggle).not.toBeChecked();
  });

  test('should show difficulty options when enabled', async ({ page }) => {
    const toggle = page.locator('#multiHitToggle');
    const options = page.locator('#multiHitOptions');
    
    // Options should be hidden initially
    await expect(options).not.toBeVisible();
    
    // Enable multi-hit mode
    await toggle.click();
    
    // Options should now be visible
    await expect(options).toBeVisible();
  });

  test('should have three difficulty levels', async ({ page }) => {
    const toggle = page.locator('#multiHitToggle');
    await toggle.click();
    
    // Wait for options to be visible
    await expect(page.locator('#multiHitOptions')).toBeVisible();
    
    const lightRadio = page.locator('input[name="difficulty"][value="LIGHT"]');
    const mediumRadio = page.locator('input[name="difficulty"][value="MEDIUM"]');
    const hardRadio = page.locator('input[name="difficulty"][value="HARD"]');
    
    await expect(lightRadio).toBeVisible();
    await expect(mediumRadio).toBeVisible();
    await expect(hardRadio).toBeVisible();
    
    // Medium should be checked by default
    await expect(mediumRadio).toBeChecked();
  });

  test('should allow difficulty selection', async ({ page }) => {
    const toggle = page.locator('#multiHitToggle');
    await toggle.click();
    
    // Wait for options to be visible
    await expect(page.locator('#multiHitOptions')).toBeVisible();
    
    const lightRadio = page.locator('input[name="difficulty"][value="LIGHT"]');
    const hardRadio = page.locator('input[name="difficulty"][value="HARD"]');
    
    // Select Light
    await lightRadio.click();
    await expect(lightRadio).toBeChecked();
    
    // Select Hard
    await hardRadio.click();
    await expect(hardRadio).toBeChecked();
    await expect(lightRadio).not.toBeChecked();
  });

  test('should show multi-hit preview info', async ({ page }) => {
    const toggle = page.locator('#multiHitToggle');
    await toggle.click();
    
    // Wait for preview to be visible
    const preview = page.locator('#multiHitPreview');
    await expect(preview).toBeVisible();
  });

  test('should not affect center blank functionality', async ({ page }) => {
    const centerBlankToggle = page.locator('#centerBlankToggle');
    const multiHitToggle = page.locator('#multiHitToggle');
    
    // Both should be independent
    await expect(centerBlankToggle).toBeChecked();
    await expect(multiHitToggle).not.toBeChecked();
    
    // Enable multi-hit
    await multiHitToggle.click();
    
    // Wait for multi-hit options to be visible
    await expect(page.locator('#multiHitOptions')).toBeVisible();
    
    // Center blank should still be checked
    await expect(centerBlankToggle).toBeChecked();
  });
});
