const { Storage } = require('./db');

describe('Storage', () => {
  let storage;

  beforeEach(async () => {
    // Clear mocked localStorage
    localStorage.clear();
    
    // Create a new storage instance
    storage = new Storage();
    
    // Initialize storage
    await storage.init();
  });

  test('should initialize with default data', () => {
    expect(storage.data.icons).toEqual([]);
    expect(storage.data.settings.language).toBe('en');
  });

  test('should save and load icons', async () => {
    const icons = [{ id: '1', name: 'icon1', data: 'data1' }];
    await storage.saveIcons(icons);
    const loaded = await storage.loadIcons();
    expect(loaded).toEqual(icons);
  });

  test('should delete an icon', async () => {
    const icons = [{ id: '1', name: 'icon1', data: 'data1' }];
    await storage.saveIcons(icons);
    await storage.deleteIcon('1');
    const loaded = await storage.loadIcons();
    expect(loaded).toEqual([]);
  });

  test('should clear all icons', async () => {
    const icons = [{ id: '1', name: 'icon1', data: 'data1' }];
    await storage.saveIcons(icons);
    await storage.clearIcons();
    const loaded = await storage.loadIcons();
    expect(loaded).toEqual([]);
  });

  test('should save and load settings', async () => {
    const settings = { language: 'de', theme: 'dark', gridSize: 4, cardsPerSet: 2 };
    await storage.saveSettings(settings);
    const loaded = await storage.loadSettings();
    expect(loaded.language).toBe('de');
    expect(loaded.theme).toBe('dark');
    expect(loaded.gridSize).toBe(4);
    expect(loaded.cardsPerSet).toBe(2);
  });

  test('should handle exportData function', () => {
    // Just make sure it doesn't throw an error
    expect(() => {
      storage.exportData();
    }).not.toThrow();
  });

  test('should handle importData function', async () => {
    // Create a mock file
    const mockFile = {};
    
    // We're not actually testing the result, just making sure it doesn't throw
    await expect(storage.importData(mockFile)).resolves.toBeDefined();
  });
}); 