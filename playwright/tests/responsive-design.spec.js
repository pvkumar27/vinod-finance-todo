const { test, expect } = require('@playwright/test');
const { login } = require('../helpers/test-helpers');

test.describe('Responsive Design Tests', () => {
  test('verify responsive design - mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Go to login page
    await page.goto('/');
    
    // Take screenshot of login page
    await page.screenshot({ path: 'mobile-login.png' });
    
    // Login
    await login(page);
    
    // Take screenshot of app
    await page.screenshot({ path: 'mobile-app.png' });
    
    // Check for mobile navigation
    const mobileNav = page.locator('nav');
    await expect(mobileNav).toBeVisible();
    
    // Navigate through tabs
    const tabs = ['To-Dos', 'Credit Cards', 'My Finances'];
    
    for (const tab of tabs) {
      const tabButton = page.locator(`button:has-text("${tab}")`);
      if (await tabButton.isVisible()) {
        await tabButton.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: `mobile-${tab.toLowerCase().replace(' ', '-')}.png` });
      }
    }
  });

  test('verify responsive design - tablet', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // Go to login page
    await page.goto('/');
    
    // Take screenshot of login page
    await page.screenshot({ path: 'tablet-login.png' });
    
    // Login
    await login(page);
    
    // Take screenshot of app
    await page.screenshot({ path: 'tablet-app.png' });
    
    // Navigate through tabs
    const tabs = ['To-Dos', 'Credit Cards', 'My Finances'];
    
    for (const tab of tabs) {
      const tabButton = page.locator(`button:has-text("${tab}")`);
      if (await tabButton.isVisible()) {
        await tabButton.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: `tablet-${tab.toLowerCase().replace(' ', '-')}.png` });
      }
    }
  });

  test('verify responsive design - desktop', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 });
    
    // Go to login page
    await page.goto('/');
    
    // Take screenshot of login page
    await page.screenshot({ path: 'desktop-login.png' });
    
    // Login
    await login(page);
    
    // Take screenshot of app
    await page.screenshot({ path: 'desktop-app.png' });
    
    // Navigate through tabs
    const tabs = ['To-Dos', 'Credit Cards', 'My Finances'];
    
    for (const tab of tabs) {
      const tabButton = page.locator(`button:has-text("${tab}")`);
      if (await tabButton.isVisible()) {
        await tabButton.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: `desktop-${tab.toLowerCase().replace(' ', '-')}.png` });
      }
    }
  });
});