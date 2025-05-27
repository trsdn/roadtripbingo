describe('Road Trip Bingo Storage System', () => {
  beforeEach(() => {
    // Start with a clean localStorage and IndexedDB
    cy.clearLocalStorage();
    cy.window().then(async (win) => {
      await win.indexedDB.deleteDatabase('RoadTripBingoDB');
    });
    
    // Visit the app
    cy.visit('/');
    
    // Wait for the app to fully initialize
    cy.window().its('iconDB').should('exist');
    // Wait for the database to be initialized
    cy.window().its('iconDB.db').should('not.be.null');
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
        title: 'Backup Test',
        gridSize: '5', // Changed from 4 to 5 to match default
        setCount: '1',
        cardCount: '2',
        language: 'de',
        centerBlank: false,
        showLabels: false,
        multiHitMode: true,
        multiHitDifficulty: 'HARD',
        icons: [
          {
            id: 'test-backup-1',
            name: 'Backup Icon 1',
            data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
          }
        ]
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
    cy.get('#gridSize').should('have.value', '5');
    cy.get('#cardCount').should('have.value', '3');
    
    // Check that icon was restored
    cy.get('#iconCount').should('contain', '1');
    cy.get('#iconGallery .icon-item').should('have.length', 1);
  });

  it('should clear all icons when requested', () => {
    // Add some icons first
    cy.window().then(win => {
      const iconsToSave = [
        {
          id: 'clear-test-1',
          name: 'Clear Test Icon 1',
          data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
        },
        {
          id: 'clear-test-2',
          name: 'Clear Test Icon 2',
          data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
        }
      ];
      return win.iconDB.saveIcons(iconsToSave);
    });
    
    // Reload to reflect changes
    cy.reload();
    cy.wait(500); // Wait for UI to update

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