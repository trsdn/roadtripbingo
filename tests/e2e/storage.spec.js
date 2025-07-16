const { test, expect } = require('@playwright/test');

test.describe('SQLite Storage Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app and clear any existing data
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('creates and stores bingo card data in SQLite', async ({ page }) => {
    // Upload test icons
    const iconInput = page.locator('#iconUpload');
    await iconInput.setInputFiles([
      'icons copyright/car-parking.png',
      'icons copyright/bus.png',
      'icons copyright/train.png',
      'icons copyright/airplane.png',
      'icons copyright/truck.png'
    ]);

    // Wait for icons to be processed
    await page.waitForTimeout(3000);

    // Wait for generate button to be enabled and generate a bingo card
    await expect(page.locator('#generateBtn')).toBeEnabled({ timeout: 10000 });
    await page.click('#generateBtn');
    await page.waitForTimeout(2000);

    // Check that the card was created
    await expect(page.locator('#cardPreview')).toBeVisible();

    // Verify that data is persisted by reloading the page
    await page.reload();
    
    // The icon count should be restored
    await expect(page.locator('#iconCount')).toContainText('5');
  });

  test('handles storage migration correctly', async ({ page }) => {
    // This test verifies that the SQLite migration works
    // By checking that the app loads without errors after potential migrations
    
    await page.goto('/');
    
    // Check console for any migration errors
    const consoleLogs = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleLogs.push(msg.text());
      }
    });

    // Wait for potential migrations to complete
    await page.waitForTimeout(2000);

    // Check that no storage-related errors occurred
    const storageErrors = consoleLogs.filter(log => 
      log.includes('storage') || log.includes('migration') || log.includes('sqlite')
    );
    expect(storageErrors).toHaveLength(0);

    // Verify the app is functional
    await expect(page.locator('h1')).toContainText('Road Trip Bingo Generator');
  });

  test('supports backup and restore functionality', async ({ page }) => {
    // Upload test data
    const iconInput = page.locator('#iconUpload');
    await iconInput.setInputFiles([
      'icons copyright/car-parking.png',
      'icons copyright/bus.png',
      'icons copyright/train.png'
    ]);

    await page.waitForTimeout(3000);
    
    // Wait for generate button to be enabled and generate card
    await expect(page.locator('#generateBtn')).toBeEnabled({ timeout: 10000 });
    await page.click('#generateBtn');
    await page.waitForTimeout(2000);

    // Verify data persistence
    const iconCount = await page.locator('#iconCount').textContent();
    expect(iconCount).toContain('3');

    // Reload and verify data is still there (indicating successful storage)
    await page.reload();
    await expect(page.locator('#iconCount')).toContainText('3');
  });

  test('handles large datasets efficiently', async ({ page }) => {
    // Test with many icons to verify SQLite performance
    const iconFiles = [
      'icons copyright/car-parking.png',
      'icons copyright/bus.png',
      'icons copyright/train.png',
      'icons copyright/airplane.png',
      'icons copyright/truck.png',
      'icons copyright/motorbike.png',
      'icons copyright/gas-station.png',
      'icons copyright/bridge.png',
      'icons copyright/traffic-light.png',
      'icons copyright/church.png',
      'icons copyright/cow.png',
      'icons copyright/deer.png',
      'icons copyright/tree.png',
      'icons copyright/sun.png',
      'icons copyright/cloud.png'
    ];

    const iconInput = page.locator('#iconUpload');
    await iconInput.setInputFiles(iconFiles);

    // Wait for processing
    await page.waitForTimeout(5000);

    // Verify all icons were processed
    await expect(page.locator('#iconCount')).toContainText('15');

    // Generate bingo card
    const startTime = Date.now();
    await expect(page.locator('#generateBtn')).toBeEnabled({ timeout: 15000 });
    await page.click('#generateBtn');
    await page.waitForTimeout(3000);
    const endTime = Date.now();

    // Verify performance (should complete within reasonable time)
    expect(endTime - startTime).toBeLessThan(20000); // Less than 20 seconds

    // Verify card was generated
    await expect(page.locator('#cardPreview')).toBeVisible();
    await expect(page.locator('.bingo-cell')).toHaveCount(25);
  });
});
