/**
 * @jest-environment jsdom
 */

const IndexedDBMigrator = require('../src/js/modules/indexedDBMigrator.js');
const SQLiteStorage = require('../src/js/modules/sqliteStorage.js');
const fs = require('fs');
const path = require('path');

describe('IndexedDBMigrator - Isolated Constructor Test', () => {
  it('should create an instance without hanging', () => {
    const testDbPath = path.join(__dirname, '../temp/test-constructor.db');
    
    // Clean up any existing database
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    
    const sqliteStorage = new SQLiteStorage(testDbPath);
    const migrator = new IndexedDBMigrator(sqliteStorage);
    
    expect(migrator).toBeDefined();
    expect(migrator.sqliteStorage).toBe(sqliteStorage);
    expect(migrator.migrationLog).toEqual([]);
    
    // Clean up
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });
});
