describe('Road Trip Bingo Card Generation', () => {
  beforeEach(() => {
    // Start with a clean localStorage
    cy.clearLocalStorage();
    
    // Visit the app
    cy.visit('/');
    
    // Wait for the app to fully initialize
    cy.window().its('iconDB').should('exist');
    cy.window().then(async (win) => {
      // Wait for the database to be initialized
      while (!win.iconDB.db) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    });
    
    // Set up test data with enough icons for a 3x3 grid
    cy.window().then(win => {
      const testIcons = Array.from({ length: 9 }, (_, i) => ({
        id: `test-${i}`,
        name: `test-icon-${i}`,
        data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
      }));
      
      return win.iconDB.saveIcons(testIcons);
    });
    
    // Reload the page to reflect the changes
    cy.reload();
  });

  it('should generate bingo cards when there are enough icons', () => {
    // Select 3x3 grid size
    cy.get('#gridSize').select('3');
    
    // Set a card title
    cy.get('#title').clear().type('Test Bingo Card');
    
    // Set 2 cards per set
    cy.get('#cardCount').clear().type('2');
    
    // Generate the cards
    cy.get('#generateBtn').should('not.be.disabled'); // Ensure button is enabled before clicking
    cy.get('#generateBtn').click();
    
    // Check that the preview shows up
    cy.get('#cardPreview').should('not.be.empty');
    cy.get('#cardPreview .card-title').should('contain', 'Test Bingo Card');
    cy.get('#cardPreview .bingo-cell').should('have.length', 9);
    cy.get('#cardPreview .bingo-cell img').should('have.length', 9);
    
    // Check that the download button is enabled
    cy.get('#downloadBtn').should('be.enabled');
    
    // The identifier should be displayed
    cy.get('#identifier').should('not.be.empty');
    cy.get('#identifier').should('contain', 'ID:');
  });

  it('should handle insufficient icons gracefully', () => {
    // First, clear all icons
    cy.window().then(win => {
      cy.stub(win, 'confirm').returns(true);
    });
    cy.get('#clearIconsBtn').should('be.visible').click(); // Ensure button is visible before clicking
    
    // Select 5x5 grid size (requires 25 icons)
    cy.get('#gridSize').select('5');
    
    // There should be a warning message
    cy.get('.info-text').should('contain', 'Need at least');
    
    // The generate button should be disabled
    cy.get('#generateBtn').should('be.disabled');
  });

  it('should handle PDF download', () => {
    // Select 3x3 grid size
    cy.get('#gridSize').select('3');
    
    // Generate the cards
    cy.get('#generateBtn').click();
    
    // Stub window.jspdf to avoid actual PDF generation
    cy.window().then(win => {
      const jsPDFStub = {
        jsPDF: function() {
          return {
            internal: {
              pageSize: {
                getWidth: () => 210,
                getHeight: () => 297
              }
            },
            setFont: cy.stub(),
            setFontSize: cy.stub(),
            text: cy.stub(),
            setDrawColor: cy.stub(),
            setLineWidth: cy.stub(),
            rect: cy.stub(),
            addImage: cy.stub(),
            addPage: cy.stub(),
            save: cy.stub()
          };
        }
      };
      
      win.jspdf = jsPDFStub;
    });
    
    // Click the download button
    cy.get('#downloadBtn').click();
    
    // Wait for a moment to let the PDF generation complete
    cy.wait(500);
    
    // The button text should change during generation and then back
    cy.get('#downloadBtn').should('contain', 'Download PDF');
  });
});