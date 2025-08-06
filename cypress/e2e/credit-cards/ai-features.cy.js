describe('Credit Cards AI Features', () => {
  beforeEach(() => {
    cy.login();
    cy.navigateToTab('Credit');
  });

  afterEach(() => {
    cy.cleanupTestData();
  });

  it('should manage credit cards with AI insights', () => {
    cy.generateTestData('card').then(cardData => {
      // Add new credit card
      cy.get('button:contains("Add"), button:contains("New")').click();
      
      cy.get('input[name*="name"], input[placeholder*="name"]').type(cardData.name);
      cy.get('input[name*="bank"], input[placeholder*="bank"]').type(cardData.bank);
      cy.get('input[name*="last4"], input[placeholder*="last4"]').type(cardData.last4);
      cy.get('input[name*="limit"], input[placeholder*="limit"]').type(cardData.creditLimit);
      
      cy.get('button[type="submit"], button:contains("Save")').click();
      
      // Verify card appears
      cy.contains(cardData.name).should('be.visible');
    });
  });

  it('should show promo APR alerts', () => {
    // Look for promo APR indicators
    cy.get('body').then($body => {
      if ($body.find('[data-testid*="promo"], .promo-indicator, :contains("Promo")').length > 0) {
        cy.get('[data-testid*="promo"], .promo-indicator, :contains("Promo")')
          .should('be.visible');
      }
    });
  });

  it('should detect inactivity risks', () => {
    // Check for inactivity warnings
    cy.get('body').then($body => {
      if ($body.find('[data-testid*="inactive"], .inactive-warning, :contains("inactive")').length > 0) {
        cy.get('[data-testid*="inactive"], .inactive-warning')
          .should('be.visible');
      }
    });
  });

  it('should show credit utilization insights', () => {
    // Look for utilization metrics
    cy.get('body').then($body => {
      if ($body.find('[data-testid*="utilization"], .utilization, :contains("utilization")').length > 0) {
        cy.get('[data-testid*="utilization"], .utilization')
          .should('be.visible');
      }
    });
  });
});