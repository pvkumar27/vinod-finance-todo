const { test, expect } = require('@playwright/test');
const { login, cleanupTestData } = require('../helpers/test-helpers');

test.describe('Test Data Cleanup', () => {
  test('clean up all test data', async ({ page }) => {
    // Login
    await login(page);
    
    // Navigate to each tab and clean up test data
    const tabs = ['To-Dos', 'Credit Cards', 'My Finances'];
    
    for (const tab of tabs) {
      // Click tab
      const tabButton = page.locator(`button:has-text("${tab}")`);
      if (await tabButton.isVisible()) {
        await tabButton.click();
        await page.waitForTimeout(1000);
        
        // Clean up test data in this tab
        await cleanupTestData(page);
      }
    }
  });
});