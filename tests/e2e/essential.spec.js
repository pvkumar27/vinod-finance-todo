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
    await expect(page.locator('h2:has-text("To-Do Manager")')).toBeVisible();

    // Navigate to Credit Cards
    await page.click('button:has-text("Credit")');
    await expect(page.locator('h2:has-text("Credit Cards")')).toBeVisible();

    // Navigate back to To-Dos
    await page.click('button:has-text("To-Dos")');
    await expect(page.locator('h2:has-text("To-Do Manager")')).toBeVisible();
  });

  test('should create and delete a todo', async ({ page }) => {
    const testData = generateTestData('todo');

    // Create todo
    await page.fill('#task-input', testData.title);
    await page.click('button:has-text("Add Task")');
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
    await page.click('button:has-text("Credit")');

    // Create credit card
    await page.click('button:has-text("Add Card")');
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
    await page.click('button:has-text("Table")');
    await expect(page.locator('table')).toBeVisible();

    await page.click('button:has-text("Cards")');
    await expect(page.locator('.task-container')).toBeVisible();

    // Test Credit Cards view modes
    await page.click('button:has-text("Credit")');

    await page.click('button:has-text("Table")');
    await expect(page.locator('table')).toBeVisible();

    await page.click('button:has-text("Cards")');
    await expect(page.locator('.grid')).toBeVisible();
  });
});
