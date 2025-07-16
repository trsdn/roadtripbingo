/**
 * @jest-environment node
 * @jest-setupFilesAfterEnv ["<rootDir>/../config/jest.setup.node.js"]
 */

const fs = require('fs');
const path = require('path');
const SQLiteStorage = require('../../../src/js/modules/sqliteStorage.js');

// Mock database path for tests
const testDbPath = path.join(__dirname, '../../../temp/test-roadtripbingo.db');
const testDataDir = path.dirname(testDbPath);

describe('SQLiteStorage', () => {
  let storage;

  // Test data for all tests
  const testIcon = {
    id: 'test-icon-1',
    name: 'Test Icon',
    data: Buffer.from('fake-image-data'),
    type: 'image/png',
    size: 1024
  };

  beforeEach(async () => {
    // Ensure temp directory exists
    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, { recursive: true });
    }

    // Remove test database if it exists
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }

    storage = new SQLiteStorage(testDbPath);
    await storage.init();
  });

  afterEach(async () => {
    // Close database connection
    if (storage && storage.db) {
      storage.db.close();
    }

    // Clean up test database
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  afterAll(() => {
    // Clean up temp directory
    if (fs.existsSync(testDataDir)) {
      fs.rmSync(testDataDir, { recursive: true, force: true });
    }
  });

  describe('constructor', () => {
    test('should initialize with default database path', () => {
      const defaultStorage = new SQLiteStorage();
      expect(defaultStorage.dbPath).toBe('./data/roadtripbingo.db');
      expect(defaultStorage.db).toBeNull();
      expect(defaultStorage.isInitialized).toBe(false);
    });

    test('should initialize with custom database path', () => {
      const customPath = '/custom/path/test.db';
      const customStorage = new SQLiteStorage(customPath);
      expect(customStorage.dbPath).toBe(customPath);
    });
  });

  describe('init', () => {
    test('should initialize database successfully', async () => {
      expect(storage.isInitialized).toBe(true);
      expect(storage.db).toBeTruthy();
    });

    test('should create required tables', async () => {
      const tables = storage.db.prepare(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name NOT LIKE 'sqlite_%'
      `).all();

      const tableNames = tables.map(t => t.name);
      expect(tableNames).toContain('icons');
      expect(tableNames).toContain('settings');
      expect(tableNames).toContain('card_generations');
      expect(tableNames).toContain('db_metadata');
    });

    test('should enable WAL mode and foreign keys', async () => {
      const journalMode = storage.db.pragma('journal_mode', { simple: true });
      const foreignKeys = storage.db.pragma('foreign_keys', { simple: true });
      
      expect(journalMode).toBe('wal');
      expect(foreignKeys).toBe(1);
    });
  });

  describe('Icon operations', () => {
    describe('saveIcon', () => {
      test('should save a new icon', async () => {
        await storage.saveIcon(testIcon);

        const savedIcon = storage.db.prepare(
          'SELECT * FROM icons WHERE id = ?'
        ).get(testIcon.id);

        expect(savedIcon).toBeTruthy();
        expect(savedIcon.name).toBe(testIcon.name);
        expect(savedIcon.type).toBe(testIcon.type);
        expect(savedIcon.size).toBe(testIcon.size);
        expect(savedIcon.created_at).toBeTruthy();
        expect(savedIcon.updated_at).toBeTruthy();
      });

      test('should update an existing icon', async () => {
        // Save initial icon
        await storage.saveIcon(testIcon);

        // Add a small delay to ensure different timestamps
        await new Promise(resolve => setTimeout(resolve, 10));

        // Update icon
        const updatedIcon = {
          ...testIcon,
          name: 'Updated Test Icon',
          size: 2048
        };
        await storage.saveIcon(updatedIcon);

        const savedIcon = storage.db.prepare(
          'SELECT * FROM icons WHERE id = ?'
        ).get(testIcon.id);

        expect(savedIcon.name).toBe('Updated Test Icon');
        expect(savedIcon.size).toBe(2048);
        expect(new Date(savedIcon.updated_at).getTime())
          .toBeGreaterThanOrEqual(new Date(savedIcon.created_at).getTime());
      });

      test('should handle binary data correctly', async () => {
        const binaryData = Buffer.from([0, 1, 2, 3, 255, 254, 253]);
        const iconWithBinary = {
          ...testIcon,
          data: binaryData
        };

        await storage.saveIcon(iconWithBinary);

        const savedIcon = storage.db.prepare(
          'SELECT * FROM icons WHERE id = ?'
        ).get(testIcon.id);

        expect(Buffer.from(savedIcon.data)).toEqual(binaryData);
      });
    });

    describe('loadIcons', () => {
      test('should return empty array when no icons exist', async () => {
        const icons = await storage.loadIcons();
        expect(icons).toEqual([]);
      });

      test('should return all saved icons', async () => {
        const testIcons = [
          { ...testIcon, id: 'icon-1', name: 'Icon 1' },
          { ...testIcon, id: 'icon-2', name: 'Icon 2' },
          { ...testIcon, id: 'icon-3', name: 'Icon 3' }
        ];

        for (const icon of testIcons) {
          await storage.saveIcon(icon);
        }

        const loadedIcons = await storage.loadIcons();
        expect(loadedIcons).toHaveLength(3);
        expect(loadedIcons.map(i => i.name)).toEqual(
          expect.arrayContaining(['Icon 1', 'Icon 2', 'Icon 3'])
        );
      });

      test('should convert BLOB data back to base64', async () => {
        await storage.saveIcon(testIcon);
        const loadedIcons = await storage.loadIcons();
        
        expect(loadedIcons[0].data).toMatch(/^data:image\/png;base64,/);
      });
    });

    describe('deleteIcon', () => {
      test('should delete an existing icon', async () => {
        await storage.saveIcon(testIcon);
        
        // Verify icon exists
        let icons = await storage.loadIcons();
        expect(icons).toHaveLength(1);

        // Delete icon
        await storage.deleteIcon(testIcon.id);

        // Verify icon is deleted
        icons = await storage.loadIcons();
        expect(icons).toHaveLength(0);
      });

      test('should not throw error when deleting non-existent icon', async () => {
        await expect(storage.deleteIcon('non-existent-id')).resolves.not.toThrow();
      });
    });

    describe('clearIcons', () => {
      test('should delete all icons', async () => {
        const testIcons = [
          { ...testIcon, id: 'icon-1' },
          { ...testIcon, id: 'icon-2' },
          { ...testIcon, id: 'icon-3' }
        ];

        for (const icon of testIcons) {
          await storage.saveIcon(icon);
        }

        // Verify icons exist
        let icons = await storage.loadIcons();
        expect(icons).toHaveLength(3);

        // Clear all icons
        await storage.clearIcons();

        // Verify all icons are deleted
        icons = await storage.loadIcons();
        expect(icons).toHaveLength(0);
      });
    });
  });

  describe('Settings operations', () => {
    const testSettings = {
      language: 'en',
      theme: 'dark',
      gridSize: 7,
      cardsPerSet: 2
    };

    describe('saveSettings', () => {
      test('should save settings as individual key-value pairs', async () => {
        await storage.saveSettings(testSettings);

        // Use the storage method instead of direct DB access
        const settings = await storage.loadSettings();
        expect(Object.keys(settings)).toHaveLength(4);
        expect(settings).toEqual(testSettings);
      });

      test('should update existing settings', async () => {
        await storage.saveSettings(testSettings);
        
        const updatedSettings = {
          ...testSettings,
          theme: 'light',
          gridSize: 5
        };
        await storage.saveSettings(updatedSettings);

        const loadedSettings = await storage.loadSettings();
        expect(loadedSettings.theme).toBe('light');
        expect(loadedSettings.gridSize).toBe(5);
        expect(loadedSettings.language).toBe('en'); // unchanged
      });
    });

    describe('loadSettings', () => {
      test('should return empty object when no settings exist', async () => {
        const settings = await storage.loadSettings();
        expect(settings).toEqual({});
      });

      test('should return all saved settings', async () => {
        await storage.saveSettings(testSettings);
        const loadedSettings = await storage.loadSettings();
        expect(loadedSettings).toEqual(testSettings);
      });

      test('should handle complex setting values', async () => {
        const complexSettings = {
          simpleString: 'hello',
          number: 42,
          boolean: true,
          array: [1, 2, 3],
          object: { nested: { value: 'test' } }
        };

        await storage.saveSettings(complexSettings);
        const loadedSettings = await storage.loadSettings();
        expect(loadedSettings).toEqual(complexSettings);
      });
    });
  });

  describe('Card generation operations', () => {
    const testGeneration = {
      id: 'gen-1',
      title: 'Test Generation',
      gridSize: 5,
      setCount: 2,
      cardsPerSet: 3,
      config: {
        leaveCenterBlank: true,
        sameCard: false,
        showLabels: true
      },
      generatedAt: new Date().toISOString()
    };

    describe('saveCardGeneration', () => {
      test('should save card generation', async () => {
        await storage.saveCardGeneration(testGeneration);

        const saved = storage.db.prepare(
          'SELECT * FROM card_generations WHERE id = ?'
        ).get(testGeneration.id);

        expect(saved).toBeTruthy();
        expect(saved.title).toBe(testGeneration.title);
        expect(saved.grid_size).toBe(testGeneration.gridSize);
        expect(saved.set_count).toBe(testGeneration.setCount);
        expect(saved.cards_per_set).toBe(testGeneration.cardsPerSet);
        expect(JSON.parse(saved.config)).toEqual(testGeneration.config);
      });

      test('should update existing generation', async () => {
        await storage.saveCardGeneration(testGeneration);

        const updated = {
          ...testGeneration,
          title: 'Updated Title',
          setCount: 5
        };
        await storage.saveCardGeneration(updated);

        const saved = storage.db.prepare(
          'SELECT * FROM card_generations WHERE id = ?'
        ).get(testGeneration.id);

        expect(saved.title).toBe('Updated Title');
        expect(saved.set_count).toBe(5);
      });
    });

    describe('loadCardGenerations', () => {
      test('should return empty array when no generations exist', async () => {
        const generations = await storage.loadCardGenerations();
        expect(generations).toEqual([]);
      });

      test('should return all saved generations', async () => {
        const generations = [
          { ...testGeneration, id: 'gen-1', title: 'Gen 1' },
          { ...testGeneration, id: 'gen-2', title: 'Gen 2' }
        ];

        for (const gen of generations) {
          await storage.saveCardGeneration(gen);
        }

        const loaded = await storage.loadCardGenerations();
        expect(loaded).toHaveLength(2);
        // Results are ordered by created_at DESC (newest first)
        expect(loaded.map(g => g.title)).toEqual(['Gen 2', 'Gen 1']);
      });

      test('should parse config object correctly', async () => {
        await storage.saveCardGeneration(testGeneration);
        const loaded = await storage.loadCardGenerations();
        
        expect(loaded[0].config).toEqual(testGeneration.config);
      });
    });
  });

  describe('Database metadata operations', () => {
    describe('getVersion', () => {
      test('should return version 1 for new database', async () => {
        const version = await storage.getVersion();
        expect(version).toBe(1);
      });
    });

    describe('setVersion', () => {
      test('should update database version', async () => {
        await storage.setVersion(2);
        const version = await storage.getVersion();
        expect(version).toBe(2);
      });
    });
  });

  describe('Transaction support', () => {
    test('should handle transaction rollback on error', async () => {
      const testIcons = [
        { ...testIcon, id: 'icon-1', name: 'Icon 1' },
        { ...testIcon, id: 'icon-2', name: 'Icon 2' }
      ];

      // Mock database prepare to fail on second call
      const originalPrepare = storage.db.prepare;
      let callCount = 0;
      storage.db.prepare = jest.fn().mockImplementation((sql) => {
        callCount++;
        if (callCount === 2 && sql.includes('INSERT')) {
          throw new Error('Simulated error');
        }
        return originalPrepare.call(storage.db, sql);
      });

      try {
        await storage.saveIcon(testIcons[0]);
        await expect(storage.saveIcon(testIcons[1])).rejects.toThrow('Simulated error');
      } finally {
        storage.db.prepare = originalPrepare;
      }

      // First icon should still be saved since they were separate transactions
      const icons = await storage.loadIcons();
      expect(icons).toHaveLength(1);
      expect(icons[0].name).toBe('Icon 1');
    });
  });

  describe('Error handling', () => {
    test('should handle database connection errors', async () => {
      const invalidStorage = new SQLiteStorage('/invalid/path/to/database.db');
      await expect(invalidStorage.init()).rejects.toThrow();
    });

    test('should handle malformed JSON in settings', async () => {
      // Insert malformed JSON directly into database
      storage.db.prepare(`
        INSERT INTO settings (key, value) VALUES (?, ?)
      `).run('test_key', 'invalid json {');

      const settings = await storage.loadSettings();
      // Should skip malformed entries and continue
      expect(settings).toEqual({});
    });

    test('should handle database lock errors gracefully', async () => {
      // This test simulates a busy database scenario
      const busyDb = new SQLiteStorage(testDbPath);
      await busyDb.init();

      // Try to perform operations on both connections
      await storage.saveIcon(testIcon);
      await busyDb.saveIcon({ ...testIcon, id: 'icon-2' });

      const iconsFromFirst = await storage.loadIcons();
      const iconsFromSecond = await busyDb.loadIcons();

      expect(iconsFromFirst).toHaveLength(2);
      expect(iconsFromSecond).toHaveLength(2);

      busyDb.db.close();
    });
  });

  describe('Performance and optimization', () => {
    test('should handle large number of icons efficiently', async () => {
      const start = Date.now();
      
      // Insert 100 icons
      const icons = Array.from({ length: 100 }, (_, i) => ({
        ...testIcon,
        id: `icon-${i}`,
        name: `Icon ${i}`,
        data: Buffer.from(`fake-data-${i}`)
      }));

      for (const icon of icons) {
        await storage.saveIcon(icon);
      }

      const loadedIcons = await storage.loadIcons();
      const end = Date.now();

      expect(loadedIcons).toHaveLength(100);
      expect(end - start).toBeLessThan(5000); // Should complete within 5 seconds
    }, 10000);

    test('should use prepared statements for efficiency', async () => {
      // Spy on prepare to verify it's being used
      const prepareSpy = jest.spyOn(storage.db, 'prepare');
      
      // Perform an operation that should use prepared statements
      await storage.saveIcon(testIcon);
      
      // Verify that prepare was called
      expect(prepareSpy).toHaveBeenCalled();
      
      prepareSpy.mockRestore();
    });
  });

  describe('Data integrity', () => {
    test('should maintain foreign key constraints', async () => {
      // This would test foreign key relationships if we had them
      // For now, just verify that foreign keys are enabled
      const foreignKeys = storage.db.pragma('foreign_keys', { simple: true });
      expect(foreignKeys).toBe(1);
    });

    test('should handle concurrent access safely', async () => {
      const promises = [];
      
      // Simulate concurrent writes
      for (let i = 0; i < 10; i++) {
        promises.push(
          storage.saveIcon({
            ...testIcon,
            id: `concurrent-icon-${i}`,
            name: `Concurrent Icon ${i}`
          })
        );
      }

      await Promise.all(promises);

      const icons = await storage.loadIcons();
      expect(icons).toHaveLength(10);
      
      // Verify all icons have unique IDs
      const ids = icons.map(i => i.id);
      const uniqueIds = [...new Set(ids)];
      expect(uniqueIds).toHaveLength(10);
    });
  });
});
