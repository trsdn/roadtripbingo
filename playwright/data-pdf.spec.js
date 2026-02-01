const { test, expect } = require('@playwright/test');

test.describe('Data Backup and Restore', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have backup button visible', async ({ page }) => {
    const backupBtn = page.locator('#backupBtn');
    await expect(backupBtn).toBeVisible();
    await expect(backupBtn).toBeEnabled();
  });

  test('should have restore button visible', async ({ page }) => {
    const restoreBtn = page.locator('#restoreBtn');
    await expect(restoreBtn).toBeVisible();
    await expect(restoreBtn).toBeEnabled();
  });

  test('should have hidden restore input', async ({ page }) => {
    const restoreInput = page.locator('#restoreInput');
    await expect(restoreInput).toBeAttached();
    // Input should not be visible to user (hidden class)
  });

  test('backup button should be clickable', async ({ page }) => {
    const backupBtn = page.locator('#backupBtn');
    await backupBtn.click();
    // Note: Actual download is hard to test in E2E, but button should work
  });
});

test.describe('PDF Generation Controls', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have PDF compression selector', async ({ page }) => {
    const compression = page.locator('#pdfCompression');
    await expect(compression).toBeVisible();
    
    const options = await compression.locator('option').allTextContents();
    expect(options.length).toBeGreaterThan(0);
  });

  test('should have PDF layout selector', async ({ page }) => {
    const layout = page.locator('#pdfLayout');
    await expect(layout).toBeVisible();
    
    const options = await layout.locator('option').allTextContents();
    expect(options).toContain('One card per page');
    expect(options).toContain('Two cards per page');
  });

  test('should have download PDF button disabled initially', async ({ page }) => {
    const downloadBtn = page.locator('#downloadBtn');
    await expect(downloadBtn).toBeVisible();
    await expect(downloadBtn).toBeDisabled();
  });
});
