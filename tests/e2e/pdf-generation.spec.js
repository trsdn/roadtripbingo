const { test, expect } = require('@playwright/test');

test.describe('PDF Generation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('generates PDF download successfully', async ({ page }) => {
    // Upload test icons
    const iconInput = page.locator('#iconUpload');
    await iconInput.setInputFiles([
      'icons copyright/car-parking.png',
      'icons copyright/bus.png',
      'icons copyright/train.png',
      'icons copyright/airplane.png',
      'icons copyright/truck.png',
      'icons copyright/motorbike.png',
      'icons copyright/gas-station.png',
      'icons copyright/bridge.png',
      'icons copyright/traffic-light.png'
    ]);

    await page.waitForTimeout(3000);

    // Wait for generate button to be enabled
    await expect(page.locator('#generateBtn')).toBeEnabled({ timeout: 10000 });

    // Generate bingo card
    await page.click('#generateBtn');
    await page.waitForTimeout(2000);

    // Verify card is generated and download button is enabled
    await expect(page.locator('#cardPreview')).toBeVisible();
    await expect(page.locator('#downloadBtn')).toBeEnabled();

    // Set up download promise
    const downloadPromise = page.waitForEvent('download');

    // Click download button
    await page.click('#downloadBtn');

    // Wait for download to start
    const download = await downloadPromise;

    // Verify download properties
    expect(download.suggestedFilename()).toContain('.pdf');
    expect(download.suggestedFilename()).toContain('bingo');
  });

  test('PDF generation works with different grid sizes', async ({ page }) => {
    // Upload test icons
    const iconInput = page.locator('#iconUpload');
    await iconInput.setInputFiles([
      'icons copyright/car-parking.png',
      'icons copyright/bus.png',
      'icons copyright/train.png',
      'icons copyright/airplane.png',
      'icons copyright/truck.png',
      'icons copyright/motorbike.png'
    ]);

    await page.waitForTimeout(3000);

    // Test with 3x3 grid
    await page.selectOption('#gridSize', '3');
    await expect(page.locator('#generateBtn')).toBeEnabled({ timeout: 10000 });
    await page.click('#generateBtn');
    await page.waitForTimeout(2000);

    await expect(page.locator('.bingo-cell')).toHaveCount(9);
    await expect(page.locator('#downloadBtn')).toBeEnabled();

    // Test with 4x4 grid
    await page.selectOption('#gridSize', '4');
    await page.click('#generateBtn');
    await page.waitForTimeout(2000);

    await expect(page.locator('.bingo-cell')).toHaveCount(16);
    await expect(page.locator('#downloadBtn')).toBeEnabled();
  });

  test('handles PDF generation errors gracefully', async ({ page }) => {
    // Try to generate PDF without icons (should show appropriate message)
    // The button should be disabled when no icons are uploaded
    await expect(page.locator('#generateBtn')).toBeDisabled();
    
    // Verify that download button is also disabled
    await expect(page.locator('#downloadBtn')).toBeDisabled();
    
    // Check that icon count shows 0
    await expect(page.locator('#iconCount')).toContainText('0');
  });

  test('supports PDF compression options', async ({ page }) => {
    // Check that PDF compression selector exists
    await expect(page.locator('#pdfCompression')).toBeVisible();
    
    // Test different compression levels
    await page.selectOption('#pdfCompression', 'NONE');
    await expect(page.locator('#pdfCompression')).toHaveValue('NONE');
    
    await page.selectOption('#pdfCompression', 'MEDIUM');
    await expect(page.locator('#pdfCompression')).toHaveValue('MEDIUM');
  });
});
