/**
 * Essential E2E Tests - Cypress Implementation
 * Critical tests for CI/CD pipeline
 */

describe('Essential Application Tests', () => {
  beforeEach(() => {
    cy.login();
  });

  afterEach(() => {
    cy.cleanupTestData();
  });

  it('should login and navigate between main tabs', () => {
    // Verify To-Dos tab (default)
    cy.get('[data-cy="todo-manager-heading"]').should('be.visible');

    // Navigate to Credit Cards
    cy.get('[data-cy="nav-cards-tab"]').click();
    cy.get('[data-cy="credit-cards-heading"]').should('be.visible');

    // Navigate back to To-Dos
    cy.get('[data-cy="nav-todos-tab"]').click();
    cy.get('[data-cy="todo-manager-heading"]').should('be.visible');
  });

  it('should create and delete a todo', () => {
    cy.generateTestData('todo').then(testData => {
      // Create todo
      cy.get('[data-cy="task-input-field"]').type(testData.title);
      cy.get('[data-cy="task-add-button"]').click();

      // Verify todo appears
      cy.contains(testData.title).should('be.visible');

      // Delete todo
      cy.contains(testData.title)
        .parent()
        .parent()
        .find('button[title*="Delete"]')
        .click();

      // Verify todo is gone
      cy.contains(testData.title).should('not.exist');
    });
  });

  it('should create and delete a credit card', () => {
    cy.generateTestData('creditCard').then(testData => {
      // Navigate to Credit Cards
      cy.get('[data-cy="nav-cards-tab"]').click();

      // Create credit card
      cy.get('[data-cy="card-add-button"]').click();

      // Fill form
      cy.get('input[name="bank_name"]').type(testData.bankName);
      cy.get('input[name="last_four_digits"]').type(testData.lastFour);

      // Submit
      cy.get('button[type="submit"]').click();

      // Verify card appears
      cy.contains(testData.bankName).should('be.visible');

      // Delete card
      cy.contains(testData.bankName)
        .parent()
        .parent()
        .find('button[title*="Delete"]')
        .click();

      // Confirm deletion
      cy.on('window:confirm', () => true);

      // Verify card is gone
      cy.contains(testData.bankName).should('not.exist');
    });
  });

  it('should switch view modes', () => {
    // Test To-Dos view modes
    cy.get('[data-cy="view-table-button"]').click();
    cy.get('table').should('be.visible');

    cy.get('[data-cy="view-cards-button"]').click();
    cy.get('[data-cy="task-container"]').should('be.visible');

    // Test Credit Cards view modes
    cy.get('[data-cy="nav-cards-tab"]').click();

    cy.get('[data-cy="view-table-button"]').click();
    cy.get('table').should('be.visible');

    cy.get('[data-cy="view-cards-button"]').click();
    cy.get('[data-cy="card-grid"]').should('be.visible');
  });
});