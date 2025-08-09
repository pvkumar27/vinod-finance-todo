/**
 * Responsive Design E2E Tests
 * Tests application behavior across different screen sizes
 */
const { test, expect } = require('@playwright/test');
const { login } = require('../../helpers/test-helpers');

test.describe('Responsive Design', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Verify mobile navigation works
    await page.click('button:has-text("To-Dos")');
    await expect(page.locator('h2:has-text("To-Do Manager")')).toBeVisible();

    // Verify mobile forms work
    await expect(page.locator('#task-input')).toBeVisible();

    // Switch to credit cards
    await page.click('button:has-text("Credit")');
    await expect(page.locator('h2:has-text("Credit Cards")')).toBeVisible();
  });

  test('should work on tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    // Verify tablet layout
    await page.click('button:has-text("Credit")');
    await expect(page.locator('button:has-text("Add Card")')).toBeVisible();

    // Test view mode switching
    await page.click('button:has-text("Table")');
    await expect(page.locator('table')).toBeVisible();
  });

  test('should work on desktop viewport', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 });

    // Verify desktop layout
    await expect(page.locator('h2:has-text("To-Do Manager")')).toBeVisible();

    // Test full functionality
    await page.click('button:has-text("Credit")');
    await expect(page.locator('.grid')).toBeVisible();
  });
});
