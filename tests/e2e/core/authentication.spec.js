/**
 * Authentication E2E Tests
 * Tests login flow and session management
 */
const { test, expect } = require('@playwright/test');
const { login, logout } = require('../../helpers/test-helpers');

test.describe('Authentication', () => {
  test('should login successfully and access main application', async ({ page }) => {
    await login(page);

    // Verify main app elements are visible
    await expect(page.locator('h2:has-text("To-Do Manager")')).toBeVisible();
    await expect(page.locator('button:has-text("To-Dos")')).toBeVisible();
    await expect(page.locator('button:has-text("Credit")')).toBeVisible();
  });

  test('should maintain session across page refreshes', async ({ page }) => {
    await login(page);

    // Refresh page
    await page.reload();

    // Should still be logged in
    await expect(page.locator('h2:has-text("To-Do Manager")')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    await login(page);
    await logout(page);

    // Should see login form
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });
});
