const { defineConfig, devices } = require('@playwright/test');
const path = require('path');

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  outputDir: path.join(__dirname, 'test-results'),
  use: {
    baseURL: process.env.BASE_URL || 'https://finance-todos.netlify.app',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium-mobile',
      use: { 
        ...devices['iPhone 12'],
        viewport: { width: 375, height: 667 }
      },
    },
    {
      name: 'chromium-tablet',
      use: { 
        ...devices['iPad'],
        viewport: { width: 768, height: 1024 }
      },
    },
    {
      name: 'chromium-desktop',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 }
      },
    },
  ],
});