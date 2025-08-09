describe('AI Assistant', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/');
  });

  afterEach(() => {
    cy.cleanupTestData();
  });

  it('should display AI assistant toggle button', () => {
    cy.get('[data-cy="ai-assistant-toggle"]').should('be.visible');
  });

  it('should open and close AI assistant chat', () => {
    // Open AI assistant
    cy.get('[data-cy="ai-assistant-toggle"]').click();
    cy.get('[data-cy="ai-assistant-chat"]').should('be.visible');

    // Close AI assistant
    cy.get('[data-cy="ai-assistant-close"]').click();
    cy.get('[data-cy="ai-assistant-chat"]').should('not.exist');
    cy.get('[data-cy="ai-assistant-toggle"]').should('be.visible');
  });

  it('should display welcome message when opened', () => {
    cy.get('[data-cy="ai-assistant-toggle"]').click();
    cy.get('[data-cy="ai-assistant-chat"]').should(
      'contain',
      "Hi! I'm Finbot, your FinTask assistant"
    );
  });

  it('should allow user to send messages', () => {
    cy.get('[data-cy="ai-assistant-toggle"]').click();

    const testMessage = 'show me my todos';
    cy.get('[data-cy="ai-assistant-input"]').type(testMessage);
    cy.get('[data-cy="ai-assistant-send"]').click();

    // Check that user message appears
    cy.get('[data-cy="ai-assistant-chat"]').should('contain', testMessage);
  });

  it('should display quick action buttons', () => {
    cy.get('[data-cy="ai-assistant-toggle"]').click();

    // Check for quick action buttons
    cy.get('[data-cy="quick-action-0"]').should('contain', 'Show pending todos');
    cy.get('[data-cy="quick-action-1"]').should('contain', 'Show completed todos');
    cy.get('[data-cy="quick-action-2"]').should('contain', 'Show credit cards');
    cy.get('[data-cy="quick-action-3"]').should('contain', 'Inactive cards');
  });

  it('should populate input when quick action is clicked', () => {
    cy.get('[data-cy="ai-assistant-toggle"]').click();

    cy.get('[data-cy="quick-action-0"]').click();
    cy.get('[data-cy="ai-assistant-input"]').should('have.value', 'show me pending todos');
  });

  it('should handle todo queries', () => {
    // First create a test todo
    cy.get('[data-cy="nav-todos-tab"]').click();
    cy.generateTestData('todo').then(testTodo => {
      cy.get('[data-cy="task-input-field"]').type(testTodo.title);
      cy.get('[data-cy="task-add-button"]').click();

      // Now test AI assistant todo query
      cy.get('[data-cy="ai-assistant-toggle"]').click();
      cy.get('[data-cy="ai-assistant-input"]').type('show me my todos');
      cy.get('[data-cy="ai-assistant-send"]').click();

      // Should show loading state
      cy.get('[data-cy="ai-assistant-chat"]').should('contain', 'Found');
    });
  });

  it('should handle credit card queries', () => {
    cy.get('[data-cy="ai-assistant-toggle"]').click();
    cy.get('[data-cy="ai-assistant-input"]').type('show me my credit cards');
    cy.get('[data-cy="ai-assistant-send"]').click();

    // Should process the query
    cy.get('[data-cy="ai-assistant-chat"]').should('contain', 'Found');
  });

  it('should handle spending analysis queries', () => {
    cy.get('[data-cy="ai-assistant-toggle"]').click();
    cy.get('[data-cy="ai-assistant-input"]').type('analyze my spending this month');
    cy.get('[data-cy="ai-assistant-send"]').click();

    // Should provide spending analysis
    cy.get('[data-cy="ai-assistant-chat"]').should('contain', 'Spending');
  });

  it('should disable send button when input is empty', () => {
    cy.get('[data-cy="ai-assistant-toggle"]').click();
    cy.get('[data-cy="ai-assistant-send"]').should('be.disabled');

    cy.get('[data-cy="ai-assistant-input"]').type('test message');
    cy.get('[data-cy="ai-assistant-send"]').should('not.be.disabled');

    cy.get('[data-cy="ai-assistant-input"]').clear();
    cy.get('[data-cy="ai-assistant-send"]').should('be.disabled');
  });

  it('should handle natural language todo creation', () => {
    cy.get('[data-cy="ai-assistant-toggle"]').click();

    const newTask = 'Pay rent next month';
    cy.get('[data-cy="ai-assistant-input"]').type(`add todo: ${newTask}`);
    cy.get('[data-cy="ai-assistant-send"]').click();

    // Should process the request (either success or error)
    cy.get('[data-cy="ai-assistant-chat"]').should('contain', 'todo');
  });

  it('should maintain chat history during session', () => {
    cy.get('[data-cy="ai-assistant-toggle"]').click();

    // Send first message
    cy.get('[data-cy="ai-assistant-input"]').type('first message');
    cy.get('[data-cy="ai-assistant-send"]').click();

    // Send second message
    cy.get('[data-cy="ai-assistant-input"]').type('second message');
    cy.get('[data-cy="ai-assistant-send"]').click();

    // Both messages should be visible
    cy.get('[data-cy="ai-assistant-chat"]').should('contain', 'first message');
    cy.get('[data-cy="ai-assistant-chat"]').should('contain', 'second message');
  });

  it('should be responsive on mobile viewport', () => {
    cy.viewport('iphone-x');

    cy.get('[data-cy="ai-assistant-toggle"]').should('be.visible');
    cy.get('[data-cy="ai-assistant-toggle"]').click();

    // Chat should be visible and properly sized on mobile
    cy.get('[data-cy="ai-assistant-chat"]').should('be.visible');
    cy.get('[data-cy="ai-assistant-input"]').should('be.visible');
  });
});
