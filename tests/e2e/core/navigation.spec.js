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
    await expect(page.locator('[data-cy="todo-manager-heading"]')).toBeVisible();

    // Navigate to Credit Cards
    await page.click('[data-cy="nav-cards-tab"]');
    await page.waitForTimeout(500);
    await expect(page.locator('[data-cy="credit-cards-heading"]')).toBeVisible();

    // Navigate back to To-Dos
    await page.click('[data-cy="nav-todos-tab"]');
    await page.waitForTimeout(500);
    await expect(page.locator('[data-cy="todo-manager-heading"]')).toBeVisible();
  });

  test('should maintain active tab state', async ({ page }) => {
    // Navigate to Credit Cards
    await page.click('button:has-text("Credit")');
    await page.waitForTimeout(500);

    // Verify active tab styling
    const activeTab = page.locator('[data-cy="nav-cards-tab"]');
    await expect(activeTab).toHaveClass(/bg-gradient-to-r/);
  });

  test('should show correct content for each tab', async ({ page }) => {
    // To-Dos tab content
    await page.click('[data-cy="nav-todos-tab"]');
    await expect(page.locator('[data-cy="task-input-field"]')).toBeVisible();
    await expect(page.locator('[data-cy="task-add-button"]')).toBeVisible();

    // Credit Cards tab content
    await page.click('[data-cy="nav-cards-tab"]');
    await expect(page.locator('[data-cy="card-add-button"]')).toBeVisible();
    await expect(page.locator('[data-cy="card-search-input"]')).toBeVisible();
  });
});
