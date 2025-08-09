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
 * @param {boolean} skipNavigation - Skip navigation to login page if already there
 */
async function login(page, skipNavigation = false) {
  // Go to login page only if not skipping navigation
  if (!skipNavigation) {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    await page.goto(baseUrl);
  }

  // Get credentials from environment variables or fallback to file
  const email = process.env.TEST_USER_EMAIL || credentials.email;
  const password = process.env.TEST_USER_PASSWORD || credentials.password;

  console.log(`Logging in with email: ${email.substring(0, 3)}...`);

  // Wait for page to load
  await page.waitForLoadState('networkidle');

  // Fill login form
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);

  // Submit form
  await page.click('button[type="submit"]');

  // Wait for navigation to complete
  await page.waitForSelector(
    'nav, .dashboard, header, .app-container, main, button:has-text("To-Dos")',
    { timeout: 30000 }
  );

  // Verify login success by checking for absence of login form
  await page.waitForSelector('form input[type="email"]', { state: 'hidden', timeout: 10000 });

  console.log('Login successful');
}

/**
 * Logout from the application
 * @param {Page} page - Playwright page object
 */
async function logout(page) {
  // Look for logout button or user menu
  const logoutBtn = page.locator('button:has-text("Logout"), button:has-text("Sign Out")');
  if (await logoutBtn.isVisible()) {
    await logoutBtn.click();
  }

  // Wait for login form to appear
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
}

/**
 * Generate test data with unique ID
 * @param {string} type - Type of data to generate (card, finance, todo, creditCard)
 * @returns {Object} Generated test data
 */
function generateTestData(type) {
  const timestamp = Date.now();
  const id = Math.floor(Math.random() * 10000);

  switch (type) {
    case 'card':
      return {
        name: `${TEST_DATA_PREFIX}Card_${id}`,
        number: '4111111111111111',
        expiry: '12/25',
        cvv: '123',
      };
    case 'creditCard':
      return {
        bankName: `${TEST_DATA_PREFIX}Bank_${id}`,
        lastFour: '1234',
        cardType: 'Visa',
      };
    case 'finance':
      return {
        description: `${TEST_DATA_PREFIX}Finance_${id}`,
        amount: (Math.random() * 1000).toFixed(2),
        category: 'Test',
      };
    case 'todo':
      return {
        title: `${TEST_DATA_PREFIX}Todo_${id}`,
        description: 'Test todo item',
        dueDate: new Date().toISOString().split('T')[0],
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
  try {
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
        const deleteBtn = item.locator(
          'xpath=./ancestor::*[position()<=3]//button[contains(@class, "delete") or contains(text(), "Delete") or contains(text(), "Remove") or contains(@title, "Delete")]'
        );

        if (await deleteBtn.isVisible()) {
          await deleteBtn.click();

          // Confirm deletion if needed
          const confirmBtn = page.locator(
            'button:has-text("Confirm"), button:has-text("Yes"), button:has-text("OK")'
          );
          if (await confirmBtn.isVisible()) {
            await confirmBtn.click();
          }

          await page.waitForTimeout(500);
        }
      }
    }
  } catch (err) {
    console.log(`Cleanup failed: ${err.message}`);
  }
}

/**
 * Wait for element with retry logic
 * @param {Page} page - Playwright page object
 * @param {string} selector - Element selector
 * @param {Object} options - Wait options
 */
async function waitForElement(page, selector, options = {}) {
  const { timeout = 10000, retries = 3 } = options;

  for (let i = 0; i < retries; i++) {
    try {
      await page.waitForSelector(selector, { timeout });
      return;
    } catch (err) {
      if (i === retries - 1) throw err;
      await page.waitForTimeout(1000);
    }
  }
}

module.exports = {
  login,
  logout,
  generateTestData,
  cleanupTestData,
  waitForElement,
  TEST_DATA_PREFIX,
};
