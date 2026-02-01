/**
 * @jest-environment node
 * @jest-setupFilesAfterEnv ["<rootDir>/../config/jest.setup.node.js"]
 */

const fs = require('fs');
const path = require('path');
const BackupManager = require('../../../src/js/modules/backupManager.js');
const SQLiteStorage = require('../../../src/js/modules/sqliteStorage.js');

// Test paths
const testDbPath = path.join(__dirname, '../../../temp/test-backup.db');
const testBackupDir = path.join(__dirname, '../../../temp/backups');
const testDataDir = path.dirname(testDbPath);

describe('BackupManager', () => {
  let backupManager;
  let sqliteStorage;

  beforeEach(async () => {
    // Ensure temp directories exist
    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, { recursive: true });
    }
    if (!fs.existsSync(testBackupDir)) {
      fs.mkdirSync(testBackupDir, { recursive: true });
    }

    // Clean up any existing test database
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }

    // Initialize SQLite storage with test data
    sqliteStorage = new SQLiteStorage(testDbPath);
    await sqliteStorage.init();
    await setupTestData();

    // Create backup manager
    backupManager = new BackupManager(sqliteStorage, testBackupDir);
  });

  afterEach(async () => {
    // Clean up
    if (sqliteStorage && sqliteStorage.db) {
      sqliteStorage.db.close();
    }

    // Clean up test files
    [testDbPath, testBackupDir, testDataDir].forEach(dir => {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
      }
    });
  });

  async function setupTestData() {
    // Add test icons
    const testIcons = [
      {
        id: 'icon-1',
        name: 'Test Icon 1',
        data: Buffer.from('fake-image-data-1'),
        type: 'image/png',
        size: 1024
      },
      {
        id: 'icon-2',
        name: 'Test Icon 2',
        data: Buffer.from('fake-image-data-2'),
        type: 'image/jpeg',
        size: 2048
      }
    ];

    for (const icon of testIcons) {
      await sqliteStorage.saveIcon(icon);
    }

    // Add test settings
    await sqliteStorage.saveSettings({
      language: 'en',
      theme: 'dark',
      gridSize: 5,
      cardsPerSet: 2
    });

    // Add test card generation
    await sqliteStorage.saveCardGeneration({
      id: 'gen-1',
      title: 'Test Generation',
      gridSize: 5,
      setCount: 2,
      cardsPerSet: 3,
      config: { leaveCenterBlank: true },
      generatedAt: new Date().toISOString()
    });
  }

  describe('constructor', () => {
    test('should initialize with default backup directory', () => {
      const defaultManager = new BackupManager(sqliteStorage);
      expect(defaultManager.backupDir).toBe('./data/backups');
      expect(defaultManager.storage).toBe(sqliteStorage);
    });

    test('should initialize with custom backup directory', () => {
      const customDir = '/custom/backup/path';
      const customManager = new BackupManager(sqliteStorage, customDir);
      expect(customManager.backupDir).toBe(customDir);
    });

    test('should create backup directory if it does not exist', () => {
      const newBackupDir = path.join(testDataDir, 'new-backup-dir');
      expect(fs.existsSync(newBackupDir)).toBe(false);

      new BackupManager(sqliteStorage, newBackupDir);
      expect(fs.existsSync(newBackupDir)).toBe(true);
    });
  });

  describe('createJSONBackup', () => {
    test('should create JSON backup with all data', async () => {
      const backupPath = await backupManager.createJSONBackup();

      expect(fs.existsSync(backupPath)).toBe(true);
      expect(path.extname(backupPath)).toBe('.json');

      const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));

      expect(backupData.metadata).toBeDefined();
      expect(backupData.metadata.version).toBeDefined();
      expect(backupData.metadata.timestamp).toBeDefined();
      expect(backupData.metadata.type).toBe('json');

      expect(backupData.data.icons).toHaveLength(2);
      expect(backupData.data.settings).toBeDefined();
      expect(backupData.data.cardGenerations).toHaveLength(1);

      // Verify icon data format
      expect(backupData.data.icons[0]).toMatchObject({
        id: 'icon-1',
        name: 'Test Icon 1',
        type: 'image/png',
        size: 1024
      });
      expect(backupData.data.icons[0].data).toMatch(/^data:image\/png;base64,/);
    });

    test('should create backup with custom filename', async () => {
      const customName = 'custom-backup-name';
      const backupPath = await backupManager.createJSONBackup(customName);

      expect(path.basename(backupPath)).toMatch(new RegExp(`^${customName}.*\\.json$`));
    });

    test('should handle empty database gracefully', async () => {
      // Clear all data
      await sqliteStorage.clearIcons();
      // Also clear settings and generations by executing DELETE statements directly
      sqliteStorage.db.exec('DELETE FROM settings');
      sqliteStorage.db.exec('DELETE FROM card_generations');

      const backupPath = await backupManager.createJSONBackup();

      expect(fs.existsSync(backupPath)).toBe(true);

      const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
      expect(backupData.data.icons).toEqual([]);
      expect(backupData.data.settings).toEqual({});
      expect(backupData.data.cardGenerations).toEqual([]);
    });

    test('should include compression info in metadata', async () => {
      const backupPath = await backupManager.createJSONBackup();
      const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));

      expect(backupData.metadata.compression).toBeDefined();
      expect(backupData.metadata.uncompressedSize).toBeGreaterThan(0);
      expect(backupData.metadata.compressedSize).toBeGreaterThan(0);
    });
  });

  describe('createSQLBackup', () => {
    test('should create SQL dump backup', async () => {
      const backupPath = await backupManager.createSQLBackup();

      expect(fs.existsSync(backupPath)).toBe(true);
      expect(path.extname(backupPath)).toBe('.sql');

      const sqlContent = fs.readFileSync(backupPath, 'utf8');

      // Check for expected SQL statements
      expect(sqlContent).toContain('INSERT INTO icons');
      expect(sqlContent).toContain('INSERT INTO settings');
      expect(sqlContent).toContain('INSERT INTO card_generations');

      // Verify metadata comments
      expect(sqlContent).toContain('-- Backup created at:');
      expect(sqlContent).toContain('-- Database version:');
    });

    test('should create valid SQL that can restore data', async () => {
      const backupPath = await backupManager.createSQLBackup();

      // Create a new database and restore from SQL
      const restoreDbPath = path.join(testDataDir, 'restore-test.db');
      const restoreStorage = new SQLiteStorage(restoreDbPath);
      await restoreStorage.init();

      const sqlContent = fs.readFileSync(backupPath, 'utf8');
      restoreStorage.db.exec(sqlContent);

      // Verify restored data
      const restoredIcons = await restoreStorage.loadIcons();
      const restoredSettings = await restoreStorage.loadSettings();

      expect(restoredIcons).toHaveLength(2);
      expect(restoredSettings.language).toBe('en');

      restoreStorage.db.close();
    });

    test('should handle special characters in data', async () => {
      // Add icon with special characters
      await sqliteStorage.saveIcon({
        id: 'special-icon',
        name: "Icon with 'quotes' and \"double quotes\" and \n newlines",
        data: Buffer.from('data with special chars: \0\x01\xFF'),
        type: 'image/png',
        size: 100
      });

      const backupPath = await backupManager.createSQLBackup();
      const sqlContent = fs.readFileSync(backupPath, 'utf8');

      // Verify SQL is properly escaped
      expect(sqlContent).toContain('special-icon');
      expect(sqlContent).toContain("''quotes''"); // Should be properly escaped
      expect(sqlContent).toContain("\\n"); // Newlines should be escaped as \n
    });
  });

  describe('restoreFromJSON', () => {
    test('should restore data from JSON backup', async () => {
      // Create backup
      const backupPath = await backupManager.createJSONBackup();

      // Clear current data
      await sqliteStorage.clearIcons();

      // Verify data is cleared
      let icons = await sqliteStorage.loadIcons();
      expect(icons).toHaveLength(0);

      // Restore from backup
      const result = await backupManager.restoreFromJSON(backupPath);

      expect(result.success).toBe(true);
      expect(result.summary.icons).toBe(2);
      expect(result.summary.settings).toBeGreaterThan(0);

      // Verify data is restored
      icons = await sqliteStorage.loadIcons();
      expect(icons).toHaveLength(2);

      const settings = await sqliteStorage.loadSettings();
      expect(settings.language).toBe('en');
    });

    test('should handle corrupted JSON backup', async () => {
      const corruptedBackupPath = path.join(testBackupDir, 'corrupted.json');
      fs.writeFileSync(corruptedBackupPath, 'invalid json {');

      const result = await backupManager.restoreFromJSON(corruptedBackupPath);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to parse JSON backup');
    });

    test('should handle missing backup file', async () => {
      const result = await backupManager.restoreFromJSON('/non/existent/backup.json');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Backup file not found');
    });

    test('should validate backup format', async () => {
      const invalidBackupPath = path.join(testBackupDir, 'invalid.json');
      fs.writeFileSync(invalidBackupPath, JSON.stringify({
        invalidFormat: true,
        missing: 'required fields'
      }));

      const result = await backupManager.restoreFromJSON(invalidBackupPath);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid backup format');
    });

    test('should handle partial restore failures', async () => {
      const backupPath = await backupManager.createJSONBackup();

      // Mock saveIcon to fail
      const originalSaveIcon = sqliteStorage.saveIcon;
      sqliteStorage.saveIcon = jest.fn().mockRejectedValue(new Error('Save failed'));

      const result = await backupManager.restoreFromJSON(backupPath);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Failed to restore icons: Save failed');

      // Restore original method
      sqliteStorage.saveIcon = originalSaveIcon;
    });
  });

  describe('getBackupInfo', () => {
    test('should return information about JSON backup', async () => {
      const backupPath = await backupManager.createJSONBackup();

      const info = await backupManager.getBackupInfo(backupPath);

      expect(info.exists).toBe(true);
      expect(info.type).toBe('json');
      expect(info.size).toBeGreaterThan(0);
      expect(info.metadata).toBeDefined();
      expect(info.metadata.timestamp).toBeDefined();
      expect(info.metadata.version).toBeDefined();
    });

    test('should return information about SQL backup', async () => {
      const backupPath = await backupManager.createSQLBackup();

      const info = await backupManager.getBackupInfo(backupPath);

      expect(info.exists).toBe(true);
      expect(info.type).toBe('sql');
      expect(info.size).toBeGreaterThan(0);
    });

    test('should handle non-existent backup file', async () => {
      const info = await backupManager.getBackupInfo('/non/existent/backup.json');

      expect(info.exists).toBe(false);
      expect(info.error).toContain('Backup file not found');
    });

    test('should handle corrupted backup metadata', async () => {
      const corruptedPath = path.join(testBackupDir, 'corrupted.json');
      fs.writeFileSync(corruptedPath, 'invalid json');

      const info = await backupManager.getBackupInfo(corruptedPath);

      expect(info.exists).toBe(true);
      expect(info.type).toBe('unknown');
      expect(info.error).toBeDefined();
    });
  });

  describe('listBackups', () => {
    test('should list all backup files', async () => {
      // Create multiple backups
      await backupManager.createJSONBackup('backup1');
      await backupManager.createJSONBackup('backup2');
      await backupManager.createSQLBackup('backup3');

      const backups = await backupManager.listBackups();

      expect(backups).toHaveLength(3);
      expect(backups.filter(b => b.type === 'json')).toHaveLength(2);
      expect(backups.filter(b => b.type === 'sql')).toHaveLength(1);

      // Should be sorted by creation time (newest first)
      expect(new Date(backups[0].created).getTime())
        .toBeGreaterThanOrEqual(new Date(backups[1].created).getTime());
    });

    test('should return empty array when no backups exist', async () => {
      const backups = await backupManager.listBackups();
      expect(backups).toEqual([]);
    });

    test('should handle corrupted backup files gracefully', async () => {
      // Create valid backup
      await backupManager.createJSONBackup('valid');

      // Create corrupted file
      const corruptedPath = path.join(testBackupDir, 'corrupted.json');
      fs.writeFileSync(corruptedPath, 'invalid');

      const backups = await backupManager.listBackups();

      expect(backups).toHaveLength(2);
      expect(backups.some(b => b.path.includes('valid'))).toBe(true);
      expect(backups.some(b => b.path.includes('corrupted'))).toBe(true);

      const corruptedBackup = backups.find(b => b.path.includes('corrupted'));
      expect(corruptedBackup.type).toBe('unknown');
      expect(corruptedBackup.error).toBeDefined();
    });
  });

  describe('cleanupOldBackups', () => {
    test('should remove backups older than specified days', async () => {
      // Create backup and artificially age it
      const oldBackupPath = await backupManager.createJSONBackup('old');
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 10); // 10 days ago
      fs.utimesSync(oldBackupPath, oldDate, oldDate);

      // Create recent backup
      await backupManager.createJSONBackup('recent');

      // Clean up backups older than 5 days, keeping minimum 1
      const result = await backupManager.cleanupOldBackups(5, 1);

      expect(result.removed).toBe(1);
      expect(result.kept).toBe(1);

      // Verify old backup is removed
      expect(fs.existsSync(oldBackupPath)).toBe(false);

      // Verify recent backup still exists
      const backups = await backupManager.listBackups();
      expect(backups).toHaveLength(1);
      expect(backups[0].path).toContain('recent');
    });

    test('should keep minimum number of backups regardless of age', async () => {
      // Create 5 old backups
      const backupPaths = [];
      for (let i = 0; i < 5; i++) {
        const backupPath = await backupManager.createJSONBackup(`old-${i}`);
        backupPaths.push(backupPath);

        // Age the backup
        const oldDate = new Date();
        oldDate.setDate(oldDate.getDate() - 10);
        fs.utimesSync(backupPath, oldDate, oldDate);
      }

      // Clean up with minimum keep = 3
      const result = await backupManager.cleanupOldBackups(5, 3);

      expect(result.removed).toBe(2);
      expect(result.kept).toBe(3);

      const remainingBackups = await backupManager.listBackups();
      expect(remainingBackups).toHaveLength(3);
    });

    test('should handle empty backup directory', async () => {
      const result = await backupManager.cleanupOldBackups(30);

      expect(result.removed).toBe(0);
      expect(result.kept).toBe(0);
    });
  });

  describe('validateBackup', () => {
    test('should validate correct JSON backup', async () => {
      const backupPath = await backupManager.createJSONBackup();

      const validation = await backupManager.validateBackup(backupPath);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      expect(validation.warnings).toBeDefined();
    });

    test('should detect JSON backup corruption', async () => {
      const backupPath = await backupManager.createJSONBackup();

      // Corrupt the backup file to make it invalid JSON
      let content = fs.readFileSync(backupPath, 'utf8');
      content = content.slice(0, -10) + 'invalid'; // Truncate and add invalid content
      fs.writeFileSync(backupPath, content);

      const validation = await backupManager.validateBackup(backupPath);

      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    test('should validate data integrity', async () => {
      const backupPath = await backupManager.createJSONBackup();

      // Read and modify backup to have invalid icon data
      const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
      // Remove id from first icon to make it invalid
      delete backup.data.icons[0].id;
      fs.writeFileSync(backupPath, JSON.stringify(backup));

      const validation = await backupManager.validateBackup(backupPath);

      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('Invalid icon data'))).toBe(true);
    });
  });

  describe('Performance and large datasets', () => {
    test('should handle large backup creation efficiently', async () => {
      // Add many icons to test performance
      const iconCount = 50; // Reduced for test performance
      for (let i = 0; i < iconCount; i++) {
        await sqliteStorage.saveIcon({
          id: `perf-icon-${i}`,
          name: `Performance Icon ${i}`,
          data: Buffer.from(`fake-data-${i}`),
          type: 'image/png',
          size: 1000 + i
        });
      }

      const start = Date.now();
      const backupPath = await backupManager.createJSONBackup();
      const duration = Date.now() - start;

      expect(fs.existsSync(backupPath)).toBe(true);
      expect(duration).toBeLessThan(10000); // Should complete within 10 seconds

      const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
      expect(backupData.data.icons).toHaveLength(iconCount + 2); // +2 from setup
    }, 15000);

    // Note: Compression feature is not currently implemented in backupManager
    // Future enhancement: Add compression support for large backups to reduce file size
  });

  describe('Error handling and edge cases', () => {
    test('should handle backup directory permission errors', async () => {
      // This test would need to run on a system where we can actually change permissions
      // For now, we'll mock the fs operations
      const originalWriteFile = fs.writeFileSync;
      fs.writeFileSync = jest.fn().mockImplementation(() => {
        throw new Error('EACCES: permission denied');
      });

      await expect(backupManager.createJSONBackup()).rejects.toThrow('permission denied');

      // Restore original function
      fs.writeFileSync = originalWriteFile;
    });

    test('should handle disk space errors during backup', async () => {
      const originalWriteFile = fs.writeFileSync;
      fs.writeFileSync = jest.fn().mockImplementation(() => {
        throw new Error('ENOSPC: no space left on device');
      });

      await expect(backupManager.createJSONBackup()).rejects.toThrow('no space left on device');

      fs.writeFileSync = originalWriteFile;
    });

    test('should handle concurrent backup operations', async () => {
      // Start multiple backup operations simultaneously
      const promises = [
        backupManager.createJSONBackup('concurrent1'),
        backupManager.createJSONBackup('concurrent2'),
        backupManager.createJSONBackup('concurrent3')
      ];

      const results = await Promise.all(promises);

      // All should succeed
      results.forEach(backupPath => {
        expect(fs.existsSync(backupPath)).toBe(true);
      });

      // All should have different filenames
      const uniquePaths = new Set(results);
      expect(uniquePaths.size).toBe(3);
    });
  });
});
