import { test, expect } from '@playwright/test';

test('Debug icon edit modal issue', async ({ page }) => {
  // Listen for console messages
  page.on('console', msg => {
    console.log(`CONSOLE [${msg.type()}]: ${msg.text()}`);
  });

  // Listen for page errors
  page.on('pageerror', error => {
    console.log(`PAGE ERROR: ${error.message}`);
  });

  // Navigate to the app
  await page.goto('http://localhost:3000');
  
  // Wait for the page to load
  await page.waitForTimeout(2000);
  
  // Check if we can see the main app
  console.log('Page title:', await page.title());
  console.log('Current URL:', page.url());
  
  // Try to navigate to Icon Manager
  const iconManagerButton = page.locator('text=Icon Manager').or(page.locator('[href*="icons"]')).or(page.locator('button:has-text("Icons")'));
  
  if (await iconManagerButton.count() > 0) {
    console.log('Found Icon Manager navigation');
    await iconManagerButton.first().click();
    await page.waitForTimeout(1000);
  } else {
    // Try to find navigation elements
    const navElements = await page.locator('nav, .nav, [role="navigation"]').count();
    console.log(`Found ${navElements} navigation elements`);
    
    // Look for any buttons or links that might lead to icons
    const allButtons = await page.locator('button, a').all();
    console.log(`Found ${allButtons.length} clickable elements`);
    
    for (let i = 0; i < Math.min(10, allButtons.length); i++) {
      const text = await allButtons[i].textContent();
      console.log(`Button/Link ${i}: "${text}"`);
    }
  }
  
  // Check if there are any icons to edit
  const iconElements = await page.locator('.icon, [data-testid*="icon"], .icon-item').count();
  console.log(`Found ${iconElements} icon elements`);
  
  // Look for edit buttons
  const editButtons = await page.locator('button:has-text("Edit"), [aria-label*="edit"], .edit-btn').count();
  console.log(`Found ${editButtons} edit buttons`);
  
  if (editButtons > 0) {
    console.log('Clicking first edit button...');
    await page.locator('button:has-text("Edit"), [aria-label*="edit"], .edit-btn').first().click();
    await page.waitForTimeout(1000);
    
    // Check if modal appeared
    const modals = await page.locator('.modal, [role="dialog"], .fixed').count();
    console.log(`Found ${modals} modal elements after clicking edit`);
    
    if (modals > 0) {
      // Check modal content
      const modalContent = await page.locator('.modal, [role="dialog"], .fixed').first().textContent();
      console.log('Modal content:', modalContent);
      
      // Check if modal is empty/white
      const modalElement = page.locator('.modal, [role="dialog"], .fixed').first();
      const modalHTML = await modalElement.innerHTML();
      console.log('Modal HTML:', modalHTML);
    }
  } else {
    console.log('No edit buttons found. Checking if we need to upload an icon first...');
    
    // Look for upload buttons
    const uploadButtons = await page.locator('button:has-text("Upload"), input[type="file"], .upload-btn').count();
    console.log(`Found ${uploadButtons} upload buttons`);
    
    if (uploadButtons > 0) {
      console.log('Found upload functionality, but no icons to edit yet');
    }
  }
  
  // Take a screenshot for visual debugging
  await page.screenshot({ path: '/Users/torstenmahr/GitHub/roadtripbingo/temp/debug-screenshot.png', fullPage: true });
  console.log('Screenshot saved to temp/debug-screenshot.png');
});