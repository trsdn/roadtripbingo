// cypress/e2e/center-blank-ui.cy.js
describe('Center Blank Toggle UI Feature', () => {
  beforeEach(() => {
    // Start with a clean localStorage
    cy.clearLocalStorage();
    
    // Visit the app
    cy.visit('/src');
  });

  it('should display the center blank toggle checkbox', () => {
    // The center blank toggle should be visible
    cy.get('#centerBlankToggle').should('exist').and('be.visible');
    
    // It should be checked by default
    cy.get('#centerBlankToggle').should('be.checked');
    
    // The label should be displayed correctly
    cy.get('label[for="centerBlankToggle"]').should('contain', 'Leave center cell blank');
  });

  it('should save and restore the toggle state in localStorage', () => {
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

  it('should toggle the checkbox when clicked', () => {
    // Initially checked
    cy.get('#centerBlankToggle').should('be.checked');
    
    // Click to uncheck
    cy.get('#centerBlankToggle').uncheck();
    cy.get('#centerBlankToggle').should('not.be.checked');
    
    // Click to check again
    cy.get('#centerBlankToggle').check();
    cy.get('#centerBlankToggle').should('be.checked');
  });

  it('should be visible in the settings section', () => {
    // Check that the toggle is in the settings area
    cy.get('#settings').within(() => {
      cy.get('#centerBlankToggle').should('exist');
      cy.get('label[for="centerBlankToggle"]').should('exist');
    });
  });

  it('should respond to language changes', () => {
    // Change language to German
    cy.get('#language').select('de');
    
    // Check that the label changes to German
    cy.get('label[for="centerBlankToggle"]').should('contain', 'Mitte frei lassen');
    
    // Change back to English
    cy.get('#language').select('en');
    
    // Check that the label changes back to English
    cy.get('label[for="centerBlankToggle"]').should('contain', 'Leave center cell blank');
  });
});
