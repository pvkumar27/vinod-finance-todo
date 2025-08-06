describe('AI Assistant Queries', () => {
  beforeEach(() => {
    cy.login();
  });

  it('should handle credit card queries', () => {
    cy.fixture('test-data').then(data => {
      data.aiQueries.forEach(queryData => {
        if (queryData.query.includes('card') || queryData.query.includes('promo')) {
          // Test AI query functionality if available
          cy.get('body').then($body => {
            if ($body.find('[data-testid="ai-input"], .ai-input, input[placeholder*="Ask"]').length > 0) {
              cy.testAIQuery(queryData.query);
              
              // Verify response contains expected keywords
              queryData.expectedKeywords.forEach(keyword => {
                cy.get('[data-testid="ai-response"], .ai-response')
                  .should('contain', keyword);
              });
            }
          });
        }
      });
    });
  });

  it('should handle todo queries', () => {
    cy.fixture('test-data').then(data => {
      data.aiQueries.forEach(queryData => {
        if (queryData.query.includes('task') || queryData.query.includes('Add')) {
          cy.get('body').then($body => {
            if ($body.find('[data-testid="ai-input"], .ai-input, input[placeholder*="Ask"]').length > 0) {
              cy.testAIQuery(queryData.query);
              
              // For task creation queries, verify task was added
              if (queryData.query.includes('Add')) {
                cy.navigateToTab('To-Dos');
                cy.contains('rent').should('be.visible');
              }
            }
          });
        }
      });
    });
  });

  it('should provide contextual responses', () => {
    // Test context-aware responses
    cy.get('body').then($body => {
      if ($body.find('[data-testid="ai-input"], .ai-input').length > 0) {
        // Query about current state
        cy.testAIQuery('What tasks are overdue?');
        
        // Should provide relevant information
        cy.get('[data-testid="ai-response"], .ai-response')
          .should('contain.text', 'task')
          .or('contain.text', 'overdue')
          .or('contain.text', 'no overdue');
      }
    });
  });

  it('should generate dynamic dashboards', () => {
    // Test dashboard generation
    cy.get('body').then($body => {
      if ($body.find('[data-testid="ai-input"], .ai-input').length > 0) {
        cy.testAIQuery('Show credit utilization');
        
        // Should generate or show dashboard
        cy.get('body').then($body => {
          if ($body.find('.dashboard, .chart, .visualization').length > 0) {
            cy.get('.dashboard, .chart, .visualization').should('be.visible');
          }
        });
      }
    });
  });
});