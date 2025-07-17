// Road Trip Bingo - API Storage System
// Frontend storage module that communicates with SQLite backend via HTTP API

class APIStorage {
  constructor() {
    this.baseURL = this.detectBaseURL();
    this.isInitialized = false;
  }

  // Detect the base URL for API calls
  detectBaseURL() {
    // Always use the current origin (server serves both static files and API)
    return window.location.origin;
  }

  // Initialize storage - check if backend is available
  async init() {
    try {
      console.log('API Storage: Attempting to connect to backend at:', this.baseURL);
      const response = await fetch(`${this.baseURL}/api/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        this.isInitialized = true;
        console.log('API storage initialized successfully - backend available');
        return true;
      } else {
        throw new Error(`Backend not available: ${response.status}`);
      }
    } catch (error) {
      console.error('Error initializing API storage:', error);
      // Fallback to localStorage if backend is not available
      console.warn('Falling back to localStorage');
      this.fallbackToLocalStorage();
      return false;
    }
  }

  // Fallback to localStorage when backend is not available
  fallbackToLocalStorage() {
    console.warn('Using localStorage fallback - data will not persist on server');
    this.isInitialized = true;
    this.useFallback = true;
  }

  // Make API request with error handling
  async apiRequest(endpoint, options = {}) {
    if (this.useFallback) {
      console.log('📱 Using localStorage fallback for:', endpoint);
      return this.handleLocalStorageFallback(endpoint, options);
    }

    try {
      const url = `${this.baseURL}${endpoint}`;
      console.log('🌐 Making API request to:', url);
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      console.log('📡 API response status:', response.status);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('📦 API response data:', result.success ? 'Success' : 'Failed', result.data ? `(${Array.isArray(result.data) ? result.data.length : typeof result.data} items)` : '');
      return result;
    } catch (error) {
      console.error('❌ API request error:', error);
      throw error;
    }
  }

  // Handle localStorage fallback operations
  handleLocalStorageFallback(endpoint, options) {
    const data = JSON.parse(localStorage.getItem('roadtripbingo-fallback') || '{"icons": [], "settings": {}}');
    
    if (endpoint === '/api/icons') {
      if (options.method === 'GET' || !options.method) {
        return { success: true, data: data.icons };
      } else if (options.method === 'POST') {
        const newIcon = JSON.parse(options.body);
        newIcon.id = Date.now().toString();
        data.icons.push(newIcon);
        localStorage.setItem('roadtripbingo-fallback', JSON.stringify(data));
        return { success: true, data: newIcon };
      }
    }

    if (endpoint.startsWith('/api/icons/') && options.method === 'DELETE') {
      const iconId = endpoint.split('/')[3];
      data.icons = data.icons.filter(icon => icon.id !== iconId);
      localStorage.setItem('roadtripbingo-fallback', JSON.stringify(data));
      return { success: true };
    }

    if (endpoint === '/api/settings') {
      if (options.method === 'GET' || !options.method) {
        return { success: true, data: data.settings };
      } else if (options.method === 'PUT') {
        data.settings = { ...data.settings, ...JSON.parse(options.body) };
        localStorage.setItem('roadtripbingo-fallback', JSON.stringify(data));
        return { success: true, data: data.settings };
      }
    }

    return { success: false, error: 'Fallback operation not implemented' };
  }

  // Load all icons with optional search and category filter
  async loadIcons(searchTerm = '', category = '') {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (category) params.append('category', category);
      // Add cache-busting parameter to ensure fresh data
      params.append('_t', Date.now().toString());
      
      const endpoint = `/api/icons${params.toString() ? '?' + params.toString() : ''}`;
      console.log('API Storage: Loading icons from:', `${this.baseURL}${endpoint}`);
      const result = await this.apiRequest(endpoint);
      console.log('API Storage: Received icons:', result.data ? result.data.length : 0);
      return result.data || [];
    } catch (error) {
      console.error('Error loading icons:', error);
      return [];
    }
  }

  // Get all categories
  async getCategories() {
    try {
      const result = await this.apiRequest('/api/categories');
      return result.data || [];
    } catch (error) {
      console.error('Error loading categories:', error);
      return [];
    }
  }

  // Save a new icon
  async saveIcon(iconData) {
    try {
      const result = await this.apiRequest('/api/icons', {
        method: 'POST',
        body: JSON.stringify(iconData)
      });
      
      if (result.success) {
        console.log('Icon saved successfully:', result.data?.id || 'unknown id');
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to save icon');
      }
    } catch (error) {
      console.error('Error saving icon:', error);
      throw error;
    }
  }

  // Save multiple icons (bulk operation for compatibility)
  async saveIcons(iconsArray) {
    if (this.useFallback) {
      localStorage.setItem('roadTripBingoIcons', JSON.stringify(iconsArray));
      return iconsArray;
    }

    try {
      // For API storage, we need to save each icon individually
      const results = [];
      for (const icon of iconsArray) {
        const result = await this.saveIcon(icon);
        if (result.success) {
          results.push(result.data);
        }
      }
      
      console.log(`Saved ${results.length} icons via API`);
      return results;
    } catch (error) {
      console.error('Error saving icons:', error);
      throw error;
    }
  }

  // Delete an icon
  async deleteIcon(iconId) {
    try {
      const result = await this.apiRequest(`/api/icons/${iconId}`, {
        method: 'DELETE'
      });
      
      if (result.success) {
        console.log('Icon deleted successfully:', iconId);
        return true;
      } else {
        throw new Error(result.error || 'Failed to delete icon');
      }
    } catch (error) {
      console.error('Error deleting icon:', error);
      throw error;
    }
  }

  // Update an icon
  async updateIcon(iconId, iconData) {
    try {
      const result = await this.apiRequest(`/api/icons/${iconId}`, {
        method: 'PUT',
        body: JSON.stringify(iconData)
      });
      
      if (result.success) {
        console.log('Icon updated successfully:', iconId);
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to update icon');
      }
    } catch (error) {
      console.error('Error updating icon:', error);
      throw error;
    }
  }

  // Load settings
  async loadSettings() {
    try {
      const result = await this.apiRequest('/api/settings');
      return result.data || {};
    } catch (error) {
      console.error('Error loading settings:', error);
      return {};
    }
  }

  // Save settings
  async saveSettings(settings) {
    try {
      const result = await this.apiRequest('/api/settings', {
        method: 'PUT',
        body: JSON.stringify(settings)
      });
      
      if (result.success) {
        console.log('Settings saved successfully');
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  }

  // Clear all icons
  async clearIcons() {
    try {
      const result = await this.apiRequest('/api/icons/clear', {
        method: 'DELETE'
      });
      
      if (result.success) {
        console.log('All icons cleared successfully');
        return true;
      } else {
        throw new Error(result.error || 'Failed to clear icons');
      }
    } catch (error) {
      console.error('Error clearing icons:', error);
      throw error;
    }
  }

  // Get storage statistics
  async getStorageStats() {
    try {
      const result = await this.apiRequest('/api/stats');
      return result.data || { iconCount: 0, totalSize: 0 };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return { iconCount: 0, totalSize: 0 };
    }
  }

  // Export data for backup
  async exportData() {
    try {
      const result = await this.apiRequest('/api/export');
      return result.data || { icons: [], settings: {} };
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }

  // Import data from backup
  async importData(data) {
    try {
      const result = await this.apiRequest('/api/import', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      
      if (result.success) {
        console.log('Data imported successfully');
        return true;
      } else {
        throw new Error(result.error || 'Failed to import data');
      }
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  }

  // Optimize storage (SQLite vacuum, cleanup)
  async optimizeStorage() {
    try {
      const result = await this.apiRequest('/api/optimize', {
        method: 'POST'
      });
      
      if (result.success) {
        console.log('Storage optimized successfully');
        return result.data || {};
      } else {
        throw new Error(result.error || 'Failed to optimize storage');
      }
    } catch (error) {
      console.error('Error optimizing storage:', error);
      throw error;
    }
  }

  // Get storage information (database stats, icon count, etc.)
  async getStorageInfo() {
    if (this.useFallback) {
      // Fallback: calculate localStorage usage
      const icons = JSON.parse(localStorage.getItem('roadTripBingoIcons') || '[]');
      const settings = JSON.parse(localStorage.getItem('roadTripBingoSettings') || '{}');
      
      return {
        iconCount: icons.length,
        iconSizeMB: (JSON.stringify(icons).length / (1024 * 1024)).toFixed(2),
        settingsCount: Object.keys(settings).length,
        totalSizeMB: ((JSON.stringify(icons).length + JSON.stringify(settings).length) / (1024 * 1024)).toFixed(2),
        storageType: 'localStorage'
      };
    }

    try {
      const result = await this.apiRequest('/api/storage/info', {
        method: 'GET'
      });
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to get storage info');
      }
    } catch (error) {
      console.error('Error getting storage info:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const apiStorage = new APIStorage();
export default apiStorage;
