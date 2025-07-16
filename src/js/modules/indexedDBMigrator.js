// Migration utility from IndexedDB to SQLite
// This script helps migrate existing IndexedDB data to the new SQLite backend

const SQLiteStorage = require('./sqliteStorage');
const crypto = require('crypto');

class IndexedDBToSQLiteMigrator {
  constructor(sqliteStorage = null) {
    this.sqliteStorage = sqliteStorage || new SQLiteStorage();
    this.migrationLog = [];
  }

  // Main migration function
  async migrate(indexedDBData) {
    try {
      console.log('Starting migration from IndexedDB to SQLite...');
      this.log('Migration started');

      // Initialize SQLite storage
      await this.sqliteStorage.init();
      this.log('SQLite storage initialized');

      // Validate input data
      if (!this.validateInputData(indexedDBData)) {
        throw new Error('Invalid IndexedDB data format');
      }

      const results = {
        icons: { migrated: 0, errors: 0 },
        settings: { migrated: 0, errors: 0 },
        total: { migrated: 0, errors: 0 }
      };

      // Migrate icons
      if (indexedDBData.icons && Array.isArray(indexedDBData.icons)) {
        this.log(`Migrating ${indexedDBData.icons.length} icons`);
        results.icons = await this.migrateIcons(indexedDBData.icons);
      }

      // Migrate settings
      if (indexedDBData.settings) {
        this.log('Migrating settings');
        results.settings = await this.migrateSettings(indexedDBData.settings);
      }

      // Calculate totals
      results.total.migrated = results.icons.migrated + results.settings.migrated;
      results.total.errors = results.icons.errors + results.settings.errors;

      this.log(`Migration completed. Total migrated: ${results.total.migrated}, Errors: ${results.total.errors}`);
      console.log('Migration results:', results);

      return {
        success: true,
        results,
        log: this.migrationLog
      };

    } catch (error) {
      this.log(`Migration failed: ${error.message}`);
      console.error('Migration error:', error);
      return {
        success: false,
        error: error.message,
        log: this.migrationLog
      };
    }
  }

  // Validate IndexedDB data structure
  validateInputData(data) {
    if (!data || typeof data !== 'object') {
      this.log('Invalid data: not an object');
      return false;
    }

    // Check if it has expected properties
    const hasValidStructure = 
      (data.icons && Array.isArray(data.icons)) ||
      (data.settings && typeof data.settings === 'object');

    if (!hasValidStructure) {
      this.log('Invalid data: missing icons array or settings object');
      return false;
    }

    return true;
  }

  // Migrate icons from IndexedDB format to SQLite
  async migrateIcons(icons) {
    const results = { migrated: 0, errors: 0 };

    for (const icon of icons) {
      try {
        // Validate icon data
        if (!this.validateIcon(icon)) {
          this.log(`Skipping invalid icon: ${icon.id || 'unknown'}`);
          results.errors++;
          continue;
        }

        // Convert base64 data to Buffer if needed
        let binaryData;
        if (typeof icon.data === 'string') {
          // Remove data URL prefix if present
          const base64Data = icon.data.replace(/^data:image\/[^;]+;base64,/, '');
          binaryData = Buffer.from(base64Data, 'base64');
        } else if (icon.blob) {
          // Handle Blob data (convert to Buffer)
          binaryData = await this.blobToBuffer(icon.blob);
        } else {
          throw new Error('No valid image data found');
        }

        // Prepare icon data for SQLite
        const sqliteIcon = {
          id: icon.id || this.generateId(),
          name: icon.name || 'Unknown Icon',
          data: binaryData,
          type: icon.type || 'image/png',
          size: binaryData.length
        };

        // Save to SQLite
        await this.sqliteStorage.saveIcon(sqliteIcon);
        this.log(`Migrated icon: ${sqliteIcon.name} (${sqliteIcon.id})`);
        results.migrated++;

      } catch (error) {
        this.log(`Error migrating icon ${icon.id || 'unknown'}: ${error.message}`);
        results.errors++;
      }
    }

    return results;
  }

  // Migrate settings from IndexedDB format to SQLite
  async migrateSettings(settings) {
    const results = { migrated: 0, errors: 0 };

    try {
      // Filter out any invalid settings
      const validSettings = this.validateAndCleanSettings(settings);
      
      if (Object.keys(validSettings).length === 0) {
        this.log('No valid settings to migrate');
        return results;
      }

      // Save settings to SQLite
      await this.sqliteStorage.saveSettings(validSettings);
      results.migrated = Object.keys(validSettings).length;
      this.log(`Migrated ${results.migrated} settings`);

    } catch (error) {
      this.log(`Error migrating settings: ${error.message}`);
      results.errors = 1;
    }

    return results;
  }

