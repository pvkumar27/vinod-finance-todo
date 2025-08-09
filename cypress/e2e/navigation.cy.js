/**
 * Navigation E2E Tests - Cypress Implementation
 */

describe('Navigation', () => {
  beforeEach(() => {
    cy.login();
  });

  it('should navigate between tabs', () => {
    // Start on To-Dos tab (default)
    cy.get('[data-cy="todo-manager-heading"]').should('be.visible');

    // Navigate to Credit Cards
    cy.get('[data-cy="nav-cards-tab"]').click();
    cy.get('[data-cy="credit-cards-heading"]').should('be.visible');

    // Navigate back to To-Dos
    cy.get('[data-cy="nav-todos-tab"]').click();
    cy.get('[data-cy="todo-manager-heading"]').should('be.visible');
  });

  it('should show correct content for each tab', () => {
    // To-Dos tab content
    cy.get('[data-cy="nav-todos-tab"]').click();
    cy.get('[data-cy="task-input-field"]').should('be.visible');
    cy.get('[data-cy="task-add-button"]').should('be.visible');

    // Credit Cards tab content
    cy.get('[data-cy="nav-cards-tab"]').click();
    cy.get('[data-cy="card-add-button"]').should('be.visible');
    cy.get('[data-cy="card-search-input"]').should('be.visible');
  });
});