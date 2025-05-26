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
      const mockIcons = [
        { id: 1, data: 'data:image/png;base64,test1', name: 'test1.png' },
        { id: 2, data: 'data:image/png;base64,test2', name: 'test2.png' }
      ];
      
      const settings = {
        gridSize: 3,
        numberOfSets: 1,
        cardsPerSet: 1,
        centerBlank: false,
        title: 'Test Bingo'
      };

      const result = generateBingoCards(mockIcons, settings);
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle empty icons array', () => {
      const settings = {
        gridSize: 3,
        numberOfSets: 1,
        cardsPerSet: 1,
        centerBlank: false,
        title: 'Test Bingo'
      };

      const result = generateBingoCards([], settings);
      
      expect(result).toBeDefined();
    });
  });
});
