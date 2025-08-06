describe('Authentication', () => {
  it('should login successfully', () => {
    cy.login();
    cy.get('nav').should('be.visible');
  });

  it('should navigate to To-Dos tab', () => {
    cy.login();
    cy.navigateToTab('To-Dos');
    cy.get('h2:contains("To-Do")').should('be.visible');
  });

  it('should navigate to Credit tab', () => {
    cy.login();
    cy.navigateToTab('Credit');
    cy.get('h2:contains("Credit")').should('be.visible');
  });
  
  it('should handle invalid credentials', () => {
    cy.visit('/');
    cy.get('input[type="email"]').type('invalid@example.com');
    cy.get('input[type="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    cy.get('input[type="email"]').should('be.visible');
  });
});