import { chromium } from 'playwright';

async function debugPDF() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Listen to console messages
  page.on('console', msg => {
    console.log(`[BROWSER] ${msg.type()}: ${msg.text()}`);
  });
  
  // Listen to page errors
  page.on('pageerror', error => {
    console.error(`[PAGE ERROR]: ${error.message}`);
  });
  
  try {
    console.log('Navigating to the application...');
    await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });
    
    console.log('Clicking on Generator tab...');
    await page.click('text=Generator');
    await page.waitForTimeout(2000);
    
    console.log('Checking if generate button exists...');
    const generateButton = await page.locator('text=Generate New Card').first();
    if (await generateButton.isVisible()) {
      console.log('Generate button found, clicking...');
      await generateButton.click();
      await page.waitForTimeout(3000); // Wait for card generation
    }
    
    console.log('Setting up download listener...');
    const downloadPromise = page.waitForEvent('download');
    
    console.log('Looking for PDF download button...');
    const downloadButton = await page.locator('text=Download PDF').first();
    if (await downloadButton.isVisible()) {
      console.log('Download button found, clicking...');
      await downloadButton.click();
      
      try {
        const download = await downloadPromise;
        console.log('✅ Download started successfully!');
        console.log(`Download filename: ${download.suggestedFilename()}`);
        
        // Save the download to current directory for debugging
        const downloadPath = `./debug-${download.suggestedFilename()}`;
        await download.saveAs(downloadPath);
        console.log(`✅ Download saved to: ${downloadPath}`);
        
        // Check file size
        const fs = await import('fs');
        const stats = await fs.promises.stat(downloadPath);
        console.log(`📁 File size: ${stats.size} bytes`);
        
        if (stats.size < 50000) {
          console.log('⚠️  PDF size is suspiciously small! Images might not be embedded.');
        }
        
      } catch (downloadError) {
        console.log('❌ No download occurred or download failed:', downloadError.message);
      }
      
      await page.waitForTimeout(5000); // Wait for console output
    } else {
      console.log('Download button not found or not visible');
    }
    
    console.log('Checking page content...');
    const title = await page.title();
    console.log(`Page title: ${title}`);
    
    // Check if there are any cards visible
    const cardElements = await page.locator('[class*="card"]').count();
    console.log(`Found ${cardElements} card-related elements`);
    
  } catch (error) {
    console.error('Error during debugging:', error);
  }
  
  console.log('Keeping browser open for 30 seconds to observe...');
  await page.waitForTimeout(30000);
  
  await browser.close();
}

debugPDF().catch(console.error);