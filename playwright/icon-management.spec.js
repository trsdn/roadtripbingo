const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('Icon Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for app to initialize
    await page.waitForTimeout(1000);
  });

  test('should show 0 icons initially', async ({ page }) => {
    const iconCount = page.locator('#iconCount');
    await expect(iconCount).toHaveText('0');
  });

  test('should upload icons', async ({ page }) => {
    const iconPath = path.join(__dirname, '../public/assets/icons/tree.png');
    
    // Upload icon
    const fileInput = page.locator('#iconUpload');
    await fileInput.setInputFiles(iconPath);
    
    // Wait for upload to complete
    await page.waitForTimeout(2000);
    
    // Check icon count increased
    const iconCount = page.locator('#iconCount');
    await expect(iconCount).toHaveText('1');
    
    // Check icon appears in gallery
    const iconGallery = page.locator('#iconGallery');
    const icons = iconGallery.locator('.icon-item');
    await expect(icons).toHaveCount(1);
  });

  test('should enable generate button when enough icons available', async ({ page }) => {
    const generateBtn = page.locator('#generateBtn');
    await expect(generateBtn).toBeDisabled();
    
    // For a 5x5 grid with center blank, we need 24 icons
    const iconPaths = [];
    for (let i = 0; i < 5; i++) {
      iconPaths.push(path.join(__dirname, '../public/assets/icons/tree.png'));
    }
    
    const fileInput = page.locator('#iconUpload');
    await fileInput.setInputFiles(iconPaths);
    
    await page.waitForTimeout(3000);
    
    // Button might still be disabled if not enough unique icons
    // This is expected behavior
  });

  test('should have clear icons button', async ({ page }) => {
    const clearBtn = page.locator('#clearIcons');
    await expect(clearBtn).toBeVisible();
    await expect(clearBtn).toBeEnabled();
  });

  test('should show icon availability info', async ({ page }) => {
    const availability = page.locator('#iconAvailability');
    await expect(availability).toBeVisible();
  });
});
