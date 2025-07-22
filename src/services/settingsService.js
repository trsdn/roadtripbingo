import axios from 'axios';

const API_BASE_URL = '/api';

const settingsService = {
  async getAll() {
    const response = await axios.get(`${API_BASE_URL}/settings`);
    return response.data;
  },
  
  async get(key) {
    const response = await axios.get(`${API_BASE_URL}/settings/${key}`);
    return response.data[key];
  },
  
  async set(key, value) {
    const response = await axios.post(`${API_BASE_URL}/settings/${key}`, { value });
    return response.data[key];
  },
  
  async setBatch(settings) {
    const promises = Object.entries(settings).map(([key, value]) =>
      this.set(key, typeof value === 'object' ? JSON.stringify(value) : String(value))
    );
    
    const results = await Promise.all(promises);
    const settingsObj = {};
    Object.keys(settings).forEach((key, index) => {
      settingsObj[key] = results[index];
    });
    
    return settingsObj;
  },
  
  async delete(key) {
    await axios.delete(`${API_BASE_URL}/settings/${key}`);
  },
  
  // Helper methods for common settings
  async getGeneratorDefaults() {
    const settings = await this.getAll();
    return {
      gridSize: parseInt(settings.gridSize) || 5,
      centerBlank: settings.centerBlank === 'true',
      showLabels: settings.showLabels !== 'false', // Default true
      multiHitMode: settings.multiHitMode === 'true',
      multiHitDifficulty: parseInt(settings.multiHitDifficulty) || 2,
      sameCard: settings.sameCard === 'true',
    };
  },
  
  async saveGeneratorDefaults(settings) {
    return await this.setBatch({
      gridSize: settings.gridSize,
      centerBlank: settings.centerBlank,
      showLabels: settings.showLabels,
      multiHitMode: settings.multiHitMode,
      multiHitDifficulty: settings.multiHitDifficulty,
      sameCard: settings.sameCard,
    });
  }
};

export default settingsService;