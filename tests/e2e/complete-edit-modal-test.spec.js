import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test('Complete icon upload and edit modal debugging', async ({ page }) => {
  let consoleMessages = [];
  let pageErrors = [];
  let networkErrors = [];

  // Capture all console messages
  page.on('console', msg => {
    const message = `[${msg.type()}] ${msg.text()}`;
    consoleMessages.push(message);
    console.log(`CONSOLE: ${message}`);
  });

  // Capture page errors  
  page.on('pageerror', error => {
    const errorInfo = `${error.message}\nStack: ${error.stack}`;
    pageErrors.push(errorInfo);
    console.log(`PAGE ERROR: ${errorInfo}`);
  });

  // Capture network failures
  page.on('requestfailed', request => {
    const errorInfo = `${request.url()} failed: ${request.failure()?.errorText}`;
    networkErrors.push(errorInfo);
    console.log(`NETWORK ERROR: ${errorInfo}`);
  });

  console.log('=== Starting complete icon edit modal test ===');
  
  // Navigate to the app
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);
  
  console.log('✓ App loaded');
  
  // Navigate to Icon Manager
  await page.locator('a[href="/icons"]').click();
  await page.waitForTimeout(1000);
  
  console.log('✓ Navigated to Icon Manager');
  
  // Check if there are existing icons
  const existingIcons = await page.locator('.icon-item, [data-testid*="icon"], .table tbody tr').count();
  console.log(`Existing icons found: ${existingIcons}`);
  
  let iconToEdit = null;
  
  if (existingIcons === 0) {
    console.log('No existing icons, uploading a test icon...');
    
    // Click upload button to open modal
    await page.locator('button:has-text("Upload")').first().click();
    await page.waitForTimeout(500);
    
    console.log('✓ Upload modal opened');
    
    // Create a simple test image file
    const testImagePath = '/Users/torstenmahr/GitHub/roadtripbingo/temp/test-icon.png';
    
    // Create a minimal PNG file
    if (!fs.existsSync(testImagePath)) {
      const pngBuffer = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
        0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE,
        0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, 0x54,
        0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01,
        0xE5, 0x27, 0xDE, 0xFC, 0x00, 0x00, 0x00, 0x00,
        0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
      ]);
      fs.writeFileSync(testImagePath, pngBuffer);
    }
    
    // Fill in the form
    await page.fill('input[type="text"]', 'Test Icon');
    await page.setInputFiles('input[type="file"]', testImagePath);
    await page.waitForTimeout(1000);
    
    console.log('✓ Form filled');
    
    // Submit the form
    await page.locator('button[type="submit"]:has-text("Upload")').click();
    await page.waitForTimeout(2000);
    
    console.log('✓ Icon uploaded');
    
    // Check if icon was successfully uploaded
    const iconsAfterUpload = await page.locator('.icon-item, [data-testid*="icon"], .table tbody tr').count();
    console.log(`Icons after upload: ${iconsAfterUpload}`);
    
    if (iconsAfterUpload === 0) {
      console.log('❌ Icon upload failed');
      throw new Error('Icon upload failed');
    }
  } else {
    console.log('Using existing icon for edit test');
  }
  
  // Now try to edit an icon
  console.log('Looking for edit buttons...');
  
  // Look for edit buttons in various possible formats
  const editButtonSelectors = [
    'button:has-text("Edit")',
    '[aria-label*="edit"]',
    '.edit-btn',
    'button[title*="edit"]',
    'button[title*="Edit"]',
    '.table button:first-of-type', // In table view, first button might be edit
    '.icon-item button', // In grid view
  ];
  
  let editButton = null;
  for (const selector of editButtonSelectors) {
    const buttons = await page.locator(selector);
    const count = await buttons.count();
    console.log(`Selector "${selector}": ${count} buttons found`);
    
    if (count > 0) {
      editButton = buttons.first();
      break;
    }
  }
  
  if (!editButton) {
    console.log('No edit button found. Taking screenshot and checking table/grid structure...');
    
    // Check table structure
    const tableRows = await page.locator('.table tbody tr').count();
    console.log(`Table rows: ${tableRows}`);
    
    if (tableRows > 0) {
      const firstRowButtons = await page.locator('.table tbody tr:first-child button').count();
      console.log(`Buttons in first row: ${firstRowButtons}`);
      
      if (firstRowButtons > 0) {
        editButton = page.locator('.table tbody tr:first-child button').first();
        console.log('Using first button in table row as edit button');
      }
    }
    
    await page.screenshot({ path: '/Users/torstenmahr/GitHub/roadtripbingo/temp/no-edit-button.png', fullPage: true });
  }
  
  if (editButton) {
    console.log('✓ Found edit button, clicking...');
    
    // Click the edit button
    await editButton.click();
    await page.waitForTimeout(2000);
    
    console.log('✓ Edit button clicked');
    
    // Check for modal
    const modalSelectors = [
      '.modal',
      '[role="dialog"]',
      '.fixed.inset-0', 
      '.fixed.z-50',
      'div.bg-black.bg-opacity-50'
    ];
    
    let modal = null;
    for (const selector of modalSelectors) {
      const modals = await page.locator(selector);
      const count = await modals.count();
      console.log(`Modal selector "${selector}": ${count} found`);
      
      if (count > 0) {
        modal = modals.first();
        break;
      }
    }
    
    if (modal) {
      console.log('✓ Edit modal found!');
      
      // Check modal visibility
      const isVisible = await modal.isVisible();
      console.log(`Modal visible: ${isVisible}`);
      
      // Get modal content
      const modalText = await modal.textContent();
      const modalHTML = await modal.innerHTML();
      
      console.log('=== MODAL ANALYSIS ===');
      console.log(`Modal text length: ${modalText.length}`);
      console.log(`Modal HTML length: ${modalHTML.length}`);
      console.log('Modal text content (first 200 chars):', modalText.substring(0, 200));
      
      // Check for specific elements that should be in the edit modal
      const hasTitle = modalText.includes('Edit') || modalText.includes('edit');
      const hasNameField = await modal.locator('input[type="text"]').count() > 0;
      const hasCloseButton = await modal.locator('button').count() > 0;
      const hasForm = await modal.locator('form').count() > 0;
      
      console.log(`Has edit title: ${hasTitle}`);
      console.log(`Has name field: ${hasNameField}`);
      console.log(`Has close button: ${hasCloseButton}`);
      console.log(`Has form: ${hasForm}`);
      
      // Check for white screen / empty content
      const isWhiteScreen = modalText.trim().length < 10 || modalHTML.includes('data:') === false;
      
      if (isWhiteScreen) {
        console.log('❌ ISSUE IDENTIFIED: Modal appears to be white/empty');
      } else {
        console.log('✅ Modal has content');
      }
      
      // Check modal styling
      const modalStyles = await modal.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return {
          display: style.display,
          visibility: style.visibility,
          opacity: style.opacity,
          backgroundColor: style.backgroundColor,
          width: style.width,
          height: style.height,
          zIndex: style.zIndex
        };
      });
      console.log('Modal computed styles:', modalStyles);
      
      // Check for any errors in console that might explain issues
      const errorMessages = consoleMessages.filter(msg => msg.includes('error') || msg.includes('Error'));
      if (errorMessages.length > 0) {
        console.log('❌ Console errors found:');
        errorMessages.forEach(err => console.log(`  - ${err}`));
      }
      
      if (pageErrors.length > 0) {
        console.log('❌ JavaScript errors found:');
        pageErrors.forEach(err => console.log(`  - ${err}`));
      }
      
      // Take screenshot of the modal
      await page.screenshot({ path: '/Users/torstenmahr/GitHub/roadtripbingo/temp/edit-modal-screenshot.png', fullPage: true });
      
      // Try to interact with the modal to test functionality
      if (hasNameField) {
        console.log('Testing modal interactivity...');
        try {
          const nameInput = modal.locator('input[type="text"]').first();
          await nameInput.fill('Updated Test Name');
          console.log('✓ Successfully updated name field');
        } catch (error) {
          console.log(`❌ Failed to update name field: ${error.message}`);
        }
      }
      
    } else {
      console.log('❌ ISSUE IDENTIFIED: No modal appeared after clicking edit');
      await page.screenshot({ path: '/Users/torstenmahr/GitHub/roadtripbingo/temp/no-modal-appeared.png', fullPage: true });
    }
    
  } else {
    console.log('❌ ISSUE IDENTIFIED: No edit button found');
    await page.screenshot({ path: '/Users/torstenmahr/GitHub/roadtripbingo/temp/no-edit-button-final.png', fullPage: true });
  }
  
  console.log('=== FINAL ERROR SUMMARY ===');
  console.log(`Console messages: ${consoleMessages.length}`);
  console.log(`Page errors: ${pageErrors.length}`);
  console.log(`Network errors: ${networkErrors.length}`);
  
  if (pageErrors.length > 0) {
    console.log('JavaScript Errors:');
    pageErrors.forEach((err, i) => console.log(`${i + 1}. ${err}`));
  }
  
  console.log('=== Debug session complete ===');
});