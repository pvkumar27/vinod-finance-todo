describe('Responsive Design', () => {
  beforeEach(() => {
    cy.login();
  });

  it('should work on mobile devices', () => {
    cy.setMobileViewport();
    
    // Test navigation on mobile
    cy.get('nav').should('be.visible');
    
    // Test tab switching
    cy.navigateToTab('To-Dos');
    cy.get('h2:contains("To-Do")').should('be.visible');
    
    cy.navigateToTab('Credit');
    cy.get('h2:contains("Credit")').should('be.visible');
    
    // Test form interactions
    cy.get('button:contains("Add"), button:contains("New")').first().click();
    cy.get('input, textarea').first().should('be.visible');
  });

  it('should work on tablet devices', () => {
    cy.setTabletViewport();
    
    // Test layout on tablet
    cy.get('nav').should('be.visible');
    
    // Verify content is properly displayed
    cy.navigateToTab('To-Dos');
    cy.get('h2:contains("To-Do")').should('be.visible');
    
    // Test interactions
    cy.get('body').then($body => {
      if ($body.find('button:contains("Add"), button:contains("New")').length > 0) {
        cy.get('button:contains("Add"), button:contains("New")').first().click();
        cy.get('input, textarea').first().should('be.visible');
      }
    });
  });

  it('should maintain functionality across viewports', () => {
    const viewports = [
      { width: 375, height: 667, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1280, height: 720, name: 'desktop' }
    ];

    viewports.forEach(viewport => {
      cy.viewport(viewport.width, viewport.height);
      
      // Test core functionality
      cy.get('nav').should('be.visible');
      cy.navigateToTab('To-Dos');
      cy.get('h2:contains("To-Do")').should('be.visible');
      
      // Test AI features if available
      cy.get('body').then($body => {
        if ($body.find('[data-testid="ai-input"], .ai-input').length > 0) {
          cy.get('[data-testid="ai-input"], .ai-input input').should('be.visible');
        }
      });
    });
  });
});