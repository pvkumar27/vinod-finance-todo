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
    // Log the base URL being used
    const baseUrl = page.context().browser().options.baseURL || 'No baseURL set';
    console.log('\n\n==== TEST ENVIRONMENT INFO ====');
    console.log(`Using baseURL: ${baseUrl}`);
    console.log(`Environment BASE_URL: ${process.env.BASE_URL || 'not set'}`);
    console.log('================================\n\n');

    // Determine the full URL to use
    const fullUrl = process.env.BASE_URL || 'http://localhost:3000';
    console.log(`Using full URL for navigation: ${fullUrl}`);

    // Go to login page with longer timeout using full URL
    await page.goto(fullUrl, { timeout: 30000 });

    // Log the actual URL after navigation
    console.log(`Actual page URL after navigation: ${page.url()}`);

    // Wait for page to be fully loaded with multiple strategies
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');

    // Take screenshot of initial page
    await page.screenshot({ path: 'tests/reports/01-initial-page.png' });

    // Debug page content
    const pageContent = await page.content();
    console.log('Page HTML length:', pageContent.length);

    // Save HTML for debugging
    const fs = require('fs');
    fs.writeFileSync('tests/reports/page-content.html', pageContent);

    // Verify that the page contains essential HTML elements
    console.log('Verifying page contains essential HTML elements...');

    // Wait for the root element to appear (indicates React app is mounted)
    console.log('Waiting for root element...');
    await page.waitForSelector('div#root', { timeout: 30000 });
    console.log('Root element found!');

    // Wait for any content to appear inside the root element
    console.log('Waiting for content inside root...');
    await page.waitForSelector('div#root > *', { timeout: 30000 });
    console.log('Content inside root found!');

    // Wait for any element to appear first
    await page.waitForSelector('body *', { timeout: 20000 });

    // Try to find login form with more flexible selectors
    console.log('Looking for login form elements...');

    // Wait for any form or auth container to appear
    console.log('Waiting for form or auth container...');
    await page
      .waitForSelector('form, div[class*="login"], div[class*="auth"], div[class*="sign"]', {
        timeout: 30000,
        state: 'visible',
      })
      .catch(e => console.log('Form container not found, will try to continue anyway'));
    console.log('Form or auth container check completed');

    // Wait for input fields to appear
    console.log('Waiting for input fields...');
    await page.waitForSelector('input', {
      timeout: 30000,
      state: 'visible',
    });
    console.log('Input fields found!');

    // Look for input fields with more flexible selectors
    const emailInput = page
      .locator(
        'input[type="email"], input[placeholder*="email"], input[name*="email"], input[id*="email"], input:first-of-type'
      )
      .first();
    const passwordInput = page
      .locator(
        'input[type="password"], input[placeholder*="password"], input[name*="password"], input[id*="password"], input[type="password"], input:nth-of-type(2)'
      )
      .first();

    // Verify inputs are visible
    console.log('Verifying email input is visible...');
    await expect(emailInput).toBeVisible({ timeout: 30000 });
    console.log('Email input is visible!');

    console.log('Verifying password input is visible...');
    await expect(passwordInput).toBeVisible({ timeout: 30000 });
    console.log('Password input is visible!');

    // Login directly without using the helper
    await page.fill('input[type="email"]', credentials.email);
    await page.fill('input[type="password"]', credentials.password);

    // Take screenshot before submitting
    await page.screenshot({ path: 'tests/reports/02-before-submit.png' });

    await page.click('button[type="submit"]');

    // Wait for navigation to complete
    console.log('Waiting for navigation to complete...');
    try {
      await Promise.race([
        page.waitForNavigation({ timeout: 20000 }),
        page.waitForSelector('nav, .dashboard, header, .app-container, main', { timeout: 20000 }),
        page.waitForFunction(
          () => {
            // Check if URL changed or login form disappeared
            return (
              !document.querySelector('form input[type="email"]') ||
              !document.querySelector('input[type="password"]')
            );
          },
          { timeout: 20000 }
        ),
      ]);
      console.log('Navigation detected!');
    } catch (e) {
      console.log('Navigation timeout, will check if still on login page');
    }

    // Check current URL and page content
    console.log(`Current URL after login attempt: ${page.url()}`);
    const postLoginContent = await page.content();
    console.log(`Page content length after login: ${postLoginContent.length}`);
    require('fs').writeFileSync('tests/reports/post-login-content.html', postLoginContent);

    // Take screenshot after navigation
    await page.screenshot({ path: 'tests/reports/03-after-navigation.png' });

    // Verify successful login (check for absence of login form)
    const loginForm = page.locator('form input[type="email"]');
    await expect(loginForm).not.toBeVisible({ timeout: 10000 });

    // Verify we're on the main app page
    const mainNav = page.locator('nav').first();
    await expect(mainNav).toBeVisible();

    // Take screenshot of main app page
    await page.screenshot({ path: 'tests/reports/04-main-app.png' });

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
