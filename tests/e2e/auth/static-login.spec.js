/**
 * Static login test
 *
 * Tests the login form using static HTML (no React/Supabase)
 */
const { test, expect } = require('@playwright/test');

test('should find login form with JavaScript enabled', async ({ page }) => {
  // Go to login page
  await page.goto(process.env.BASE_URL || 'http://localhost:3000', { timeout: 30000 });

  // Wait for JavaScript to execute
  await page.waitForTimeout(1000);

  // Take screenshot
  await page.screenshot({ path: 'tests/reports/static-login.png' });

  // Wait for form to be created by JavaScript
  await page.waitForSelector('form', { timeout: 5000 });

  // Verify login form is displayed
  await expect(page.locator('form')).toBeVisible();
  await expect(page.locator('input[type="email"]')).toBeVisible();
  await expect(page.locator('input[type="password"]')).toBeVisible();

  // Fill in form (just for demonstration)
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'password123');

  // Take screenshot after filling
  await page.screenshot({ path: 'tests/reports/static-login-filled.png' });

  // Success - we found the form
  console.log('Successfully found and interacted with login form');
});
