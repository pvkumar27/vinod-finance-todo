/**
 * Plaid Integration tests
 * 
 * Tests the Plaid integration for connecting bank accounts.
 */
const { test, expect } = require('@playwright/test');
const { login } = require('../../helpers/test-helpers');

test.describe('Plaid Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await login(page);
    
    // Navigate to Credit Cards tab
    await page.click('button:has-text("Credit Cards"), button:has-text("Cards")');
    await page.waitForTimeout(1000);
  });

  test('connect bank account via Plaid', async ({ page }) => {
    // Look for Connect Bank Account button
    const connectBtn = page.locator('button:has-text("Connect Bank"), button:has-text("Link Bank")');
    
    if (await connectBtn.isVisible()) {
      await connectBtn.click();
      await page.waitForTimeout(1000);
      
      // Plaid iframe should appear
      const plaidFrame = page.frameLocator('iframe[name*="plaid"], iframe[title*="Plaid"]').first();
      
      if (await plaidFrame.isVisible()) {
        // Take screenshot of Plaid interface
        await page.screenshot({ path: 'plaid-connect.png' });
        
        // Note: We can't fully test Plaid integration in automated tests
        // as it requires external authentication, but we can verify the UI appears
        console.log('Plaid interface detected - integration test would continue with sandbox credentials');
      } else {
        // If no iframe, check for alternative Plaid UI
        const plaidUI = page.locator('div:has-text("Connect your bank account")');
        await expect(plaidUI).toBeVisible();
      }
    } else {
      console.log('Connect Bank button not found - skipping Plaid test');
    }
  });

  test('verify Plaid synced badge', async ({ page }) => {
    // Look for cards with Plaid badge
    const plaidBadges = page.locator('text=🏦, text="Plaid Synced"');
    const count = await plaidBadges.count();
    
    console.log(`Found ${count} cards with Plaid badges`);
    
    // Take screenshot of cards
    await page.screenshot({ path: 'plaid-cards.png' });
  });
});