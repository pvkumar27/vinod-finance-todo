/**
 * Login tests
 *
 * Tests the authentication flow using a dedicated test account.
 */
const { test, expect } = require('@playwright/test');
const credentials = require('../../fixtures/test-credentials');
const { setupConsoleHandler } = require('../../helpers/console-handler');

// Configure console error handling
test.beforeEach(async ({ page }) => {
  setupConsoleHandler(page);
});

test.describe('Authentication', () => {
  test.beforeEach(() => {
    // Validate credentials are available
    credentials.validate();
  });

  test('should login successfully and navigate through all tabs', async ({ page }) => {
    // Go to login page with longer timeout
    await page.goto('/', { timeout: 30000 });

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Verify login form is displayed with longer timeout
    await expect(page.locator('form, div:has(> input[type="email"])')).toBeVisible({
      timeout: 10000,
    });
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[type="password"]')).toBeVisible({ timeout: 10000 });

    // Login directly without using the helper
    console.log(`Logging in with email: ${credentials.email.substring(0, 3)}...`);
    await page.fill('input[type="email"]', credentials.email);
    await page.fill('input[type="password"]', credentials.password);

    // Take screenshot before submitting
    await page.screenshot({ path: 'tests/reports/before-login.png' });

    await page.click('button[type="submit"]');
    console.log('Login form submitted');

    // Wait for navigation to complete
    try {
      await Promise.race([
        page.waitForNavigation({ timeout: 5000 }),
        page.waitForSelector('nav, .dashboard', { timeout: 5000 }),
      ]);
    } catch (e) {
      // Timeout is okay, we'll check if still on login page
    }

    // Take screenshot after login attempt
    await page.screenshot({ path: 'tests/reports/after-login.png' });

    // Verify successful login (check for absence of login form)
    const loginForm = page.locator('form input[type="email"]');
    await expect(loginForm).not.toBeVisible({ timeout: 10000 });
    console.log('Login successful - login form no longer visible');

    // Verify we're on the main app page
    const mainNav = page.locator('nav').first();
    await expect(mainNav).toBeVisible();

    // Define tabs to check
    const tabs = [
      { name: 'To-Dos', expectedElement: 'h2:has-text("To-Do Manager")' },
      { name: 'Credit', expectedElement: 'h2:has-text("Credit Cards")' },
      { name: 'Finances', expectedElement: 'h2:has-text("Finances")' },
    ];

    // Navigate through each tab and verify content
    for (const tab of tabs) {
      // Click on tab
      await page.click(`button:has-text("${tab.name}")`);
      await page.waitForTimeout(500);

      // Verify tab content loaded
      await expect(page.locator(tab.expectedElement)).toBeVisible();

      // Verify interactive elements exist
      const interactiveElements = page.locator('button, input, select');
      const count = await interactiveElements.count();
      expect(count).toBeGreaterThan(0);
    }
  });
});
