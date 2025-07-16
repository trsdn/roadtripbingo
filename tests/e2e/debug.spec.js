const { test, expect } = require('@playwright/test');

test.describe('Debug Icon Loading', () => {
  test('debug icon loading with console output', async ({ page }) => {
    // Listen to console logs
    page.on('console', msg => {
      console.log(`[BROWSER] ${msg.type()}: ${msg.text()}`);
    });

    // Listen to page errors
    page.on('pageerror', err => {
      console.log(`[BROWSER ERROR] ${err.message}`);
    });

    // Listen to network requests
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        console.log(`[NETWORK] REQUEST: ${request.method()} ${request.url()}`);
      }
    });

    page.on('response', response => {
      if (response.url().includes('/api/')) {
        console.log(`[NETWORK] RESPONSE: ${response.status()} ${response.url()}`);
      }
    });

    // Navigate to the app
    await page.goto('/');
    
    // Wait a bit for initialization
    await page.waitForTimeout(5000);
    
    // Check icon count
    const iconCountText = await page.locator('#iconCount').textContent();
    console.log('Final icon count:', iconCountText);
    
    // Check generate button state
    const generateBtnDisabled = await page.locator('#generateBtn').getAttribute('disabled');
    console.log('Generate button disabled:', generateBtnDisabled !== null);
  });
});
