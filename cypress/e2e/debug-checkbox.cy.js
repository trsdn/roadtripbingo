describe('Debug Checkbox Behavior', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('http://localhost:8080');
    cy.get('body', { timeout: 10000 }).should('be.visible');
    cy.window().its('iconDB').should('exist');
    cy.wait(1000);
  });

  it('should debug checkbox event listeners and behavior', () => {
    // Check for multiple event listeners
    cy.window().then((win) => {
      const checkbox = win.document.getElementById('multiHitToggle');
      cy.log('Checkbox element:', checkbox);
      
      // Get all event listeners
      if (win.getEventListeners) {
        const listeners = win.getEventListeners(checkbox);
        cy.log('Event listeners:', listeners);
      }
      
      // Check if setupEventListeners was called multiple times
      if (win.console) {
        cy.log('Console logs available');
      }
    });

    // Test direct property manipulation without any events
    cy.get('#multiHitToggle').then($el => {
      const element = $el[0];
      cy.log('Initial checked state:', element.checked);
      
      // Set checked to true without firing events
      element.checked = true;
      cy.log('After setting checked=true:', element.checked);
      
      // Check if something automatically changes it back
      cy.wait(100);
      cy.log('After 100ms wait:', element.checked);
      
      cy.wait(500);
      cy.log('After 500ms wait:', element.checked);
      
      cy.wait(1000);
      cy.log('After 1000ms wait:', element.checked);
    });

    // Test manual event dispatch
    cy.get('#multiHitToggle').then($el => {
      const element = $el[0];
      element.checked = true;
      
      // Manually dispatch change event
      const changeEvent = new Event('change', { bubbles: true });
      element.dispatchEvent(changeEvent);
      
      cy.log('After manual change event:', element.checked);
      
      // Check options visibility
      const options = document.getElementById('multiHitOptions');
      cy.log('Options display:', options ? options.style.display : 'element not found');
    });

    // Test with Cypress .check() method
    cy.get('#multiHitToggle').then($el => {
      const element = $el[0];
      cy.log('Before Cypress .check():', element.checked);
    });
    
    cy.get('#multiHitToggle').check({ force: true });
    
    cy.get('#multiHitToggle').then($el => {
      const element = $el[0];
      cy.log('Immediately after Cypress .check():', element.checked);
    });
    
    cy.wait(100);
    cy.get('#multiHitToggle').then($el => {
      const element = $el[0];
      cy.log('100ms after Cypress .check():', element.checked);
    });
    
    cy.wait(500);
    cy.get('#multiHitToggle').then($el => {
      const element = $el[0];
      cy.log('500ms after Cypress .check():', element.checked);
    });
  });
});
