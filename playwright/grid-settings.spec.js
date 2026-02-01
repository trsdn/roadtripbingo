const { test, expect } = require('@playwright/test');

test.describe('Grid Size and Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have all grid sizes available', async ({ page }) => {
    const gridSelect = page.locator('#gridSize');
    await expect(gridSelect).toBeVisible();
    
    const options = await gridSelect.locator('option').allTextContents();
    expect(options).toContain('3x3');
    expect(options).toContain('4x4');
    expect(options).toContain('5x5');
    expect(options).toContain('6x6');
    expect(options).toContain('7x7');
    expect(options).toContain('8x8');
  });

  test('should have 5x5 selected by default', async ({ page }) => {
    const gridSelect = page.locator('#gridSize');
    await expect(gridSelect).toHaveValue('5');
  });

  test('should change grid size', async ({ page }) => {
    const gridSelect = page.locator('#gridSize');
    
    await gridSelect.selectOption('3');
    await expect(gridSelect).toHaveValue('3');
    
    await gridSelect.selectOption('8');
    await expect(gridSelect).toHaveValue('8');
  });

  test('should update icon requirements when grid size changes', async ({ page }) => {
    const gridSelect = page.locator('#gridSize');
    const availability = page.locator('#iconAvailability');
    
    // Select 3x3 (needs 9 icons, or 8 with center blank)
    await gridSelect.selectOption('3');
    await expect(availability).toBeVisible();
    let text = await availability.textContent();
    expect(text).toMatch(/\d+/);
    
    // Select 8x8 (needs 64 icons, or 63 with center blank if applicable)
    await gridSelect.selectOption('8');
    await expect(availability).toBeVisible();
    text = await availability.textContent();
    expect(text).toMatch(/\d+/);
  });

  test('should have set count input', async ({ page }) => {
    const setCount = page.locator('#setCount');
    await expect(setCount).toBeVisible();
    await expect(setCount).toHaveValue('1');
    
    await setCount.fill('3');
    await expect(setCount).toHaveValue('3');
  });

  test('should have card count input', async ({ page }) => {
    const cardCount = page.locator('#cardCount');
    await expect(cardCount).toBeVisible();
    await expect(cardCount).toHaveValue('1');
    
    await cardCount.fill('5');
    await expect(cardCount).toHaveValue('5');
  });
});
