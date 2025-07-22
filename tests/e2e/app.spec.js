import { test, expect } from '@playwright/test';

test.describe('Road Trip Bingo App', () => {
  test('loads the main page', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.locator('h1')).toContainText('Road Trip Bingo Generator');
    await expect(page.locator('nav')).toBeVisible();
  });
  
  test('navigation works', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to Icons page
    await page.click('text=Icon Manager');
    await expect(page).toHaveURL('/icons');
    
    // Navigate back to Generator
    await page.click('text=Generator');
    await expect(page).toHaveURL('/');
  });
  
  test('language selector works', async ({ page }) => {
    await page.goto('/');
    
    // Switch to German
    await page.selectOption('select', 'de');
    await expect(page.locator('h1')).toContainText('Roadtrip Bingo Generator');
    
    // Switch back to English
    await page.selectOption('select', 'en');
    await expect(page.locator('h1')).toContainText('Road Trip Bingo Generator');
  });
});