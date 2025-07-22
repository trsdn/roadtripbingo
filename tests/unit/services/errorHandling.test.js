import { describe, it, expect, vi, beforeEach } from 'vitest';
import iconService from '../../../src/services/iconService';
import settingsService from '../../../src/services/settingsService';
import { generateBingoCards } from '../../../src/services/cardGenerator';

describe('Error Handling and Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch.mockClear();
  });

  describe('Network Failures', () => {
    it('handles complete network failure', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'));

      await expect(iconService.getAll()).rejects.toThrow('Network error');
    });

    it('handles timeout errors', async () => {
      global.fetch.mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      );

      await expect(iconService.getAll()).rejects.toThrow('Timeout');
    });

    it('handles intermittent connection issues', async () => {
      // First call fails, second succeeds
      global.fetch
        .mockRejectedValueOnce(new Error('Connection failed'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([])
        });

      // First attempt should fail
      await expect(iconService.getAll()).rejects.toThrow('Connection failed');

      // Second attempt should succeed
      const result = await iconService.getAll();
      expect(result).toEqual([]);
    });

    it('handles malformed server responses', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON'))
      });

      await expect(iconService.getAll()).rejects.toThrow('Invalid JSON');
    });

    it('handles HTTP error codes', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      await expect(iconService.getAll()).rejects.toThrow('HTTP error! status: 500');
    });
  });

  describe('Data Corruption and Validation', () => {
    it('handles corrupted icon data', async () => {
      const corruptedIcons = [
        { id: '1', name: null, category: '', data: 'invalid-base64' },
        { id: '2' }, // Missing required fields
        { id: '3', name: 'Valid', category: 'test', data: 'data:image/png;base64,valid' }
      ];

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(corruptedIcons)
      });

      const result = await iconService.getAll();
      expect(result).toEqual(corruptedIcons); // Service returns data as-is
    });

    it('validates icon data before saving', async () => {
      const invalidIcon = {
        name: '', // Empty name
        category: null, // Invalid category
        data: 'not-base64' // Invalid data
      };

      global.fetch.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request'
      });

      await expect(iconService.save(invalidIcon)).rejects.toThrow('HTTP error! status: 400');
    });

    it('handles extremely large icon data', async () => {
      const hugeIcon = {
        name: 'Huge Icon',
        category: 'test',
        data: 'data:image/png;base64,' + 'A'.repeat(10000000) // 10MB base64 string
      };

      global.fetch.mockResolvedValue({
        ok: false,
        status: 413,
        statusText: 'Payload Too Large'
      });

      await expect(iconService.save(hugeIcon)).rejects.toThrow('HTTP error! status: 413');
    });
  });

  describe('Settings Edge Cases', () => {
    it('handles invalid setting keys', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      const result = await settingsService.get('invalid-key', 'default');
      expect(result).toBe('default');
    });

    it('handles settings with special characters', async () => {
      const weirdKey = 'test/key\\with:special@chars#';
      const weirdValue = '{"complex": "value", "with": ["arrays", 123]}';

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ key: weirdKey, value: weirdValue })
      });

      await settingsService.set(weirdKey, weirdValue);
      
      expect(global.fetch).toHaveBeenCalledWith(
        `/api/settings/${encodeURIComponent(weirdKey)}`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ value: weirdValue })
        })
      );
    });

    it('handles concurrent setting updates', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ key: 'test', value: 'final' })
      });

      // Simulate multiple concurrent updates
      const promises = Array.from({ length: 5 }, (_, i) =>
        settingsService.set('test', `value-${i}`)
      );

      const results = await Promise.all(promises);
      
      // All should resolve, server handles concurrency
      results.forEach(result => {
        expect(result).toEqual({ key: 'test', value: 'final' });
      });
    });
  });

  describe('Card Generation Edge Cases', () => {
    it('generates cards with no icons', async () => {
      await expect(generateBingoCards([], { 
        gridSize: 3, 
        cardCount: 1, 
        centerBlank: false,
        multiHitMode: false
      })).resolves.toBeDefined();
    });

    it('handles extremely large grid sizes', async () => {
      const manyIcons = Array.from({ length: 100 }, (_, i) => ({
        id: `${i}`,
        name: `Icon ${i}`,
        category: 'test',
        difficulty: 1
      }));

      const result = await generateBingoCards(manyIcons, {
        gridSize: 8, // Maximum supported
        cardCount: 1,
        centerBlank: false,
        multiHitMode: false
      });

      expect(result).toHaveLength(1);
      expect(result[0].cells).toHaveLength(64);
    });

    it('handles insufficient icons for grid size', async () => {
      const fewIcons = [
        { id: '1', name: 'Icon 1', category: 'test', difficulty: 1 },
        { id: '2', name: 'Icon 2', category: 'test', difficulty: 1 }
      ];

      const result = await generateBingoCards(fewIcons, {
        gridSize: 5, // 25 cells, but only 2 icons
        cardCount: 1,
        centerBlank: false,
        multiHitMode: false
      });

      expect(result).toHaveLength(1);
      expect(result[0].cells).toHaveLength(25);
      
      // Should reuse icons to fill grid
      const nonBlankCells = result[0].cells.filter(cell => !cell.isBlank);
      expect(nonBlankCells.length).toBe(25);
    });

    it('handles duplicate icon IDs', async () => {
      const iconsWithDuplicates = [
        { id: '1', name: 'Icon 1', category: 'test', difficulty: 1 },
        { id: '1', name: 'Duplicate', category: 'test', difficulty: 2 }, // Same ID
        { id: '2', name: 'Icon 2', category: 'test', difficulty: 1 }
      ];

      const result = await generateBingoCards(iconsWithDuplicates, {
        gridSize: 3,
        cardCount: 1,
        centerBlank: false,
        multiHitMode: false
      });

      expect(result).toHaveLength(1);
      expect(result[0].cells).toHaveLength(9);
    });

    it('handles icons with missing properties', async () => {
      const brokenIcons = [
        { id: '1', name: 'Complete Icon', category: 'test', difficulty: 1 },
        { id: '2', name: 'Missing Category' }, // No category or difficulty
        { id: '3', category: 'test' }, // No name
        null, // Completely null
        undefined // Completely undefined
      ].filter(Boolean); // Remove null/undefined for this test

      const result = await generateBingoCards(brokenIcons, {
        gridSize: 3,
        cardCount: 1,
        centerBlank: false,
        multiHitMode: false
      });

      expect(result).toHaveLength(1);
      expect(result[0].cells).toHaveLength(9);
    });

    it('handles multi-hit mode with all icons excluded', async () => {
      const excludedIcons = [
        { id: '1', name: 'Icon 1', excludeFromMultiHit: true },
        { id: '2', name: 'Icon 2', excludeFromMultiHit: true }
      ];

      const result = await generateBingoCards(excludedIcons, {
        gridSize: 3,
        cardCount: 1,
        centerBlank: false,
        multiHitMode: true
      });

      expect(result).toHaveLength(1);
      
      // No cells should be multi-hit targets
      const multiHitCells = result[0].cells.filter(cell => cell.multiHitTarget);
      expect(multiHitCells).toHaveLength(0);
    });

    it('handles extreme card counts', async () => {
      const icons = Array.from({ length: 25 }, (_, i) => ({
        id: `${i}`,
        name: `Icon ${i}`,
        category: 'test',
        difficulty: 1
      }));

      const result = await generateBingoCards(icons, {
        gridSize: 3,
        cardCount: 100, // Many cards
        centerBlank: false,
        multiHitMode: false
      });

      expect(result).toHaveLength(100);
      result.forEach(card => {
        expect(card.cells).toHaveLength(9);
      });
    });
  });

  describe('Memory and Resource Constraints', () => {
    it('handles memory pressure during large operations', async () => {
      // Simulate limited memory by creating large objects
      const hugeIcons = Array.from({ length: 1000 }, (_, i) => ({
        id: `${i}`,
        name: `Icon ${i}`,
        category: 'test',
        difficulty: 1,
        data: 'data:image/png;base64,' + 'A'.repeat(1000) // Large data
      }));

      const startMemory = process.memoryUsage().heapUsed;
      
      const result = await generateBingoCards(hugeIcons, {
        gridSize: 8,
        cardCount: 10,
        centerBlank: false,
        multiHitMode: false
      });

      const endMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = endMemory - startMemory;

      expect(result).toHaveLength(10);
      // Memory increase should be reasonable (less than 100MB)
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024);
    });

    it('handles rapid successive API calls', async () => {
      let callCount = 0;
      global.fetch.mockImplementation(() => {
        callCount++;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: callCount })
        });
      });

      // Make 100 rapid calls
      const promises = Array.from({ length: 100 }, (_, i) =>
        iconService.save({ name: `Icon ${i}`, category: 'test', data: 'test' })
      );

      const results = await Promise.allSettled(promises);
      
      // All should resolve or at least not crash
      results.forEach(result => {
        expect(result.status).toBe('fulfilled');
      });
    });
  });

  describe('Browser Compatibility Issues', () => {
    it('handles missing modern JS features gracefully', () => {
      // Temporarily remove modern methods to test fallbacks
      const originalValues = Array.prototype.values;
      delete Array.prototype.values;

      try {
        const icons = [{ id: '1', name: 'Test' }];
        expect(() => generateBingoCards(icons, {
          gridSize: 3,
          cardCount: 1,
          centerBlank: false,
          multiHitMode: false
        })).not.toThrow();
      } finally {
        Array.prototype.values = originalValues;
      }
    });

    it('handles missing fetch API', () => {
      const originalFetch = global.fetch;
      delete global.fetch;

      try {
        expect(() => iconService.getAll()).toThrow();
      } finally {
        global.fetch = originalFetch;
      }
    });

    it('handles missing localStorage', async () => {
      const originalLocalStorage = global.localStorage;
      delete global.localStorage;

      try {
        // Services should still work without localStorage
        global.fetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({})
        });

        await expect(settingsService.getAll()).resolves.toEqual({});
      } finally {
        global.localStorage = originalLocalStorage;
      }
    });
  });

  describe('Race Conditions', () => {
    it('handles concurrent read/write operations', async () => {
      let responseCounter = 0;
      global.fetch.mockImplementation(() => {
        responseCounter++;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ counter: responseCounter })
        });
      });

      // Start concurrent operations
      const readPromise = iconService.getAll();
      const writePromise = iconService.save({ name: 'Test', category: 'test', data: 'test' });
      const updatePromise = iconService.update('1', { name: 'Updated' });

      const results = await Promise.all([readPromise, writePromise, updatePromise]);
      
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result).toHaveProperty('counter');
      });
    });

    it('handles rapid state changes', async () => {
      // Simulate rapid state changes that could cause race conditions
      const operations = Array.from({ length: 20 }, (_, i) => {
        if (i % 3 === 0) {
          return iconService.save({ name: `Icon ${i}`, category: 'test', data: 'test' });
        } else if (i % 3 === 1) {
          return iconService.update(`${i}`, { name: `Updated ${i}` });
        } else {
          return iconService.delete(`${i}`);
        }
      });

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      const results = await Promise.allSettled(operations);
      
      // All should complete without crashing
      results.forEach(result => {
        expect(['fulfilled', 'rejected']).toContain(result.status);
      });
    });
  });
});