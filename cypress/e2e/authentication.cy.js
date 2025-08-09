/**
 * Authentication E2E Tests - Cypress Implementation
 */

describe('Authentication', () => {
  it('should login successfully and access main application', () => {
    cy.login();
    
    // Verify main app elements are visible
    cy.get('[data-cy="todo-manager-heading"]').should('be.visible');
    cy.get('[data-cy="nav-todos-tab"]').should('be.visible');
    cy.get('[data-cy="nav-cards-tab"]').should('be.visible');
  });

  it('should maintain session across page refreshes', () => {
    cy.login();
    
    // Refresh page
    cy.reload();
    
    // Should still be logged in
    cy.get('[data-cy="todo-manager-heading"]').should('be.visible');
  });
});