describe('Debug Multi-Hit Initialization', () => {
  it('should debug multi-hit initialization state', () => {
    cy.clearLocalStorage();
    cy.visit('http://localhost:8080');
    cy.get('body', { timeout: 10000 }).should('be.visible');
    cy.window().its('iconDB').should('exist');
    cy.get('#generateBtn').should('exist');
    
    // Set up test icons quickly
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
    cy.wait(2000);
    
    // Debug the state
    cy.window().then((win) => {
      const toggle = win.document.getElementById('multiHitToggle');
      const generateBtn = win.document.getElementById('generateBtn');
      
      cy.log('Toggle exists:', !!toggle);
      cy.log('Generate button exists:', !!generateBtn);
      cy.log('IconDB exists:', !!win.iconDB);
      cy.log('IconDB.db exists:', !!(win.iconDB && win.iconDB.db));
      cy.log('Available icons count:', win.availableIcons ? win.availableIcons.length : 'undefined');
      cy.log('Toggle has event listeners:', toggle ? toggle._hasEventListeners : 'toggle not found');
      cy.log('Document ready state:', win.document.readyState);
      
      // Check if all conditions are met except the event listener flag
      const basicCondition = toggle && generateBtn && win.iconDB && win.iconDB.db;
      const iconsCondition = win.availableIcons && win.availableIcons.length > 0;
      const eventListenerCondition = toggle && toggle._hasEventListeners === true;
      
      cy.log('Basic condition (toggle, button, db):', basicCondition);
      cy.log('Icons condition:', iconsCondition);
      cy.log('Event listener condition:', eventListenerCondition);
      
      expect(toggle).to.exist;
      expect(generateBtn).to.exist;
      expect(win.iconDB).to.exist;
      expect(win.iconDB.db).to.not.be.null;
    });
  });
});
