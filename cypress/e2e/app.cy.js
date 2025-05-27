describe('Road Trip Bingo Generator', () => {
  beforeEach(() => {
    // Start with a clean localStorage
    cy.clearLocalStorage();
    
    // Visit the app
    cy.visit('/');
  });

  it('loads the application correctly', () => {
    // Check that the main UI elements are present
    cy.get('h1').should('contain', 'Road Trip Bingo Generator');
    cy.get('#gridSize').should('exist');
    cy.get('#iconUpload').should('exist');
    cy.get('#generateBtn').should('exist');
    cy.get('#downloadBtn').should('exist').and('be.disabled');
  });

  it('allows selecting different grid sizes', () => {
    // Test grid size selection
    cy.get('#gridSize').select('3');
    cy.get('#gridSize').should('have.value', '3');
    
    cy.get('#gridSize').select('4');
    cy.get('#gridSize').should('have.value', '4');
    
    cy.get('#gridSize').select('5');
    cy.get('#gridSize').should('have.value', '5');
  });

  it('displays icon count correctly', () => {
    // Initially, there should be 0 icons
    cy.get('#iconCount').should('contain', '0');
  });

  it('updates UI language when changed', () => {
    // Test language switching
    cy.get('#languageSelect').select('de');
    // Wait for the language to be applied
    cy.get('h1').should('contain', 'Auto Bingo Generator');
    
    // Switch back to English
    cy.get('#languageSelect').select('en');
    cy.get('h1').should('contain', 'Road Trip Bingo Generator');
  });
});