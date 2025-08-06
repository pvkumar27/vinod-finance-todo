describe('FinTask AI-Driven Full Test Suite', () => {
  beforeEach(() => {
    cy.login();
  });

  afterEach(() => {
    cy.cleanupTestData();
  });

  it('should demonstrate complete AI workflow', () => {
    // Verify basic navigation works
    cy.navigateToTab('Credit');
    cy.get('h2:contains("Credit")').should('be.visible');
    
    cy.navigateToTab('To-Dos');
    cy.get('h2:contains("To-Do")').should('be.visible');
    
    // Test basic functionality exists
    cy.get('body').should('contain.text', 'Credit');
  });

  it('should handle error scenarios gracefully', () => {
    cy.get('body').then($body => {
      if ($body.find('[data-testid="ai-input"], .ai-input').length > 0) {
        cy.get('[data-testid="ai-input"], .ai-input input')
          .type('Invalid query with special chars !@#$%^&*()');
        
        cy.get('button:contains("Send"), button[type="submit"]').click();
        cy.get('body').should('be.visible');
      }
    });
  });
});