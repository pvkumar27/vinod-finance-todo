/**
 * Test helpers for E2E testing
 * 
 * These utilities help with:
 * - Authentication
 * - Test data generation
 * - Test data cleanup
 * 
 * SAFETY: All test data is prefixed with 'Test_E2E_' to ensure we never
 * modify or delete real user data.
 */
const credentials = require('../fixtures/test-credentials');

// Constants
const TEST_DATA_PREFIX = 'Test_E2E_';

/**
 * Login to the application
 * @param {Page} page - Playwright page object
 */
async function login(page) {
  // Go to login page
  await page.goto('/');
  
  // Get credentials from environment variables or fallback to file
  const email = process.env.TEST_USER_EMAIL || credentials.email;
  const password = process.env.TEST_USER_PASSWORD || credentials.password;
  
  console.log(`Logging in with email: ${email.substring(0, 3)}...`);
  
  // Fill login form
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  
  // Submit form
  await page.click('button[type="submit"]');
  
  // Wait for navigation with better approach
  try {
    // Wait for navigation or dashboard element
    await Promise.race([
      page.waitForNavigation({ timeout: 5000 }),
      page.waitForSelector('nav, .dashboard', { timeout: 5000 })
    ]);
  } catch (e) {
    // Timeout is okay, we'll check if still on login page
  }
  
  // Check if login was successful
  const loginForm = page.locator('form input[type="email"]');
  const isStillOnLoginPage = await loginForm.isVisible();
  
  if (isStillOnLoginPage) {
    throw new Error('Login failed - check credentials');
  }
  
  console.log('Login successful');
}

/**
 * Generate test data with unique ID
 * @param {string} type - Type of data to generate (card, finance, todo)
 * @returns {Object} Generated test data
 */
function generateTestData(type) {
  const timestamp = Date.now();
  const id = Math.floor(Math.random() * 10000);
  
  switch(type) {
    case 'card':
      return {
        name: `${TEST_DATA_PREFIX}Card_${id}`,
        number: '4111111111111111',
        expiry: '12/25',
        cvv: '123'
      };
    case 'finance':
      return {
        description: `${TEST_DATA_PREFIX}Finance_${id}`,
        amount: (Math.random() * 1000).toFixed(2),
        category: 'Test'
      };
    case 'todo':
      return {
        title: `${TEST_DATA_PREFIX}Todo_${id}`,
        description: 'Test todo item',
        dueDate: '2023-12-31'
      };
    default:
      return { id: `${TEST_DATA_PREFIX}${id}` };
  }
}

/**
 * Clean up test data
 * SAFETY: Only deletes items with the test prefix
 * @param {Page} page - Playwright page object
 */
async function cleanupTestData(page) {
  // Find test items
  const testItems = page.locator(`text=${TEST_DATA_PREFIX}`);
  const count = await testItems.count();
  
  console.log(`Found ${count} test items to clean up`);
  
  for (let i = 0; i < count; i++) {
    const item = testItems.first();
    if (await item.isVisible()) {
      // Verify this is actually test data before deleting
      const itemText = await item.textContent();
      if (!itemText.includes(TEST_DATA_PREFIX)) {
        console.warn('Skipping item that does not contain test prefix');
        continue;
      }
      
      // Find delete button near the item
      const deleteBtn = item.locator('xpath=./ancestor::*[position()<=3]//button[contains(@class, "delete") or contains(text(), "Delete") or contains(text(), "Remove")]');
      
      if (await deleteBtn.isVisible()) {
        await deleteBtn.click();
        
        // Confirm deletion if needed
        const confirmBtn = page.locator('button:has-text("Confirm"), button:has-text("Yes")');
        if (await confirmBtn.isVisible()) {
          await confirmBtn.click();
        }
        
        await page.waitForTimeout(500);
      }
    }
  }
}

module.exports = { 
  login, 
  generateTestData, 
  cleanupTestData,
  TEST_DATA_PREFIX
};