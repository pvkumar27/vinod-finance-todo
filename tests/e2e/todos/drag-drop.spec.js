/**
 * Drag and Drop tests for To-Do tasks
 * 
 * Tests the drag and drop functionality for reordering tasks.
 */
const { test, expect } = require('@playwright/test');
const { login, generateTestData, cleanupTestData } = require('../../helpers/test-helpers');

test.describe('To-Do Drag and Drop', () => {
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

  test('should reorder tasks using drag and drop', async ({ page }) => {
    // Create test tasks
    const task1 = generateTestData('task');
    const task2 = generateTestData('task');
    const task3 = generateTestData('task');
    
    // Add tasks
    await addTask(page, task1.name);
    await addTask(page, task2.name);
    await addTask(page, task3.name);
    
    // Wait for tasks to appear
    await page.waitForSelector(`text=${task1.name}`);
    await page.waitForSelector(`text=${task2.name}`);
    await page.waitForSelector(`text=${task3.name}`);
    
    // Get the task elements
    const taskElements = await page.$$('.cursor-grab');
    expect(taskElements.length).toBeGreaterThanOrEqual(3);
    
    // Get the initial order of tasks
    const initialOrder = await getTaskOrder(page);
    
    // Perform drag and drop - move the first task to the third position
    await dragAndDrop(page, taskElements[0], taskElements[2]);
    
    // Wait for the reordering to complete
    await page.waitForTimeout(1000);
    
    // Get the new order of tasks
    const newOrder = await getTaskOrder(page);
    
    // Verify the order has changed
    expect(newOrder[0]).toBe(initialOrder[1]);
    expect(newOrder[1]).toBe(initialOrder[2]);
    expect(newOrder[2]).toBe(initialOrder[0]);
  });
  
  test('should maintain separate order for pinned and unpinned tasks', async ({ page }) => {
    // Create test tasks
    const task1 = generateTestData('task');
    const task2 = generateTestData('task');
    
    // Add tasks
    await addTask(page, task1.name);
    await addTask(page, task2.name);
    
    // Wait for tasks to appear
    await page.waitForSelector(`text=${task1.name}`);
    await page.waitForSelector(`text=${task2.name}`);
    
    // Pin the second task
    const pinButtons = await page.$$('button[title="Pin task"]');
    await pinButtons[1].click();
    
    // Wait for the pinned task to move to the pinned section
    await page.waitForTimeout(1000);
    
    // Verify the pinned task is in the pinned section
    const pinnedSection = await page.locator('h4:has-text("Pinned Tasks")');
    await expect(pinnedSection).toBeVisible();
    
    // Get the pinned task
    const pinnedTask = await page.locator(`text=${task2.name}`).first();
    
    // Verify the pinned task is in the pinned section
    const pinnedTaskParent = await pinnedTask.locator('xpath=./ancestor::div[contains(@class, "bg-yellow-50")]');
    await expect(pinnedTaskParent).toBeVisible();
  });
});

// Helper function to add a task
async function addTask(page, taskName) {
  await page.fill('input[placeholder="Add a new task..."]', taskName);
  await page.click('button:has-text("Add")');
  await page.waitForTimeout(500);
}

// Helper function to get the current order of tasks
async function getTaskOrder(page) {
  const taskTexts = await page.$$eval('.text-gray-900', elements => 
    elements.map(el => el.textContent)
  );
  return taskTexts;
}

// Helper function to perform drag and drop
async function dragAndDrop(page, sourceElement, targetElement) {
  const sourceBox = await sourceElement.boundingBox();
  const targetBox = await targetElement.boundingBox();
  
  // Start dragging
  await page.mouse.move(
    sourceBox.x + sourceBox.width / 2,
    sourceBox.y + sourceBox.height / 2
  );
  await page.mouse.down();
  
  // Move to target
  await page.mouse.move(
    targetBox.x + targetBox.width / 2,
    targetBox.y + targetBox.height / 2,
    { steps: 10 } // Move in steps for smoother drag
  );
  
  // Release to drop
  await page.mouse.up();
}