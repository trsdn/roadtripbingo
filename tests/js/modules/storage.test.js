/**
 * @jest-environment jsdom
 */

import storage from '@/js/modules/storage.js';

describe('Storage Module', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('loadData', () => {
    it('should return default data when localStorage is empty', () => {
      const result = storage.loadData();
      
      expect(result).toEqual({
        language: 'en',
        theme: 'light',
        icons: [],
        settings: {}
      });
    });

    it('should load existing data from localStorage', () => {
      const testData = {
        language: 'de',
        theme: 'dark',
        icons: [{ id: 1, name: 'test.png' }],
        settings: { gridSize: 5 }
      };
      
      localStorage.setItem('roadtripBingo', JSON.stringify(testData));
      
      const result = storage.loadData();
      expect(result).toEqual(testData);
    });

    it('should return default data when localStorage contains invalid JSON', () => {
      localStorage.setItem('roadtripBingo', 'invalid json');
      
      const result = storage.loadData();
      expect(result).toEqual({
        language: 'en',
        theme: 'light',
        icons: [],
        settings: {}
      });
    });
  });

  describe('saveData', () => {
    it('should save data to localStorage', () => {
      const testData = {
        language: 'de',
        theme: 'dark',
        icons: [{ id: 1, name: 'test.png' }],
        settings: { gridSize: 5 }
      };
      
      storage.saveData(testData);
      
      const saved = JSON.parse(localStorage.getItem('roadtripBingo'));
      expect(saved).toEqual(testData);
    });

    it('should handle save errors gracefully', () => {
      // Mock localStorage to throw an error
      const mockSetItem = jest.spyOn(Storage.prototype, 'setItem')
        .mockImplementation(() => {
          throw new Error('Storage full');
        });
      
      expect(() => {
        storage.saveData({ test: 'data' });
      }).not.toThrow();
      
      mockSetItem.mockRestore();
    });
  });

  describe('clearData', () => {
    it('should clear all data from localStorage', () => {
      localStorage.setItem('roadtripBingo', '{"test": "data"}');
      
      storage.clearData();
      
      expect(localStorage.getItem('roadtripBingo')).toBeNull();
    });
  });
});
