/**
 * Essential E2E Tests - Pipeline Optimized
 *
 * This file contains the most critical tests that must pass for deployment.
 * These tests are optimized for speed and reliability in CI/CD pipelines.
 */
const { test, expect } = require('@playwright/test');
const { login, generateTestData, cleanupTestData } = require('../helpers/test-helpers');

test.describe('Essential Application Tests', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test.afterEach(async ({ page }) => {
    await cleanupTestData(page);
  });

  test('should login and navigate between main tabs', async ({ page }) => {
    // Verify To-Dos tab (default)
    await expect(page.locator('[data-cy="todo-manager-heading"]')).toBeVisible();

    // Navigate to Credit Cards
    await page.click('[data-cy="nav-cards-tab"]');
    await expect(page.locator('[data-cy="credit-cards-heading"]')).toBeVisible();

    // Navigate back to To-Dos
    await page.click('[data-cy="nav-todos-tab"]');
    await expect(page.locator('[data-cy="todo-manager-heading"]')).toBeVisible();
  });

  test('should create and delete a todo', async ({ page }) => {
    const testData = generateTestData('todo');

    // Create todo
    await page.fill('[data-cy="task-input-field"]', testData.title);
    await page.click('[data-cy="task-add-button"]');
    await page.waitForTimeout(1000);

    // Verify todo appears
    await expect(page.locator(`text=${testData.title}`)).toBeVisible();

    // Delete todo
    const deleteBtn = page
      .locator(`text=${testData.title}`)
      .locator('xpath=./ancestor::*[position()<=3]//button[contains(@title, "Delete")]');
    await deleteBtn.click();
    await page.waitForTimeout(1000);

    // Verify todo is gone
    await expect(page.locator(`text=${testData.title}`)).not.toBeVisible();
  });

  test('should create and delete a credit card', async ({ page }) => {
    const testData = generateTestData('creditCard');

    // Navigate to Credit Cards
    await page.click('[data-cy="nav-cards-tab"]');

    // Create credit card
    await page.click('[data-cy="card-add-button"]');
    await page.waitForTimeout(500);

    // Fill form (using more flexible selectors)
    await page.fill('input[placeholder*="bank"], input[name*="bank"]', testData.bankName);
    await page.fill('input[placeholder*="last"], input[name*="last"]', testData.lastFour);

    // Submit
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);

    // Verify card appears
    await expect(page.locator(`text=${testData.bankName}`)).toBeVisible();

    // Delete card
    const deleteBtn = page
      .locator(`text=${testData.bankName}`)
      .locator('xpath=./ancestor::*[position()<=3]//button[contains(@title, "Delete")]');
    await deleteBtn.click();

    // Confirm deletion
    await page.click('button:has-text("OK")');
    await page.waitForTimeout(1000);

    // Verify card is gone
    await expect(page.locator(`text=${testData.bankName}`)).not.toBeVisible();
  });

  test('should switch view modes', async ({ page }) => {
    // Test To-Dos view modes
    await page.click('[data-cy="view-table-button"]');
    await expect(page.locator('table')).toBeVisible();

    await page.click('[data-cy="view-cards-button"]');
    await expect(page.locator('[data-cy="task-container"]')).toBeVisible();

    // Test Credit Cards view modes
    await page.click('[data-cy="nav-cards-tab"]');

    await page.click('[data-cy="view-table-button"]');
    await expect(page.locator('table')).toBeVisible();

    await page.click('[data-cy="view-cards-button"]');
    await expect(page.locator('[data-cy="card-grid"]')).toBeVisible();
  });
});
