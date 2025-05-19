describe('Road Trip Bingo Storage System', () => {
  beforeEach(() => {
    // Start with a clean localStorage
    cy.clearLocalStorage();
    
    // Visit the app
    cy.visit('/');
  });

  it('should backup and restore data', () => {
    // First, let's set up some settings
    cy.get('#languageSelect').select('de');
    cy.get('#gridSize').select('3');
    cy.get('#cardCount').clear().type('2');
    
    // Stub the file download
    cy.window().then(win => {
      cy.stub(win.iconDB, 'exportData').as('exportData');
    });
    
    // Click the backup button
    cy.get('#backupBtn').click();
    cy.get('@exportData').should('be.called');
    
    // Now let's restore some pre-defined data
    // This requires us to modify the app's behavior because Cypress
    // can't interact with file download/upload dialogs directly
    cy.window().then(win => {
      // Create test data
      const testData = {
        icons: [
          {
            id: 'test-1',
            name: 'test-icon-1',
            data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
          }
        ],
        settings: {
          language: 'en',
          theme: 'light',
          gridSize: 4,
          cardsPerSet: 3
        },
        gameStates: []
      };
      
      // Simulate restore by calling importData directly
      const jsonBlob = new Blob([JSON.stringify(testData)], { type: 'application/json' });
      const testFile = new File([jsonBlob], 'test-backup.json', { type: 'application/json' });
      
      // Spy on window.alert to catch success message
      cy.stub(win, 'alert').as('alertStub');
      
      return win.iconDB.importData(testFile);
    });
    
    // Force a reload to ensure UI updates
    cy.reload();
    
    // After restore, check that UI reflects the restored settings
    cy.get('#languageSelect').should('have.value', 'en');
    cy.get('#gridSize').should('have.value', '4');
    cy.get('#cardCount').should('have.value', '3');
    
    // Check that icon was restored
    cy.get('#iconCount').should('contain', '1');
    cy.get('#iconGallery .icon-item').should('have.length', 1);
  });

  it('should clear all icons when requested', () => {
    // Add some test data directly
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
    
    // Reload the page to reflect the changes
    cy.reload();
    
    // Verify icons are loaded
    cy.get('#iconCount').should('contain', '2');
    cy.get('#iconGallery .icon-item').should('have.length', 2);
    
    // Stub window.confirm to always return true
    cy.window().then(win => {
      cy.stub(win, 'confirm').returns(true);
    });
    
    // Clear all icons
    cy.get('#clearIconsBtn').click();
    
    // Verify icons are cleared
    cy.get('#iconCount').should('contain', '0');
    cy.get('#iconGallery .icon-item').should('not.exist');
  });
}); 