/**
 * Playwright configuration for E2E tests
 *
 * This configuration targets the production environment and includes
 * settings for different viewports, screenshots, and reporting.
 */
const { defineConfig, devices } = require('@playwright/test');
const path = require('path');

module.exports = defineConfig({
  // Test directory
  testDir: path.join(__dirname, '../e2e'),

  // Maximum time one test can run
  timeout: 30 * 1000,

  // Run tests in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Limit parallel workers on CI, use default locally
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use
  reporter: [['html', { outputFolder: path.join(__dirname, '../reports') }], ['list']],

  // Output directory for test artifacts
  outputDir: path.join(__dirname, '../test-results'),

  // Global setup and teardown
  // globalSetup: path.join(__dirname, 'global-setup.js'),
  // globalTeardown: path.join(__dirname, 'global-teardown.js'),

  // Shared settings for all the projects below
  use: {
    // Base URL for all tests - Default to localhost for all environments
    baseURL: process.env.BASE_URL || 'http://localhost:3000',

    // Navigation timeout - increase for CI environments
    navigationTimeout: 30000,

    // Wait for page load state
    waitForNavigation: 'networkidle',

    // Run in headless mode by default
    headless: true,

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Take screenshot only on failure
    screenshot: 'only-on-failure',

    // Record video for all tests
    video: 'on',

    // Browser viewport size
    viewport: { width: 1280, height: 720 },

    // Ignore certain console errors
    ignoreConsoleErrors: true,
  },

  // Configure projects for different environments
  projects: [
    {
      name: 'chromium-mobile',
      use: {
        ...devices['iPhone 12'],
        viewport: { width: 375, height: 667 },
        headless: true,
      },
    },
    {
      name: 'chromium-tablet',
      use: {
        ...devices['iPad'],
        viewport: { width: 768, height: 1024 },
        headless: true,
      },
    },
    {
      name: 'chromium-desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
        headless: true,
      },
    },
  ],
});
