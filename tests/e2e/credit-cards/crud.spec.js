/**
 * Credit Cards CRUD tests
 * 
 * Tests the create, read, update, delete operations for credit cards.
 */
const { test, expect } = require('@playwright/test');
const { login, generateTestData, cleanupTestData } = require('../../helpers/test-helpers');

test.describe('Credit Cards CRUD', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/');
    await login(page, true);
    
    // Navigate to Credit Cards tab
    await page.click('button:has-text("Credit Cards"), button:has-text("Cards")');
    await page.waitForTimeout(1000);
  });

  test.afterEach(async ({ page }) => {
    // Clean up test data
    await cleanupTestData(page);
  });

  test('create, edit, and delete credit card', async ({ page }) => {
    const testData = generateTestData('card');
    
    // Create card
    const addBtn = page.locator('button:has-text("Add"), button:has-text("New Card")');
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(500);
      
      // Fill form with only available fields
      await page.getByPlaceholder('Card name').fill(testData.name);
      await page.getByPlaceholder('Bank name').fill('Test Bank');
      
      // Submit
      await page.locator('button:has-text("Add Credit Card")').click();
      await page.waitForTimeout(1000);
      
      // Verify card appears
      const card = page.locator(`text=${testData.name}`);
      await expect(card).toBeVisible();
      
      // Edit card
      const editBtn = card.locator('xpath=./ancestor::*[position()<=3]//button[contains(@class, "edit") or contains(text(), "Edit")]');
      if (await editBtn.isVisible()) {
        await editBtn.click();
        await page.waitForTimeout(500);
        
        // Update name - use more specific selector
        const updatedName = `${testData.name}_Updated`;
        await page.getByPlaceholder('Card name').fill(updatedName);
        
        // Save
        await page.locator('button:has-text("Save")').click();
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
});