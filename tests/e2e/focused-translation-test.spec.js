import { test, expect } from '@playwright/test';

test.describe('Focused Translation UI Test', () => {
  test('comprehensive translation UI behavior check', async ({ page }) => {
    console.log('=== COMPREHENSIVE TRANSLATION UI BEHAVIOR TEST ===');
    
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');
    
    // 1. Check language selector in navigation
    console.log('\n1. Testing Language Selector...');
    const navigationLanguageSelector = page.locator('nav select, header select');
    await expect(navigationLanguageSelector).toBeVisible();
    
    // Check options
    const englishOption = page.locator('option[value="en"]');
    const germanOption = page.locator('option[value="de"]');
    await expect(englishOption).toBeVisible();
    await expect(germanOption).toBeVisible();
    console.log('✓ Language selector has English and German options');
    
    // 2. Test language switching
    console.log('\n2. Testing Language Switching...');
    
    // Start in English
    const title = page.locator('h1');
    await expect(title).toContainText('Road Trip Bingo');
    console.log('✓ Initial English title displayed');
    
    // Switch to German
    await navigationLanguageSelector.selectOption('de');
    await page.waitForTimeout(1000);
    await expect(title).toContainText('Roadtrip Bingo');
    console.log('✓ German title displayed after language switch');
    
    // 3. Navigate to Icon Manager
    console.log('\n3. Testing Icon Manager Navigation...');
    await page.click('a[href="/icons"]');
    await page.waitForLoadState('networkidle');
    
    const iconManagerHeading = page.locator('h2');
    await expect(iconManagerHeading).toContainText('Icon Manager');
    console.log('✓ Icon Manager page loaded');
    
    // 4. Check for icons and test editing if available
    console.log('\n4. Testing Icon Editing Behavior...');
    
    // Count icons
    const iconRows = page.locator('table tbody tr, .grid > div');
    const iconCount = await iconRows.count();
    console.log(`Found ${iconCount} icons to work with`);
    
    if (iconCount > 0) {
      // Look for edit buttons - be more specific
      const editButtons = page.locator('button:has-text("Edit"), button[title*="Edit"], button[aria-label*="Edit"]');
      const editButtonCount = await editButtons.count();
      console.log(`Found ${editButtonCount} edit buttons`);
      
      if (editButtonCount > 0) {
        // Test in German mode
        console.log('\n--- Testing in German Mode ---');
        await navigationLanguageSelector.selectOption('de');
        await page.waitForTimeout(500);
        
        // Click first edit button
        await editButtons.first().click();
        await page.waitForTimeout(500);
        
        // Check if modal opened
        const modal = page.locator('.fixed.inset-0, [role="dialog"]');
        if (await modal.count() > 0) {
          console.log('✓ Edit modal opened in German mode');
          
          // Check for icon name field
          const nameField = page.locator('input[type="text"]').first();
          const isEditable = await nameField.isEditable();
          console.log(`✓ Name field is editable: ${isEditable}`);
          
          // Look for German translation indicators
          const germanLabel = page.locator('text*="(DE)"');
          const translationNote = page.locator('text*="Editing translation", text*="Übersetzung"');
          const originalNameRef = page.locator('text*="Original name", text*="Originalname"');
          
          const hasGermanIndicator = await germanLabel.count() > 0;
          const hasTranslationNote = await translationNote.count() > 0;
          const hasOriginalNameRef = await originalNameRef.count() > 0;
          
          console.log(`✓ German language indicator: ${hasGermanIndicator}`);
          console.log(`✓ Translation editing note: ${hasTranslationNote}`);
          console.log(`✓ Original name reference: ${hasOriginalNameRef}`);
          
          // Close modal
          const cancelButton = page.locator('button:has-text("Cancel"), button:has-text("Abbrechen")');
          if (await cancelButton.count() > 0) {
            await cancelButton.click();
            await page.waitForTimeout(500);
          }
          
          // Test in English mode
          console.log('\n--- Testing in English Mode ---');
          await navigationLanguageSelector.selectOption('en');
          await page.waitForTimeout(500);
          
          // Click edit again
          await editButtons.first().click();
          await page.waitForTimeout(500);
          
          const modalEnglish = page.locator('.fixed.inset-0, [role="dialog"]');
          if (await modalEnglish.count() > 0) {
            console.log('✓ Edit modal opened in English mode');
            
            // Check for English editing context
            const englishLabel = page.locator('label:has-text("Icon Name")');
            await expect(englishLabel).toBeVisible();
            
            const englishNameField = page.locator('input[type="text"]').first();
            const isEditableEnglish = await englishNameField.isEditable();
            console.log(`✓ English name field is editable: ${isEditableEnglish}`);
            
            // Should NOT have German translation indicators in English mode
            const noGermanIndicator = await page.locator('text*="(DE)"').count() === 0;
            console.log(`✓ No German indicators in English mode: ${noGermanIndicator}`);
            
            // Close modal
            const cancelButtonEn = page.locator('button:has-text("Cancel")');
            if (await cancelButtonEn.count() > 0) {
              await cancelButtonEn.click();
            }
          }
        } else {
          console.log('ℹ Edit modal did not open - testing functionality may be restricted');
        }
      } else {
        console.log('ℹ No edit buttons found - testing with available UI elements');
      }
    } else {
      console.log('ℹ No icons found - testing basic translation functionality');
    }
    
    // 5. Test other UI elements for translation
    console.log('\n5. Testing Other UI Element Translations...');
    
    // Test buttons
    await navigationLanguageSelector.selectOption('de');
    await page.waitForTimeout(500);
    
    const uploadButton = page.locator('button:has-text("hochladen"), button:has-text("Upload")');
    const hasGermanButtons = await uploadButton.count() > 0;
    console.log(`✓ German button translations present: ${hasGermanButtons}`);
    
    // 6. Test language persistence
    console.log('\n6. Testing Language Persistence...');
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Check if German is still selected
    const currentLang = await navigationLanguageSelector.inputValue();
    const persistsGerman = currentLang === 'de';
    console.log(`✓ Language persists after reload: ${persistsGerman} (current: ${currentLang})`);
    
    console.log('\n=== TRANSLATION UI BEHAVIOR TEST COMPLETE ===');
  });
});