// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('AI Suggestions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
    
    // Wait for the page to load properly
    await page.waitForSelector('#navIconManager');
    
    // Switch to Icon Manager
    await page.click('#navIconManager');
    
    // Wait for the Icon Manager to be visible and loaded
    await page.waitForSelector('#iconManagerPage.active');
    await page.waitForSelector('#iconTable tbody tr');
  });

  test('should display AI analysis results with all fields', async ({ page }) => {
    // Select an icon
    const firstCheckbox = page.locator('#iconTable tbody tr:first-child input[type="checkbox"]');
    await firstCheckbox.check();
    
    // Open AI Features panel
    await page.click('#openAIFeatures');
    await page.waitForSelector('#aiFeatures');
    
    // Start AI analysis
    await page.click('#analyzeSelectedIcons');
    
    // Wait for analysis to complete
    await page.waitForSelector('.ai-result-item', { timeout: 30000 });
    
    // Check what fields are present in the results
    const resultItem = page.locator('.ai-result-item').first();
    
    // Log the full HTML content of the results
    const resultsHTML = await resultItem.innerHTML();
    console.log('AI Results HTML:', resultsHTML);
    
    // Check for expected suggestion types
    const suggestions = await resultItem.locator('.ai-suggestion').all();
    console.log('Number of suggestions:', suggestions.length);
    
    for (let i = 0; i < suggestions.length; i++) {
      const suggestionText = await suggestions[i].textContent();
      console.log(`Suggestion ${i + 1}:`, suggestionText);
    }
    
    // Check if German name suggestion exists
    const germanNameSuggestion = resultItem.locator('.ai-suggestion:has-text("German Name:")');
    const hasGermanName = await germanNameSuggestion.count() > 0;
    console.log('Has German Name suggestion:', hasGermanName);
    
    // Verify basic suggestions exist
    await expect(resultItem.locator('.ai-suggestion:has-text("Category:")')).toBeVisible();
    await expect(resultItem.locator('.ai-suggestion:has-text("Name:")')).toBeVisible();
    await expect(resultItem.locator('.ai-suggestion:has-text("Difficulty:")')).toBeVisible();
    await expect(resultItem.locator('.ai-suggestion:has-text("Tags:")')).toBeVisible();
  });

  test('should handle tags accept button click', async ({ page }) => {
    // Listen for console messages
    const consoleMessages = [];
    page.on('console', msg => {
      consoleMessages.push(`${msg.type()}: ${msg.text()}`);
    });
    
    // Listen for JavaScript errors
    const jsErrors = [];
    page.on('pageerror', error => {
      jsErrors.push(error.message);
    });
    
    // Select an icon
    const firstCheckbox = page.locator('#iconTable tbody tr:first-child input[type="checkbox"]');
    await firstCheckbox.check();
    
    // Open AI Features panel
    await page.click('#openAIFeatures');
    await page.waitForSelector('#aiFeatures');
    
    // Start AI analysis
    await page.click('#analyzeSelectedIcons');
    
    // Wait for analysis to complete
    await page.waitForSelector('.ai-result-item', { timeout: 30000 });
    
    // Find and click the tags accept button
    const tagsAcceptButton = page.locator('.ai-suggestion:has-text("Tags:") .ai-accept');
    await expect(tagsAcceptButton).toBeVisible();
    
    // Click the accept button
    await tagsAcceptButton.click();
    
    // Wait a moment for any async operations
    await page.waitForTimeout(2000);
    
    // Log console messages and errors
    console.log('Console messages after clicking tags accept:', consoleMessages);
    console.log('JavaScript errors:', jsErrors);
    
    // Check if there are any JS errors
    expect(jsErrors).toEqual([]);
    
    // Check if the acceptSuggestion function was called
    const acceptSuggestionCalled = consoleMessages.some(msg => 
      msg.includes('Accepting suggestion') || msg.includes('acceptSuggestion')
    );
    console.log('Accept suggestion function called:', acceptSuggestionCalled);
    
    // Verify no errors occurred
    const hasErrors = consoleMessages.some(msg => msg.includes('error:'));
    expect(hasErrors).toBe(false);
  });

  test('should test German translation accept button if present', async ({ page }) => {
    // Listen for console messages
    const consoleMessages = [];
    page.on('console', msg => {
      consoleMessages.push(`${msg.type()}: ${msg.text()}`);
    });
    
    // Select an icon
    const firstCheckbox = page.locator('#iconTable tbody tr:first-child input[type="checkbox"]');
    await firstCheckbox.check();
    
    // Open AI Features panel
    await page.click('#openAIFeatures');
    await page.waitForSelector('#aiFeatures');
    
    // Start AI analysis
    await page.click('#analyzeSelectedIcons');
    
    // Wait for analysis to complete
    await page.waitForSelector('.ai-result-item', { timeout: 30000 });
    
    // Check if German name suggestion exists
    const germanNameSuggestion = page.locator('.ai-suggestion:has-text("German Name:")');
    const hasGermanName = await germanNameSuggestion.count() > 0;
    
    if (hasGermanName) {
      console.log('German name suggestion found, testing accept button');
      
      const germanAcceptButton = germanNameSuggestion.locator('.ai-accept');
      await germanAcceptButton.click();
      
      // Wait for any async operations
      await page.waitForTimeout(2000);
      
      // Check if addTranslation function was called
      const addTranslationCalled = consoleMessages.some(msg => 
        msg.includes('Adding translation') || msg.includes('addTranslation')
      );
      console.log('Add translation function called:', addTranslationCalled);
    } else {
      console.log('No German name suggestion found in AI results');
    }
  });

  test('should log actual AI response data', async ({ page }) => {
    // Intercept the AI analysis request
    page.route('**/api/ai/analyze-batch', async route => {
      const response = await route.fetch();
      const data = await response.json();
      console.log('AI Analysis Response:', JSON.stringify(data, null, 2));
      route.fulfill({ response });
    });
    
    // Select an icon
    const firstCheckbox = page.locator('#iconTable tbody tr:first-child input[type="checkbox"]');
    await firstCheckbox.check();
    
    // Open AI Features panel
    await page.click('#openAIFeatures');
    await page.waitForSelector('#aiFeatures');
    
    // Start AI analysis
    await page.click('#analyzeSelectedIcons');
    
    // Wait for analysis to complete
    await page.waitForSelector('.ai-result-item', { timeout: 30000 });
  });
});