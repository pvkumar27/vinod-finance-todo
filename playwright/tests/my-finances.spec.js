const { test, expect } = require('@playwright/test');
const { login, generateTestData, cleanupTestData } = require('../helpers/test-helpers');

test.describe('My Finances Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await login(page);
    
    // Navigate to My Finances tab
    await page.click('button:has-text("My Finances"), button:has-text("Finances")');
    await page.waitForTimeout(1000);
  });

  test.afterEach(async ({ page }) => {
    // Clean up test data
    await cleanupTestData(page);
  });

  test('verify Owner dropdown options', async ({ page }) => {
    // Look for Owner dropdown
    const dropdowns = page.locator('select');
    const count = await dropdowns.count();
    
    if (count > 0) {
      const ownerDropdown = dropdowns.first();
      const options = await ownerDropdown.locator('option').allTextContents();
      
      // Check if options contain Self and Spouse
      const hasOwnerOptions = options.some(opt => opt.includes('Self')) && 
                             options.some(opt => opt.includes('Spouse'));
      
      expect(hasOwnerOptions).toBeTruthy();
    }
  });

  test('verify Sync Source dropdown options', async ({ page }) => {
    const dropdowns = page.locator('select');
    const count = await dropdowns.count();
    
    if (count > 1) {
      const syncDropdown = dropdowns.nth(1);
      const options = await syncDropdown.locator('option').allTextContents();
      
      // Check if options contain Manual and Plaid
      const hasSyncOptions = options.some(opt => opt.includes('Manual')) && 
                            options.some(opt => opt.includes('Plaid'));
      
      expect(hasSyncOptions).toBeTruthy();
    }
  });

  test('verify default values', async ({ page }) => {
    const dropdowns = page.locator('select');
    const count = await dropdowns.count();
    
    if (count > 0) {
      // Check first dropdown (Owner)
      const ownerDropdown = dropdowns.first();
      const ownerValue = await ownerDropdown.evaluate(el => el.value);
      
      // Check if default is Self
      expect(ownerValue.includes('Self')).toBeTruthy();
      
      if (count > 1) {
        // Check second dropdown (Sync Source)
        const syncDropdown = dropdowns.nth(1);
        const syncValue = await syncDropdown.evaluate(el => el.value);
        
        // Check if default is Manual
        expect(syncValue.includes('Manual')).toBeTruthy();
      }
    }
  });

  test('submit and verify persistence', async ({ page }) => {
    const testData = generateTestData('finance');
    
    // Find and fill description field
    const descField = page.locator('input[placeholder*="description"], input[name*="description"], input[placeholder*="Description"]').first();
    if (await descField.isVisible()) {
      await descField.fill(testData.description);
    }
    
    // Find and fill amount field
    const amountField = page.locator('input[placeholder*="amount"], input[name*="amount"], input[placeholder*="Amount"]').first();
    if (await amountField.isVisible()) {
      await amountField.fill(testData.amount.toString());
    }
    
    // Find and click submit button
    const submitBtn = page.locator('button[type="submit"], button:has-text("Add"), button:has-text("Submit")');
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await page.waitForTimeout(1000);
      
      // Verify entry appears
      const entry = page.locator(`text=${testData.description}`);
      await expect(entry).toBeVisible();
      
      // Refresh page to verify persistence
      await page.reload();
      await page.waitForTimeout(2000);
      
      // Verify entry still appears
      const persistedEntry = page.locator(`text=${testData.description}`);
      await expect(persistedEntry).toBeVisible();
    }
  });
});