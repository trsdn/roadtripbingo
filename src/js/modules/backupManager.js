// Road Trip Bingo - Backup and Restore Utilities
// Provides backup and restore functionality for SQLite database

const fs = require('fs');
const path = require('path');
const SQLiteStorage = require('./sqliteStorage');

class BackupManager {
  constructor(dbPathOrStorage = './data/roadtripbingo.db', backupDir = null) {
    // Handle both database path string and storage instance
    if (typeof dbPathOrStorage === 'string') {
      this.storage = new SQLiteStorage(dbPathOrStorage);
      this.backupDir = backupDir || './data/backups';
    } else {
      // Assume it's a storage instance (for testing)
      this.storage = dbPathOrStorage;
      this.backupDir = backupDir || './data/backups';
    }
    
    // Ensure backup directory exists
    try {
      if (!fs.existsSync(this.backupDir)) {
        fs.mkdirSync(this.backupDir, { recursive: true });
      }
    } catch (error) {
      console.warn(`Could not create backup directory ${this.backupDir}:`, error.message);
    }
  }

  // Create a backup of the current database
  async createBackup(format = 'json', description = '') {
    try {
      await this.storage.init();
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupName = `backup-${timestamp}`;
      const suffix = description ? `-${description.replace(/[^a-zA-Z0-9]/g, '-')}` : '';
      
      let backupPath;
      let backupData;

      if (format === 'json') {
        backupPath = path.join(this.backupDir, `${backupName}${suffix}.json`);
        backupData = await this.storage.exportData();
        
        // Add backup metadata
        backupData.backup = {
          format: 'json',
          description,
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        };
        
        fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
        
      } else if (format === 'sql') {
        backupPath = path.join(this.backupDir, `${backupName}${suffix}.sql`);
        backupData = await this.createSQLDump();
        fs.writeFileSync(backupPath, backupData);
        
      } else {
        throw new Error(`Unsupported backup format: ${format}`);
      }

      const stats = fs.statSync(backupPath);
      
      console.log(`Backup created: ${backupPath} (${(stats.size / 1024).toFixed(2)} KB)`);
      
      return {
        success: true,
        path: backupPath,
        size: stats.size,
        format,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Error creating backup:', error);
      throw new Error(`Backup failed: ${error.message}`);
    }
  }

  // Restore from a backup file
  async restoreBackup(backupPath) {
    try {
      if (!fs.existsSync(backupPath)) {
        throw new Error(`Backup file not found: ${backupPath}`);
      }

      await this.storage.init();
      
      const ext = path.extname(backupPath).toLowerCase();
      let restoreData;

      if (ext === '.json') {
        const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
        
        // Validate backup format
        if (!this.validateJSONBackup(backupData)) {
          throw new Error('Invalid backup file format');
        }
        
        await this.storage.importData(backupData);
        
      } else if (ext === '.sql') {
        const sqlData = fs.readFileSync(backupPath, 'utf8');
        await this.restoreFromSQL(sqlData);
        
      } else {
        throw new Error(`Unsupported backup format: ${ext}`);
      }

      console.log(`Restore completed from: ${backupPath}`);
      
      return {
        success: true,
        restoredFrom: backupPath,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Error restoring backup:', error);
      throw new Error(`Restore failed: ${error.message}`);
    }
  }

  // Create SQL dump of the database
  async createSQLDump() {
    const icons = await this.storage.loadIcons();
    const settings = await this.storage.loadSettings();
    const generations = await this.storage.loadCardGenerations(1000);

    let sql = `-- Road Trip Bingo Database Backup
-- Created: ${new Date().toISOString()}
-- Format: SQL Dump
-- Backup created at: ${new Date().toISOString()}
-- Database version: 1.0.0

PRAGMA foreign_keys = OFF;

-- Clear existing data
DELETE FROM icons;
DELETE FROM settings;
DELETE FROM card_generations;

-- Insert icons
`;

    // Add icons
    for (const icon of icons) {
      const base64Data = Buffer.from(icon.data).toString('base64');
      sql += `INSERT INTO icons (id, name, data, type, size, created_at, updated_at) VALUES (
  ${this.sqlEscape(icon.id)},
  ${this.sqlEscape(icon.name)},
  ${this.sqlEscape(base64Data)},
  ${this.sqlEscape(icon.type)},
  ${icon.size},
  ${this.sqlEscape(icon.createdAt)},
  ${this.sqlEscape(icon.updatedAt)}
);\n`;
    }

    // Add settings
    sql += '\n-- Insert settings\n';
    for (const [key, value] of Object.entries(settings)) {
      sql += `INSERT INTO settings (key, value, updated_at) VALUES (
  ${this.sqlEscape(key)},
  ${this.sqlEscape(JSON.stringify(value))},
  CURRENT_TIMESTAMP
);\n`;
    }

    // Add card generations
    sql += '\n-- Insert card generations\n';
    for (const gen of generations) {
      sql += `INSERT INTO card_generations (id, title, grid_size, set_count, cards_per_set, config, created_at) VALUES (
  ${this.sqlEscape(gen.id)},
  ${this.sqlEscape(gen.title)},
  ${gen.gridSize},
  ${gen.setCount},
  ${gen.cardsPerSet},
  ${this.sqlEscape(JSON.stringify(gen.config))},
  ${this.sqlEscape(gen.createdAt)}
);\n`;
    }

    sql += '\nPRAGMA foreign_keys = ON;\n';
    return sql;
  }

  // Restore from SQL dump
  async restoreFromSQL(sqlData) {
    // This is a simplified implementation
    // In production, you'd want a proper SQL parser
    throw new Error('SQL restore not yet implemented - use JSON format instead');
  }

  // Validate JSON backup format
  validateJSONBackup(data) {
    if (!data || typeof data !== 'object') {
      return false;
    }

    // Check for required properties
    const hasValidStructure = 
      (data.icons && Array.isArray(data.icons)) &&
      (data.settings && typeof data.settings === 'object') &&
      data.version;

    return hasValidStructure;
  }

  // Escape SQL values
  sqlEscape(value) {
    if (value === null || value === undefined) {
      return 'NULL';
    }
    // Properly escape single quotes and handle special characters
    return `'${String(value).replace(/'/g, "''").replace(/\n/g, "\\n").replace(/\r/g, "\\r")}'`;
  }

  // Create JSON backup with optional custom filename
  async createJSONBackup(customName = null) {
    try {
      await this.storage.init();
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const baseName = customName || `backup-${timestamp}`;
      const backupPath = path.join(this.backupDir, `${baseName}.json`);
      
      // Get all data from storage
      const icons = await this.storage.loadIcons();
      const settings = await this.storage.loadSettings();
      const generations = await this.storage.loadCardGenerations();
      
      const backupData = {
        metadata: {
          type: 'json',
          format: 'json',
          timestamp: new Date().toISOString(),
          version: '1.0.0',
          compression: {
            enabled: false,
            algorithm: null
          }
        },
        data: {
          icons,
          settings,
          cardGenerations: generations
        }
      };
      
      // Add compression info
      const originalSize = JSON.stringify(backupData).length;
      backupData.metadata.compression.uncompressedSize = originalSize;
      backupData.metadata.compression.compressedSize = originalSize; // No compression for now
      backupData.metadata.uncompressedSize = originalSize; // For backward compatibility
      backupData.metadata.compressedSize = originalSize;
      
      fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
      
      console.log(`JSON backup created: ${backupPath}`);
      return backupPath;
    } catch (error) {
      console.error('Error creating JSON backup:', error);
      throw new Error(`Failed to create JSON backup: ${error.message}`);
    }
  }

  // Create SQL backup with optional custom filename
  async createSQLBackup(customName = null) {
    try {
      await this.storage.init();
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const baseName = customName || `backup-${timestamp}`;
      const backupPath = path.join(this.backupDir, `${baseName}.sql`);
      
      // Generate SQL dump
      const sqlContent = await this.createSQLDump();
      
      fs.writeFileSync(backupPath, sqlContent);
      
      console.log(`SQL backup created: ${backupPath}`);
      return backupPath;
    } catch (error) {
      console.error('Error creating SQL backup:', error);
      throw new Error(`Failed to create SQL backup: ${error.message}`);
    }
  }

  // Restore from JSON backup
  async restoreFromJSON(backupPath) {
    try {
      if (!fs.existsSync(backupPath)) {
        return {
          success: false,
          error: 'Backup file not found'
        };
      }

      const backupContent = fs.readFileSync(backupPath, 'utf8');
      let backupData;
      
      try {
        backupData = JSON.parse(backupContent);
      } catch (parseError) {
        return {
          success: false,
          error: 'Failed to parse JSON backup'
        };
      }

      // Validate backup format
      if (!backupData.data || !backupData.metadata) {
        return {
          success: false,
          error: 'Invalid backup format'
        };
      }

      await this.storage.init();
      
      // Clear existing data
      await this.storage.clearIcons();
      
      const errors = [];
      
      // Restore icons
      if (backupData.data.icons && Array.isArray(backupData.data.icons)) {
        for (const icon of backupData.data.icons) {
          try {
            await this.storage.saveIcon(icon);
          } catch (iconError) {
            errors.push(`Failed to restore icons: ${iconError.message}`);
            console.warn(`Failed to restore icon ${icon.id}:`, iconError);
          }
        }
      }
      
      // Restore settings
      if (backupData.data.settings) {
        try {
          await this.storage.saveSettings(backupData.data.settings);
        } catch (settingsError) {
          errors.push(`Failed to restore settings: ${settingsError.message}`);
        }
      }
      
      // Restore generations
      if (backupData.data.cardGenerations && Array.isArray(backupData.data.cardGenerations)) {
        for (const generation of backupData.data.cardGenerations) {
          try {
            await this.storage.saveCardGeneration(generation);
          } catch (genError) {
            errors.push(`Failed to restore generation: ${genError.message}`);
            console.warn(`Failed to restore generation ${generation.id}:`, genError);
          }
        }
      }
      
      return {
        success: errors.length === 0,
        errors,
        summary: {
          icons: backupData.data.icons?.length || 0,
          settings: backupData.data.settings ? Object.keys(backupData.data.settings).length : 0,
          generations: backupData.data.cardGenerations?.length || 0
        }
      };
    } catch (error) {
      console.error('Error restoring from JSON backup:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get backup file information
  async getBackupInfo(backupPath) {
    try {
      if (!fs.existsSync(backupPath)) {
        return {
          exists: false,
          error: 'Backup file not found'
        };
      }

      const stats = fs.statSync(backupPath);
      const ext = path.extname(backupPath);
      
      let backupInfo = {
        exists: true,
        path: backupPath,
        size: stats.size,
        created: stats.mtime, // Use mtime for testing purposes
        modified: stats.mtime,
        type: ext === '.json' ? 'json' : ext === '.sql' ? 'sql' : 'unknown'
      };

      if (ext === '.json') {
        try {
          const content = fs.readFileSync(backupPath, 'utf8');
          const data = JSON.parse(content);
          
          if (data.metadata) {
            backupInfo.metadata = data.metadata;
            backupInfo.itemCounts = {
              icons: data.data?.icons?.length || 0,
              settings: data.data?.settings ? Object.keys(data.data.settings).length : 0,
              generations: data.data?.generations?.length || 0
            };
          }
        } catch (parseError) {
          backupInfo.type = 'unknown';
          backupInfo.error = 'Failed to parse backup metadata';
        }
      }

      return backupInfo;
    } catch (error) {
      return {
        exists: true,
        error: error.message
      };
    }
  }

  // List all backup files
  async listBackups() {
    try {
      if (!fs.existsSync(this.backupDir)) {
        return [];
      }

      const files = fs.readdirSync(this.backupDir);
      const backups = [];

      for (const file of files) {
        if (file.endsWith('.json') || file.endsWith('.sql')) {
          const backupPath = path.join(this.backupDir, file);
          try {
            const info = await this.getBackupInfo(backupPath);
            if (info.exists) {
              // Include all files, even corrupted ones
              backups.push(info);
            }
          } catch (error) {
            console.warn(`Failed to get info for backup ${file}:`, error);
          }
        }
      }

      return backups.sort((a, b) => new Date(b.created) - new Date(a.created));
    } catch (error) {
      console.error('Error listing backups:', error);
      return [];
    }
  }

  // Clean up old backups
  async cleanupOldBackups(maxAge = 30, minKeep = 3) {
    try {
      const backups = await this.listBackups();
      
      if (backups.length <= minKeep) {
        return { removed: 0, kept: backups.length };
      }

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - maxAge);

      const toRemove = backups
        .slice(minKeep) // Keep at least minKeep newest backups
        .filter(backup => new Date(backup.created) < cutoffDate);

      let removed = 0;
      for (const backup of toRemove) {
        try {
          fs.unlinkSync(backup.path);
          removed++;
        } catch (error) {
          console.warn(`Failed to remove backup ${backup.path}:`, error);
        }
      }

      return {
        removed,
        kept: backups.length - removed
      };
    } catch (error) {
      console.error('Error cleaning up backups:', error);
      return { removed: 0, kept: 0 };
    }
  }

  // Validate backup file integrity
  async validateBackup(backupPath) {
    try {
      const info = await this.getBackupInfo(backupPath);
      
      if (!info.exists) {
        return { 
          valid: false, 
          error: 'Backup file not found',
          errors: ['Backup file not found'],
          warnings: []
        };
      }

      const errors = [];
      const warnings = [];

      if (info.type === 'json') {
        const content = fs.readFileSync(backupPath, 'utf8');
        let data;
        
        try {
          data = JSON.parse(content);
        } catch (parseError) {
          return { 
            valid: false, 
            error: 'Failed to parse JSON backup',
            errors: ['Failed to parse JSON backup'],
            warnings: []
          };
        }
        
        // Basic structure validation
        if (!data.metadata || !data.data) {
          errors.push('Invalid backup structure');
        }

        // Check for required data sections
        if (!data.data.icons && !data.data.settings && !data.data.cardGenerations) {
          errors.push('Backup contains no valid data sections');
        }

        // Data integrity checks
        if (data.data.icons && Array.isArray(data.data.icons)) {
          for (const icon of data.data.icons) {
            if (!icon.id || !icon.name) {
              errors.push('Invalid icon data structure');
            }
            // Check for proper data format
            if (icon.data && typeof icon.data !== 'string' && !Buffer.isBuffer(icon.data)) {
              errors.push('Invalid icon data format');
            }
          }
        }

        return { 
          valid: errors.length === 0, 
          info, 
          errors,
          warnings
        };
      } else if (info.type === 'sql') {
        // Basic SQL file validation
        const content = fs.readFileSync(backupPath, 'utf8');
        if (!content.includes('CREATE TABLE') && !content.includes('INSERT INTO')) {
          errors.push('Invalid SQL backup content');
        }
        return { 
          valid: errors.length === 0, 
          info,
          errors,
          warnings
        };
      }

      return { 
        valid: false, 
        error: 'Unknown backup type',
        errors: ['Unknown backup type'],
        warnings: []
      };
    } catch (error) {
      return { 
        valid: false, 
        error: error.message,
        errors: [error.message],
        warnings: []
      };
    }
  }
}

module.exports = BackupManager;
