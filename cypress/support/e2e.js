// Import commands
import './commands';

// Global configuration
Cypress.on('uncaught:exception', (err, runnable) => {
  // Prevent Cypress from failing on uncaught exceptions
  // that are not critical to test functionality
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false;
  }
  if (err.message.includes('Non-Error promise rejection captured')) {
    return false;
  }
  return true;
});

// Set viewport for mobile testing
beforeEach(() => {
  // Default to desktop, but can be overridden in individual tests
  cy.viewport(1280, 720);
});