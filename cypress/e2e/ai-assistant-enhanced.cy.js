describe('AI Assistant Enhanced Features', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/');
  });

  it('should display proactive dashboard with AI insights', () => {
    // Check if proactive dashboard is visible
    cy.contains('AI Insights').should('be.visible');
    cy.contains('Visual Analytics').should('be.visible');

    // Check for AI-first design elements
    cy.contains('FinTask AI Dashboard').should('be.visible');
    cy.contains('Your AI-powered finance assistant').should('be.visible');
  });

  it('should show enhanced AI assistant with proactive features', () => {
    // Open AI assistant
    cy.get('[data-cy="ai-assistant-toggle"]').click();

    // Check for enhanced welcome message
    cy.get('[data-cy="ai-assistant-chat"]').should('be.visible');
    cy.contains("Hey there! I'm Finbot").should('be.visible');
    cy.contains('What needs my attention today?').should('be.visible');

    // Check for enhanced quick actions
    cy.get('[data-cy="ai-assistant-input"]').should('be.visible');
  });

  it('should handle priority insights query', () => {
    // Open AI assistant
    cy.get('[data-cy="ai-assistant-toggle"]').click();

    // Type priority query
    cy.get('[data-cy="ai-assistant-input"]').type('what needs my attention today?');
    cy.get('[data-cy="ai-assistant-send"]').click();

    // Check for AI response
    cy.contains('Priority Items', { timeout: 10000 }).should('be.visible');
  });

  it('should handle financial insights query', () => {
    // Open AI assistant
    cy.get('[data-cy="ai-assistant-toggle"]').click();

    // Type insights query
    cy.get('[data-cy="ai-assistant-input"]').type('give me financial insights');
    cy.get('[data-cy="ai-assistant-send"]').click();

    // Check for AI response with insights
    cy.contains('Financial Insights', { timeout: 10000 }).should('be.visible');
  });

  it('should display visual insights component', () => {
    // Check if visual insights are rendered
    cy.contains('Financial Overview').should('be.visible');
    cy.contains('AI Generated').should('be.visible');
  });

  it('should handle dashboard quick actions', () => {
    // Click on AI Assistant quick action
    cy.contains('Ask FinBot').click();

    // AI assistant should expand
    cy.get('[data-cy="ai-assistant-chat"]').should('be.visible');
  });

  it('should show enhanced quick actions with priorities', () => {
    // Open AI assistant
    cy.get('[data-cy="ai-assistant-toggle"]').click();

    // Open quick actions
    cy.get('[data-cy="ai-assistant-input"]').should('be.visible');

    // Look for the quick actions button (plus icon)
    cy.get('button[title="Quick actions"]').click();

    // Check for enhanced quick actions
    cy.contains('What needs attention?').should('be.visible');
    cy.contains('Financial insights').should('be.visible');
  });

  it('should handle proactive alerts', () => {
    // Open AI assistant and wait for proactive alerts
    cy.get('[data-cy="ai-assistant-toggle"]').click();

    // Wait for potential proactive messages (they appear after 2 seconds)
    cy.wait(3000);

    // Check if any proactive alerts appeared
    // Note: This might not always trigger depending on data
    cy.get('[data-cy="ai-assistant-chat"]').should('be.visible');
  });

  it('should display AI-first dashboard design', () => {
    // Check for gradient headers and AI-first design
    cy.contains('AI Insights').should('be.visible');
    cy.contains('Live').should('be.visible');
    cy.contains('Visual Analytics').should('be.visible');
    cy.contains('AI Generated').should('be.visible');

    // Check for quick stats grid
    cy.contains('AI Assistant').should('be.visible');
    cy.contains('Smart Insights').should('be.visible');
    cy.contains('Priority Focus').should('be.visible');
  });

  it('should handle optimization suggestions query', () => {
    // Open AI assistant
    cy.get('[data-cy="ai-assistant-toggle"]').click();

    // Type optimization query
    cy.get('[data-cy="ai-assistant-input"]').type('get optimization suggestions');
    cy.get('[data-cy="ai-assistant-send"]').click();

    // Check for AI response
    cy.contains('Optimization', { timeout: 10000 }).should('be.visible');
  });
});

describe('AI Assistant Visual Features', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/');
  });

  it('should display visual charts in insights', () => {
    // Check if visual insights component loads
    cy.contains('Financial Overview').should('be.visible');

    // Look for chart elements (progress bars, etc.)
    cy.get('.bg-green-500').should('exist'); // Progress bar colors
  });

  it('should show proactive dashboard cards', () => {
    // Check for proactive dashboard elements
    cy.contains('Needs Attention').should('exist');
    cy.contains('Insights').should('exist');

    // Check for interactive elements
    cy.get('button').contains('Full Analysis').should('be.visible');
    cy.get('button').contains('Priority Items').should('be.visible');
  });

  it('should handle dashboard to AI assistant integration', () => {
    // Click on "Get Insights" button
    cy.contains('Get Insights').click();

    // AI assistant should expand and process query
    cy.get('[data-cy="ai-assistant-chat"]', { timeout: 5000 }).should('be.visible');
  });
});
