/**
 * @jest-environment jsdom
 */

const SQLiteStorage = require('../src/js/modules/sqliteStorage.js');
const fs = require('fs');
const path = require('path');

describe('SQLiteStorage Init Test', () => {
  it('should initialize SQLite storage without hanging', async () => {
    const testDbPath = path.join(__dirname, '../temp/test-init.db');
    const testDataDir = path.dirname(testDbPath);
    
    // Ensure temp directory exists
    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, { recursive: true });
    }
    
    // Clean up any existing test database
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    
    const sqliteStorage = new SQLiteStorage(testDbPath);
    
    // This is where it might hang
    await sqliteStorage.init();
    
    expect(sqliteStorage.db).toBeDefined();
    
    // Clean up
    if (sqliteStorage && sqliteStorage.db) {
      sqliteStorage.db.close();
    }
    
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });
});
