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
        category TEXT DEFAULT 'default',
        tags TEXT DEFAULT '[]',
        alt_text TEXT DEFAULT '',
        difficulty INTEGER DEFAULT 3,
        exclude_from_multi_hit BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_icons_name ON icons(name);
      CREATE INDEX IF NOT EXISTS idx_icons_category ON icons(category);
      CREATE INDEX IF NOT EXISTS idx_icons_difficulty ON icons(difficulty);
      CREATE INDEX IF NOT EXISTS idx_icons_exclude_multi_hit ON icons(exclude_from_multi_hit);
      
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
    
    // Generate ID if not provided - ensure it's never undefined
    const iconId = iconData.id || `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    let blobData;
    let mimeType;
    let dataSize;
    
    // Handle different input formats
    if (iconData.image) {
      // Base64 data URL format (from frontend)
      const base64Data = iconData.image;
      console.log('Input image data type:', typeof base64Data);
      console.log('Input image data starts with data:', base64Data?.startsWith('data:'));
      
      if (base64Data && base64Data.startsWith('data:')) {
        try {
          // Extract MIME type and base64 data
          const parts = base64Data.split(',');
          if (parts.length !== 2) {
            throw new Error('Invalid data URL format');
          }
          const [mimePrefix, base64String] = parts;
          const mimeMatch = mimePrefix.match(/data:(.*?);/);
          if (!mimeMatch) {
            throw new Error('Invalid MIME type in data URL');
          }
          mimeType = mimeMatch[1];
          // Convert base64 to Buffer (like Python bytes) immediately
          blobData = Buffer.from(base64String, 'base64');
          dataSize = blobData.length;
          
          console.log('Extracted data:', {
            mimeType: mimeType,
            base64Length: base64String.length
          });
        } catch (error) {
          console.error('Error parsing base64 data:', error);
          throw new Error(`Invalid image data format: ${error.message}`);
        }
      } else {
        throw new Error('Invalid image data format - must be data URL');
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
    
    // Include ALL required fields based on schema (id, name, data, type are NOT NULL)
    const insertSQL = `INSERT INTO icons (id, name, data, type, category, tags, alt_text, difficulty, exclude_from_multi_hit, size) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    try {
      // Debug each parameter
      console.log('iconId:', typeof iconId, iconId);
      console.log('name:', typeof (iconData.name || 'Untitled Icon'), iconData.name || 'Untitled Icon');
      console.log('blobData:', typeof blobData, blobData ? `${blobData.length} bytes` : 'null/undefined');
      console.log('mimeType:', typeof mimeType, mimeType);
      console.log('dataSize:', typeof dataSize, dataSize);
      
      // Use the data directly (already converted to Buffer above)
      const safeIconId = iconId;
      const safeName = iconData.name || 'Untitled Icon';
      const safeData = blobData; // Already a Buffer from above
      const safeType = mimeType || 'image/png'; 
      const safeSize = dataSize;
      
      console.log('Saving icon with all required fields:', {
        id: typeof safeIconId,
        name: typeof safeName,
        data: Buffer.isBuffer(safeData),
        type: typeof safeType,
        size: typeof safeSize
      });
      
      const stmt = this.db.prepare(insertSQL);
      
      const result = stmt.run(
        safeIconId,
        safeName,
        safeData,
        safeType,
        iconData.category || 'default',
        JSON.stringify(iconData.tags || []),
        iconData.altText || iconData.name || 'Icon',
        iconData.difficulty || 3,
        iconData.excludeFromMultiHit ? 1 : 0,
        safeSize || 0
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
          altText: iconData.altText || iconData.name || 'Icon',
          difficulty: iconData.difficulty || 3,
          excludeFromMultiHit: iconData.excludeFromMultiHit || false
        } 
      };
    } catch (error) {
      console.error('Error saving icon to database:', error);
      console.error('Icon data that caused error:', {
        id: iconId,
        name: iconData.name,
        hasImage: !!iconData.image,
        imageLength: iconData.image ? iconData.image.length : 0,
        mimeType,
        dataSize
      });
      throw new Error(`Failed to save icon: ${error.message}`);
    }
  }

  async loadIcons(searchTerm = '', category = '') {
    if (!this.isInitialized) await this.init();
    
    let query = `
      SELECT id, name, data, type, size, category, tags, alt_text, difficulty, exclude_from_multi_hit, created_at, updated_at
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
          difficulty: row.difficulty || 3,
          excludeFromMultiHit: row.exclude_from_multi_hit || false,
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
    
    // Build dynamic update query
    const updates = [];
    const values = [];
    
    if (iconData.category !== undefined) {
      updates.push('category = ?');
      values.push(iconData.category);
    }
    
    if (iconData.name !== undefined) {
      updates.push('name = ?');
      values.push(iconData.name);
    }
    
    if (iconData.difficulty !== undefined) {
      updates.push('difficulty = ?');
      values.push(iconData.difficulty);
    }
    
    if (iconData.tags !== undefined) {
      updates.push('tags = ?');
      values.push(JSON.stringify(iconData.tags));
    }
    
    if (iconData.alt_text !== undefined) {
      updates.push('alt_text = ?');
      values.push(iconData.alt_text);
    }
    
    if (iconData.excludeFromMultiHit !== undefined) {
      updates.push('exclude_from_multi_hit = ?');
      values.push(iconData.excludeFromMultiHit ? 1 : 0);
    }
    
    if (updates.length === 0) {
      throw new Error('No fields to update');
    }
    
    // Add timestamp update
    updates.push('updated_at = CURRENT_TIMESTAMP');
    
    // Add iconId for WHERE clause
    values.push(iconId);
    
    const sql = `UPDATE icons SET ${updates.join(', ')} WHERE id = ?`;
    
    try {
      const stmt = this.db.prepare(sql);
      const result = stmt.run(...values);
      
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
        difficulty: row.difficulty || 3,
        excludeFromMultiHit: row.exclude_from_multi_hit || false,
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

  // Icon Sets Management Methods
  
  // Create a new icon set
  async createIconSet(setData) {
    if (!this.isInitialized) await this.init();
    
    const setId = setData.id || `set-${Date.now()}`;
    const stmt = this.db.prepare(`
      INSERT INTO icon_sets (id, name, description)
      VALUES (?, ?, ?)
    `);
    
    try {
      stmt.run(setId, setData.name, setData.description || '');
      return { success: true, id: setId };
    } catch (error) {
      console.error('Error creating icon set:', error);
      throw new Error(`Failed to create icon set: ${error.message}`);
    }
  }
  
  // Get all icon sets
  async getIconSets() {
    if (!this.isInitialized) await this.init();
    
    const stmt = this.db.prepare(`
      SELECT s.*, COUNT(m.icon_id) as icon_count
      FROM icon_sets s
      LEFT JOIN icon_set_members m ON s.id = m.set_id
      GROUP BY s.id
      ORDER BY s.name ASC
    `);
    
    try {
      const rows = stmt.all();
      return rows.map(row => ({
        id: row.id,
        name: row.name,
        description: row.description,
        iconCount: row.icon_count,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
    } catch (error) {
      console.error('Error loading icon sets:', error);
      throw new Error(`Failed to load icon sets: ${error.message}`);
    }
  }
  
  // Get icons in a specific set
  async getIconsInSet(setId) {
    if (!this.isInitialized) await this.init();
    
    const stmt = this.db.prepare(`
      SELECT i.*, m.added_at
      FROM icons i
      JOIN icon_set_members m ON i.id = m.icon_id
      WHERE m.set_id = ?
      ORDER BY i.name ASC
    `);
    
    try {
      const rows = stmt.all(setId);
      return rows.map(row => {
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
          difficulty: row.difficulty || 3,
          excludeFromMultiHit: row.exclude_from_multi_hit || false,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          addedToSet: row.added_at
        };
      });
    } catch (error) {
      console.error('Error loading icons in set:', error);
      throw new Error(`Failed to load icons in set: ${error.message}`);
    }
  }
  
  // Add icon to set
  async addIconToSet(iconId, setId) {
    if (!this.isInitialized) await this.init();
    
    const stmt = this.db.prepare(`
      INSERT OR IGNORE INTO icon_set_members (icon_id, set_id)
      VALUES (?, ?)
    `);
    
    try {
      const result = stmt.run(iconId, setId);
      return { success: true, added: result.changes > 0 };
    } catch (error) {
      console.error('Error adding icon to set:', error);
      throw new Error(`Failed to add icon to set: ${error.message}`);
    }
  }
  
  // Remove icon from set
  async removeIconFromSet(iconId, setId) {
    if (!this.isInitialized) await this.init();
    
    const stmt = this.db.prepare(`
      DELETE FROM icon_set_members
      WHERE icon_id = ? AND set_id = ?
    `);
    
    try {
      const result = stmt.run(iconId, setId);
      return { success: true, removed: result.changes > 0 };
    } catch (error) {
      console.error('Error removing icon from set:', error);
      throw new Error(`Failed to remove icon from set: ${error.message}`);
    }
  }
  
  // Update icon set
  async updateIconSet(setId, setData) {
    if (!this.isInitialized) await this.init();
    
    const stmt = this.db.prepare(`
      UPDATE icon_sets
      SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    try {
      const result = stmt.run(setData.name, setData.description || '', setId);
      if (result.changes === 0) {
        throw new Error(`Icon set with id ${setId} not found`);
      }
      return { success: true };
    } catch (error) {
      console.error('Error updating icon set:', error);
      throw new Error(`Failed to update icon set: ${error.message}`);
    }
  }
  
  // Delete icon set
  async deleteIconSet(setId) {
    if (!this.isInitialized) await this.init();
    
    // Don't allow deleting the default "All Icons" set
    if (setId === 'all-icons') {
      throw new Error('Cannot delete the default "All Icons" set');
    }
    
    const stmt = this.db.prepare('DELETE FROM icon_sets WHERE id = ?');
    
    try {
      const result = stmt.run(setId);
      return { success: true, deleted: result.changes > 0 };
    } catch (error) {
      console.error('Error deleting icon set:', error);
      throw new Error(`Failed to delete icon set: ${error.message}`);
    }
  }
  
  // Icon Translation Methods
  
  // Save translation for an icon
  async saveIconTranslation(iconId, languageCode, translatedName) {
    if (!this.isInitialized) await this.init();
    
    // Validate inputs to prevent null/empty values
    if (!iconId || !languageCode || !translatedName || 
        languageCode.trim() === '' || translatedName.trim() === '') {
      return { success: false, error: 'Icon ID, language code, and translated name are required' };
    }
    
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO icon_translations (icon_id, language_code, translated_name)
      VALUES (?, ?, ?)
    `);
    
    try {
      stmt.run(iconId, languageCode.trim(), translatedName.trim());
      return { success: true };
    } catch (error) {
      console.error('Error saving icon translation:', error);
      throw new Error(`Failed to save icon translation: ${error.message}`);
    }
  }
  
  // Get translations for an icon
  async getIconTranslations(iconId) {
    if (!this.isInitialized) await this.init();
    
    const stmt = this.db.prepare(`
      SELECT language_code, translated_name
      FROM icon_translations
      WHERE icon_id = ?
    `);
    
    try {
      const rows = stmt.all(iconId);
      const translations = {};
      rows.forEach(row => {
        translations[row.language_code] = row.translated_name;
      });
      return translations;
    } catch (error) {
      console.error('Error loading icon translations:', error);
      throw new Error(`Failed to load icon translations: ${error.message}`);
    }
  }
  
  // Delete translation for an icon
  async deleteIconTranslation(iconId, languageCode) {
    if (!this.isInitialized) await this.init();
    
    // Validate inputs to prevent accidental deletion
    if (!iconId || !languageCode || languageCode.trim() === '') {
      return { success: false, error: 'Icon ID and language code are required' };
    }
    
    const stmt = this.db.prepare(`
      DELETE FROM icon_translations
      WHERE icon_id = ? AND language_code = ?
    `);
    
    try {
      const result = stmt.run(iconId, languageCode.trim());
      return { success: true, deleted: result.changes > 0 };
    } catch (error) {
      console.error('Error deleting icon translation:', error);
      throw new Error(`Failed to delete icon translation: ${error.message}`);
    }
  }
  
  // Get sets that contain a specific icon
  async getSetsContainingIcon(iconId) {
    if (!this.isInitialized) await this.init();
    
    const stmt = this.db.prepare(`
      SELECT s.id, s.name, s.description, m.added_at
      FROM icon_sets s
      JOIN icon_set_members m ON s.id = m.set_id
      WHERE m.icon_id = ?
      ORDER BY s.name ASC
    `);
    
    try {
      const rows = stmt.all(iconId);
      return rows.map(row => ({
        id: row.id,
        name: row.name,
        description: row.description,
        addedAt: row.added_at
      }));
    } catch (error) {
      console.error('Error loading sets containing icon:', error);
      throw new Error(`Failed to load sets containing icon: ${error.message}`);
    }
  }
  
  // Migrate existing icons to ensure they're all in the "All Icons" set
  async migrateExistingIconsToDefaultSet() {
    if (!this.isInitialized) await this.init();
    
    try {
      // Get all icons that are not in any set
      const stmt = this.db.prepare(`
        SELECT i.id
        FROM icons i
        LEFT JOIN icon_set_members m ON i.id = m.icon_id
        WHERE m.icon_id IS NULL
      `);
      
      const orphanedIcons = stmt.all();
      
      if (orphanedIcons.length > 0) {
        console.log(`Migrating ${orphanedIcons.length} orphaned icons to "All Icons" set`);
        
        // Add each orphaned icon to the "All Icons" set
        const insertStmt = this.db.prepare(`
          INSERT OR IGNORE INTO icon_set_members (icon_id, set_id)
          VALUES (?, 'all-icons')
        `);
        
        for (const icon of orphanedIcons) {
          insertStmt.run(icon.id);
        }
        
        return { success: true, migratedCount: orphanedIcons.length };
      }
      
      return { success: true, migratedCount: 0 };
    } catch (error) {
      console.error('Error migrating existing icons:', error);
      throw new Error(`Failed to migrate existing icons: ${error.message}`);
    }
  }

  // Get icons suitable for multi-hit mode (not excluded)
  async getMultiHitEligibleIcons() {
    if (!this.isInitialized) await this.init();
    
    const stmt = this.db.prepare(`
      SELECT id, name, data, type, size, category, tags, alt_text, difficulty, exclude_from_multi_hit, created_at, updated_at
      FROM icons
      WHERE exclude_from_multi_hit = FALSE
      ORDER BY created_at ASC
    `);
    
    try {
      const rows = stmt.all();
      return rows.map(row => {
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
          difficulty: row.difficulty || 3,
          excludeFromMultiHit: row.exclude_from_multi_hit || false,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        };
      });
    } catch (error) {
      console.error('Error loading multi-hit eligible icons:', error);
      throw new Error(`Failed to load multi-hit eligible icons: ${error.message}`);
    }
  }

  // Bulk update exclusion status for multiple icons
  async bulkUpdateMultiHitExclusion(iconIds, exclude) {
    if (!this.isInitialized) await this.init();
    
    const stmt = this.db.prepare(`
      UPDATE icons 
      SET exclude_from_multi_hit = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    try {
      const transaction = this.db.transaction(() => {
        for (const iconId of iconIds) {
          stmt.run(exclude, iconId);
        }
      });
      
      transaction();
      return { success: true, updated: iconIds.length };
    } catch (error) {
      console.error('Error bulk updating multi-hit exclusion:', error);
      throw new Error(`Failed to bulk update multi-hit exclusion: ${error.message}`);
    }
  }

  // Apply smart defaults for multi-hit exclusion based on icon characteristics
  async applySmartMultiHitDefaults() {
    if (!this.isInitialized) await this.init();
    
    // Define environmental/always-visible icons that should be excluded from multi-hit
    const environmentalKeywords = [
      'sky', 'sun', 'cloud', 'horizon', 'road', 'street', 'highway', 'path',
      'grass', 'tree', 'mountain', 'hill', 'field', 'water', 'river', 'lake',
      'weather', 'sunset', 'sunrise', 'daylight', 'darkness', 'night'
    ];
    
    // Define categories that should typically be excluded
    const environmentalCategories = ['environment', 'nature', 'weather', 'landscape'];
    
    try {
      // Build conditions for environmental icons
      const keywordConditions = environmentalKeywords.map(() => 'name LIKE ?').join(' OR ');
      const categoryConditions = environmentalCategories.map(() => 'category = ?').join(' OR ');
      
      const query = `
        UPDATE icons 
        SET exclude_from_multi_hit = TRUE, updated_at = CURRENT_TIMESTAMP
        WHERE (${keywordConditions}) OR (${categoryConditions})
      `;
      
      const params = [
        ...environmentalKeywords.map(keyword => `%${keyword}%`),
        ...environmentalCategories
      ];
      
      const stmt = this.db.prepare(query);
      const result = stmt.run(...params);
      
      console.log(`Applied smart defaults: ${result.changes} icons excluded from multi-hit mode`);
      
      return { 
        success: true, 
        updated: result.changes,
        message: `Smart defaults applied to ${result.changes} icons`
      };
    } catch (error) {
      console.error('Error applying smart multi-hit defaults:', error);
      throw new Error(`Failed to apply smart defaults: ${error.message}`);
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

  // AI Feature Methods
  async analyzeIconWithAI(iconId) {
    try {
      const icon = this.db.prepare('SELECT * FROM icons WHERE id = ?').get(iconId);
      if (!icon) {
        return { success: false, error: 'Icon not found' };
      }

      // Check if analysis already exists and is recent
      const existingAnalysis = this.db.prepare(`
        SELECT * FROM ai_analysis 
        WHERE icon_id = ? 
        AND datetime(analysis_date) > datetime('now', '-7 days')
      `).get(iconId);

      if (existingAnalysis) {
        return { 
          success: true, 
          data: existingAnalysis,
          cached: true 
        };
      }

      // In real implementation, this would call the AI service
      // For now, return a placeholder
      return {
        success: true,
        data: {
          icon_id: iconId,
          category_suggestion: icon.category,
          tags_suggestion: JSON.stringify(['placeholder']),
          difficulty_suggestion: icon.difficulty || 3,
          name_suggestion: icon.name,
          description_suggestion: `AI analysis for ${icon.name}`,
          confidence_score: 0.85,
          ai_model: 'gpt-4o-mini',
          analysis_date: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Error analyzing icon with AI:', error);
      return { success: false, error: error.message };
    }
  }

  async analyzeBatchWithAI(iconIds) {
    try {
      const results = [];
      for (const iconId of iconIds) {
        const result = await this.analyzeIconWithAI(iconId);
        results.push(result);
      }
      return { success: true, data: results };
    } catch (error) {
      console.error('Error batch analyzing icons:', error);
      return { success: false, error: error.message };
    }
  }

  async detectDuplicatesWithAI() {
    try {
      const icons = this.db.prepare('SELECT id, name, category, tags FROM icons').all();
      
      // In real implementation, this would use AI to detect semantic duplicates
      // For now, return empty results
      return {
        success: true,
        data: {
          groups: [],
          total_icons_analyzed: icons.length,
          duplicates_found: 0
        }
      };
    } catch (error) {
      console.error('Error detecting duplicates:', error);
      return { success: false, error: error.message };
    }
  }

  async getAIContentSuggestions(targetSet = 'general') {
    try {
      const icons = this.db.prepare('SELECT * FROM icons').all();
      const iconSummary = this.summarizeIconSet(icons);

      // In real implementation, this would use AI to suggest missing content
      return {
        success: true,
        data: {
          target_set: targetSet,
          current_summary: iconSummary,
          suggestions: [
            {
              type: 'missing_category',
              category: 'Weather',
              reason: 'No weather-related icons found',
              examples: ['Rain', 'Snow', 'Sun', 'Cloud']
            }
          ]
        }
      };
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      return { success: false, error: error.message };
    }
  }

  async generateSmartSet(criteria) {
    try {
      // In real implementation, this would use AI to generate a themed set
      return {
        success: true,
        data: {
          name: criteria.theme || 'Custom Set',
          description: 'AI-generated icon set',
          icons: [],
          theme: criteria.theme,
          created_at: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Error generating smart set:', error);
      return { success: false, error: error.message };
    }
  }

  async getAIPreferences() {
    try {
      const prefs = this.db.prepare('SELECT * FROM ai_preferences WHERE user_id = ?').get('default');
      return prefs || {
        enabled: true,
        auto_apply_suggestions: false,
        preferred_model: 'gpt-4o-mini',
        duplicate_detection_sensitivity: 0.8,
        suggestion_aggressiveness: 'moderate'
      };
    } catch (error) {
      console.error('Error getting AI preferences:', error);
      return null;
    }
  }

  async updateAIPreferences(preferences) {
    try {
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO ai_preferences (
          user_id, enabled, auto_apply_suggestions, preferred_model,
          duplicate_detection_sensitivity, suggestion_aggressiveness,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      `);

      stmt.run(
        'default',
        preferences.enabled !== false,
        preferences.auto_apply_suggestions || false,
        preferences.preferred_model || 'gpt-4o-mini',
        preferences.duplicate_detection_sensitivity || 0.8,
        preferences.suggestion_aggressiveness || 'moderate'
      );

      return { success: true };
    } catch (error) {
      console.error('Error updating AI preferences:', error);
      return { success: false, error: error.message };
    }
  }

  async cacheAIResult(data) {
    try {
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + (data.expires_in || 86400));

      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO ai_cache (
          cache_key, request_type, request_data, response_data,
          ai_model, created_at, expires_at
        ) VALUES (?, ?, ?, ?, ?, datetime('now'), ?)
      `);

      stmt.run(
        data.cache_key,
        data.request_type,
        JSON.stringify(data.request_data || {}),
        JSON.stringify(data.response_data),
        data.ai_model || 'gpt-4o-mini',
        expiresAt.toISOString()
      );

      return { success: true };
    } catch (error) {
      console.error('Error caching AI result:', error);
      return { success: false, error: error.message };
    }
  }

  async getAICachedResult(cacheKey) {
    try {
      const cached = this.db.prepare(`
        SELECT * FROM ai_cache 
        WHERE cache_key = ? 
        AND datetime(expires_at) > datetime('now')
      `).get(cacheKey);

      if (cached) {
        // Update hit count
        this.db.prepare('UPDATE ai_cache SET hit_count = hit_count + 1 WHERE cache_key = ?').run(cacheKey);
        
        return {
          success: true,
          data: {
            ...cached,
            response_data: JSON.parse(cached.response_data)
          }
        };
      }

      return { success: false, error: 'Cache miss' };
    } catch (error) {
      console.error('Error getting cached result:', error);
      return { success: false, error: error.message };
    }
  }

  async trackAIUsage(data) {
    try {
      // Update usage counter
      const currentDate = new Date().toISOString().split('T')[0];
      
      this.db.prepare(`
        UPDATE ai_preferences 
        SET current_month_usage = current_month_usage + 1,
            usage_reset_date = CASE 
              WHEN usage_reset_date IS NULL OR date(usage_reset_date) < date('now', 'start of month')
              THEN date('now', 'start of month')
              ELSE usage_reset_date
            END
        WHERE user_id = 'default'
      `).run();

      return { success: true };
    } catch (error) {
      console.error('Error tracking AI usage:', error);
      return { success: false, error: error.message };
    }
  }

  async checkAIUsageLimits() {
    try {
      const prefs = await this.getAIPreferences();
      const currentDate = new Date();
      const resetDate = prefs.usage_reset_date ? new Date(prefs.usage_reset_date) : null;
      
      // Reset usage if we're in a new month
      if (!resetDate || resetDate.getMonth() !== currentDate.getMonth()) {
        await this.db.prepare(`
          UPDATE ai_preferences 
          SET current_month_usage = 0, 
              usage_reset_date = date('now', 'start of month')
          WHERE user_id = 'default'
        `).run();
        
        return {
          success: true,
          data: {
            within_limits: true,
            usage: 0,
            limit: prefs.monthly_usage_limit || 1000
          }
        };
      }

      return {
        success: true,
        data: {
          within_limits: prefs.current_month_usage < (prefs.monthly_usage_limit || 1000),
          usage: prefs.current_month_usage || 0,
          limit: prefs.monthly_usage_limit || 1000
        }
      };
    } catch (error) {
      console.error('Error checking usage limits:', error);
      return { success: false, error: error.message };
    }
  }

  summarizeIconSet(icons) {
    const summary = {
      total_count: icons.length,
      categories: {},
      difficulties: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      common_tags: {}
    };

    icons.forEach(icon => {
      summary.categories[icon.category] = (summary.categories[icon.category] || 0) + 1;
      if (icon.difficulty) {
        summary.difficulties[icon.difficulty]++;
      }
      
      if (icon.tags) {
        try {
          const tags = typeof icon.tags === 'string' ? JSON.parse(icon.tags) : icon.tags;
          tags.forEach(tag => {
            summary.common_tags[tag] = (summary.common_tags[tag] || 0) + 1;
          });
        } catch (e) {
          // Ignore JSON parse errors
        }
      }
    });

    return summary;
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
