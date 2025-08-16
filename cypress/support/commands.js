// Custom commands for authentication
Cypress.Commands.add('login', (email, password) => {
  const testEmail = email || Cypress.env('TEST_USER_EMAIL') || 'pvkumar27@yahoo.com';
  const testPassword = password || Cypress.env('TEST_USER_PASSWORD') || 'Test1234';

  cy.visit('/', { timeout: 30000 });

  // Wait for page to be fully loaded
  cy.window().should('exist');
  cy.document().should('exist');
  cy.get('body').should('be.visible');

  // Wait for auth form to be stable
  cy.wait(1000);

  // Handle email input with retry logic
  cy.get('input[type="email"]', { timeout: 15000 })
    .should('be.visible')
    .then($input => {
      cy.wrap($input).clear({ force: true }).type(testEmail, { delay: 50 });
    });

  // Handle password input with retry logic
  cy.get('input[type="password"]')
    .should('be.visible')
    .then($input => {
      cy.wrap($input).clear({ force: true }).type(testPassword, { delay: 50 });
    });

  // Submit form
  cy.get('button[type="submit"]').should('be.visible').click();

  // Wait for navigation to complete - app loads on chat tab by default
  cy.get('body', { timeout: 20000 }).should('be.visible');

  // Navigate to todos tab for tests
  cy.get('button[aria-label="Navigate to Todos"]', { timeout: 10000 }).click();
  cy.get('[data-cy="todo-manager-heading"]', { timeout: 10000 }).should('be.visible');
});

// Custom command for cleanup
Cypress.Commands.add('cleanupTestData', () => {
  // Clean up test todos
  cy.get('body').then($body => {
    if ($body.text().includes('Test_E2E_')) {
      cy.get('*')
        .contains('Test_E2E_')
        .each($el => {
          cy.wrap($el)
            .closest('.group')
            .find('button[aria-label*="Delete"]')
            .click({ force: true });
        });
    }

    // Clean up test credit cards containing Chase (from tests)
    if ($body.text().includes('Chase 1234')) {
      cy.get('*')
        .contains('Chase 1234')
        .each($el => {
          cy.wrap($el).closest('div').find('button').last().click({ force: true });
          cy.window().then(win => cy.stub(win, 'confirm').returns(true));
        });
    }
  });
});

// Custom command for generating test data
Cypress.Commands.add('generateTestData', type => {
  const timestamp = Date.now();
  const id = timestamp % 10000; // Use timestamp-based ID instead of Math.random()

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
