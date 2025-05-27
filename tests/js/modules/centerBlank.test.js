/**
 * @jest-environment jsdom
 */

import { generateBingoCards } from '@/js/modules/cardGenerator.js';

describe('Center Blank Toggle Feature', () => {
  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = '';
    // Clear localStorage
    localStorage.clear();
  });

  describe('generateBingoCards with leaveCenterBlank option', () => {
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

    it('should leave center cell blank for 7x7 grid when leaveCenterBlank is true', () => {
      // Generate enough icons for a 7x7 grid (48 icons needed when center is blank)
      const mockIcons = Array.from({ length: 49 }, (_, i) => ({
        id: i + 1,
        data: `data:image/png;base64,test${i + 1}`,
        name: `test${i + 1}.png`
      }));
      
      const options = {
        icons: mockIcons,
        gridSize: 7,
        setCount: 1,
        cardsPerSet: 1,
        title: 'Test Bingo',
        leaveCenterBlank: true
      };

      const result = generateBingoCards(options);
      
      const card = result.cardSets[0].cards[0];
      
      // Center cell (3,3) should be a free space
      const centerCell = card.grid[3][3];
      expect(centerCell.isFreeSpace).toBe(true);
      
      // Count non-free space cells (should be 48)
      let nonFreeSpaceCells = 0;
      for (let row = 0; row < 7; row++) {
        for (let col = 0; col < 7; col++) {
          if (!card.grid[row][col].isFreeSpace) {
            nonFreeSpaceCells++;
          }
        }
      }
      expect(nonFreeSpaceCells).toBe(48);
    });

    it('should NOT leave center cell blank for even-sized grids (4x4)', () => {
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

    it('should NOT leave center cell blank for 3x3 grid when leaveCenterBlank is true (only works for 5x5, 7x7, 9x9)', () => {
      // Generate enough icons for a 3x3 grid (9 icons needed)
      const mockIcons = Array.from({ length: 9 }, (_, i) => ({
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
        leaveCenterBlank: true // Should not affect 3x3 grids
      };

      const result = generateBingoCards(options);
      
      const card = result.cardSets[0].cards[0];
      
      // All cells should have content (feature only applies to 5x5, 7x7, 9x9)
      let nonFreeSpaceCells = 0;
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          if (!card.grid[row][col].isFreeSpace) {
            nonFreeSpaceCells++;
          }
        }
      }
      expect(nonFreeSpaceCells).toBe(9);
    });
  });
});
