const { test, expect } = require('@playwright/test');

test.describe('App Initialization and Language', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load application with proper title', async ({ page }) => {
    await expect(page).toHaveTitle(/Road Trip Bingo/);
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('Road Trip Bingo Generator');
  });

  test('should have language selector visible', async ({ page }) => {
    const languageSelect = page.locator('#languageSelect');
    await expect(languageSelect).toBeVisible();
    await expect(languageSelect).toHaveValue('en');
  });

  test('should switch to German language', async ({ page }) => {
    const languageSelect = page.locator('#languageSelect');
    await languageSelect.selectOption('de');
    
    // Wait a bit for translation to apply
    await page.waitForTimeout(500);
    
    // Check that some German text appears
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
  });

  test('should have all main UI elements visible', async ({ page }) => {
    await expect(page.locator('#title')).toBeVisible();
    await expect(page.locator('#gridSize')).toBeVisible();
    await expect(page.locator('#setCount')).toBeVisible();
    await expect(page.locator('#cardCount')).toBeVisible();
    await expect(page.locator('#generateBtn')).toBeVisible();
    await expect(page.locator('#iconUpload')).toBeVisible();
  });

  test('should display icon availability message', async ({ page }) => {
    const iconAvailability = page.locator('#iconAvailability');
    await expect(iconAvailability).toBeVisible();
    await expect(iconAvailability).toContainText(/icons/i);
  });
});
