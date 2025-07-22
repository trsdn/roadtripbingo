import iconService from './iconService';
import settingsService from './settingsService';

const backupService = {
  async createFullBackup() {
    try {
      const [icons, settings] = await Promise.all([
        iconService.getAll(),
        settingsService.getAll()
      ]);
      
      const backup = {
        version: '2.0',
        timestamp: new Date().toISOString(),
        data: {
          icons,
          settings,
          iconCount: icons.length,
          settingsCount: Object.keys(settings).length
        },
        metadata: {
          exportedBy: 'Road Trip Bingo Generator',
          format: 'json'
        }
      };
      
      return backup;
    } catch (error) {
      throw new Error(`Failed to create backup: ${error.message}`);
    }
  },
  
  async exportBackup(options = {}) {
    const {
      includeIcons = true,
      includeSettings = true,
      filename = null
    } = options;
    
    try {
      let backup = {
        version: '2.0',
        timestamp: new Date().toISOString(),
        data: {},
        metadata: {
          exportedBy: 'Road Trip Bingo Generator',
          format: 'json'
        }
      };
      
      if (includeIcons) {
        const icons = await iconService.getAll();
        backup.data.icons = icons;
        backup.data.iconCount = icons.length;
      }
      
      if (includeSettings) {
        const settings = await settingsService.getAll();
        backup.data.settings = settings;
        backup.data.settingsCount = Object.keys(settings).length;
      }
      
      // Create download
      const dataStr = JSON.stringify(backup, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      
      const defaultFilename = `bingo-backup-${new Date().toISOString().split('T')[0]}.json`;
      const exportFilename = filename || defaultFilename;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFilename);
      linkElement.click();
      
      return {
        success: true,
        filename: exportFilename,
        iconCount: backup.data.iconCount || 0,
        settingsCount: backup.data.settingsCount || 0
      };
    } catch (error) {
      throw new Error(`Failed to export backup: ${error.message}`);
    }
  },
  
  async importBackup(file, options = {}) {
    const {
      importIcons = true,
      importSettings = true,
      overwriteExisting = false
    } = options;
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const backup = JSON.parse(e.target.result);
          
          // Validate backup format
          if (!backup.version || !backup.data) {
            throw new Error('Invalid backup file format');
          }
          
          const results = {
            iconsImported: 0,
            settingsImported: 0,
            errors: []
          };
          
          // Import icons
          if (importIcons && backup.data.icons) {
            try {
              for (const icon of backup.data.icons) {
                try {
                  // Check if icon already exists
                  if (!overwriteExisting) {
                    const existing = await iconService.getAll();
                    const existingIcon = existing.find(e => e.name === icon.name);
                    if (existingIcon) {
                      results.errors.push(`Icon "${icon.name}" already exists - skipped`);
                      continue;
                    }
                  }
                  
                  await iconService.create({
                    name: icon.name,
                    data: icon.data,
                    difficulty: icon.difficulty || 1,
                    tags: Array.isArray(icon.tags) ? icon.tags : []
                  });
                  results.iconsImported++;
                } catch (error) {
                  results.errors.push(`Failed to import icon "${icon.name}": ${error.message}`);
                }
              }
            } catch (error) {
              results.errors.push(`Icon import failed: ${error.message}`);
            }
          }
          
          // Import settings
          if (importSettings && backup.data.settings) {
            try {
              await settingsService.setBatch(backup.data.settings);
              results.settingsImported = Object.keys(backup.data.settings).length;
            } catch (error) {
              results.errors.push(`Settings import failed: ${error.message}`);
            }
          }
          
          resolve(results);
        } catch (error) {
          reject(new Error(`Failed to parse backup file: ${error.message}`));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read backup file'));
      };
      
      reader.readAsText(file);
    });
  },
  
  validateBackupFile(file) {
    if (!file) {
      return { isValid: false, error: 'No file provided' };
    }
    
    if (!file.name.endsWith('.json')) {
      return { isValid: false, error: 'File must be a JSON file' };
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      return { isValid: false, error: 'File size too large (max 10MB)' };
    }
    
    return { isValid: true };
  },
  
  async getBackupInfo() {
    try {
      const [icons, settings] = await Promise.all([
        iconService.getAll(),
        settingsService.getAll()
      ]);
      
      return {
        iconCount: icons.length,
        settingsCount: Object.keys(settings).length,
        totalSize: this.estimateBackupSize(icons, settings),
        lastModified: new Date().toISOString() // This would ideally come from actual data
      };
    } catch (error) {
      throw new Error(`Failed to get backup info: ${error.message}`);
    }
  },
  
  estimateBackupSize(icons, settings) {
    let size = 0;
    
    // Estimate icon data size (base64 images)
    icons.forEach(icon => {
      if (icon.data) {
        // Base64 is ~33% larger than original binary
        size += icon.data.length * 0.75;
      }
    });
    
    // Settings are typically small
    size += JSON.stringify(settings).length;
    
    // Add metadata overhead
    size += 1000;
    
    return Math.round(size);
  },
  
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
};

export default backupService;