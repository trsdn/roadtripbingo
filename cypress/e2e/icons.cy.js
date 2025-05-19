describe('Road Trip Bingo Icon Management', () => {
  beforeEach(() => {
    // Start with a clean localStorage
    cy.clearLocalStorage();
    
    // Visit the app
    cy.visit('/');
  });

  it('should display empty icon gallery initially', () => {
    cy.get('#iconGallery').should('be.empty');
    cy.get('#iconCount').should('contain', '0');
  });

  it('should add icons programmatically', () => {
    // Add icon directly to test the UI update
    cy.window().then(win => {
      const testIcon = {
        id: 'test-1',
        name: 'test-icon-1',
        data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
      };
      
      return win.iconDB.saveIcons([testIcon]);
    });
    
    // Reload to see the changes
    cy.reload();
    
    // Check that the icon is displayed
    cy.get('#iconGallery .icon-item').should('have.length', 1);
    cy.get('#iconGallery .icon-item img').should('have.attr', 'alt', 'test-icon-1');
    cy.get('#iconCount').should('contain', '1');
  });

  it('should delete an icon when requested', () => {
    // Add two icons
    cy.window().then(win => {
      const testIcons = [
        {
          id: 'test-1',
          name: 'test-icon-1',
          data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
        },
        {
          id: 'test-2',
          name: 'test-icon-2',
          data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
        }
      ];
      
      return win.iconDB.saveIcons(testIcons);
    });
    
    // Reload to see the changes
    cy.reload();
    
    // Verify two icons are present
    cy.get('#iconGallery .icon-item').should('have.length', 2);
    cy.get('#iconCount').should('contain', '2');
    
    // Delete the first icon
    cy.get('#iconGallery .icon-item:first-child .delete-icon').click();
    
    // Verify only one icon is now present
    cy.get('#iconGallery .icon-item').should('have.length', 1);
    cy.get('#iconCount').should('contain', '1');
  });

  it('should update the card generation options based on icon count', () => {
    // Initially with no icons, generation should be disabled
    cy.get('#generateBtn').should('be.disabled');
    
    // Add enough icons for a 3x3 grid
    cy.window().then(win => {
      const testIcons = Array.from({ length: 9 }, (_, i) => ({
        id: `test-${i}`,
        name: `test-icon-${i}`,
        data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
      }));
      
      return win.iconDB.saveIcons(testIcons);
    });
    
    // Reload to see the changes
    cy.reload();
    
    // Set grid size to 3x3
    cy.get('#gridSize').select('3');
    
    // Generation should now be enabled
    cy.get('#generateBtn').should('be.enabled');
    
    // But if we select 5x5 (requiring 25 icons), it should be disabled again
    cy.get('#gridSize').select('5');
    cy.get('#generateBtn').should('be.disabled');
  });
}); 