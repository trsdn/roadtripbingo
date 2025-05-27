// Road Trip Bingo - Preview Toggle and Grid Layout E2E Test

describe('Preview label toggle and grid layout', () => {
  beforeEach(() => {
    // Start with a clean localStorage
    cy.clearLocalStorage();
    
    // Visit the app
    cy.visit('/'); // Changed from /src/index.html to /
    
    // Wait for the app to fully initialize
    cy.window().its('iconDB').should('exist');
    cy.window().then(async (win) => {
      // Wait for the database to be initialized
      while (!win.iconDB.db) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    });
    
    // Set up test data with enough icons for testing
    cy.window().then(win => {
      const testIcons = Array.from({ length: 25 }, (_, i) => ({
        id: `test-${i}`,
        name: `test-icon-${i}`,
        data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
      }));
      
      return win.iconDB.saveIcons(testIcons);
    });
    
    // Reload the page to reflect the changes
    cy.reload();
  });

  it('shows the label toggle and updates preview grid', () => {
    // Toggle should be visible
    cy.get('#showLabelsToggle').should('exist').and('be.visible');
    // Generate a 3x3 card
    cy.get('#gridSize').select('3');
    cy.get('#generateBtn').click();
    // Preview grid should show labels by default
    cy.get('.bingo-card-preview-grid .icon-label').should('have.length', 9);
    // Toggle off
    cy.get('#showLabelsToggle').uncheck({ force: true });
    cy.get('.bingo-card-preview-grid .icon-label').should('not.exist');
    // Toggle on
    cy.get('#showLabelsToggle').check({ force: true });
    cy.get('.bingo-card-preview-grid .icon-label').should('have.length', 9);
  });

  it('preview grid layout matches expected structure', () => {
    cy.get('#gridSize').select('4');
    cy.get('#generateBtn').click();
    // Should have 16 cells in a 4x4 grid
    cy.get('.bingo-card-preview-grid .bingo-cell').should('have.length', 16);
    // Each cell should contain an img
    cy.get('.bingo-card-preview-grid .bingo-cell img').should('have.length', 16);
  });
});
