/**
 * To-Dos CRUD E2E Tests
 * Tests create, read, update, delete operations for to-do items
 */
const { test, expect } = require('@playwright/test');
const { login, generateTestData, cleanupTestData } = require('../../helpers/test-helpers');

test.describe('To-Dos CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);

    // Navigate to To-Dos tab (default)
    await page.click('button:has-text("To-Dos")');
    await page.waitForTimeout(1000);
  });

  test.afterEach(async ({ page }) => {
    await cleanupTestData(page);
  });

  test('should create, edit, and delete todo', async ({ page }) => {
    const testData = generateTestData('todo');

    // Create todo
    await page.fill('#task-input', testData.title);
    await page.fill('#task-due-date', testData.dueDate);
    await page.click('button:has-text("Add Task")');
    await page.waitForTimeout(1000);

    // Verify todo appears
    const todoElement = page.locator(`text=${testData.title}`);
    await expect(todoElement).toBeVisible();

    // Edit todo
    const editBtn = todoElement.locator(
      'xpath=./ancestor::*[position()<=3]//button[contains(@title, "Edit")]'
    );
    await editBtn.click();
    await page.waitForTimeout(500);

    // Update title
    const updatedTitle = `${testData.title}_Updated`;
    await page.fill('#task-input', updatedTitle);
    await page.click('button:has-text("Update")');
    await page.waitForTimeout(1000);

    // Verify update
    await expect(page.locator(`text=${updatedTitle}`)).toBeVisible();

    // Delete todo
    const deleteBtn = page
      .locator(`text=${updatedTitle}`)
      .locator('xpath=./ancestor::*[position()<=3]//button[contains(@title, "Delete")]');
    await deleteBtn.click();
    await page.waitForTimeout(1000);

    // Verify todo is gone
    await expect(page.locator(`text=${updatedTitle}`)).not.toBeVisible();
  });

  test('should toggle todo completion', async ({ page }) => {
    const testData = generateTestData('todo');

    // Create todo
    await page.fill('#task-input', testData.title);
    await page.click('button:has-text("Add Task")');
    await page.waitForTimeout(1000);

    // Toggle completion
    const checkbox = page
      .locator(`text=${testData.title}`)
      .locator('xpath=./ancestor::*[position()<=3]//input[@type="checkbox"]');
    await checkbox.click();
    await page.waitForTimeout(1000);

    // Verify task moved to completed section
    await page.click('button:has-text("Completed Tasks")');
    await expect(page.locator(`text=${testData.title}`)).toBeVisible();
  });

  test('should pin and unpin todos', async ({ page }) => {
    const testData = generateTestData('todo');

    // Create todo
    await page.fill('#task-input', testData.title);
    await page.click('button:has-text("Add Task")');
    await page.waitForTimeout(1000);

    // Pin todo
    const pinBtn = page
      .locator(`text=${testData.title}`)
      .locator('xpath=./ancestor::*[position()<=3]//button[contains(@title, "Pin")]');
    await pinBtn.click();
    await page.waitForTimeout(1000);

    // Verify todo appears in pinned section
    await expect(page.locator('h4:has-text("Pinned Tasks")')).toBeVisible();
    await expect(page.locator('.bg-yellow-50').locator(`text=${testData.title}`)).toBeVisible();
  });

  test('should switch between view modes', async ({ page }) => {
    // Test Cards view
    await page.click('button:has-text("Cards")');
    await expect(page.locator('.task-container')).toBeVisible();

    // Test Table view
    await page.click('button:has-text("Table")');
    await expect(page.locator('table')).toBeVisible();
  });
});
