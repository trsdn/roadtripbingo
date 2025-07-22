import { test, expect } from '@playwright/test';

test.describe('Translation Modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080/iconmanager');
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('should open and close translation modal with close button', async ({ page }) => {
    // Wait for the translate button to be visible
    await page.waitForSelector('button:has-text("Translate")', { timeout: 10000 });
    
    // Click on the first translate button
    const firstTranslateButton = page.locator('button:has-text("Translate")').first();
    await firstTranslateButton.click();

    // Verify modal is open
    const modal = page.locator('#translationModal');
    await expect(modal).toBeVisible();

    // Find and click the close button (X)
    const closeButton = modal.locator('#closeTranslationModal');
    await expect(closeButton).toBeVisible();
    await closeButton.click();

    // Verify modal is closed
    await expect(modal).not.toBeVisible();
  });

  test('should open and close translation modal by clicking outside', async ({ page }) => {
    // Wait for the translate button to be visible
    await page.waitForSelector('button:has-text("Translate")', { timeout: 10000 });
    
    // Click on the first translate button
    const firstTranslateButton = page.locator('button:has-text("Translate")').first();
    await firstTranslateButton.click();

    // Verify modal is open
    const modal = page.locator('#translationModal');
    await expect(modal).toBeVisible();

    // Get the modal and modal content bounding boxes
    const modalBounds = await modal.boundingBox();
    const modalContent = modal.locator('.modal-content');
    const contentBounds = await modalContent.boundingBox();

    // Calculate a position that's on the modal background (not on modal content)
    // Click at a point to the right of the modal content
    const clickX = contentBounds.x + contentBounds.width + 50; // Right side of modal content
    const clickY = contentBounds.y + contentBounds.height / 2; // Middle height of modal content
    
    // Make sure the click position is within the modal bounds
    const finalX = Math.min(clickX, modalBounds.x + modalBounds.width - 10);
    const finalY = Math.min(clickY, modalBounds.y + modalBounds.height - 10);
    
    await page.mouse.click(finalX, finalY);

    // Verify modal is closed
    await expect(modal).not.toBeVisible();
  });

  test('should not close modal when clicking inside modal content', async ({ page }) => {
    // Wait for the translate button to be visible
    await page.waitForSelector('button:has-text("Translate")', { timeout: 10000 });
    
    // Click on the first translate button
    const firstTranslateButton = page.locator('button:has-text("Translate")').first();
    await firstTranslateButton.click();

    // Verify modal is open
    const modal = page.locator('#translationModal');
    await expect(modal).toBeVisible();

    // Click inside the modal content
    const modalContent = modal.locator('.modal-content');
    await modalContent.click();

    // Verify modal is still open
    await expect(modal).toBeVisible();
  });
});