/**
 * Root Playwright configuration
 * 
 * This file points to the main configuration in the tests/config directory.
 */
const { defineConfig } = require('@playwright/test');

// Use the standard config from the /tests/config directory
module.exports = require('./tests/config/playwright.config.js');