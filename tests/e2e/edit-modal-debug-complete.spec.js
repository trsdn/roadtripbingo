import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test('Complete debug of icon edit modal', async ({ page }) => {
  // Listen for all console messages
  page.on('console', msg => {
    console.log(`CONSOLE [${msg.type()}]: ${msg.text()}`);
  });

  // Listen for page errors
  page.on('pageerror', error => {
    console.log(`PAGE ERROR: ${error.message}\nStack: ${error.stack}`);
  });

  // Listen for network errors
  page.on('requestfailed', request => {
    console.log(`NETWORK ERROR: ${request.url()} failed: ${request.failure()?.errorText}`);
  });

  console.log('=== Starting debug session ===');
  
  // Navigate to the app
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);
  
  console.log('Page title:', await page.title());
  console.log('Current URL:', page.url());
  
  // Navigate to Icon Manager
  const iconManagerLink = page.locator('a[href="/icons"]').or(page.locator('text=Icon Manager'));
  await iconManagerLink.click();
  await page.waitForTimeout(1000);
  
  console.log('Navigated to Icon Manager');
  
  // Check current state
  const iconCount = await page.locator('.icon-item, .icon, [data-testid*="icon"]').count();
  console.log(`Current icons: ${iconCount}`);
  
  // Create a simple test image
  const testImagePath = '/Users/torstenmahr/GitHub/roadtripbingo/temp/test-icon.png';
  
  // Create a small PNG file if it doesn't exist
  if (!fs.existsSync(testImagePath)) {
    // Create a simple 1x1 PNG (smallest valid PNG)
    const pngBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
      0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
      0x49, 0x48, 0x44, 0x52, // IHDR
      0x00, 0x00, 0x00, 0x01, // width = 1
      0x00, 0x00, 0x00, 0x01, // height = 1
      0x08, 0x02, 0x00, 0x00, 0x00, // bit depth, color type, compression, filter, interlace
      0x90, 0x77, 0x53, 0xDE, // CRC
      0x00, 0x00, 0x00, 0x0C, // IDAT chunk length
      0x49, 0x44, 0x41, 0x54, // IDAT
      0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01,
      0xE5, 0x27, 0xDE, 0xFC, // CRC
      0x00, 0x00, 0x00, 0x00, // IEND chunk length
      0x49, 0x45, 0x4E, 0x44, // IEND
      0xAE, 0x42, 0x60, 0x82  // CRC
    ]);
    fs.writeFileSync(testImagePath, pngBuffer);
    console.log('Created test image');
  }
  
  // Look for upload button/input
  const fileInput = page.locator('input[type="file"]');
  const uploadButton = page.locator('button:has-text("Upload"), button:has-text("Add")');
  
  console.log(`File inputs found: ${await fileInput.count()}`);
  console.log(`Upload buttons found: ${await uploadButton.count()}`);
  
  if (await fileInput.count() > 0) {
    console.log('Uploading test icon...');
    await fileInput.setInputFiles(testImagePath);
    await page.waitForTimeout(2000);
    
    // Check if icon was added
    const newIconCount = await page.locator('.icon-item, .icon, [data-testid*="icon"]').count();
    console.log(`Icons after upload: ${newIconCount}`);
    
    if (newIconCount > iconCount) {
      console.log('Icon uploaded successfully! Now testing edit functionality...');
      
      // Look for edit buttons
      const editButtons = await page.locator('button:has-text("Edit"), [aria-label*="edit"], .edit-btn, .edit-icon').all();
      console.log(`Edit buttons found: ${editButtons.length}`);
      
      if (editButtons.length > 0) {
        console.log('Clicking edit button...');
        await editButtons[0].click();
        await page.waitForTimeout(1000);
        
        // Check for modal
        const modals = await page.locator('.modal, [role="dialog"], .fixed, .overlay').all();
        console.log(`Modals found after edit click: ${modals.length}`);
        
        if (modals.length > 0) {
          const modal = modals[0];
          console.log('Modal detected! Checking content...');
          
          // Get modal content
          const modalText = await modal.textContent();
          const modalHTML = await modal.innerHTML();
          
          console.log('Modal text content:', modalText);
          console.log('Modal HTML (first 500 chars):', modalHTML.substring(0, 500));
          
          // Check if modal is empty or has error content
          if (modalText.trim() === '' || modalHTML.trim() === '') {
            console.log('❌ ISSUE FOUND: Modal is empty (white screen)');
          } else if (modalText.includes('error') || modalText.includes('Error')) {
            console.log('❌ ISSUE FOUND: Modal contains error text');
          } else {
            console.log('✅ Modal has content');
          }
          
          // Check for form elements in modal
          const formInputs = await modal.locator('input, textarea, select').count();
          const buttons = await modal.locator('button').count();
          console.log(`Form inputs in modal: ${formInputs}`);
          console.log(`Buttons in modal: ${buttons}`);
          
          // Check modal styling
          const modalComputedStyle = await modal.evaluate((el) => {
            const style = window.getComputedStyle(el);
            return {
              display: style.display,
              visibility: style.visibility,
              opacity: style.opacity,
              backgroundColor: style.backgroundColor,
              width: style.width,
              height: style.height
            };
          });
          console.log('Modal computed styles:', modalComputedStyle);
          
        } else {
          console.log('❌ ISSUE FOUND: No modal appeared after clicking edit');
        }
      } else {
        console.log('❌ ISSUE FOUND: No edit buttons found after upload');
      }
    } else {
      console.log('❌ ISSUE FOUND: Icon upload failed');
    }
  } else {
    console.log('❌ ISSUE FOUND: No file input found for upload');
  }
  
  // Take screenshot
  await page.screenshot({ path: '/Users/torstenmahr/GitHub/roadtripbingo/temp/complete-debug-screenshot.png', fullPage: true });
  console.log('Screenshot saved to temp/complete-debug-screenshot.png');
  
  console.log('=== Debug session complete ===');
});