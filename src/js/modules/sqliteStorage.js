// Road Trip Bingo - SQLite Storage System
// Using SQLite for persistent server-side storage

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

class SQLiteStorage {
  constructor(dbPath = './data/roadtripbingo.db') {
    this.dbPath = dbPath;
    this.db = null;
    this.isInitialized = false;
    
    // Ensure data directory exists (only for reasonable paths)
    const dataDir = path.dirname(dbPath);
    try {
      if (!path.isAbsolute(dataDir) || dataDir.startsWith('./') || dataDir.startsWith('temp/')) {
        if (!fs.existsSync(dataDir)) {
          fs.mkdirSync(dataDir, { recursive: true });
        }
      }
    } catch (error) {
      // Ignore directory creation errors in constructor
      console.warn(`Could not create directory ${dataDir}:`, error.message);
    }
  }

  // Initialize SQLite database
  async init() {
    try {
      this.db = new Database(this.dbPath);
      
      // Enable WAL mode for better concurrency
      this.db.pragma('journal_mode = WAL');
      this.db.pragma('foreign_keys = ON');
      
      // Run migrations
      await this.runMigrations();
      
      this.isInitialized = true;
      console.log('SQLite database initialized successfully');
      
      return true;
    } catch (error) {
      console.error('Error initializing SQLite database:', error);
      throw error;
    }
  }

