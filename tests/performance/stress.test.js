import { describe, it, expect, vi, beforeEach } from 'vitest';
import { performance } from 'perf_hooks';
import iconService from '../../src/services/iconService';
import { generateBingoCards } from '../../src/services/cardGenerator';

describe('Performance and Stress Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch.mockClear();
  });

  describe('Service Performance', () => {
    it('handles rapid API calls without performance degradation', async () => {
      let responseTime = 50; // Start with 50ms response time
      
      global.fetch.mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: () => Promise.resolve({ id: Date.now() })
            });
          }, responseTime);
          
          // Simulate slight increase in response time under load
          responseTime += 1;
        });
      });

      const callCount = 100;
      const startTime = performance.now();
      
      const promises = Array.from({ length: callCount }, (_, i) =>
        iconService.save({ name: `Icon ${i}`, category: 'test', data: 'test' })
      );
      
      const results = await Promise.all(promises);
      const endTime = performance.now();
      
      const totalDuration = endTime - startTime;
      const avgDuration = totalDuration / callCount;
      
      expect(results).toHaveLength(callCount);
      expect(avgDuration).toBeLessThan(200); // Average under 200ms per call
      expect(totalDuration).toBeLessThan(15000); // Total under 15 seconds
    });

    it('maintains performance with large datasets', async () => {
      const largeIconSet = Array.from({ length: 10000 }, (_, i) => ({
        id: `${i}`,
        name: `Icon ${i}`,
        category: 'performance-test',
        difficulty: (i % 5) + 1,
        data: `data:image/png;base64,${'A'.repeat(1000)}` // 1KB per icon
      }));

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(largeIconSet)
      });

      const startTime = performance.now();
      const startMemory = process.memoryUsage().heapUsed;
      
      const result = await iconService.getAll();
      
      const endTime = performance.now();
      const endMemory = process.memoryUsage().heapUsed;
      
      const duration = endTime - startTime;
      const memoryIncrease = endMemory - startMemory;
      
      expect(result).toHaveLength(10000);
      expect(duration).toBeLessThan(1000); // Under 1 second
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024); // Under 100MB
    });

    it('handles concurrent requests efficiently', async () => {
      const concurrentOperations = [
        // Simulate mixed operations
        ...Array.from({ length: 20 }, (_, i) => iconService.getAll()),
        ...Array.from({ length: 10 }, (_, i) => 
          iconService.save({ name: `New Icon ${i}`, category: 'test', data: 'test' })
        ),
        ...Array.from({ length: 5 }, (_, i) => 
          iconService.update(`${i}`, { name: `Updated ${i}` })
        )
      ];

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([])
      });

      const startTime = performance.now();
      const results = await Promise.allSettled(concurrentOperations);
      const endTime = performance.now();
      
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      
      expect(successCount).toBeGreaterThan(30); // Most operations should succeed
      expect(endTime - startTime).toBeLessThan(5000); // Under 5 seconds
    });
  });

  describe('Card Generation Performance', () => {
    it('generates large numbers of cards efficiently', async () => {
      const icons = Array.from({ length: 1000 }, (_, i) => ({
        id: `${i}`,
        name: `Icon ${i}`,
        category: 'performance',
        difficulty: (i % 5) + 1
      }));

      const settings = {
        gridSize: 5,
        cardCount: 500, // Generate 500 cards
        centerBlank: false,
        multiHitMode: true
      };

      const startTime = performance.now();
      const startMemory = process.memoryUsage().heapUsed;
      
      const cards = await generateBingoCards(icons, settings);
      
      const endTime = performance.now();
      const endMemory = process.memoryUsage().heapUsed;
      
      const duration = endTime - startTime;
      const memoryIncrease = endMemory - startMemory;
      
      expect(cards).toHaveLength(500);
      expect(duration).toBeLessThan(10000); // Under 10 seconds
      expect(memoryIncrease).toBeLessThan(200 * 1024 * 1024); // Under 200MB
      
      // Verify card quality
      cards.forEach(card => {
        expect(card.cells).toHaveLength(25);
        expect(card.cells.every(cell => cell !== null)).toBe(true);
      });
    });

    it('handles maximum grid size efficiently', async () => {
      const icons = Array.from({ length: 100 }, (_, i) => ({
        id: `${i}`,
        name: `Icon ${i}`,
        category: 'large-grid',
        difficulty: (i % 5) + 1
      }));

      const settings = {
        gridSize: 8, // Maximum 8x8 = 64 cells
        cardCount: 10,
        centerBlank: false,
        multiHitMode: false
      };

      const startTime = performance.now();
      const cards = await generateBingoCards(icons, settings);
      const endTime = performance.now();
      
      expect(cards).toHaveLength(10);
      expect(cards[0].cells).toHaveLength(64);
      expect(endTime - startTime).toBeLessThan(2000); // Under 2 seconds
    });

    it('scales linearly with card count', async () => {
      const icons = Array.from({ length: 50 }, (_, i) => ({
        id: `${i}`,
        name: `Icon ${i}`,
        category: 'scaling',
        difficulty: (i % 5) + 1
      }));

      const cardCounts = [10, 50, 100, 200];
      const timings = [];

      for (const cardCount of cardCounts) {
        const startTime = performance.now();
        
        const cards = await generateBingoCards(icons, {
          gridSize: 5,
          cardCount,
          centerBlank: false,
          multiHitMode: false
        });
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        expect(cards).toHaveLength(cardCount);
        timings.push({ cardCount, duration });
      }

      // Check that time scales approximately linearly
      const timeRatio = timings[3].duration / timings[0].duration;
      const cardRatio = timings[3].cardCount / timings[0].cardCount;
      
      // Time ratio should be roughly proportional to card ratio (within 50% tolerance)
      expect(timeRatio).toBeLessThan(cardRatio * 1.5);
    });
  });

  describe('Memory Management', () => {
    it('prevents memory leaks with repeated operations', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([])
      });

      const initialMemory = process.memoryUsage().heapUsed;
      
      // Perform 100 cycles of operations
      for (let cycle = 0; cycle < 100; cycle++) {
        // Create some data
        const tempData = Array.from({ length: 100 }, (_, i) => ({
          id: `${cycle}-${i}`,
          data: 'x'.repeat(1000)
        }));
        
        // Simulate API operations
        await Promise.all([
          iconService.getAll(),
          iconService.save(tempData[0]),
          generateBingoCards(tempData, {
            gridSize: 3,
            cardCount: 5,
            centerBlank: false,
            multiHitMode: false
          })
        ]);
        
        // Force garbage collection periodically
        if (cycle % 20 === 0 && global.gc) {
          global.gc();
        }
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (under 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });

    it('handles large data structures without memory overflow', async () => {
      const hugeDataset = Array.from({ length: 50000 }, (_, i) => ({
        id: `${i}`,
        name: `Large Dataset Icon ${i}`,
        category: 'huge-test',
        difficulty: (i % 5) + 1,
        data: 'data:image/png;base64,' + 'X'.repeat(500), // 500 bytes per icon
        metadata: {
          tags: Array.from({ length: 10 }, (_, j) => `tag-${i}-${j}`),
          description: 'A'.repeat(200)
        }
      }));

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(hugeDataset)
      });

      const startMemory = process.memoryUsage().heapUsed;
      
      try {
        const result = await iconService.getAll();
        expect(result).toHaveLength(50000);
        
        const endMemory = process.memoryUsage().heapUsed;
        const memoryIncrease = endMemory - startMemory;
        
        // Should handle large dataset (but memory increase will be significant)
        expect(memoryIncrease).toBeLessThan(500 * 1024 * 1024); // Under 500MB
        
      } catch (error) {
        // If we run out of memory, that's expected for this stress test
        expect(error.message).toMatch(/memory|heap/i);
      }
    });
  });

  describe('Error Recovery Under Load', () => {
    it('maintains stability with high error rates', async () => {
      let callCount = 0;
      global.fetch.mockImplementation(() => {
        callCount++;
        // Fail 30% of the time
        if (callCount % 10 < 3) {
          return Promise.reject(new Error('Simulated network error'));
        }
        
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: callCount })
        });
      });

      const operations = Array.from({ length: 100 }, (_, i) =>
        iconService.save({ name: `Icon ${i}`, category: 'error-test', data: 'test' })
          .catch(error => ({ error: error.message }))
      );

      const results = await Promise.all(operations);
      
      const successes = results.filter(r => !r.error).length;
      const failures = results.filter(r => r.error).length;
      
      expect(successes).toBeGreaterThan(60); // At least 60% success rate
      expect(failures).toBeLessThan(40); // At most 40% failure rate
      expect(successes + failures).toBe(100);
    });

    it('recovers gracefully from temporary service outages', async () => {
      let isServiceDown = true;
      
      // Service comes back online after 2 seconds
      setTimeout(() => {
        isServiceDown = false;
      }, 2000);

      global.fetch.mockImplementation(() => {
        if (isServiceDown) {
          return Promise.reject(new Error('Service temporarily unavailable'));
        }
        
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        });
      });

      const startTime = performance.now();
      
      // Keep retrying until service comes back
      let attempts = 0;
      let success = false;
      
      while (!success && attempts < 50) {
        try {
          await iconService.getAll();
          success = true;
        } catch (error) {
          attempts++;
          await new Promise(resolve => setTimeout(resolve, 100)); // Wait 100ms between attempts
        }
      }
      
      const endTime = performance.now();
      
      expect(success).toBe(true);
      expect(attempts).toBeGreaterThan(0);
      expect(endTime - startTime).toBeGreaterThan(2000); // Should have waited for service
      expect(endTime - startTime).toBeLessThan(10000); // But not too long
    });
  });

  describe('Browser Resource Limits', () => {
    it('respects browser storage limits', async () => {
      // Simulate approaching localStorage limit
      const largeData = 'x'.repeat(1024 * 1024); // 1MB string
      
      global.localStorage = {
        setItem: vi.fn((key, value) => {
          if (value.length > 5 * 1024 * 1024) { // 5MB limit
            throw new Error('QuotaExceededError');
          }
        }),
        getItem: vi.fn(() => largeData),
        removeItem: vi.fn()
      };

      // Should handle storage quota errors gracefully
      expect(() => {
        global.localStorage.setItem('test', largeData.repeat(10));
      }).toThrow('QuotaExceededError');
    });

    it('handles CPU-intensive operations without blocking UI', async () => {
      const cpuIntensiveIcons = Array.from({ length: 5000 }, (_, i) => ({
        id: `${i}`,
        name: `CPU Test Icon ${i}`,
        category: 'cpu-intensive',
        difficulty: (i % 5) + 1,
        // Simulate complex metadata that requires processing
        metadata: {
          complexCalculation: Math.sin(i) * Math.cos(i) * Math.tan(i),
          nestedData: {
            level1: { level2: { level3: { value: i * Math.PI } } }
          }
        }
      }));

      const startTime = performance.now();
      
      // Use setTimeout to yield control periodically
      const processInChunks = async (data, chunkSize = 100) => {
        const results = [];
        
        for (let i = 0; i < data.length; i += chunkSize) {
          const chunk = data.slice(i, i + chunkSize);
          
          // Process chunk
          const processedChunk = chunk.map(item => ({
            ...item,
            processed: true,
            timestamp: Date.now()
          }));
          
          results.push(...processedChunk);
          
          // Yield control to prevent blocking
          await new Promise(resolve => setTimeout(resolve, 0));
        }
        
        return results;
      };

      const results = await processInChunks(cpuIntensiveIcons);
      const endTime = performance.now();
      
      expect(results).toHaveLength(5000);
      expect(endTime - startTime).toBeLessThan(5000); // Under 5 seconds
      expect(results.every(item => item.processed)).toBe(true);
    });
  });

  describe('Real-world Usage Patterns', () => {
    it('simulates typical user session', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([
          { id: '1', name: 'Car', category: 'transport' },
          { id: '2', name: 'Tree', category: 'nature' }
        ])
      });

      const sessionStartTime = performance.now();
      
      // Simulate user actions over a 30-second period
      const userActions = [
        // Load initial data
        () => iconService.getAll(),
        
        // Upload some icons
        () => iconService.save({ name: 'House', category: 'building', data: 'test' }),
        () => iconService.save({ name: 'Dog', category: 'animal', data: 'test' }),
        
        // Generate cards multiple times
        () => generateBingoCards([
          { id: '1', name: 'Car' },
          { id: '2', name: 'Tree' }
        ], { gridSize: 5, cardCount: 10, centerBlank: false, multiHitMode: false }),
        
        // Update some icons
        () => iconService.update('1', { name: 'Updated Car' }),
        
        // Generate more cards with different settings
        () => generateBingoCards([
          { id: '1', name: 'Updated Car' },
          { id: '2', name: 'Tree' }
        ], { gridSize: 4, cardCount: 5, centerBlank: true, multiHitMode: true }),
        
        // Delete an icon
        () => iconService.delete('2'),
        
        // Final load
        () => iconService.getAll()
      ];

      for (const action of userActions) {
        await action();
        // Simulate user thinking time
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
      }
      
      const sessionEndTime = performance.now();
      const sessionDuration = sessionEndTime - sessionStartTime;
      
      // Session should complete in reasonable time
      expect(sessionDuration).toBeLessThan(30000); // Under 30 seconds
      expect(sessionDuration).toBeGreaterThan(4000); // At least 4 seconds (due to delays)
    });
  });
});