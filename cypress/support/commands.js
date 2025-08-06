// Custom commands for FinTask E2E testing

const TEST_DATA_PREFIX = 'Test_E2E_';

/**
 * Login command
 */
Cypress.Commands.add('login', () => {
  const email = Cypress.env('TEST_USER_EMAIL') || 'pvkumar27@yahoo.com';
  const password = Cypress.env('TEST_USER_PASSWORD') || 'Test1234';
  
  cy.visit('/');
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();
  
  // Wait for successful login
  cy.get('nav').should('be.visible');
  cy.get('input[type="email"]').should('not.exist');
});

/**
 * Generate test data
 */
Cypress.Commands.add('generateTestData', (type) => {
  const timestamp = Date.now();
  const id = Math.floor(Math.random() * 10000);
  
  const data = {
    card: {
      name: `${TEST_DATA_PREFIX}Card_${id}`,
      bank: 'Test Bank',
      last4: '1234',
      creditLimit: '5000'
    },
    todo: {
      title: `${TEST_DATA_PREFIX}Todo_${id}`,
      description: 'AI-generated test task',
      priority: 'medium'
    },
    expense: {
      description: `${TEST_DATA_PREFIX}Expense_${id}`,
      amount: '99.99',
      category: 'Test Category'
    }
  };
  
  return cy.wrap(data[type] || { id: `${TEST_DATA_PREFIX}${id}` });
});

/**
 * Cleanup test data
 */
Cypress.Commands.add('cleanupTestData', () => {
  // Find and delete all test items
  cy.get('body').then($body => {
    if ($body.find(`[data-testid*="${TEST_DATA_PREFIX}"], :contains("${TEST_DATA_PREFIX}")`).length > 0) {
      cy.get(`[data-testid*="${TEST_DATA_PREFIX}"], :contains("${TEST_DATA_PREFIX}")`)
        .each($el => {
          // Find delete button in the same container
          cy.wrap($el)
            .parents('[data-testid], .card, .item, tr')
            .find('button:contains("Delete"), button[aria-label*="delete"], .delete-btn')
            .first()
            .click({ force: true });
          
          // Handle confirmation if it appears
          cy.get('body').then($body => {
            if ($body.find('button:contains("Confirm"), button:contains("Yes")').length > 0) {
              cy.get('button:contains("Confirm"), button:contains("Yes")').click();
            }
          });
        });
    }
  });
});

/**
 * Navigate to tab
 */
Cypress.Commands.add('navigateToTab', (tabName) => {
  cy.get(`button:contains("${tabName}")`).click();
  cy.wait(500);
});

/**
 * Test AI assistant query
 */
Cypress.Commands.add('testAIQuery', (query, expectedResponse) => {
  cy.get('[data-testid="ai-input"], input[placeholder*="Ask"], .natural-input input')
    .type(query);
  cy.get('button:contains("Send"), button[type="submit"]').click();
  
  if (expectedResponse) {
    cy.get('[data-testid="ai-response"], .ai-response, .response-container')
      .should('contain', expectedResponse);
  }
});

/**
 * Mobile viewport
 */
Cypress.Commands.add('setMobileViewport', () => {
  cy.viewport(375, 667);
});

/**
 * Tablet viewport  
 */
Cypress.Commands.add('setTabletViewport', () => {
  cy.viewport(768, 1024);
});