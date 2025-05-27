/**
 * @jest-environment jsdom
 */

import { generateBingoCards } from '@/js/modules/cardGenerator.js';

describe('Card Generator', () => {
  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = '';
    // Clear localStorage
    localStorage.clear();
  });

  describe('generateBingoCards', () => {
    it('should generate cards with correct structure', () => {
      // Generate enough icons for a 3x3 grid (9 icons needed)
      const mockIcons = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        data: `data:image/png;base64,test${i + 1}`,
        name: `test${i + 1}.png`
      }));
      
      const options = {
        icons: mockIcons,
        gridSize: 3,
        setCount: 1,
        cardsPerSet: 1,
        title: 'Test Bingo',
        leaveCenterBlank: false
      };

      const result = generateBingoCards(options);
      
      expect(result).toBeDefined();
      expect(result.cardSets).toBeDefined();
      expect(Array.isArray(result.cardSets)).toBe(true);
      expect(result.cardSets.length).toBe(1); // 1 set requested
    });

    it('should handle empty icons array', () => {
      const options = {
        icons: [],
        gridSize: 3,
        setCount: 1,
        cardsPerSet: 1,
        title: 'Test Bingo',
        leaveCenterBlank: false
      };

      expect(() => {
        generateBingoCards(options);
      }).toThrow('No icons available');
    });

    it('should leave center cell blank for 5x5 grid when leaveCenterBlank is true', () => {
      // Generate enough icons for a 5x5 grid (24 icons needed when center is blank)
      const mockIcons = Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        data: `data:image/png;base64,test${i + 1}`,
        name: `test${i + 1}.png`
      }));
      
      const options = {
        icons: mockIcons,
        gridSize: 5,
        setCount: 1,
        cardsPerSet: 1,
        title: 'Test Bingo',
        leaveCenterBlank: true
      };

      const result = generateBingoCards(options);
      
      expect(result).toBeDefined();
      expect(result.cardSets).toBeDefined();
      expect(result.cardSets.length).toBe(1);
      expect(result.cardSets[0].cards.length).toBe(1);
      
      const card = result.cardSets[0].cards[0];
      expect(card.grid).toBeDefined();
      expect(card.grid.length).toBe(5);
      
      // Center cell (2,2) should be a free space
      const centerCell = card.grid[2][2];
      expect(centerCell.isFreeSpace).toBe(true);
      
      // Count non-free space cells (should be 24)
      let nonFreeSpaceCells = 0;
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          if (!card.grid[row][col].isFreeSpace) {
            nonFreeSpaceCells++;
          }
        }
      }
      expect(nonFreeSpaceCells).toBe(24);
    });

    it('should NOT leave center cell blank for 5x5 grid when leaveCenterBlank is false', () => {
      // Generate enough icons for a 5x5 grid (25 icons needed when center is not blank)
      const mockIcons = Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        data: `data:image/png;base64,test${i + 1}`,
        name: `test${i + 1}.png`
      }));
      
      const options = {
        icons: mockIcons,
        gridSize: 5,
        setCount: 1,
        cardsPerSet: 1,
        title: 'Test Bingo',
        leaveCenterBlank: false
      };

      const result = generateBingoCards(options);
      
      const card = result.cardSets[0].cards[0];
      
      // Center cell (2,2) should NOT be a free space
      const centerCell = card.grid[2][2];
      expect(centerCell.isFreeSpace).toBeFalsy();
      
      // All cells should have content
      let nonFreeSpaceCells = 0;
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          if (!card.grid[row][col].isFreeSpace) {
            nonFreeSpaceCells++;
          }
        }
      }
      expect(nonFreeSpaceCells).toBe(25);
    });

    it('should NOT leave center cell blank for even-sized grids even when leaveCenterBlank is true', () => {
      // Generate enough icons for a 4x4 grid (16 icons needed)
      const mockIcons = Array.from({ length: 16 }, (_, i) => ({
        id: i + 1,
        data: `data:image/png;base64,test${i + 1}`,
        name: `test${i + 1}.png`
      }));
      
      const options = {
        icons: mockIcons,
        gridSize: 4,
        setCount: 1,
        cardsPerSet: 1,
        title: 'Test Bingo',
        leaveCenterBlank: true // Even when true, should not affect even-sized grids
      };

      const result = generateBingoCards(options);
      
      const card = result.cardSets[0].cards[0];
      
      // All cells should have content (no center cell for even-sized grids)
      let nonFreeSpaceCells = 0;
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
          if (!card.grid[row][col].isFreeSpace) {
            nonFreeSpaceCells++;
          }
        }
      }
      expect(nonFreeSpaceCells).toBe(16);
    });
  });
});