  // Run database migrations
  async runMigrations() {
    const migrationsDir = path.join(__dirname, '../../../data/migrations');
    
    if (!fs.existsSync(migrationsDir)) {
      console.warn('Migrations directory not found, creating initial schema...');
      await this.createInitialSchema();
      return;
    }

    try {
      const migrationFiles = fs.readdirSync(migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .sort();

      for (const file of migrationFiles) {
        const migrationPath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(migrationPath, 'utf8');
        
        try {
          this.db.exec(sql);
          console.log(`Migration ${file} executed successfully`);
        } catch (error) {
          // Handle duplicate column errors gracefully for migrations
          if (error.message.includes('duplicate column name')) {
            console.log(`Migration ${file} skipped - columns already exist`);
          } else {
            console.error(`Error executing migration ${file}:`, error);
            throw error;
          }
        }
      }
    } catch (error) {
      // If migrations fail due to I/O issues, fall back to initial schema
      console.warn('Migration failed, using fallback schema:', error.message);
      await this.createInitialSchema();
    }
  }

  // Create initial schema if migrations don't exist
  async createInitialSchema() {
    const sql = `
      PRAGMA foreign_keys = ON;
      
      CREATE TABLE IF NOT EXISTS icons (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        data BLOB NOT NULL,
        type TEXT NOT NULL,
        size INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_icons_name ON icons(name);
      
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS card_generations (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        grid_size INTEGER NOT NULL,
        set_count INTEGER NOT NULL,
        cards_per_set INTEGER NOT NULL,
        config TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS db_metadata (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('version', '1.0.0');
    `;
    
    this.db.exec(sql);
  }

  // Icon management methods
  async saveIcon(iconData) {
    if (!this.isInitialized) await this.init();
    
    // Generate ID if not provided
    const iconId = iconData.id || Date.now().toString();
    
    let blobData;
    let mimeType;
    let dataSize;
    
    // Handle different input formats
    if (iconData.image) {
      // Base64 data URL format (from frontend)
      const base64Data = iconData.image;
      if (base64Data.startsWith('data:')) {
        // Extract MIME type and base64 data
        const [mimePrefix, base64String] = base64Data.split(',');
        mimeType = mimePrefix.match(/data:(.*?);/)[1];
        blobData = Buffer.from(base64String, 'base64');
        dataSize = blobData.length;
      } else {
        throw new Error('Invalid image data format');
      }
    } else if (iconData.blob) {
      // Blob format (from IndexedDB migration)
      blobData = iconData.blob;
      mimeType = iconData.type || 'image/png';
      dataSize = blobData.size || blobData.length;
    } else if (iconData.data) {
      // Raw data format
      blobData = iconData.data;
      mimeType = iconData.type || 'image/png';
      dataSize = blobData.length;
    } else {
      throw new Error('No image data provided');
    }
    
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO icons (id, name, data, type, size, category, tags, alt_text, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);
    
    try {
      const result = stmt.run(
        iconId,
        iconData.name || 'Untitled Icon',
        blobData,
        mimeType,
        dataSize,
        iconData.category || 'default',
        JSON.stringify(iconData.tags || []),
        iconData.altText || iconData.name || 'Icon'
      );
      
      return { 
        success: true, 
        data: { 
          id: iconId, 
          name: iconData.name || 'Untitled Icon',
          type: mimeType,
          size: dataSize,
          category: iconData.category || 'default',
          tags: iconData.tags || [],
          altText: iconData.altText || iconData.name || 'Icon'
        } 
      };
    } catch (error) {
      console.error('Error saving icon:', error);
      throw new Error(`Failed to save icon: ${error.message}`);
    }
  }

  async loadIcons(searchTerm = '', category = '') {
    if (!this.isInitialized) await this.init();
    
    let query = `
      SELECT id, name, data, type, size, category, tags, alt_text, created_at, updated_at
      FROM icons
    `;
    
    const params = [];
    const conditions = [];
    
    if (searchTerm) {
      conditions.push('(name LIKE ? OR alt_text LIKE ? OR tags LIKE ?)');
      const searchPattern = `%${searchTerm}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }
    
    if (category && category !== 'all') {
      conditions.push('category = ?');
      params.push(category);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY created_at ASC';
    
    const stmt = this.db.prepare(query);
    
    try {
      const rows = stmt.all(...params);
      return rows.map(row => {
        let imageData = row.data;
        
        // Convert Buffer back to base64 data URL for frontend compatibility
        if (Buffer.isBuffer(imageData)) {
          imageData = `data:${row.type};base64,${imageData.toString('base64')}`;
        }
        
        return {
          id: row.id,
          name: row.name,
          image: imageData, // Use 'image' property for frontend compatibility
          data: imageData,  // Keep 'data' for backward compatibility
          type: row.type,
          size: row.size,
          category: row.category || 'default',
          tags: JSON.parse(row.tags || '[]'),
          altText: row.alt_text || '',
          createdAt: row.created_at,
          updatedAt: row.updated_at
        };
      });
    } catch (error) {
      console.error('Error loading icons:', error);
      throw new Error(`Failed to load icons: ${error.message}`);
    }
  }

  // Get all categories
  async getCategories() {
    if (!this.isInitialized) await this.init();
    
    const stmt = this.db.prepare(`
      SELECT DISTINCT category, COUNT(*) as count
      FROM icons
      GROUP BY category
      ORDER BY category ASC
    `);
    
    try {
      const rows = stmt.all();
      return rows.map(row => ({
        name: row.category,
        count: row.count
      }));
    } catch (error) {
      console.error('Error loading categories:', error);
      return [];
    }
  }

  async deleteIcon(iconId) {
    if (!this.isInitialized) await this.init();
    
    const stmt = this.db.prepare('DELETE FROM icons WHERE id = ?');
    
    try {
      const result = stmt.run(iconId);
      return { success: true, deleted: result.changes > 0 };
    } catch (error) {
      console.error('Error deleting icon:', error);
      throw new Error(`Failed to delete icon: ${error.message}`);
    }
  }

  async clearIcons() {
    if (!this.isInitialized) await this.init();
    
    const stmt = this.db.prepare('DELETE FROM icons');
    
    try {
      const result = stmt.run();
      return { success: true, deleted: result.changes };
    } catch (error) {
      console.error('Error clearing icons:', error);
      throw new Error(`Failed to clear icons: ${error.message}`);
    }
  }

  // Settings management methods
  async saveSettings(settings) {
    if (!this.isInitialized) await this.init();
    
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO settings (key, value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `);
    
    try {
      // Convert settings object to individual key-value pairs
      const transaction = this.db.transaction((settingsObj) => {
        for (const [key, value] of Object.entries(settingsObj)) {
          stmt.run(key, JSON.stringify(value));
        }
      });
      
      transaction(settings);
      return { success: true };
    } catch (error) {
      console.error('Error saving settings:', error);
      throw new Error(`Failed to save settings: ${error.message}`);
    }
  }

  async loadSettings() {
    if (!this.isInitialized) await this.init();
    
    const stmt = this.db.prepare('SELECT key, value FROM settings');
    
    try {
      const rows = stmt.all();
      const settings = {};
      
      for (const row of rows) {
        try {
          settings[row.key] = JSON.parse(row.value);
        } catch (parseError) {
          console.warn(`Error parsing setting ${row.key}:`, parseError);
          // Skip malformed entries instead of falling back to raw value
          continue;
        }
      }
      
      return settings;
    } catch (error) {
      console.error('Error loading settings:', error);
      throw new Error(`Failed to load settings: ${error.message}`);
    }
  }

  // Card generation history methods
  async saveCardGeneration(generationData) {
    if (!this.isInitialized) await this.init();
    
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO card_generations (id, title, grid_size, set_count, cards_per_set, config)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    try {
      const result = stmt.run(
        generationData.id,
        generationData.title,
        generationData.gridSize,
        generationData.setCount,
        generationData.cardsPerSet,
        JSON.stringify(generationData.config)
      );
      
      return { success: true, id: generationData.id };
    } catch (error) {
      console.error('Error saving card generation:', error);
      throw new Error(`Failed to save card generation: ${error.message}`);
    }
  }

  async loadCardGenerations(limit = 50) {
    if (!this.isInitialized) await this.init();
    
    const stmt = this.db.prepare(`
      SELECT id, title, grid_size, set_count, cards_per_set, config, created_at
      FROM card_generations
      ORDER BY created_at DESC
      LIMIT ?
    `);
    
    try {
      const rows = stmt.all(limit);
      return rows.map(row => ({
        id: row.id,
        title: row.title,
        gridSize: row.grid_size,
        setCount: row.set_count,
        cardsPerSet: row.cards_per_set,
        config: JSON.parse(row.config),
        createdAt: row.created_at
      }));
    } catch (error) {
      console.error('Error loading card generations:', error);
      throw new Error(`Failed to load card generations: ${error.message}`);
    }
  }

  // Database management methods
  async getStorageInfo() {
    if (!this.isInitialized) await this.init();
    
    try {
      const iconCountStmt = this.db.prepare('SELECT COUNT(*) as count FROM icons');
      const iconSizeStmt = this.db.prepare('SELECT SUM(size) as total_size FROM icons');
      const settingsCountStmt = this.db.prepare('SELECT COUNT(*) as count FROM settings');
      
      const iconCount = iconCountStmt.get().count;
      const iconSize = iconSizeStmt.get().total_size || 0;
      const settingsCount = settingsCountStmt.get().count;
      
      // Get database file size
      const stats = fs.statSync(this.dbPath);
      const dbSize = stats.size;
      
      return {
        iconCount,
        iconSizeMB: iconSize / (1024 * 1024),
        settingsCount,
        totalSizeMB: dbSize / (1024 * 1024),
        dbPath: this.dbPath
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      throw new Error(`Failed to get storage info: ${error.message}`);
    }
  }

  // Export data for backup
  async exportData() {
    if (!this.isInitialized) await this.init();
    
    try {
      const icons = await this.loadIcons();
      const settings = await this.loadSettings();
      const generations = await this.loadCardGenerations(1000); // Export more history
      
      // Convert binary data to base64 for JSON export
      const exportIcons = icons.map(icon => ({
        ...icon,
        data: Buffer.from(icon.data).toString('base64')
      }));
      
      return {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        icons: exportIcons,
        settings,
        generations
      };
    } catch (error) {
      console.error('Error exporting data:', error);
      throw new Error(`Failed to export data: ${error.message}`);
    }
  }

  // Import data from backup
  async importData(data) {
    if (!this.isInitialized) await this.init();
    
    try {
      const transaction = this.db.transaction(() => {
        // Clear existing data
        this.db.prepare('DELETE FROM icons').run();
        this.db.prepare('DELETE FROM settings').run();
        this.db.prepare('DELETE FROM card_generations').run();
        
        // Import icons
        if (data.icons) {
          const iconStmt = this.db.prepare(`
            INSERT INTO icons (id, name, data, type, size, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `);
          
          for (const icon of data.icons) {
            const binaryData = Buffer.from(icon.data, 'base64');
            iconStmt.run(
              icon.id,
              icon.name,
              binaryData,
              icon.type,
              icon.size,
              icon.createdAt || new Date().toISOString(),
              icon.updatedAt || new Date().toISOString()
            );
          }
        }
        
        // Import settings
        if (data.settings) {
          const settingsStmt = this.db.prepare(`
            INSERT INTO settings (key, value, updated_at)
            VALUES (?, ?, CURRENT_TIMESTAMP)
          `);
          
          for (const [key, value] of Object.entries(data.settings)) {
            settingsStmt.run(key, JSON.stringify(value));
          }
        }
        
        // Import card generations
        if (data.generations) {
          const genStmt = this.db.prepare(`
            INSERT INTO card_generations (id, title, grid_size, set_count, cards_per_set, config, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `);
          
          for (const gen of data.generations) {
            genStmt.run(
              gen.id,
              gen.title,
              gen.gridSize,
              gen.setCount,
              gen.cardsPerSet,
              JSON.stringify(gen.config),
              gen.createdAt || new Date().toISOString()
            );
          }
        }
      });
      
      transaction();
      return { success: true };
    } catch (error) {
      console.error('Error importing data:', error);
      throw new Error(`Failed to import data: ${error.message}`);
    }
  }

  // Version management methods
  async getVersion() {
    if (!this.isInitialized) await this.init();
    
    const stmt = this.db.prepare('SELECT value FROM db_metadata WHERE key = ?');
    
    try {
      const row = stmt.get('version');
      return row ? parseInt(row.value) : 1;
    } catch (error) {
      console.error('Error getting version:', error);
      return 1; // Default version
    }
  }

  async setVersion(version) {
    if (!this.isInitialized) await this.init();
    
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO db_metadata (key, value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `);
    
    try {
      stmt.run('version', version.toString());
      return { success: true };
    } catch (error) {
      console.error('Error setting version:', error);
    }
  }

  // Update an existing icon
  async updateIcon(iconId, iconData) {
    if (!this.isInitialized) await this.init();
    
    const { name, category, tags, alt_text } = iconData;
    
    const stmt = this.db.prepare(`
      UPDATE icons 
      SET name = ?, category = ?, tags = ?, alt_text = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    try {
      const result = stmt.run(
        name || 'Untitled Icon',
        category || 'default',
        JSON.stringify(tags || []),
        alt_text || '',
        iconId
      );
      
      if (result.changes === 0) {
        throw new Error(`Icon with id ${iconId} not found`);
      }
      
      // Return the updated icon
      const updatedIcon = await this.loadIcon(iconId);
      return { success: true, data: updatedIcon };
    } catch (error) {
      console.error('Error updating icon:', error);
      throw new Error(`Failed to update icon: ${error.message}`);
    }
  }

  // Load a single icon by ID
  async loadIcon(iconId) {
    if (!this.isInitialized) await this.init();
    
    const stmt = this.db.prepare('SELECT * FROM icons WHERE id = ?');
    
    try {
      const row = stmt.get(iconId);
      if (!row) {
        return null;
      }
      
      let imageData = row.data;
      
      // Convert Buffer back to base64 data URL for frontend compatibility
      if (Buffer.isBuffer(imageData)) {
        imageData = `data:${row.type};base64,${imageData.toString('base64')}`;
      }
      
      return {
        id: row.id,
        name: row.name,
        image: imageData,
        data: imageData,
        type: row.type,
        size: row.size,
        category: row.category || 'default',
        tags: JSON.parse(row.tags || '[]'),
        altText: row.alt_text || '',
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };
    } catch (error) {
      console.error('Error loading icon:', error);
      throw new Error(`Failed to load icon: ${error.message}`);
    }
  }

  // Optimize storage (VACUUM and analyze)
  async optimizeStorage() {
    if (!this.isInitialized) await this.init();
    
    try {
      // Get initial database size
      const beforeStats = this.db.prepare('PRAGMA page_count').get();
      const pageSize = this.db.prepare('PRAGMA page_size').get();
      const beforeSize = beforeStats.page_count * pageSize.page_size;
      
      // Run VACUUM to reclaim space
      this.db.exec('VACUUM');
      
      // Analyze tables for query optimization
      this.db.exec('ANALYZE');
      
      // Get after stats
      const afterStats = this.db.prepare('PRAGMA page_count').get();
      const afterSize = afterStats.page_count * pageSize.page_size;
      
      const spaceSaved = beforeSize - afterSize;
      
      console.log('Storage optimization completed:', {
        beforeSize,
        afterSize,
        spaceSaved
      });
      
      return {
        beforeSize,
        afterSize,
        spaceSaved,
        message: `Optimization complete. ${spaceSaved > 0 ? `Saved ${spaceSaved} bytes.` : 'No space reclaimed.'}`
      };
    } catch (error) {
      console.error('Error optimizing storage:', error);
      throw new Error(`Failed to optimize storage: ${error.message}`);
    }
  }

  // Clear all data from database (for testing purposes)
  async clearAllData() {
    if (!this.isInitialized) await this.init();
    
    try {
      // Start transaction
      const deleteCards = this.db.prepare('DELETE FROM card_generations');
      const deleteIcons = this.db.prepare('DELETE FROM icons');
      const deleteSettings = this.db.prepare('DELETE FROM settings');
      
      // Execute deletions in transaction
      const transaction = this.db.transaction(() => {
        deleteCards.run();
        deleteIcons.run();
        deleteSettings.run();
      });
      
      transaction();
      
      console.log('All data cleared from database');
      return { success: true, message: 'All data cleared successfully' };
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw new Error(`Failed to clear all data: ${error.message}`);
    }
  }

  // Close database connection
  close() {
    if (this.db) {
      this.db.close();
      this.isInitialized = false;
      console.log('SQLite database connection closed');
    }
  }
}

module.exports = SQLiteStorage;
