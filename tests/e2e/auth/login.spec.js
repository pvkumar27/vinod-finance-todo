/**
 * Login tests
 * 
 * Tests the authentication flow using a dedicated test account.
 */
const { test, expect } = require('@playwright/test');
const { login } = require('../../helpers/test-helpers');

test.describe('Authentication', () => {
  test('should login successfully with valid credentials', async ({ page }) => {
    // Go to login page
    await page.goto('/');
    
    // Verify login form is displayed
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    
    // Login
    await login(page);
    
    // Verify successful login (check for absence of login form)
    const loginForm = page.locator('form input[type="email"]');
    await expect(loginForm).not.toBeVisible();
    
    // Verify we're on the main app page
    const navElement = page.locator('nav');
    await expect(navElement).toBeVisible();
  });
});