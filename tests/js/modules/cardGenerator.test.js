/**
 * @jest-environment jsdom
 */

import { generateBingoCards, generateIdentifier, calculateExpectedMultiHitCount, getDifficultySettings } from '@/js/modules/cardGenerator.js';

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

    it('should assign a unique identifier to each set', () => {
      const mockIcons = Array.from({ length: 9 }, (_, i) => ({
        id: i + 1,
        data: `data:image/png;base64,test${i + 1}`,
        name: `test${i + 1}.png`
      }));

      const options = {
        icons: mockIcons,
        gridSize: 3,
        setCount: 2,
        cardsPerSet: 1,
        title: 'Test Bingo',
        leaveCenterBlank: false
      };

      const result = generateBingoCards(options);
      expect(result.cardSets.length).toBe(2);
      const id1 = result.cardSets[0].identifier;
      const id2 = result.cardSets[1].identifier;
      expect(id1).toMatch(/^ID:[A-Z0-9]{3}$/);
      expect(id2).toMatch(/^ID:[A-Z0-9]{3}$/);
      expect(id1).not.toBe(id2);
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

  describe('Multi-Hit Mode', () => {
    it('should generate cards normally when multi-hit mode is disabled', () => {
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
        leaveCenterBlank: false,
        multiHitMode: false
      };

      const result = generateBingoCards(options);
      const card = result.cardSets[0].cards[0];
      
      // Check that no cells are marked as multi-hit
      let multiHitCells = 0;
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          const cell = card.grid[row][col];
          if (cell.isMultiHit) {
            multiHitCells++;
          }
          expect(cell.hitCount).toBe(1);
          expect(cell.hitCountDisplay).toBe(1);
        }
      }
      expect(multiHitCells).toBe(0);
    });

    it('should generate multi-hit tiles when multi-hit mode is enabled', () => {
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
        leaveCenterBlank: false,
        multiHitMode: true,
        difficulty: 'MEDIUM'
      };

      const result = generateBingoCards(options);
      const card = result.cardSets[0].cards[0];
      
      // Check that some cells are marked as multi-hit
      let multiHitCells = 0;
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          const cell = card.grid[row][col];
          if (cell.isMultiHit) {
            multiHitCells++;
            expect(cell.hitCount).toBeGreaterThanOrEqual(2);
            expect(cell.hitCount).toBeLessThanOrEqual(4);
            expect(cell.hitCountDisplay).toBe(cell.hitCount);
          } else {
            expect(cell.hitCount).toBe(1);
            expect(cell.hitCountDisplay).toBe(1);
          }
        }
      }
      
      // Should have some multi-hit cells for medium difficulty (40-50% of 25 cells)
      expect(multiHitCells).toBeGreaterThan(0);
      expect(multiHitCells).toBeLessThanOrEqual(25);
    });

    it('should respect difficulty levels', () => {
      const mockIcons = Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        data: `data:image/png;base64,test${i + 1}`,
        name: `test${i + 1}.png`
      }));
      
      const baseOptions = {
        icons: mockIcons,
        gridSize: 5,
        setCount: 1,
        cardsPerSet: 1,
        title: 'Test Bingo',
        leaveCenterBlank: false,
        multiHitMode: true
      };

      // Test Light difficulty
      const lightResult = generateBingoCards({ ...baseOptions, difficulty: 'LIGHT' });
      const lightCard = lightResult.cardSets[0].cards[0];
      
      let lightMultiHit = 0;
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          const cell = lightCard.grid[row][col];
          if (cell.isMultiHit) {
            lightMultiHit++;
            expect(cell.hitCount).toBeGreaterThanOrEqual(2);
            expect(cell.hitCount).toBeLessThanOrEqual(3);
          }
        }
      }
      
      // Test Hard difficulty
      const hardResult = generateBingoCards({ ...baseOptions, difficulty: 'HARD' });
      const hardCard = hardResult.cardSets[0].cards[0];
      
      let hardMultiHit = 0;
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          const cell = hardCard.grid[row][col];
          if (cell.isMultiHit) {
            hardMultiHit++;
            expect(cell.hitCount).toBeGreaterThanOrEqual(3);
            expect(cell.hitCount).toBeLessThanOrEqual(5);
          }
        }
      }
      
      // Hard should generally have more multi-hit cells than light
      // Note: Due to randomness, we can't guarantee this in every run,
      // but we can check that both are within reasonable ranges
      expect(lightMultiHit).toBeGreaterThan(0);
      expect(hardMultiHit).toBeGreaterThan(0);
    });

    it('should avoid multi-hit on center blank tiles', () => {
      const mockIcons = Array.from({ length: 24 }, (_, i) => ({
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
        leaveCenterBlank: true,
        multiHitMode: true,
        difficulty: 'HARD'
      };

      const result = generateBingoCards(options);
      const card = result.cardSets[0].cards[0];
      
      // Center cell should be free space and not multi-hit
      const centerCell = card.grid[2][2];
      expect(centerCell.isFreeSpace).toBe(true);
      expect(centerCell.isMultiHit).toBeFalsy();
    });
  });

  describe('Helper Functions', () => {
    it('should calculate expected multi-hit count correctly', () => {
      // 5x5 grid = 25 cells, medium difficulty = 40-50%, average = 45%
      const expected = calculateExpectedMultiHitCount(5, false, 'MEDIUM');
      expect(expected).toBe(11); // 25 * 0.45 = 11.25, rounded to 11
      
      // 5x5 grid with center blank = 24 cells, medium difficulty = 45%
      const expectedWithBlank = calculateExpectedMultiHitCount(5, true, 'MEDIUM');
      expect(expectedWithBlank).toBe(11); // 24 * 0.45 = 10.8, rounded to 11
    });

    it('should generate a short alphanumeric identifier', () => {
      const id = generateIdentifier();
      expect(id).toMatch(/^ID:[A-Z0-9]{3}$/);
    });

    it('should return correct difficulty settings', () => {
      const light = getDifficultySettings('LIGHT');
      expect(light.minPercentage).toBe(20);
      expect(light.maxPercentage).toBe(30);
      expect(light.minHits).toBe(2);
      expect(light.maxHits).toBe(3);

      const medium = getDifficultySettings('MEDIUM');
      expect(medium.minPercentage).toBe(40);
      expect(medium.maxPercentage).toBe(50);
      expect(medium.minHits).toBe(2);
      expect(medium.maxHits).toBe(4);

      const hard = getDifficultySettings('HARD');
      expect(hard.minPercentage).toBe(60);
      expect(hard.maxPercentage).toBe(70);
      expect(hard.minHits).toBe(3);
      expect(hard.maxHits).toBe(5);
    });
  });
});
