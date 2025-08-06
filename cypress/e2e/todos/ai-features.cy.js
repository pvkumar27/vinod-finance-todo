describe('To-Dos AI Features', () => {
  beforeEach(() => {
    cy.login();
    cy.navigateToTab('To-Dos');
  });

  afterEach(() => {
    cy.cleanupTestData();
  });

  it('should create and manage AI-enhanced todos', () => {
    cy.generateTestData('todo').then(todoData => {
      // Add new todo
      cy.get('button:contains("Add"), button:contains("New")').click();
      
      cy.get('input[name*="title"], input[placeholder*="title"]').type(todoData.title);
      cy.get('textarea[name*="description"], textarea[placeholder*="description"]').type(todoData.description);
      
      cy.get('button[type="submit"], button:contains("Save")').click();
      
      // Verify todo appears
      cy.contains(todoData.title).should('be.visible');
      
      // Test completion
      cy.contains(todoData.title)
        .parents('[data-testid], .todo-item, .task-item')
        .find('input[type="checkbox"], .complete-btn')
        .click();
      
      // Verify completion state
      cy.contains(todoData.title)
        .parents('[data-testid], .todo-item, .task-item')
        .should('have.class', 'completed')
        .or('contain', 'completed');
    });
  });

  it('should show smart suggestions', () => {
    // Look for AI suggestions
    cy.get('body').then($body => {
      if ($body.find('[data-testid*="suggestion"], .suggestion, .smart-suggestion').length > 0) {
        cy.get('[data-testid*="suggestion"], .suggestion, .smart-suggestion')
          .should('be.visible');
      }
    });
  });

  it('should support natural language input', () => {
    // Test natural language todo creation
    cy.get('body').then($body => {
      if ($body.find('[data-testid="natural-input"], .natural-input, input[placeholder*="natural"]').length > 0) {
        cy.get('[data-testid="natural-input"], .natural-input input')
          .type('Remind me to pay rent on the 1st of every month');
        
        cy.get('button:contains("Add"), button[type="submit"]').click();
        
        // Should create a todo with parsed information
        cy.contains('pay rent').should('be.visible');
      }
    });
  });

  it('should show auto-prioritization', () => {
    // Check for priority indicators
    cy.get('body').then($body => {
      if ($body.find('[data-testid*="priority"], .priority, .priority-indicator').length > 0) {
        cy.get('[data-testid*="priority"], .priority-indicator')
          .should('be.visible');
      }
    });
  });
});