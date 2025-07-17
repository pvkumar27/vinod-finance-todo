/**
 * Test Data Cleanup
 * 
 * Utility test to clean up all test data across the application.
 * This can be run independently to ensure no test data remains.
 * 
 * SAFETY: Only deletes items with the test prefix.
 */
const { test, expect } = require('@playwright/test');
const { login, cleanupTestData, TEST_DATA_PREFIX } = require('../../helpers/test-helpers');

test.describe('Test Data Cleanup', () => {
  test('clean up all test data', async ({ page }) => {
    console.log(`Starting cleanup of all test data with prefix: ${TEST_DATA_PREFIX}`);
    
    // Login
    await login(page);
    
    // Navigate to each tab and clean up test data
    const tabs = ['To-Dos', 'Credit Cards', 'My Finances'];
    
    for (const tab of tabs) {
      console.log(`Cleaning up test data in ${tab} tab`);
      
      // Click tab
      const tabButton = page.locator(`button:has-text("${tab}")`);
      if (await tabButton.isVisible()) {
        await tabButton.click();
        await page.waitForTimeout(1000);
        
        // Clean up test data in this tab
        await cleanupTestData(page);
      }
    }
    
    console.log('Test data cleanup complete');
  });
});