// Road Trip Bingo - IndexedDB Storage System
// Using IndexedDB for much larger storage capacity and better performance

class IndexedDBStorage {
  constructor() {
    this.dbName = 'roadtripBingo';
    this.dbVersion = 1;
    this.db = null;
    this.data = {
      settings: {
        language: 'en',
        theme: 'light',
        gridSize: 5,
        cardsPerSet: 1,
        showLabels: true
      },
      gameStates: []
    };
  }

  // Initialize IndexedDB
  init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('Error opening IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = async () => {
        try {
          this.db = request.result;
          console.log('IndexedDB opened successfully');
          await this.loadSettings();
          await this.migrateFromLocalStorage();
          resolve(this.data);
        } catch (error) {
          console.error('Error during IndexedDB initialization:', error);
          reject(error);
        }
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        console.log('Creating IndexedDB object stores');

        // Create icons store
        if (!db.objectStoreNames.contains('icons')) {
          const iconStore = db.createObjectStore('icons', { keyPath: 'id' });
          iconStore.createIndex('name', 'name', { unique: false });
        }

        // Create settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }

        // Create game states store
        if (!db.objectStoreNames.contains('gameStates')) {
          db.createObjectStore('gameStates', { keyPath: 'id' });
        }
      };
    });
  }

  // Migrate data from localStorage to IndexedDB
  async migrateFromLocalStorage() {
    try {
      const localData = localStorage.getItem('roadtripbingo-data');
      if (localData) {
        console.log('Migrating data from localStorage to IndexedDB...');
        const parsed = JSON.parse(localData);
        
        // Migrate icons
        if (parsed.icons && parsed.icons.length > 0) {
          console.log(`Migrating ${parsed.icons.length} icons...`);
          for (const icon of parsed.icons) {
            // Convert base64 to Blob for more efficient storage
            const blob = await this.base64ToBlob(icon.data);
            await this.saveIcon({
              id: icon.id,
              name: icon.name,
              blob: blob,
              type: blob.type
            });
          }
        }

        // Migrate settings
        if (parsed.settings) {
          await this.saveSettings(parsed.settings);
        }

        // Clear localStorage after successful migration
        localStorage.removeItem('roadtripbingo-data');
        console.log('Migration completed, localStorage cleared');
        
        // Show success message to user
        setTimeout(() => {
          const message = document.createElement('div');
          message.className = 'storage-info';
          message.textContent = `Successfully migrated ${parsed.icons?.length || 0} icons to improved storage system!`;
          message.style.background = '#d4edda';
          message.style.color = '#155724';
          message.style.border = '1px solid #c3e6cb';
          
          const iconManager = document.getElementById('iconManager');
          if (iconManager) {
            iconManager.insertBefore(message, iconManager.firstChild);
            setTimeout(() => message.remove(), 8000);
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Error during migration:', error);
      // Don't fail if migration fails, just continue
    }
  }

  // Convert base64 data URL to Blob
  base64ToBlob(dataURL) {
    return new Promise((resolve) => {
      const arr = dataURL.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      resolve(new Blob([u8arr], { type: mime }));
    });
  }

  // Convert Blob to base64 data URL (for backward compatibility)
  blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // Icon operations
  async saveIcon(iconData) {
    if (!this.db) {
      throw new Error('Database not initialized. Call init() first.');
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['icons'], 'readwrite');
      const store = transaction.objectStore('icons');
      
      const request = store.put(iconData);
      
      request.onsuccess = () => resolve(iconData);
      request.onerror = () => reject(request.error);
    });
  }

  async saveIcons(icons) {
    const results = [];
    for (const icon of icons) {
      let iconData;
      
      if (icon.blob) {
        // Already has blob data
        iconData = icon;
      } else if (icon.data) {
        // Convert base64 to blob
        const blob = await this.base64ToBlob(icon.data);
        iconData = {
          id: icon.id,
          name: icon.name,
          blob: blob,
          type: blob.type
        };
      }
      
      const saved = await this.saveIcon(iconData);
      results.push(saved);
    }
    console.log(`Saved ${results.length} icons to IndexedDB`);
    return results;
  }

  async loadIcons() {
    if (!this.db) {
      throw new Error('Database not initialized. Call init() first.');
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['icons'], 'readonly');
      const store = transaction.objectStore('icons');
      const request = store.getAll();
      
      request.onsuccess = async () => {
        const icons = request.result;
        // Convert back to the format expected by the app
        const convertedIcons = [];
        
        for (const icon of icons) {
          const base64Data = await this.blobToBase64(icon.blob);
          convertedIcons.push({
            id: icon.id,
            name: icon.name,
            data: base64Data
          });
        }
        
        resolve(convertedIcons);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  async deleteIcon(id) {
    if (!this.db) {
      throw new Error('Database not initialized. Call init() first.');
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['icons'], 'readwrite');
      const store = transaction.objectStore('icons');
      const request = store.delete(id);
      
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  async clearIcons() {
    if (!this.db) {
      throw new Error('Database not initialized. Call init() first.');
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['icons'], 'readwrite');
      const store = transaction.objectStore('icons');
      const request = store.clear();
      
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  // Settings operations
  async saveSettings(settings) {
    if (!this.db) {
      throw new Error('Database not initialized. Call init() first.');
    }
    
    this.data.settings = { ...this.data.settings, ...settings };
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['settings'], 'readwrite');
      const store = transaction.objectStore('settings');
      
      const request = store.put({
        key: 'main',
        data: this.data.settings
      });
      
      request.onsuccess = () => resolve(this.data.settings);
      request.onerror = () => reject(request.error);
    });
  }

  async loadSettings() {
    if (!this.db) {
      throw new Error('Database not initialized. Call init() first.');
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['settings'], 'readonly');
      const store = transaction.objectStore('settings');
      const request = store.get('main');
      
      request.onsuccess = () => {
        if (request.result) {
          this.data.settings = { ...this.data.settings, ...request.result.data };
        }
        resolve(this.data.settings);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  // Get storage usage information
  async getStorageInfo() {
    try {
      // Estimate storage usage
      const estimate = await navigator.storage.estimate();
      const usedMB = (estimate.usage || 0) / (1024 * 1024);
      const quotaMB = (estimate.quota || 0) / (1024 * 1024);
      
      // Get icon count
      const icons = await this.loadIcons();
      const iconCount = icons.length;
      
      return {
        totalSizeMB: usedMB,
        quotaMB: quotaMB,
        iconCount: iconCount,
        isNearLimit: quotaMB > 0 && (usedMB / quotaMB) > 0.8,
        isOverLimit: quotaMB > 0 && (usedMB / quotaMB) > 0.95,
        storageType: 'IndexedDB'
      };
    } catch (error) {
      return {
        totalSizeMB: 0,
        quotaMB: 0,
        iconCount: 0,
        isNearLimit: false,
        isOverLimit: false,
        storageType: 'IndexedDB',
        error: error.message
      };
    }
  }

  // Export data for backup
  async exportData() {
    const icons = await this.loadIcons();
    const settings = await this.loadSettings();
    
    const data = {
      icons: icons,
      settings: settings,
      gameStates: this.data.gameStates,
      exportDate: new Date().toISOString(),
      version: '2.0'
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'roadtripbingo-backup.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Import data from backup
  async importData(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = JSON.parse(event.target.result);
          
          // Clear existing data
          await this.clearIcons();
          
          // Import icons
          if (data.icons && data.icons.length > 0) {
            await this.saveIcons(data.icons);
          }
          
          // Import settings
          if (data.settings) {
            await this.saveSettings(data.settings);
          }
          
          resolve(true);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  // Compatibility methods (remove storage optimization since IndexedDB handles large data)
  optimizeIconsAndRetry(icons) {
    // With IndexedDB, we don't need to optimize - just save all icons
    return this.saveIcons(icons);
  }

  save() {
    // IndexedDB operations are already saved immediately, so this is just for compatibility
    return Promise.resolve(true);
  }
}

// Create the storage instance
const indexedDBStorage = new IndexedDBStorage();

// Export the storage instance as the default export
export default indexedDBStorage;
