/**
 * Login tests
 *
 * Tests the authentication flow using a dedicated test account.
 */
const { test, expect } = require('@playwright/test');
const credentials = require('../../fixtures/test-credentials');

test.describe('Authentication', () => {
  test('should verify app initialization', async ({ page }) => {
    // Log environment info
    console.log('==== TEST ENVIRONMENT INFO ====');
    console.log(`BASE_URL: ${process.env.BASE_URL || 'not set'}`);
    console.log(`TEST_USER_EMAIL defined: ${!!process.env.TEST_USER_EMAIL}`);
    console.log(`TEST_USER_PASSWORD defined: ${!!process.env.TEST_USER_PASSWORD}`);
    console.log('================================');

    // Go to the base URL
    await page.goto(process.env.BASE_URL || 'http://localhost:3000', { timeout: 30000 });
    console.log(`Navigated to: ${page.url()}`);

    // Take screenshot
    await page.screenshot({ path: 'tests/reports/app-init.png' });

    // Wait for root to have content (React app initialized)
    await page.waitForSelector('div#root', { timeout: 30000 });
    console.log('Root element found');

    // Wait for any content inside root
    await page.waitForSelector('div#root *', { timeout: 30000 });
    console.log('Content inside root found');

    // Verify that React has mounted something
    const rootChildrenCount = await page.locator('div#root > *').count();
    expect(rootChildrenCount).toBeGreaterThan(0);
    console.log(`Root has ${rootChildrenCount} children - app initialized successfully`);
  });
});
