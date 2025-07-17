// Test helpers
const credentials = require('../fixtures/test-credentials');

// Login function
async function login(page) {
  // Go to login page
  await page.goto('/');
  
  // Fill login form
  await page.fill('input[type="email"]', credentials.email);
  await page.fill('input[type="password"]', credentials.password);
  
  // Submit form
  await page.click('button[type="submit"]');
  
  // Wait for navigation
  await page.waitForTimeout(3000);
  
  // Check if login was successful
  const loginForm = page.locator('form input[type="email"]');
  const isStillOnLoginPage = await loginForm.isVisible();
  
  if (isStillOnLoginPage) {
    throw new Error('Login failed - check credentials');
  }
  
  console.log('Login successful');
}

// Generate test data with unique ID
function generateTestData(type) {
  const timestamp = Date.now();
  const id = Math.floor(Math.random() * 10000);
  const prefix = 'Test_E2E_';
  
  switch(type) {
    case 'card':
      return {
        name: `${prefix}Card_${id}`,
        number: '4111111111111111',
        expiry: '12/25',
        cvv: '123'
      };
    case 'finance':
      return {
        description: `${prefix}Finance_${id}`,
        amount: (Math.random() * 1000).toFixed(2),
        category: 'Test'
      };
    case 'todo':
      return {
        title: `${prefix}Todo_${id}`,
        description: 'Test todo item',
        dueDate: '2023-12-31'
      };
    default:
      return { id: `${prefix}${id}` };
  }
}

// Clean up test data
async function cleanupTestData(page) {
  const prefix = 'Test_E2E_';
  
  // Find test items
  const testItems = page.locator(`text=${prefix}`);
  const count = await testItems.count();
  
  console.log(`Found ${count} test items to clean up`);
  
  for (let i = 0; i < count; i++) {
    const item = testItems.first();
    if (await item.isVisible()) {
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

module.exports = { login, generateTestData, cleanupTestData };