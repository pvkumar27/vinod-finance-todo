const { test, expect } = require('@playwright/test');
const { login, generateTestData, cleanupTestData } = require('./test-helpers');

test.describe('CRUD Operations Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await login(page);
  });

  test.afterEach(async ({ page }) => {
    // Clean up test data
    await cleanupTestData(page);
  });

  test('create, edit, and delete credit card', async ({ page }) => {
    // Navigate to Credit Cards tab
    await page.click('button:has-text("Credit Cards"), button:has-text("Cards")');
    await page.waitForTimeout(1000);
    
    const testData = generateTestData('card');
    
    // Create card
    const addBtn = page.locator('button:has-text("Add"), button:has-text("New Card")');
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(500);
      
      // Fill form
      await page.locator('input[placeholder*="name"], input[name*="name"]').fill(testData.name);
      await page.locator('input[placeholder*="number"], input[name*="number"]').fill(testData.number);
      await page.locator('input[placeholder*="expiry"], input[name*="expiry"]').fill(testData.expiry);
      await page.locator('input[placeholder*="cvv"], input[name*="cvv"]').fill(testData.cvv);
      
      // Submit
      await page.locator('button[type="submit"], button:has-text("Save")').click();
      await page.waitForTimeout(1000);
      
      // Verify card appears
      const card = page.locator(`text=${testData.name}`);
      await expect(card).toBeVisible();
      
      // Edit card
      const editBtn = card.locator('xpath=./ancestor::*[position()<=3]//button[contains(@class, "edit") or contains(text(), "Edit")]');
      if (await editBtn.isVisible()) {
        await editBtn.click();
        await page.waitForTimeout(500);
        
        // Update name
        const updatedName = `${testData.name}_Updated`;
        await page.locator('input[placeholder*="name"], input[name*="name"]').fill(updatedName);
        
        // Save
        await page.locator('button[type="submit"], button:has-text("Save")').click();
        await page.waitForTimeout(1000);
        
        // Verify update
        const updatedCard = page.locator(`text=${updatedName}`);
        await expect(updatedCard).toBeVisible();
        
        // Delete card
        const deleteBtn = updatedCard.locator('xpath=./ancestor::*[position()<=3]//button[contains(@class, "delete") or contains(text(), "Delete")]');
        if (await deleteBtn.isVisible()) {
          await deleteBtn.click();
          
          // Confirm deletion if needed
          const confirmBtn = page.locator('button:has-text("Confirm"), button:has-text("Yes")');
          if (await confirmBtn.isVisible()) {
            await confirmBtn.click();
          }
          
          await page.waitForTimeout(1000);
          
          // Verify card is gone
          const deletedCard = page.locator(`text=${updatedName}`);
          await expect(deletedCard).not.toBeVisible();
        }
      }
    }
  });

  test('create, edit, and delete finance entry', async ({ page }) => {
    // Navigate to My Finances tab
    await page.click('button:has-text("My Finances"), button:has-text("Finances")');
    await page.waitForTimeout(1000);
    
    const testData = generateTestData('finance');
    
    // Create finance entry
    const descField = page.locator('input[placeholder*="description"], input[name*="description"]').first();
    const amountField = page.locator('input[placeholder*="amount"], input[name*="amount"]').first();
    
    if (await descField.isVisible() && await amountField.isVisible()) {
      await descField.fill(testData.description);
      await amountField.fill(testData.amount.toString());
      
      // Submit
      const submitBtn = page.locator('button[type="submit"], button:has-text("Add")');
      await submitBtn.click();
      await page.waitForTimeout(1000);
      
      // Verify entry appears
      const entry = page.locator(`text=${testData.description}`);
      await expect(entry).toBeVisible();
      
      // Edit entry
      const editBtn = entry.locator('xpath=./ancestor::*[position()<=3]//button[contains(@class, "edit") or contains(text(), "Edit")]');
      if (await editBtn.isVisible()) {
        await editBtn.click();
        await page.waitForTimeout(500);
        
        // Update description
        const updatedDesc = `${testData.description}_Updated`;
        await page.locator('input[placeholder*="description"], input[name*="description"]').fill(updatedDesc);
        
        // Save
        await page.locator('button[type="submit"], button:has-text("Save")').click();
        await page.waitForTimeout(1000);
        
        // Verify update
        const updatedEntry = page.locator(`text=${updatedDesc}`);
        await expect(updatedEntry).toBeVisible();
        
        // Delete entry
        const deleteBtn = updatedEntry.locator('xpath=./ancestor::*[position()<=3]//button[contains(@class, "delete") or contains(text(), "Delete")]');
        if (await deleteBtn.isVisible()) {
          await deleteBtn.click();
          
          // Confirm deletion if needed
          const confirmBtn = page.locator('button:has-text("Confirm"), button:has-text("Yes")');
          if (await confirmBtn.isVisible()) {
            await confirmBtn.click();
          }
          
          await page.waitForTimeout(1000);
          
          // Verify entry is gone
          const deletedEntry = page.locator(`text=${updatedDesc}`);
          await expect(deletedEntry).not.toBeVisible();
        }
      }
    }
  });

  test('create, edit, and delete todo', async ({ page }) => {
    // Navigate to To-Dos tab
    await page.click('button:has-text("To-Dos")');
    await page.waitForTimeout(1000);
    
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