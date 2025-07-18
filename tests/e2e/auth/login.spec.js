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

    // Take screenshot of initial page
    await page.screenshot({ path: 'tests/reports/initial-page.png' });
    console.log('Initial page loaded, checking for login form');

    // Debug page content
    const pageContent = await page.content();
    console.log('Page title:', await page.title());
    console.log('Page content length:', pageContent.length);

    // Wait for any input field to appear (more generic)
    await page.waitForSelector('input', { timeout: 15000 });

    // Find email and password fields with more flexible selectors
    const emailInput = page
      .locator('input[type="email"], input[placeholder*="email"], input[name*="email"]')
      .first();
    const passwordInput = page
      .locator('input[type="password"], input[placeholder*="password"], input[name*="password"]')
      .first();

    // Verify login form elements are present
    await expect(emailInput).toBeVisible({ timeout: 10000 });
    await expect(passwordInput).toBeVisible({ timeout: 10000 });

    // Login directly without using the helper
    console.log(`Logging in with email: ${credentials.email.substring(0, 3)}...`);

    await emailInput.fill(credentials.email);
    await passwordInput.fill(credentials.password);

    // Take screenshot before submitting
    await page.screenshot({ path: 'tests/reports/before-login.png' });

    // Find and click the submit button with more flexible selector
    const submitButton = page
      .locator(
        'button[type="submit"], button:has-text("Sign In"), button:has-text("Log In"), input[type="submit"]'
      )
      .first();
    await submitButton.click();
    console.log('Login form submitted');

    // Wait for navigation to complete with longer timeout
    try {
      console.log('Waiting for navigation or dashboard to appear');
      await Promise.race([
        page.waitForNavigation({ timeout: 15000 }),
        page.waitForSelector('nav, .dashboard, header, .app-container', { timeout: 15000 }),
        page.waitForFunction(() => !document.querySelector('input[type="email"]'), {
          timeout: 15000,
        }),
      ]);
      console.log('Navigation detected');
    } catch (e) {
      console.log('Navigation timeout, will check if still on login page');
    }

    // Take screenshot after login attempt
    await page.screenshot({ path: 'tests/reports/after-login.png' });

    // Take another screenshot after waiting for navigation
    await page.screenshot({ path: 'tests/reports/after-navigation.png' });

    // Verify successful login (check for absence of login form)
    const loginForm = page
      .locator('input[type="email"], input[placeholder*="email"], input[name*="email"]')
      .first();

    // Check if we're still on the login page
    const isStillOnLoginPage = await loginForm.isVisible().catch(() => false);

    if (isStillOnLoginPage) {
      console.log('Still on login page, checking for error messages');
      const loginPageContent = await page.content();
      console.log('Page content after login attempt:', loginPageContent.substring(0, 500) + '...');

      // Check for any error messages
      const errorText = await page
        .textContent('text=error, text=invalid, .error, .alert')
        .catch(() => 'No error message found');
      console.log('Error message if any:', errorText);

      throw new Error('Login failed - still on login page');
    }

    console.log('Login successful - login form no longer visible');

    // Verify we're on the main app page - try multiple possible selectors
    const appElements = [
      page.locator('nav').first(),
      page.locator('.dashboard').first(),
      page.locator('header').first(),
      page.locator('.app-container').first(),
    ];

    let foundAppElement = false;
    for (const element of appElements) {
      if (await element.isVisible().catch(() => false)) {
        foundAppElement = true;
        break;
      }
    }

    if (!foundAppElement) {
      console.log('Could not find any app elements after login');
      await page.screenshot({ path: 'tests/reports/no-app-elements.png' });
      throw new Error('Login may have succeeded but no app elements found');
    }

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
