/**
 * Responsive Design tests
 * 
 * Tests the application's responsive behavior across different viewports.
 */
const { test, expect } = require('@playwright/test');
const { login } = require('../../helpers/test-helpers');

test.describe('Responsive Design', () => {
  test('verify responsive design - mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Go to login page
    await page.goto('/');
    
    // Login
    await login(page);
    
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
      }
    }
  });

  test('verify responsive design - tablet', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // Go to login page
    await page.goto('/');
    
    // Login
    await login(page);
    
    // Navigate through tabs
    const tabs = ['To-Dos', 'Credit Cards', 'My Finances'];
    
    for (const tab of tabs) {
      const tabButton = page.locator(`button:has-text("${tab}")`);
      if (await tabButton.isVisible()) {
        await tabButton.click();
        await page.waitForTimeout(1000);
      }
    }
  });

  test('verify responsive design - desktop', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 });
    
    // Go to login page
    await page.goto('/');
    
    // Login
    await login(page);
    
    // Navigate through tabs
    const tabs = ['To-Dos', 'Credit Cards', 'My Finances'];
    
    for (const tab of tabs) {
      const tabButton = page.locator(`button:has-text("${tab}")`);
      if (await tabButton.isVisible()) {
        await tabButton.click();
        await page.waitForTimeout(1000);
      }
    }
  });
});