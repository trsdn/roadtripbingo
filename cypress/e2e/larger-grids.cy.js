describe('Road Trip Bingo - Larger Grid Sizes (6x6, 7x7, 8x8)', () => {
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
  });

  // Test data setup for different grid sizes
  const gridTestCases = [
    { size: 6, cells: 36, label: '6x6 Grid' },
    { size: 7, cells: 49, label: '7x7 Grid' },
    { size: 8, cells: 64, label: '8x8 Grid' }
  ];

  gridTestCases.forEach(({ size, cells, label }) => {
    describe(`${label} Tests`, () => {
      beforeEach(() => {
        // Set up test data with enough icons for the specific grid size
        cy.window().then(async (win) => {
          // Wait for the database to be initialized
          while (!win.iconDB.db) {
            await new Promise(resolve => setTimeout(resolve, 50));
          }
          
          const testIcons = Array.from({ length: cells }, (_, i) => ({
            id: `test-${i}`,
            name: `test-icon-${i}`,
            data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
          }));
          
          return win.iconDB.saveIcons(testIcons);
        });
        
        // Reload the page to reflect the changes
        cy.reload();
      });

      it(`should generate ${label} bingo cards when there are enough icons`, () => {
        // Select the grid size
        cy.get('#gridSize').select(size.toString());
        
        // Set a card title
        cy.get('#title').clear().type(`Test ${label} Bingo Card`);
        
        // Set 2 cards per set
        cy.get('#cardCount').clear().type('2');
        
        // Generate the cards
        cy.get('#generateBtn').click();
        
        // Check that the preview shows up
        cy.get('#cardPreview').should('not.be.empty');
        cy.get('#cardPreview .card-title').should('contain', `Test ${label} Bingo Card`);
        cy.get('#cardPreview .bingo-cell').should('have.length', cells);
        cy.get('#cardPreview .bingo-cell img').should('have.length', cells);
        
        // Check that the download button is enabled
        cy.get('#downloadBtn').should('be.enabled');
        
        // The identifier should be displayed
        cy.get('#identifier').should('not.be.empty');
        cy.get('#identifier').should('contain', 'ID:');
      });

      it(`should show warning when insufficient icons for ${label}`, () => {
        // Clear all icons
        cy.window().then(win => {
          cy.stub(win, 'confirm').returns(true);
        });
        cy.get('#clearIcons').click();
        
        // Add fewer icons than required
        cy.window().then(win => {
          const insufficientIcons = Array.from({ length: cells - 1 }, (_, i) => ({
            id: `test-${i}`,
            name: `test-icon-${i}`,
            data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
          }));
          
          return win.iconDB.saveIcons(insufficientIcons);
        });
        
        cy.reload();
        
        // Select the grid size
        cy.get('#gridSize').select(size.toString());
        
        // There should be a warning message
        cy.get('.info-text').should('contain', `Need at least ${cells}`);
        
        // The generate button should be disabled
        cy.get('#generateBtn').should('be.disabled');
      });

      it(`should handle PDF download for ${label}`, () => {
        // Select the grid size
        cy.get('#gridSize').select(size.toString());
        
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

      it(`should handle responsive design for ${label}`, () => {
        // Test on mobile viewport
        cy.viewport(375, 667);
        
        // Select the grid size
        cy.get('#gridSize').select(size.toString());
        
        // Generate the cards
        cy.get('#generateBtn').click();
        
        // Check that cells are properly sized for mobile
        cy.get('#cardPreview .bingo-cell').should('be.visible');
        cy.get('#cardPreview .bingo-cell img').should('be.visible');
        
        // Test on tablet viewport
        cy.viewport(768, 1024);
        
        // Check that cells are properly sized for tablet
        cy.get('#cardPreview .bingo-cell').should('be.visible');
        cy.get('#cardPreview .bingo-cell img').should('be.visible');
      });
    });
  });

  it('should validate that all larger grid sizes are available in dropdown', () => {
    // Check that 6x6, 7x7, 8x8 options are available
    cy.get('#gridSize option[value="6"]').should('exist');
    cy.get('#gridSize option[value="7"]').should('exist');
    cy.get('#gridSize option[value="8"]').should('exist');
  });

  it('should maintain performance with larger grids', () => {
    // Set up maximum icons
    cy.window().then(async (win) => {
      // Wait for the database to be initialized
      while (!win.iconDB.db) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      const maxIcons = Array.from({ length: 64 }, (_, i) => ({
        id: `test-${i}`,
        name: `test-icon-${i}`,
        data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
      }));
      
      return win.iconDB.saveIcons(maxIcons);
    });
    
    cy.reload();
    
    // Test generation time for largest grid
    cy.get('#gridSize').select('8');
    
    const startTime = Date.now();
    cy.get('#generateBtn').click();
    
    // Should complete within reasonable time (5 seconds)
    cy.get('#cardPreview .bingo-cell', { timeout: 5000 }).should('have.length', 64);
    
    cy.then(() => {
      const endTime = Date.now();
      const generationTime = endTime - startTime;
      expect(generationTime).to.be.lessThan(5000); // Should complete within 5 seconds
    });
  });
});
