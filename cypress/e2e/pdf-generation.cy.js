describe('PDF Generation', () => {
  beforeEach(() => {
    cy.visit('/');
    
    // Wait for the page to load
    cy.get('#iconGallery').should('exist');
    
    // Add test icons to localStorage
    cy.window().then(win => {
      const testIcons = [];
      for (let i = 1; i <= 25; i++) {
        testIcons.push({
          id: `test-icon-${i}`,
          name: `Test Icon ${i}`,
          data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
        });
      }
      
      return win.iconDB.saveIcons(testIcons);
    });
    
    // Reload to reflect the changes
    cy.reload();
  });

  it('should generate PDF with actual images (not empty grid)', () => {
    // Select 3x3 grid
    cy.get('#gridSize').select('3');
    
    // Set title
    cy.get('#title').clear().type('Test PDF Bingo');
    
    // Generate cards
    cy.get('#generateBtn').click();
    
    // Wait for preview to show
    cy.get('#cardPreview').should('not.be.empty');
    
    // Mock PDF generation to capture the addImage calls
    let addImageCalls = [];
    
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
            addImage: cy.stub().callsFake((data, type, x, y, width, height) => {
              addImageCalls.push({
                data,
                type,
                x,
                y,
                width,
                height
              });
            }),
            addPage: cy.stub(),
            save: cy.stub()
          };
        }
      };
      
      win.jspdf = jsPDFStub;
    });
    
    // Click download and wait for PDF generation
    cy.get('#downloadBtn').click();
    
    // Wait longer for async image loading
    cy.wait(2000);
    
    // Verify that addImage was called for each cell (9 cells for 3x3 grid)
    cy.window().then(() => {
      expect(addImageCalls.length).to.equal(9);
      
      // Verify each addImage call has proper image data
      addImageCalls.forEach((call, index) => {
        expect(call.data).to.include('data:image/png;base64');
        expect(call.type).to.equal('PNG');
        expect(call.x).to.be.a('number');
        expect(call.y).to.be.a('number');
        expect(call.width).to.be.a('number');
        expect(call.height).to.be.a('number');
      });
    });
    
    // Button should return to normal state
    cy.get('#downloadBtn').should('contain', 'Download PDF');
  });

  it('should handle PDF generation with different grid sizes', () => {
    const gridSizes = [
      { size: 4, cells: 16 },
      { size: 5, cells: 25 }
    ];

    gridSizes.forEach(({ size, cells }) => {
      // Select grid size
      cy.get('#gridSize').select(size.toString());
      
      // Generate cards
      cy.get('#generateBtn').click();
      
      // Track addImage calls
      let addImageCalls = [];
      
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
              addImage: cy.stub().callsFake(() => {
                addImageCalls.push(true);
              }),
              addPage: cy.stub(),
              save: cy.stub()
            };
          }
        };
        
        win.jspdf = jsPDFStub;
      });
      
      // Generate PDF
      cy.get('#downloadBtn').click();
      
      // Wait for async operations
      cy.wait(2000);
      
      // Verify correct number of images were added
      cy.window().then(() => {
        expect(addImageCalls.length).to.equal(cells);
      });
    });
  });

  it('should handle errors gracefully during PDF generation', () => {
    // Select grid size
    cy.get('#gridSize').select('3');
    
    // Generate cards
    cy.get('#generateBtn').click();
    
    // Mock PDF with error
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
            addImage: cy.stub().throws(new Error('PDF generation error')),
            addPage: cy.stub(),
            save: cy.stub()
          };
        }
      };
      
      win.jspdf = jsPDFStub;
      
      // Stub alert to verify error handling
      cy.stub(win, 'alert').as('alertStub');
    });
    
    // Click download
    cy.get('#downloadBtn').click();
    
    // Wait for error handling
    cy.wait(1000);
    
    // Button should return to normal state even on error
    cy.get('#downloadBtn').should('contain', 'Download PDF');
  });

  it('should preserve aspect ratios in PDF generation', () => {
    // Add a specific non-square test image
    cy.window().then(win => {
      const wideIcon = {
        id: 'wide-test-icon',
        name: 'Wide Test Icon',
        // This is a 2x1 pixel image (wide aspect ratio)
        data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAABCAYAAAD0In+KAAAAEklEQVR42mP8z8DAAEYjGxYAAD8EAQHa2JfCAAAAAElFTkSuQmCC'
      };
      
      return win.iconDB.saveIcons([wideIcon]);
    });
    
    cy.reload();
    
    // Select 3x3 grid
    cy.get('#gridSize').select('3');
    
    // Generate cards
    cy.get('#generateBtn').click();
    
    // Track aspect ratio calculations
    let aspectRatios = [];
    
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
            addImage: cy.stub().callsFake((data, type, x, y, width, height) => {
              aspectRatios.push(width / height);
            }),
            addPage: cy.stub(),
            save: cy.stub()
          };
        }
      };
      
      win.jspdf = jsPDFStub;
    });
    
    // Generate PDF
    cy.get('#downloadBtn').click();
    
    // Wait for generation
    cy.wait(2000);
    
    // Verify aspect ratios are preserved (not all squares)
    cy.window().then(() => {
      expect(aspectRatios.length).to.be.greaterThan(0);
      // At least one image should have a different aspect ratio if we have the wide image
      const uniqueAspectRatios = [...new Set(aspectRatios.map(ar => Math.round(ar * 100) / 100))];
      expect(uniqueAspectRatios.length).to.be.greaterThan(1);
    });
  });
});
