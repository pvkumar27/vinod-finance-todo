// Custom commands for authentication
Cypress.Commands.add('login', (email, password) => {
  const testEmail = email || Cypress.env('TEST_USER_EMAIL') || 'pvkumar27@yahoo.com';
  const testPassword = password || Cypress.env('TEST_USER_PASSWORD') || 'Test1234';

  cy.visit('/', { timeout: 30000 });

  // Wait for page to be fully loaded
  cy.window().should('exist');
  cy.document().should('exist');
  cy.get('body').should('be.visible');

  // Wait for form elements with longer timeout
  cy.get('input[type="email"]', { timeout: 15000 }).should('be.visible').clear();
  cy.get('input[type="email"]').type(testEmail, { delay: 100 });

  cy.get('input[type="password"]').should('be.visible').clear();
  cy.get('input[type="password"]').type(testPassword, { delay: 100 });

  cy.get('button[type="submit"]').should('be.visible').click();

  // Wait for navigation to complete - app loads on chat tab by default
  cy.get('body', { timeout: 20000 }).should('be.visible');

  // Navigate to todos tab for tests
  cy.get('button[aria-label="Navigate to Todos"]').click();
  cy.get('[data-cy="todo-manager-heading"]', { timeout: 10000 }).should('be.visible');
});

// Custom command for cleanup
Cypress.Commands.add('cleanupTestData', () => {
  // Clean up test todos
  cy.get('body').then($body => {
    // Look for todos containing Test_E2E_
    if ($body.find('span:contains("Test_E2E_")').length > 0) {
      cy.get('span:contains("Test_E2E_")', { timeout: 5000 }).each($el => {
        cy.wrap($el).parents('.group').find('button[aria-label*="Delete"]').click({ force: true });
      });
    }

    // Clean up test credit cards containing Chase (from tests)
    if ($body.find('h3:contains("Chase 1234")').length > 0) {
      cy.get('h3:contains("Chase 1234")', { timeout: 5000 }).each($el => {
        cy.wrap($el).parents('.rounded-lg').find('button').last().click({ force: true });
        // Confirm deletion
        cy.on('window:confirm', () => true);
      });
    }
  });
});

// Custom command for generating test data
Cypress.Commands.add('generateTestData', type => {
  const timestamp = Date.now();
  const id = Math.floor(Math.random() * 10000);

  const data = {
    todo: {
      title: `Test_E2E_Todo_${id}_${timestamp}`,
      description: 'Test todo item',
      dueDate: new Date().toISOString().split('T')[0],
    },
    creditCard: {
      bankName: `Test_E2E_Bank_${id}`,
      lastFour: '1234',
    },
  };

  return data[type] || { id: `Test_E2E_${id}` };
});
