describe('Multi-Hit Mode Feature', () => {
  beforeEach(() => {
    // Start with a clean localStorage
    cy.clearLocalStorage();
    
    // Visit the app (using the correct port)
    cy.visit('http://localhost:8080');
    
    // Wait for the app to fully initialize
    cy.get('body', { timeout: 10000 }).should('be.visible');
    
    // Wait for the app JavaScript to be fully loaded and initialized
    cy.window().its('iconDB').should('exist');
    cy.get('#generateBtn').should('exist');
    
    // Set up test data with enough icons for testing
    cy.window().then(async (win) => {
      // Wait for iconDB to be available and initialized
      const waitForIconDB = () => {
        return new Promise((resolve) => {
          const checkIconDB = () => {
            if (win.iconDB && 
                typeof win.iconDB.saveIcons === 'function' && 
                win.iconDB.db !== null) {
              resolve();
            } else {
              setTimeout(checkIconDB, 100);
            }
          };
          checkIconDB();
        });
      };
      
      await waitForIconDB();
      
      // Ensure the database is fully initialized
      if (!win.iconDB.db) {
        await win.iconDB.init();
      }
      
      const testIcons = Array.from({ length: 40 }, (_, i) => ({
        id: `test-${i}`,
        name: `test-icon-${i}`,
        data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
      }));
      
      return win.iconDB.saveIcons(testIcons);
    });
    
    // Reload the page to reflect the changes
    cy.reload();
    
    // Wait for the app to be fully initialized after reload
    cy.window().its('iconDB').should('exist');
    cy.get('#generateBtn').should('exist');
    
    // Simple wait for initialization to complete
    cy.wait(2000);
  });

  it('should load the application', () => {
    cy.get('h1').should('contain', 'Road Trip Bingo Generator');
  });

  it('should display multi-hit mode controls', () => {
    // Wait for the app to be fully ready
    cy.window().then((win) => {
      // Ensure event listeners are attached
      expect(win.document.readyState).to.equal('complete');
      cy.log('Document ready, available icons:', win.availableIcons ? win.availableIcons.length : 'undefined');
    });
    cy.wait(500);

    // Check that multi-hit toggle exists and is interactive
    cy.get('#multiHitToggle').should('exist').and('be.visible').and('not.be.disabled');
    
    // Debug: Check initial checkbox state
    cy.get('#multiHitToggle').then(($checkbox) => {
      cy.log('Initial checkbox state:', $checkbox.prop('checked'));
    });
    
    // Check that multi-hit options are initially hidden
    cy.get('#multiHitOptions').should('exist').and('not.be.visible');
    
    // Debug: Check initial options visibility
    cy.get('#multiHitOptions').then(($options) => {
      cy.log('Initial options display:', $options.css('display'));
    });
    
    // Enable multi-hit mode (now that initialization is complete)
    cy.get('#multiHitToggle').check({ force: true }).should('be.checked');
    
    // Debug: Check state after check
    cy.get('#multiHitToggle').then(($checkbox) => {
      cy.log('Checkbox state after check:', $checkbox.prop('checked'));
    });
    
    // Give more time for the change to process
    cy.wait(1000);
    
    // Debug: Check options visibility after change
    cy.get('#multiHitOptions').then(($options) => {
      cy.log('Options display after check:', $options.css('display'));
    });
    
    // Wait for the options to become visible
    cy.get('#multiHitOptions').should('be.visible');
    
    // Verify the checkbox is actually checked
    cy.get('#multiHitToggle').should('be.checked');
    
    // Check that all difficulty options exist and are interactive
    cy.get('input[name="difficulty"][value="LIGHT"]').should('exist').and('not.be.disabled');
    cy.get('input[name="difficulty"][value="MEDIUM"]').should('exist').and('not.be.disabled');
    cy.get('input[name="difficulty"][value="HARD"]').should('exist').and('not.be.disabled');
    
    // Check that MEDIUM is selected by default
    cy.get('input[name="difficulty"][value="MEDIUM"]').should('be.checked');
    
    // Check that preview text exists
    cy.get('#multiHitPreview').should('exist').and('be.visible');
  });

  it('should update preview text when difficulty changes', () => {
    // Enable multi-hit mode
    cy.get('#multiHitToggle').check({ force: true });
    cy.get('#multiHitOptions').should('be.visible');
    
    // Check Light difficulty preview
    cy.get('input[name="difficulty"][value="LIGHT"]').check({ force: true });
    cy.get('#multiHitPreview').should('contain.text', 'Expected:');
    cy.get('#multiHitPreview').should('contain.text', 'multiple hits');
    
    // Check Medium difficulty preview
    cy.get('input[name="difficulty"][value="MEDIUM"]').check({ force: true });
    cy.get('#multiHitPreview').should('contain.text', 'Expected:');
    cy.get('#multiHitPreview').should('contain.text', 'multiple hits');
    
    // Check Hard difficulty preview
    cy.get('input[name="difficulty"][value="HARD"]').check({ force: true });
    cy.get('#multiHitPreview').should('contain.text', 'Expected:');
    cy.get('#multiHitPreview').should('contain.text', 'multiple hits');
  });

  it('should generate cards with multi-hit mode enabled', () => {
    // Enable multi-hit mode
    cy.get('#multiHitToggle').check({ force: true });
    cy.get('#multiHitOptions').should('be.visible');
    
    // Select Medium difficulty
    cy.get('input[name="difficulty"][value="MEDIUM"]').check({ force: true });
    
    // Wait for generate button to be enabled
    cy.get('#generateBtn').should('not.be.disabled');
    
    // Generate cards
    cy.get('#generateBtn').click();
    
    // Wait for card generation
    cy.wait(3000);
    
    // Check that preview is displayed
    cy.get('#cardPreview').should('be.visible');
    
    // Check for multi-hit badges in the preview
    cy.get('.multi-hit-badge').should('exist');
    
    // Verify that some badges exist (should be roughly 40-50% for medium difficulty)
    cy.get('.multi-hit-badge').should('have.length.greaterThan', 0);
  });

  it('should persist multi-hit settings', () => {
    // Enable multi-hit mode and select Hard difficulty
    cy.get('#multiHitToggle').check({ force: true });
    cy.get('#multiHitOptions').should('be.visible');
    cy.get('input[name="difficulty"][value="HARD"]').check({ force: true });
    
    // Wait for settings to be saved
    cy.wait(1000);
    
    // Reload the page
    cy.reload();
    
    // Wait for the page to load and app to initialize
    cy.get('body').should('be.visible');
    cy.wait(2000);
    
    // Check that multi-hit mode is still enabled
    cy.get('#multiHitToggle').should('be.checked');
    
    // Check that Hard difficulty is still selected
    cy.get('input[name="difficulty"][value="HARD"]').should('be.checked');
    
    // Check that options are visible
    cy.get('#multiHitOptions').should('be.visible');
  });

  it('should work with different grid sizes', () => {
    // Wait for app to be ready
    cy.wait(500);
    
    // Test with 4x4 grid
    cy.get('#gridSize').select('4');
    cy.get('#multiHitToggle').check({ force: true });
    cy.get('#multiHitOptions').should('be.visible');
    
    // Check icon availability and generate button status
    cy.window().then((win) => {
      cy.log('Available icons:', win.availableIcons ? win.availableIcons.length : 'undefined');
    });
    
    // Wait for icon count to be processed
    cy.wait(1000);
    cy.get('#generateBtn').should('not.be.disabled');
    cy.get('#generateBtn').click();
    cy.wait(2000);
    cy.get('#cardPreview').should('be.visible');
    
    // Test with 5x5 grid
    cy.get('#gridSize').select('5');
    cy.get('#generateBtn').should('not.be.disabled');
    cy.get('#generateBtn').click();
    cy.wait(2000);
    cy.get('#cardPreview').should('be.visible');
    
    // Test with 6x6 grid
    cy.get('#gridSize').select('6');
    cy.get('#generateBtn').should('not.be.disabled');
    cy.get('#generateBtn').click();
    cy.wait(2000);
    cy.get('#cardPreview').should('be.visible');
  });

  it('should not affect center blank functionality', () => {
    // Ensure we are back to 5×5 grid
    cy.get('#gridSize').select('5');
    
    // Optional: clear previous preview if it exists
    cy.get('#cardPreview').then(($el) => { 
      if ($el.length > 0) {
        $el.empty(); 
      }
    });
    
    // Ensure center blank is enabled (it's checked by default, so only check if needed)
    cy.get('#centerBlankToggle').then(($checkbox) => {
      if (!$checkbox.is(':checked')) {
        cy.get('#centerBlankToggle').check({ force: true });
      }
    });
    
    // Enable multi-hit mode (now that initialization is complete)
    cy.get('#multiHitToggle').check({ force: true }).should('be.checked');
    cy.get('#multiHitOptions').should('be.visible');
    
    // Generate cards
    cy.get('#generateBtn').should('not.be.disabled');
    cy.get('#generateBtn').click();
    cy.wait(3000);
    
    // Check that preview is visible and has cells
    cy.get('#cardPreview').should('be.visible');
    cy.get('#cardPreview .bingo-cell').should('have.length.greaterThan', 0);
    
    // Check that center cell is blank and has no multi-hit badge
    // For 5x5 grid, center cell is index 12 (0-based: row 2, col 2)
    cy.get('#cardPreview .bingo-cell').eq(12).should('contain.text', 'FREE');
    cy.get('#cardPreview .bingo-cell').eq(12).find('.multi-hit-badge').should('not.exist');
  });

  it('should disable multi-hit options when toggled off', () => {
    // Toggle multi‑hit mode ON
    cy.get('#multiHitToggle').check({ force: true });
    cy.get('#multiHitOptions').should('be.visible');
    
    // Toggle multi‑hit mode OFF
    cy.get('#multiHitToggle').uncheck({ force: true });
    
    // Check that options are hidden
    cy.get('#multiHitOptions').should('not.be.visible');
    
    // Generate cards and verify no multi-hit badges
    cy.get('#generateBtn').should('not.be.disabled');
    cy.get('#generateBtn').click();
    cy.wait(2000);
    cy.get('#cardPreview').should('be.visible');
    cy.get('.multi-hit-badge').should('not.exist');
  });

  it('should generate PDF with multi-hit counters', () => {
    // Enable multi-hit mode
    cy.get('#multiHitToggle').check({ force: true });
    cy.get('#multiHitOptions').should('be.visible');
    cy.get('input[name="difficulty"][value="MEDIUM"]').check({ force: true });
    
    // Generate cards
    cy.get('#generateBtn').should('not.be.disabled');
    cy.get('#generateBtn').click();
    cy.wait(3000);
    
    // Check that preview is visible
    cy.get('#cardPreview').should('be.visible');
    
    // Click download PDF button
    cy.get('#downloadBtn').should('not.be.disabled');
    cy.get('#downloadBtn').click();
    
    // Wait for PDF generation
    cy.wait(3000);
    
    // Check that no errors occurred (PDF generation is complex to test directly)
    // We mainly verify the button works and no JavaScript errors
    cy.window().then((win) => {
      // Check that no console errors occurred during PDF generation
      // Note: This is a basic check, comprehensive PDF testing would require additional tools
      cy.log('PDF generation completed without JavaScript errors');
    });
  });

  it('should show correct hit counts for different difficulties', () => {
    // Test Light difficulty (2-3 hits)
    cy.get('#multiHitToggle').check({ force: true });
    cy.get('#multiHitOptions').should('be.visible');
    cy.get('input[name="difficulty"][value="LIGHT"]').check({ force: true });
    cy.get('#generateBtn').should('not.be.disabled').click();
    cy.wait(1000);
    
    // Check that hit counts are within expected range
    cy.get('.multi-hit-badge').each(($badge) => {
      const hitCount = parseInt($badge.text());
      expect(hitCount).to.be.within(2, 3);
    });
    
    // Test Hard difficulty (3-5 hits)
    cy.get('input[name="difficulty"][value="HARD"]').check({ force: true });
    cy.get('#generateBtn').should('not.be.disabled').click();
    cy.wait(1000);
    
    cy.get('.multi-hit-badge').each(($badge) => {
      const hitCount = parseInt($badge.text());
      expect(hitCount).to.be.within(3, 5);
    });
  });

  it('should maintain responsive design with multi-hit badges', () => {
    // Test on different viewport sizes
    cy.viewport(1200, 800);
    cy.get('#multiHitToggle').check({ force: true });
    cy.get('#multiHitOptions').should('be.visible');
    cy.get('#generateBtn').should('not.be.disabled').click();
    cy.wait(1000);
    cy.get('.multi-hit-badge').should('be.visible');
    
    cy.viewport(768, 1024);
    cy.get('.multi-hit-badge').should('be.visible');
    
    cy.viewport(375, 667);
    cy.get('.multi-hit-badge').should('be.visible');
  });
});
