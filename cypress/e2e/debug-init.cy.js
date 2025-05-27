// Debug test to understand initialization state
describe('Debug Initialization', () => {
  it('should debug the window state', () => {
    cy.visit('http://localhost:8080');
    
    // Wait for basic page load
    cy.get('body', { timeout: 10000 }).should('be.visible');
    
    // Debug what's available in the window
    cy.window().then((win) => {
      cy.log('Window keys:', Object.keys(win));
      cy.log('iconDB exists:', !!win.iconDB);
      cy.log('iconDB db:', win.iconDB ? win.iconDB.db : 'no iconDB');
      cy.log('availableIcons exists:', !!win.availableIcons);
      cy.log('availableIcons length:', win.availableIcons ? win.availableIcons.length : 'undefined');
      cy.log('multiHitToggle exists:', !!win.document.getElementById('multiHitToggle'));
      cy.log('generateBtn exists:', !!win.document.getElementById('generateBtn'));
      cy.log('Document ready state:', win.document.readyState);
    });
    
    // Wait a bit and check again
    cy.wait(2000);
    
    cy.window().then((win) => {
      cy.log('=== After 2 seconds ===');
      cy.log('iconDB exists:', !!win.iconDB);
      cy.log('iconDB db:', win.iconDB ? win.iconDB.db : 'no iconDB');
      cy.log('availableIcons exists:', !!win.availableIcons);
      cy.log('availableIcons length:', win.availableIcons ? win.availableIcons.length : 'undefined');
      cy.log('multiHitToggle exists:', !!win.document.getElementById('multiHitToggle'));
      cy.log('generateBtn exists:', !!win.document.getElementById('generateBtn'));
    });
    
    // Wait even longer
    cy.wait(5000);
    
    cy.window().then((win) => {
      cy.log('=== After 7 seconds total ===');
      cy.log('iconDB exists:', !!win.iconDB);
      cy.log('iconDB db:', win.iconDB ? win.iconDB.db : 'no iconDB');
      cy.log('availableIcons exists:', !!win.availableIcons);
      cy.log('availableIcons length:', win.availableIcons ? win.availableIcons.length : 'undefined');
      cy.log('multiHitToggle exists:', !!win.document.getElementById('multiHitToggle'));
      cy.log('generateBtn exists:', !!win.document.getElementById('generateBtn'));
    });
  });
});
