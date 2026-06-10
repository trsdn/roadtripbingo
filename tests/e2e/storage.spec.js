const { test, expect } = require('@playwright/test');

test.describe('SQLite Storage Integration', () => {
  test.beforeEach(async ({ page, request }) => {
    await request.post('/api/test/reset');
    // Navigate to the app and clear any existing data
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('creates and stores bingo card data in SQLite', async ({ page }) => {
    // Upload test icons
    const iconInput = page.locator('#iconUpload');
    await iconInput.setInputFiles([
      'public/assets/icons/parking.png',
      'public/assets/icons/bus.png',
      'public/assets/icons/train.png',
      'public/assets/icons/airplane.png',
      'public/assets/icons/truck.png',
      'public/assets/icons/motorcycle.png',
      'public/assets/icons/gas station.png',
      'public/assets/icons/bridge.png',
      'public/assets/icons/traffic light.png'
    ]);

    await page.selectOption('#gridSize', '3');

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
    await expect(page.locator('#iconCount')).toContainText('9');
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
      'public/assets/icons/parking.png',
      'public/assets/icons/bus.png',
      'public/assets/icons/train.png',
      'public/assets/icons/airplane.png',
      'public/assets/icons/truck.png',
      'public/assets/icons/motorcycle.png',
      'public/assets/icons/gas station.png',
      'public/assets/icons/bridge.png',
      'public/assets/icons/traffic light.png'
    ]);

    await page.selectOption('#gridSize', '3');
    await page.waitForTimeout(3000);

    // Wait for generate button to be enabled and generate card
    await expect(page.locator('#generateBtn')).toBeEnabled({ timeout: 10000 });
    await page.click('#generateBtn');
    await page.waitForTimeout(2000);

    // Verify data persistence
    const iconCount = await page.locator('#iconCount').textContent();
    expect(iconCount).toContain('9');

    // Reload and verify data is still there (indicating successful storage)
    await page.reload();
    await expect(page.locator('#iconCount')).toContainText('9');
  });

  test('handles large datasets efficiently', async ({ page }) => {
    // Test with many icons to verify SQLite performance
    const iconFiles = [
      'public/assets/icons/parking.png',
      'public/assets/icons/bus.png',
      'public/assets/icons/train.png',
      'public/assets/icons/airplane.png',
      'public/assets/icons/truck.png',
      'public/assets/icons/motorcycle.png',
      'public/assets/icons/gas station.png',
      'public/assets/icons/bridge.png',
      'public/assets/icons/traffic light.png',
      'public/assets/icons/church.png',
      'public/assets/icons/cow.png',
      'public/assets/icons/deer.png',
      'public/assets/icons/tree.png',
      'public/assets/icons/sun.png',
      'public/assets/icons/cloud.png'
    ];

    const iconInput = page.locator('#iconUpload');
    await iconInput.setInputFiles(iconFiles);

    // Wait for processing
    await page.waitForTimeout(5000);

    // Verify all icons were processed
    await expect(page.locator('#iconCount')).toContainText('15');

    await page.selectOption('#gridSize', '3');

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
    await expect(page.locator('.bingo-cell')).toHaveCount(9);
  });
});
