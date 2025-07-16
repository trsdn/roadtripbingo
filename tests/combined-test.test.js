/**
 * @jest-environment jsdom
 */

const IndexedDBMigrator = require('../src/js/modules/indexedDBMigrator.js');
const SQLiteStorage = require('../src/js/modules/sqliteStorage.js');
const fs = require('fs');
const path = require('path');

require('fake-indexeddb/auto');

describe('Combined Test', () => {
  it('should handle both IndexedDB and SQLite setup without hanging', async () => {
    const testDbPath = path.join(__dirname, '../temp/test-combined.db');
    const testDataDir = path.dirname(testDbPath);
    
    // Ensure temp directory exists
    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, { recursive: true });
    }
    
    // Clean up any existing test database
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    
    // Initialize SQLite storage
    const sqliteStorage = new SQLiteStorage(testDbPath);
    await sqliteStorage.init();
    
    // Create migrator instance
    const migrator = new IndexedDBMigrator(sqliteStorage);
    
    // Set up mock IndexedDB
    const mockIndexedDB = await new Promise((resolve, reject) => {
      const request = indexedDB.open('roadtripBingo', 1);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        resolve(request.result);
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
    
    expect(migrator).toBeDefined();
    expect(mockIndexedDB).toBeDefined();
    
    // Clean up
    mockIndexedDB.close();
    
    if (sqliteStorage && sqliteStorage.db) {
      sqliteStorage.db.close();
    }
    
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    
    // Clean up IndexedDB
    await new Promise((resolve) => {
      const deleteReq = indexedDB.deleteDatabase('roadtripBingo');
      deleteReq.onsuccess = () => resolve();
      deleteReq.onerror = () => resolve();
    });
  });
});
