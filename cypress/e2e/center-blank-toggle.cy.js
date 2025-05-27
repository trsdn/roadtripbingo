describe('Center Blank Toggle Feature', () => {
  beforeEach(() => {
    // Start with a clean localStorage
    cy.clearLocalStorage();
    
    // Visit the app
    cy.visit('/src');
    
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

  it('should display the center blank toggle checkbox', () => {
    // The center blank toggle should be visible
    cy.get('#centerBlankToggle').should('exist').and('be.visible');
    
    // It should be checked by default
    cy.get('#centerBlankToggle').should('be.checked');
    
    // The label should be displayed correctly
    cy.get('label[for="centerBlankToggle"]').should('contain', 'Leave center cell blank');
  });

  it('should generate 5x5 cards with center blank when toggle is enabled', () => {
    // Select 5x5 grid size
    cy.get('#gridSize').select('5');
    
    // Ensure center blank toggle is checked
    cy.get('#centerBlankToggle').should('be.checked');
    
    // Set a card title
    cy.get('#title').clear().type('Test Center Blank Card');
    
    // Generate the cards
    cy.get('#generateBtn').click();
    
    // Check that the preview shows up
    cy.get('#cardPreview').should('not.be.empty');
    cy.get('#cardPreview .card-title').should('contain', 'Test Center Blank Card');
    
    // Should have 25 cells (5x5 grid)
    cy.get('#cardPreview .bingo-cell').should('have.length', 25);
    
    // The center cell should have the free-space class
    cy.get('#cardPreview .bingo-cell').eq(12).should('have.class', 'free-space'); // Center cell (index 12 in 5x5)
    
    // Should have 24 cells with images (all except center)
    cy.get('#cardPreview .bingo-cell img').should('have.length', 24);
  });

  it('should generate 5x5 cards without center blank when toggle is disabled', () => {
    // Select 5x5 grid size
    cy.get('#gridSize').select('5');
    
    // Uncheck the center blank toggle
    cy.get('#centerBlankToggle').uncheck();
    
    // Set a card title
    cy.get('#title').clear().type('Test Full 5x5 Card');
    
    // Generate the cards
    cy.get('#generateBtn').click();
    
    // Check that the preview shows up
    cy.get('#cardPreview').should('not.be.empty');
    cy.get('#cardPreview .card-title').should('contain', 'Test Full 5x5 Card');
    
    // Should have 25 cells (5x5 grid)
    cy.get('#cardPreview .bingo-cell').should('have.length', 25);
    
    // The center cell should NOT have the free-space class
    cy.get('#cardPreview .bingo-cell').eq(12).should('not.have.class', 'free-space');
    
    // Should have 25 cells with images (all cells filled)
    cy.get('#cardPreview .bingo-cell img').should('have.length', 25);
  });

  it('should not affect even-sized grids (4x4)', () => {
    // Select 4x4 grid size
    cy.get('#gridSize').select('4');
    
    // Ensure center blank toggle is checked
    cy.get('#centerBlankToggle').should('be.checked');
    
    // Set a card title
    cy.get('#title').clear().type('Test 4x4 Card');
    
    // Generate the cards
    cy.get('#generateBtn').click();
    
    // Check that the preview shows up
    cy.get('#cardPreview').should('not.be.empty');
    cy.get('#cardPreview .card-title').should('contain', 'Test 4x4 Card');
    
    // Should have 16 cells (4x4 grid)
    cy.get('#cardPreview .bingo-cell').should('have.length', 16);
    
    // Should have 16 cells with images (all cells filled, no center for even grids)
    cy.get('#cardPreview .bingo-cell img').should('have.length', 16);
    
    // No cells should have the free-space class
    cy.get('#cardPreview .bingo-cell.free-space').should('not.exist');
  });

  it('should save and restore the toggle state', () => {
    // Uncheck the center blank toggle
    cy.get('#centerBlankToggle').uncheck();
    
    // Reload the page
    cy.reload();
    
    // The toggle should still be unchecked
    cy.get('#centerBlankToggle').should('not.be.checked');
    
    // Check the toggle again
    cy.get('#centerBlankToggle').check();
    
    // Reload the page
    cy.reload();
    
    // The toggle should now be checked
    cy.get('#centerBlankToggle').should('be.checked');
  });

  it('should update icon count requirements based on center blank setting', () => {
    // Select 5x5 grid size
    cy.get('#gridSize').select('5');
    
    // With center blank enabled (default), should need 24 icons
    cy.get('#centerBlankToggle').should('be.checked');
    
    // Check that generate button is enabled (we have 25 icons, need 24)
    cy.get('#generateBtn').should('be.enabled');
    
    // Uncheck center blank toggle (should now need 25 icons)
    cy.get('#centerBlankToggle').uncheck();
    
    // Generate button should still be enabled (we have exactly 25 icons)
    cy.get('#generateBtn').should('be.enabled');
  });
});
