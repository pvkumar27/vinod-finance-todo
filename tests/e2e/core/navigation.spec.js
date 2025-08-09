/**
 * Navigation E2E Tests
 * Tests tab navigation and UI state management
 */
const { test, expect } = require('@playwright/test');
const { login } = require('../../helpers/test-helpers');

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should navigate between tabs', async ({ page }) => {
    // Start on To-Dos tab (default)
    await expect(page.locator('h2:has-text("To-Do Manager")')).toBeVisible();

    // Navigate to Credit Cards
    await page.click('button:has-text("Credit")');
    await page.waitForTimeout(500);
    await expect(page.locator('h2:has-text("Credit Cards")')).toBeVisible();

    // Navigate back to To-Dos
    await page.click('button:has-text("To-Dos")');
    await page.waitForTimeout(500);
    await expect(page.locator('h2:has-text("To-Do Manager")')).toBeVisible();
  });

  test('should maintain active tab state', async ({ page }) => {
    // Navigate to Credit Cards
    await page.click('button:has-text("Credit")');
    await page.waitForTimeout(500);

    // Verify active tab styling
    const activeTab = page.locator('button:has-text("Credit")');
    await expect(activeTab).toHaveClass(/bg-gradient-to-r/);
  });

  test('should show correct content for each tab', async ({ page }) => {
    // To-Dos tab content
    await page.click('button:has-text("To-Dos")');
    await expect(page.locator('#task-input')).toBeVisible();
    await expect(page.locator('button:has-text("Add Task")')).toBeVisible();

    // Credit Cards tab content
    await page.click('button:has-text("Credit")');
    await expect(page.locator('button:has-text("Add Card")')).toBeVisible();
    await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();
  });
});
