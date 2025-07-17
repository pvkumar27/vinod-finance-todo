/**
 * Login tests
 * 
 * Tests the authentication flow using a dedicated test account.
 */
const { test, expect } = require('@playwright/test');
const credentials = require('../../fixtures/test-credentials');

test.describe('Authentication', () => {
  test('should login successfully with valid credentials', async ({ page }) => {
    // Go to login page
    await page.goto('/');
    
    // Verify login form is displayed
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    
    // Login directly without using the helper (which would navigate again)
    await page.fill('input[type="email"]', credentials.email);
    await page.fill('input[type="password"]', credentials.password);
    await page.click('button[type="submit"]');
    
    // Wait for navigation to complete
    try {
      await Promise.race([
        page.waitForNavigation({ timeout: 5000 }),
        page.waitForSelector('nav, .dashboard', { timeout: 5000 })
      ]);
    } catch (e) {
      // Timeout is okay, we'll check if still on login page
    }
    
    // Verify successful login (check for absence of login form)
    const loginForm = page.locator('form input[type="email"]');
    await expect(loginForm).not.toBeVisible();
    
    // Verify we're on the main app page
    const mainNav = page.locator('nav').first();
    await expect(mainNav).toBeVisible();
  });

  test('should navigate through all tabs after login', async ({ page }) => {
    // Login first
    await page.goto('/');
    
    // Wait for form to be fully loaded
    await page.waitForSelector('input[type="email"]');
    
    // Type with delay to ensure input is captured
    await page.fill('input[type="email"]', credentials.email);
    await page.waitForTimeout(100);
    await page.fill('input[type="password"]', credentials.password);
    await page.waitForTimeout(100);
    
    await page.click('button[type="submit"]');
    
    // Wait for login to complete with better error handling
    try {
      await page.waitForSelector('nav', { timeout: 10000 });
    } catch (e) {
      // Check if still on login page
      if (await page.locator('form input[type="email"]').isVisible()) {
        throw new Error('Login failed - still on login page');
      }
    }
    
    // Define tabs to check
    const tabs = [
      { name: 'To-Dos', expectedElement: 'h2:has-text("To-Do Manager")' },
      { name: 'Credit', expectedElement: 'h2:has-text("Credit Cards")' },
      { name: 'My Finances', expectedElement: 'h2:has-text("My Finances")' }
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