  // Check if IndexedDB is available in the environment
  async checkIndexedDBAvailability() {
    try {
      if (typeof window === 'undefined' || !window.indexedDB) {
        return false;
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  // Get data from IndexedDB 
  async getIndexedDBData() {
    try {
      if (!await this.checkIndexedDBAvailability()) {
        throw new Error('IndexedDB not available');
      }

      // Mock implementation for tests
      return new Promise((resolve, reject) => {
        if (typeof window === 'undefined' || !window.indexedDB) {
          reject(new Error('IndexedDB not available'));
          return;
        }

        const request = indexedDB.open('roadtripBingo', 1);
        
        request.onerror = () => {
          reject(new Error('Database error'));
        };

        request.onsuccess = (event) => {
          const db = event.target.result;
          
          try {
            const transaction = db.transaction(['icons', 'settings', 'gameStates'], 'readonly');
            const iconsStore = transaction.objectStore('icons');
            const settingsStore = transaction.objectStore('settings');
            const gameStatesStore = transaction.objectStore('gameStates');

            const data = { icons: [], settings: {}, gameStates: [] };
            let completed = 0;
            const stores = 3;

            const checkComplete = () => {
              completed++;
              if (completed === stores) {
                db.close();
                resolve(data);
              }
            };

            // Get icons
            const iconsRequest = iconsStore.getAll();
            iconsRequest.onsuccess = () => {
              data.icons = iconsRequest.result || [];
              checkComplete();
            };

            // Get settings
            const settingsRequest = settingsStore.getAll();
            settingsRequest.onsuccess = () => {
              const settingsArray = settingsRequest.result || [];
              for (const setting of settingsArray) {
                data.settings[setting.key] = setting.value;
              }
              checkComplete();
            };

            // Get game states
            const gameStatesRequest = gameStatesStore.getAll();
            gameStatesRequest.onsuccess = () => {
              data.gameStates = gameStatesRequest.result || [];
              checkComplete();
            };
          } catch (error) {
            db.close();
            reject(error);
          }
        };
      });
    } catch (error) {
      throw new Error(`Failed to get IndexedDB data: ${error.message}`);
    }
  }

  // Validate individual icon data
  validateIcon(icon) {
    if (!icon || typeof icon !== 'object') {
      throw new Error('Icon must be an object');
    }
    if (!icon.id || typeof icon.id !== 'string') {
      throw new Error('Icon must have a valid id');
    }
    if (!icon.name || typeof icon.name !== 'string') {
      throw new Error('Icon must have a valid name');
    }
    if (!icon.data || typeof icon.data !== 'string') {
      throw new Error('Icon must have valid data');
    }
    return true;
  }

  // Validate setting data structure
  validateSetting(setting) {
    if (!setting || typeof setting !== 'object') {
      throw new Error('Setting must be an object');
    }
    if (!setting.key || typeof setting.key !== 'string') {
      throw new Error('Setting must have a valid key');
    }
    if (setting.value === undefined || setting.value === null) {
      throw new Error('Setting must have a value');
    }
    return true;
  }

  // Validate data structure
  validateData(data) {
    if (!data || typeof data !== 'object') {
      return false;
    }

    // Validate icons if present
    if (data.icons && Array.isArray(data.icons)) {
      for (const icon of data.icons) {
        try {
          this.validateIcon(icon);
        } catch (error) {
          console.warn('Invalid icon data:', error.message);
          return false;
        }
      }
    }

    // Validate settings if present
    if (data.settings && typeof data.settings === 'object') {
      for (const [key, value] of Object.entries(data.settings)) {
        try {
          this.validateSetting({ key, value });
        } catch (error) {
          console.warn('Invalid setting data:', error.message);
          return false;
        }
      }
    }

    return true;
  }

  // Main migration function with options
  async migrateData(options = {}) {
    try {
      this.log('Starting data migration from IndexedDB to SQLite');

      // Get IndexedDB data
      let indexedDBData;
      try {
        indexedDBData = await this.getIndexedDBData();
      } catch (error) {
        this.log(`Failed to get IndexedDB data: ${error.message}`);
        return {
          success: false,
          error: `Failed to get IndexedDB data: ${error.message}`,
          migrated: { icons: 0, settings: 0, gameStates: 0 },
          errors: []
        };
      }

      // Validate data
      if (!this.validateData(indexedDBData)) {
        return {
          success: false,
          error: 'Invalid IndexedDB data structure',
          migrated: { icons: 0, settings: 0, gameStates: 0 },
          errors: ['Data validation failed']
        };
      }

      // Create backup if requested
      let backupPath = null;
      if (options.createBackup) {
        try {
          const BackupManager = require('./backupManager');
          const backupManager = new BackupManager(this.sqliteStorage);
          backupPath = await backupManager.createJSONBackup('pre-migration');
          this.log(`Backup created: ${backupPath}`);
        } catch (error) {
          this.log(`Failed to create backup: ${error.message}`);
        }
      }

      // Initialize SQLite storage
      await this.sqliteStorage.init();

      const results = {
        success: true,
        migrated: { icons: 0, settings: 0, gameStates: 0 },
        errors: [],
        backupPath,
        progress: options.onProgress
      };

      // Migrate icons
      if (indexedDBData.icons && Array.isArray(indexedDBData.icons)) {
        this.log(`Migrating ${indexedDBData.icons.length} icons`);
        for (const icon of indexedDBData.icons) {
          try {
            await this.sqliteStorage.saveIcon(icon);
            results.migrated.icons++;
            if (options.onProgress) {
              options.onProgress('icons', results.migrated.icons, indexedDBData.icons.length);
            }
          } catch (error) {
            results.errors.push(`Failed to migrate icon ${icon.id}: ${error.message}`);
          }
        }
      }

      // Migrate settings
      if (indexedDBData.settings && typeof indexedDBData.settings === 'object') {
        this.log('Migrating settings');
        try {
          await this.sqliteStorage.saveSettings(indexedDBData.settings);
          results.migrated.settings = Object.keys(indexedDBData.settings).length;
        } catch (error) {
          results.errors.push(`Failed to migrate settings: ${error.message}`);
        }
      }

      // Migrate game states (as card generations)
      if (indexedDBData.gameStates && Array.isArray(indexedDBData.gameStates)) {
        this.log(`Migrating ${indexedDBData.gameStates.length} game states`);
        for (const gameState of indexedDBData.gameStates) {
          try {
            // Convert game state to card generation format
            const generation = {
              id: gameState.id || crypto.randomUUID(),
              title: gameState.title || 'Migrated Game',
              created_at: gameState.timestamp || new Date().toISOString(),
              config: JSON.stringify(gameState.config || {})
            };
            await this.sqliteStorage.saveCardGeneration(generation);
            results.migrated.gameStates++;
          } catch (error) {
            results.errors.push(`Failed to migrate game state: ${error.message}`);
          }
        }
      }

      this.log(`Migration completed. Migrated: ${JSON.stringify(results.migrated)}`);
      
      if (results.errors.length > 0) {
        results.success = false;
        results.error = `Migration completed with ${results.errors.length} errors`;
      }

      return results;
    } catch (error) {
      this.log(`Migration failed: ${error.message}`);
      return {
        success: false,
        error: error.message,
        migrated: { icons: 0, settings: 0, gameStates: 0 },
        errors: [error.message]
      };
    }
  }

  // Rollback migration using backup
  async rollbackMigration(backupPath) {
    try {
      this.log(`Starting rollback from backup: ${backupPath}`);

      if (!backupPath || !require('fs').existsSync(backupPath)) {
        return {
          success: false,
          error: 'Backup file not found'
        };
      }

      const BackupManager = require('./backupManager');
      const backupManager = new BackupManager(this.sqliteStorage);
      
      const result = await backupManager.restoreFromJSON(backupPath);
      
      if (result.success) {
        this.log('Rollback completed successfully');
      } else {
        this.log(`Rollback failed: ${result.error}`);
      }

      return result;
    } catch (error) {
      this.log(`Rollback failed: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Convert Blob to Buffer
  async blobToBuffer(blob) {
    if (typeof blob.arrayBuffer === 'function') {
      const arrayBuffer = await blob.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } else if (typeof blob.stream === 'function') {
      const stream = blob.stream();
      const reader = stream.getReader();
      const chunks = [];
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
      
      return Buffer.concat(chunks);
    } else {
      throw new Error('Unsupported blob format');
    }
  }

  // Generate unique ID
  generateId() {
    return crypto.randomUUID();
  }

  // Add entry to migration log
  log(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    this.migrationLog.push(logEntry);
    console.log(logEntry);
  }

  // Create backup of current SQLite data before migration
  async createBackup() {
    try {
      const backupData = await this.sqliteStorage.exportData();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = `./data/backups/pre-migration-${timestamp}.json`;
      
      const fs = require('fs');
      const path = require('path');
      
      // Ensure backup directory exists
      const backupDir = path.dirname(backupPath);
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      
      fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
      this.log(`Backup created: ${backupPath}`);
      
      return backupPath;
    } catch (error) {
      this.log(`Failed to create backup: ${error.message}`);
      throw error;
    }
  }

  // Rollback migration (restore from backup)
  async rollback(backupPath) {
    try {
      const fs = require('fs');
      
      if (!fs.existsSync(backupPath)) {
        throw new Error(`Backup file not found: ${backupPath}`);
      }
      
      const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
      await this.sqliteStorage.importData(backupData);
      
      this.log(`Rollback completed from: ${backupPath}`);
      return true;
    } catch (error) {
      this.log(`Rollback failed: ${error.message}`);
      throw error;
    }
  }
}

module.exports = IndexedDBToSQLiteMigrator;
