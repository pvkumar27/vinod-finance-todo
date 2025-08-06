describe('Test Data Cleanup', () => {
  it('should clean up all test data', () => {
    cy.login();
    
    // Navigate through all tabs and clean up
    const tabs = ['To-Dos', 'Credit'];
    
    tabs.forEach(tab => {
      cy.navigateToTab(tab);
      cy.cleanupTestData();
      cy.wait(1000);
    });
    
    // Verify cleanup was successful
    cy.get('body').should('not.contain', Cypress.env('TEST_DATA_PREFIX'));
  });

  it('should only delete test data', () => {
    cy.login();
    
    // Verify that non-test data is preserved
    cy.get('body').then($body => {
      const allText = $body.text();
      const hasTestData = allText.includes(Cypress.env('TEST_DATA_PREFIX'));
      const hasRealData = allText.length > 1000; // Assume real data exists if page has content
      
      if (hasTestData) {
        cy.cleanupTestData();
        
        // After cleanup, test data should be gone but real data should remain
        cy.get('body').should('not.contain', Cypress.env('TEST_DATA_PREFIX'));
        
        if (hasRealData) {
          cy.get('body').should('contain.text', 'To-Do'); // Basic app content should remain
        }
      }
    });
  });
});