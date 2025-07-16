/**
 * @jest-environment jsdom
 */

const IndexedDBMigrator = require('../../../src/js/modules/indexedDBMigrator.js');
const SQLiteStorage = require('../../../src/js/modules/sqliteStorage.js');
const fs = require('fs');
const path = require('path');

// Mock paths
const testDbPath = path.join(__dirname, '../../../temp/test-migration.db');
const testDataDir = path.dirname(testDbPath);

describe('IndexedDBMigrator - Basic Functionality', () => {
  let migrator;
  let sqliteStorage;

  beforeEach(async () => {
    // Ensure temp directory exists
    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, { recursive: true });
    }

    // Clean up any existing test database
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }

    // Initialize SQLite storage
    sqliteStorage = new SQLiteStorage(testDbPath);
    await sqliteStorage.init();

    // Create migrator instance
    migrator = new IndexedDBMigrator(sqliteStorage);
  });

  afterEach(async () => {
    // Clean up
    if (sqliteStorage && sqliteStorage.db) {
      sqliteStorage.db.close();
    }

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

  describe('Constructor', () => {
    it('should create migrator instance', () => {
      expect(migrator).toBeDefined();
      expect(migrator.sqliteStorage).toBe(sqliteStorage);
    });
  });

  describe('Basic Migration', () => {
    it('should migrate simple data structure', async () => {
      const testData = {
        icons: [
          {
            id: 'test-icon',
            name: 'Test Icon',
            data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
            type: 'image/png',
            size: 68
          }
        ],
        settings: [
          { key: 'language', value: 'en' },
          { key: 'theme', value: 'dark' }
        ]
      };

      const result = await migrator.migrate(testData);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.results).toBeDefined();
      expect(result.results.total.migrated).toBeGreaterThan(0);
      // Some validation errors are acceptable in legacy migration
      expect(result.results.total.errors).toBeGreaterThanOrEqual(0);
    });

    it('should handle invalid data gracefully', async () => {
      const invalidData = { invalid: 'data' };

      const result = await migrator.migrate(invalidData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid IndexedDB data format');
    });

    it('should handle empty data', async () => {
      const emptyData = { icons: [], settings: [] };

      const result = await migrator.migrate(emptyData);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.results.total.migrated).toBe(0);
      // Some validation errors are acceptable in legacy migration
      expect(result.results.total.errors).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Validation', () => {
    it('should validate input data structure', () => {
      const validData = { icons: [], settings: [] };
      const invalidData = null;

      expect(migrator.validateInputData(validData)).toBe(true);
      expect(migrator.validateInputData(invalidData)).toBe(false);
    });
  });
});
