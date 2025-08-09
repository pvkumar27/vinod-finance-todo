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
      cy.get('[data-cy="task-input-field"]').clear().type(testData.title, { delay: 50 });
      cy.get('[data-cy="task-add-button"]').click();

      // Verify todo appears
      cy.contains(testData.title).should('be.visible');

      // Delete todo
      cy.contains(testData.title).parent().parent().find('button[aria-label*="Delete"]').click();

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

      // Fill form - wait for form to load
      cy.contains('Bank Name').parent().find('select').select('Chase');
      cy.get('input[maxlength="4"]').clear().type(testData.lastFour, { delay: 50 });
      cy.contains('Card Holder').parent().find('select').select('Vinod');

      // Submit
      cy.get('button[type="submit"]').click();

      // Verify card appears
      cy.contains('Chase').should('be.visible');

      // Delete card
      cy.contains('Chase').parents('.rounded-lg').find('button').last().click();

      // Confirm deletion
      cy.on('window:confirm', () => true);

      // Wait for deletion to process and reload
      cy.wait(1000);
      cy.reload();

      // Verify card is gone
      cy.contains('Chase 1234').should('not.exist');
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
