/**
 * @jest-environment jsdom
 */

const IndexedDBMigrator = require('../src/js/modules/indexedDBMigrator.js');
const SQLiteStorage = require('../src/js/modules/sqliteStorage.js');
const fs = require('fs');
const path = require('path');

require('fake-indexeddb/auto');

const testDbPath = path.join(__dirname, '../temp/test-beforeeach.db');
const testDataDir = path.dirname(testDbPath);

describe('BeforeEach Test', () => {
  let migrator;
  let sqliteStorage;
  let mockIndexedDB;

  beforeEach(async () => {
    console.log('Starting beforeEach...');
    
    // Ensure temp directory exists
    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, { recursive: true });
    }
    console.log('Temp directory created');

    // Clean up any existing test database
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    console.log('Existing DB cleaned up');

    // Initialize SQLite storage
    sqliteStorage = new SQLiteStorage(testDbPath);
    console.log('SQLite storage created');
    
    await sqliteStorage.init();
    console.log('SQLite storage initialized');

    // Create migrator instance
    migrator = new IndexedDBMigrator(sqliteStorage);
    console.log('Migrator created');

    // Set up mock IndexedDB data
    console.log('Setting up mock IndexedDB...');
    await setupMockIndexedDB();
    console.log('Mock IndexedDB setup completed');

    console.log('BeforeEach completed successfully');
  });

  async function setupMockIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('roadtripBingo', 1);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        mockIndexedDB = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create icons store
        if (!db.objectStoreNames.contains('icons')) {
          const iconStore = db.createObjectStore('icons', { keyPath: 'id' });
          iconStore.createIndex('name', 'name', { unique: false });
        }

        // Create settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }

        // Create gameStates store
        if (!db.objectStoreNames.contains('gameStates')) {
          db.createObjectStore('gameStates', { keyPath: 'id' });
        }
      };
    });
  }

  afterEach(async () => {
    console.log('Starting afterEach...');
    
    // Clean up
    if (sqliteStorage && sqliteStorage.db) {
      sqliteStorage.db.close();
    }

    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }

    // Clear IndexedDB
    if (mockIndexedDB) {
      mockIndexedDB.close();
      mockIndexedDB = null;
    }
    
    // Force cleanup of fake IndexedDB
    try {
      delete global.indexedDB;
      require('fake-indexeddb/auto');
    } catch (e) {
      // Ignore errors in cleanup
    }
    
    console.log('AfterEach completed successfully');
  });

  test('should complete beforeEach without hanging', () => {
    expect(migrator).toBeDefined();
    expect(sqliteStorage).toBeDefined();
  });
});
