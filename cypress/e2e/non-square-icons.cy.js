describe('Road Trip Bingo - Non-Square Icon Aspect Ratio Fix', () => {
  beforeEach(() => {
    // Start with a clean localStorage
    cy.clearLocalStorage();
    
    // Visit the app
    cy.visit('/');
  });

  it('should preserve aspect ratio for non-square icons in gallery', () => {
    // Create test icons with different aspect ratios
    cy.window().then(win => {
      // Create a test icon with non-square dimensions (wide rectangle)
      const canvas = document.createElement('canvas');
      canvas.width = 520;  // Wide
      canvas.height = 110; // Short (like DD.png and WOB.png)
      const ctx = canvas.getContext('2d');
      
      // Fill with a colored rectangle to make it visible
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ffffff';
      ctx.font = '20px Arial';
      ctx.fillText('WIDE', canvas.width/2 - 25, canvas.height/2 + 7);
      
      const wideIcon = {
        id: 'test-wide-icon',
        name: 'wide-icon.png',
        data: canvas.toDataURL('image/png')
      };

      // Create a square icon for comparison
      const squareCanvas = document.createElement('canvas');
      squareCanvas.width = 100;
      squareCanvas.height = 100;
      const squareCtx = squareCanvas.getContext('2d');
      squareCtx.fillStyle = '#00ff00';
      squareCtx.fillRect(0, 0, 100, 100);
      squareCtx.fillStyle = '#000000';
      squareCtx.font = '14px Arial';
      squareCtx.fillText('SQUARE', 20, 55);
      
      const squareIcon = {
        id: 'test-square-icon',
        name: 'square-icon.png',
        data: squareCanvas.toDataURL('image/png')
      };

      return win.iconDB.saveIcons([wideIcon, squareIcon]);
    });
    
    // Reload to see the changes
    cy.reload();
    
    // Verify icons are displayed
    cy.get('#iconGallery .icon-item').should('have.length', 2);
    cy.get('#iconCount').should('contain', '2');
    
    // Check that wide icon maintains aspect ratio
    cy.get('#iconGallery .icon-item img[alt="wide-icon.png"]').then($img => {
      const img = $img[0];
      // The image should not be stretched to square
      // It should maintain its wide aspect ratio
      expect(img.clientWidth).to.be.greaterThan(img.clientHeight);
      // Should fit within max dimensions
      expect(img.clientWidth).to.be.at.most(50);
      expect(img.clientHeight).to.be.at.most(50);
    });
    
    // Check that square icon displays normally
    cy.get('#iconGallery .icon-item img[alt="square-icon.png"]').then($img => {
      const img = $img[0];
      // Square icon should have equal or similar width/height
      const aspectRatio = img.clientWidth / img.clientHeight;
      expect(aspectRatio).to.be.closeTo(1, 0.1); // Allow small variance
    });
  });

  it('should preserve aspect ratio in generated bingo cards', () => {
    // Add test icons with different aspect ratios
    cy.window().then(win => {
      const canvas = document.createElement('canvas');
      canvas.width = 520;
      canvas.height = 110;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#0000ff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ffffff';
      ctx.font = '20px Arial';
      ctx.fillText('RECT', canvas.width/2 - 25, canvas.height/2 + 7);
      
      // Create multiple copies for a full grid
      const testIcons = Array.from({ length: 9 }, (_, i) => ({
        id: `test-${i}`,
        name: `test-icon-${i}.png`,
        data: canvas.toDataURL('image/png')
      }));
      
      return win.iconDB.saveIcons(testIcons);
    });
    
    cy.reload();
    
    // Select 3x3 grid
    cy.get('#gridSize').select('3');
    
    // Generate cards
    cy.get('#generateBtn').click();
    
    // Check that bingo card images maintain aspect ratio
    cy.get('#cardPreview .bingo-cell img').should('have.length', 9);
    
    // Each image should maintain its wide aspect ratio
    cy.get('#cardPreview .bingo-cell img').each($img => {
      const img = $img[0];
      // Images should be wider than they are tall
      expect(img.clientWidth).to.be.greaterThan(img.clientHeight);
      // Should fit within cell constraints
      expect(img.clientWidth).to.be.at.most(80); // Approximate cell size
      expect(img.clientHeight).to.be.at.most(80);
    });
  });

  it('should handle mixed aspect ratios in the same card', () => {
    // Create icons with different aspect ratios
    cy.window().then(win => {
      const icons = [];
      
      // Wide icon
      const wideCanvas = document.createElement('canvas');
      wideCanvas.width = 400;
      wideCanvas.height = 100;
      let ctx = wideCanvas.getContext('2d');
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(0, 0, 400, 100);
      icons.push({
        id: 'wide-1',
        name: 'wide.png',
        data: wideCanvas.toDataURL('image/png')
      });
      
      // Tall icon
      const tallCanvas = document.createElement('canvas');
      tallCanvas.width = 100;
      tallCanvas.height = 400;
      ctx = tallCanvas.getContext('2d');
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(0, 0, 100, 400);
      icons.push({
        id: 'tall-1',
        name: 'tall.png',
        data: tallCanvas.toDataURL('image/png')
      });
      
      // Square icon
      const squareCanvas = document.createElement('canvas');
      squareCanvas.width = 200;
      squareCanvas.height = 200;
      ctx = squareCanvas.getContext('2d');
      ctx.fillStyle = '#0000ff';
      ctx.fillRect(0, 0, 200, 200);
      icons.push({
        id: 'square-1',
        name: 'square.png',
        data: squareCanvas.toDataURL('image/png')
      });
      
      // Duplicate to fill 9 cells
      const fullIcons = [];
      for (let i = 0; i < 9; i++) {
        const baseIcon = icons[i % 3];
        fullIcons.push({
          ...baseIcon,
          id: `${baseIcon.id}-${i}`,
          name: `${baseIcon.name}-${i}`
        });
      }
      
      return win.iconDB.saveIcons(fullIcons);
    });
    
    cy.reload();
    
    // Generate a 3x3 card
    cy.get('#gridSize').select('3');
    cy.get('#generateBtn').click();
    
    // Verify all images are displayed and maintain their ratios
    cy.get('#cardPreview .bingo-cell img').should('have.length', 9);
    
    // Check that different aspect ratios coexist properly
    cy.get('#cardPreview .bingo-cell img').then($images => {
      let hasWide = false;
      let hasTall = false;
      let hasSquare = false;
      
      $images.each((_, img) => {
        const aspectRatio = img.clientWidth / img.clientHeight;
        if (aspectRatio > 1.5) hasWide = true;
        else if (aspectRatio < 0.67) hasTall = true;
        else hasSquare = true;
      });
      
      // Should have mixed aspect ratios
      expect(hasWide || hasTall).to.be.true;
    });
  });
});
