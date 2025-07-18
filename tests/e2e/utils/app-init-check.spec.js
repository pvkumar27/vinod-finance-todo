/**
 * App initialization check
 *
 * This test verifies that the React app initializes properly.
 */
const { test, expect } = require('@playwright/test');

test('React app initializes properly', async ({ page }) => {
  // Log environment variables
  console.log('Environment variables:');
  console.log(`BASE_URL: ${process.env.BASE_URL || 'not set'}`);
  console.log(`REACT_APP_SUPABASE_URL defined: ${!!process.env.REACT_APP_SUPABASE_URL}`);
  console.log(`REACT_APP_SUPABASE_ANON_KEY defined: ${!!process.env.REACT_APP_SUPABASE_ANON_KEY}`);

  // Go to the base URL
  await page.goto(process.env.BASE_URL || 'http://localhost:3000', { timeout: 30000 });

  // Take screenshot
  await page.screenshot({ path: 'tests/reports/app-init.png' });

  // Wait for root to have content (React app initialized)
  try {
    // Wait for any content inside root
    await page.waitForSelector('div#root *', { timeout: 10000 });
    console.log('React app initialized successfully!');
  } catch (e) {
    console.log('React app failed to initialize');

    // Get page content for debugging
    const content = await page.content();
    console.log(`Page HTML length: ${content.length}`);

    // Check if root div exists but is empty
    const rootExists = (await page.locator('div#root').count()) > 0;
    console.log(`Root div exists: ${rootExists}`);

    // Check console errors
    const consoleMessages = [];
    page.on('console', msg => consoleMessages.push(`${msg.type()}: ${msg.text()}`));

    // Log console messages
    console.log('Browser console messages:');
    consoleMessages.forEach(msg => console.log(msg));

    throw new Error('React app failed to initialize - root div is empty');
  }

  // Verify that React has mounted something
  const rootChildrenCount = await page.locator('div#root > *').count();
  expect(rootChildrenCount).toBeGreaterThan(0);
});
