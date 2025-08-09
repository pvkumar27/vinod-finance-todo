/**
 * Credit Cards CRUD E2E Tests
 * Tests create, read, update, delete operations for credit cards
 */
const { test, expect } = require('@playwright/test');
const { login, generateTestData, cleanupTestData } = require('../../helpers/test-helpers');

test.describe('Credit Cards CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);

    // Navigate to Credit Cards tab
    await page.click('button:has-text("Credit")');
    await page.waitForTimeout(1000);
  });

  test.afterEach(async ({ page }) => {
    await cleanupTestData(page);
  });

  test('should create, edit, and delete credit card', async ({ page }) => {
    const testData = generateTestData('creditCard');

    // Create credit card
    await page.click('button:has-text("Add Card")');
    await page.waitForTimeout(500);

    // Fill form
    await page.fill('input[name="bank_name"]', testData.bankName);
    await page.fill('input[name="last_four_digits"]', testData.lastFour);

    // Submit
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);

    // Verify card appears
    const cardElement = page.locator(`text=${testData.bankName}`);
    await expect(cardElement).toBeVisible();

    // Edit card
    const editBtn = page
      .locator(`text=${testData.bankName}`)
      .locator('xpath=./ancestor::*[position()<=3]//button[contains(@title, "Edit")]');
    await editBtn.click();
    await page.waitForTimeout(500);

    // Update bank name
    const updatedName = `${testData.bankName}_Updated`;
    await page.fill('input[name="bank_name"]', updatedName);

    // Save
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);

    // Verify update
    await expect(page.locator(`text=${updatedName}`)).toBeVisible();

    // Delete card
    const deleteBtn = page
      .locator(`text=${updatedName}`)
      .locator('xpath=./ancestor::*[position()<=3]//button[contains(@title, "Delete")]');
    await deleteBtn.click();

    // Confirm deletion
    await page.click('button:has-text("OK")');
    await page.waitForTimeout(1000);

    // Verify card is gone
    await expect(page.locator(`text=${updatedName}`)).not.toBeVisible();
  });

  test('should switch between view modes', async ({ page }) => {
    // Test Cards view
    await page.click('button:has-text("Cards")');
    await expect(page.locator('.grid')).toBeVisible();

    // Test Table view
    await page.click('button:has-text("Table")');
    await expect(page.locator('table')).toBeVisible();
  });

  test('should filter cards by tabs', async ({ page }) => {
    // Test All Cards tab
    await page.click('button:has-text("All Cards")');
    await page.waitForTimeout(500);

    // Test Promo Expiring tab
    await page.click('button:has-text("Promo Expiring")');
    await page.waitForTimeout(500);

    // Test Inactive tab
    await page.click('button:has-text("Inactive")');
    await page.waitForTimeout(500);
  });
});
