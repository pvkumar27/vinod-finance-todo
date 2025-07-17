/**
 * To-Dos CRUD tests
 * 
 * Tests the create, read, update, delete operations for to-do items.
 */
const { test, expect } = require('@playwright/test');
const { login, generateTestData, cleanupTestData } = require('../../helpers/test-helpers');

test.describe('To-Dos CRUD', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await login(page);
    
    // Navigate to To-Dos tab
    await page.click('button:has-text("To-Dos")');
    await page.waitForTimeout(1000);
  });

  test.afterEach(async ({ page }) => {
    // Clean up test data
    await cleanupTestData(page);
  });

  test('create, edit, and delete todo', async ({ page }) => {
    const testData = generateTestData('todo');
    
    // Create todo
    const addBtn = page.locator('button:has-text("Add"), button:has-text("New Todo")');
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(500);
      
      // Fill form
      await page.locator('input[placeholder*="title"], input[name*="title"]').fill(testData.title);
      await page.locator('textarea[placeholder*="description"], textarea[name*="description"]').fill(testData.description);
      
      // Submit
      await page.locator('button[type="submit"], button:has-text("Save")').click();
      await page.waitForTimeout(1000);
      
      // Verify todo appears
      const todo = page.locator(`text=${testData.title}`);
      await expect(todo).toBeVisible();
      
      // Edit todo
      const editBtn = todo.locator('xpath=./ancestor::*[position()<=3]//button[contains(@class, "edit") or contains(text(), "Edit")]');
      if (await editBtn.isVisible()) {
        await editBtn.click();
        await page.waitForTimeout(500);
        
        // Update title
        const updatedTitle = `${testData.title}_Updated`;
        await page.locator('input[placeholder*="title"], input[name*="title"]').fill(updatedTitle);
        
        // Save
        await page.locator('button[type="submit"], button:has-text("Save")').click();
        await page.waitForTimeout(1000);
        
        // Verify update
        const updatedTodo = page.locator(`text=${updatedTitle}`);
        await expect(updatedTodo).toBeVisible();
        
        // Delete todo
        const deleteBtn = updatedTodo.locator('xpath=./ancestor::*[position()<=3]//button[contains(@class, "delete") or contains(text(), "Delete")]');
        if (await deleteBtn.isVisible()) {
          await deleteBtn.click();
          
          // Confirm deletion if needed
          const confirmBtn = page.locator('button:has-text("Confirm"), button:has-text("Yes")');
          if (await confirmBtn.isVisible()) {
            await confirmBtn.click();
          }
          
          await page.waitForTimeout(1000);
          
          // Verify todo is gone
          const deletedTodo = page.locator(`text=${updatedTitle}`);
          await expect(deletedTodo).not.toBeVisible();
        }
      }
    }
  });
});