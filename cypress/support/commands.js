// Custom commands for authentication
Cypress.Commands.add('login', (email, password) => {
  const testEmail = email || Cypress.env('TEST_USER_EMAIL');
  const testPassword = password || Cypress.env('TEST_USER_PASSWORD');
  
  cy.visit('/');
  cy.get('[data-cy="auth-email-input"]', { timeout: 10000 }).type(testEmail);
  cy.get('[data-cy="auth-password-input"]').type(testPassword);
  cy.get('[data-cy="auth-submit-button"]').click();
  
  // Wait for navigation to complete
  cy.get('[data-cy="todo-manager-heading"]', { timeout: 15000 }).should('be.visible');
});

// Custom command for cleanup
Cypress.Commands.add('cleanupTestData', () => {
  // Clean up any test data with Test_E2E_ prefix
  cy.get('body').then($body => {
    if ($body.find('[data-cy*="Test_E2E_"]').length > 0) {
      cy.get('[data-cy*="Test_E2E_"]').each($el => {
        cy.wrap($el).parent().find('[data-cy*="delete"]').click({ force: true });
      });
    }
  });
});

// Custom command for generating test data
Cypress.Commands.add('generateTestData', (type) => {
  const timestamp = Date.now();
  const id = Math.floor(Math.random() * 10000);
  
  const data = {
    todo: {
      title: `Test_E2E_Todo_${id}_${timestamp}`,
      description: 'Test todo item',
      dueDate: new Date().toISOString().split('T')[0]
    },
    creditCard: {
      bankName: `Test_E2E_Bank_${id}`,
      lastFour: '1234'
    }
  };
  
  return data[type] || { id: `Test_E2E_${id}` };
});