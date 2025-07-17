const { test, expect } = require('@playwright/test');
const { login } = require('./test-helpers');

test.describe('Navigation Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await login(page);
  });

  test('navigate between all tabs', async ({ page }) => {
    // Find all tab buttons
    const tabButtons = page.locator('nav button');
    const count = await tabButtons.count();
    
    // Click each tab and verify navigation
    for (let i = 0; i < count; i++) {
      const button = tabButtons.nth(i);
      const buttonText = await button.textContent();
      
      await button.click();
      await page.waitForTimeout(1000);
      
      // Take screenshot of each tab
      await page.screenshot({ path: `tab-${i}-${buttonText.trim().toLowerCase().replace(' ', '-')}.png` });
      
      // Verify active tab indicator
      const isActive = await button.evaluate(el => 
        el.classList.contains('border-primary-500') || 
        el.classList.contains('bg-primary-50') ||
        el.classList.contains('text-primary-600') ||
        el.getAttribute('aria-selected') === 'true'
      );
      
      expect(isActive).toBeTruthy();
    }
  });

  test('verify interactive dashboards', async ({ page }) => {
    // Navigate through tabs and check for interactive elements
    const tabButtons = page.locator('nav button');
    const count = await tabButtons.count();
    
    for (let i = 0; i < count; i++) {
      await tabButtons.nth(i).click();
      await page.waitForTimeout(1000);
      
      // Check for interactive elements
      const buttons = page.locator('button:not(nav button)');
      const inputs = page.locator('input, select, textarea');
      
      // Verify interactive elements are present
      const buttonCount = await buttons.count();
      const inputCount = await inputs.count();
      
      expect(buttonCount + inputCount).toBeGreaterThan(0);
    }
  });

  test('verify version info', async ({ page }) => {
    // Look for version info in footer or about section
    const footer = page.locator('footer');
    if (await footer.isVisible()) {
      const footerText = await footer.textContent();
      
      // Check for version pattern (v1.2.3 or similar)
      const hasVersion = /v\d+\.\d+\.\d+/.test(footerText);
      expect(hasVersion).toBeTruthy();
    } else {
      // Try to find version elsewhere
      const versionText = page.locator('text=/v\\d+\\.\\d+\\.\\d+/');
      const hasVersion = await versionText.count() > 0;
      
      // If no version found, look for about section
      if (!hasVersion) {
        const aboutButton = page.locator('button:has-text("About"), a:has-text("About")');
        if (await aboutButton.isVisible()) {
          await aboutButton.click();
          await page.waitForTimeout(1000);
          
          const aboutVersionText = page.locator('text=/v\\d+\\.\\d+\\.\\d+/');
          expect(await aboutVersionText.count()).toBeGreaterThan(0);
        }
      }
    }
  });
});