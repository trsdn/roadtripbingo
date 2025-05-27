// Debug version of multi-hit mode test
describe('Debug Multi-Hit Mode', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('http://localhost:8080');
    cy.get('body', { timeout: 10000 }).should('be.visible');
    cy.window().its('iconDB').should('exist');
    cy.get('#generateBtn').should('exist');
    
    // Set up test icons
    cy.window().then(async (win) => {
      const waitForIconDB = () => {
        return new Promise((resolve) => {
          const checkIconDB = () => {
            if (win.iconDB && typeof win.iconDB.saveIcons === 'function' && win.iconDB.db !== null) {
              resolve();
            } else {
              setTimeout(checkIconDB, 100);
            }
          };
          checkIconDB();
        });
      };
      
      await waitForIconDB();
      
      if (!win.iconDB.db) {
        await win.iconDB.init();
      }
      
      const testIcons = Array.from({ length: 25 }, (_, i) => ({
        id: `test-${i}`,
        name: `test-icon-${i}`,
        data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
      }));
      
      return win.iconDB.saveIcons(testIcons);
    });
    
    cy.reload();
    cy.window().its('iconDB').should('exist');
    cy.get('#generateBtn').should('exist');
    cy.wait(1000);
  });

  it('should debug multi-hit toggle behavior', () => {
    // Check console for any errors
    cy.window().then((win) => {
      // Log current state
      cy.log('Document ready state:', win.document.readyState);
      cy.log('Event listeners attached?', !!win.setupEventListeners);
      cy.log('Available icons:', win.availableIcons ? win.availableIcons.length : 'undefined');
    });

    // Check initial state
    cy.get('#multiHitToggle').should('exist').and('be.visible').and('not.be.disabled');
    cy.get('#multiHitOptions').should('exist').and('not.be.visible');
    
    // Check toggle state before clicking
    cy.get('#multiHitToggle').then(($checkbox) => {
      cy.log('Checkbox checked before:', $checkbox.prop('checked'));
    });
    
    // Try checking the box
    cy.get('#multiHitToggle').check({ force: true });
    
    // Check toggle state after clicking
    cy.get('#multiHitToggle').then(($checkbox) => {
      cy.log('Checkbox checked after check():', $checkbox.prop('checked'));
    });
    
    // Trigger change event manually
    cy.get('#multiHitToggle').trigger('change', { force: true });
    
    // Wait and check again
    cy.wait(1000);
    cy.get('#multiHitToggle').then(($checkbox) => {
      cy.log('Checkbox checked after trigger:', $checkbox.prop('checked'));
    });
    
    // Check if options are visible
    cy.get('#multiHitOptions').then(($options) => {
      cy.log('Options display style:', $options.css('display'));
      cy.log('Options visible:', $options.is(':visible'));
    });
    
    // Check if JavaScript event handler exists
    cy.window().then((win) => {
      const toggle = win.document.getElementById('multiHitToggle');
      cy.log('Toggle element found:', !!toggle);
      if (toggle) {
        // Get all event listeners (this won't work in all browsers but let's try)
        cy.log('Toggle has event listeners:', toggle.onclick !== null);
      }
    });
  });
});
