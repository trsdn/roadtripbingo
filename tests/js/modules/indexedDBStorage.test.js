// Test file for IndexedDB Storage
import indexedDBStorage from '../../../src/js/modules/indexedDBStorage.js';

describe('IndexedDB Storage', () => {
  beforeEach(async () => {
    // Initialize IndexedDB storage before each test
    await indexedDBStorage.init();
    // Clear IndexedDB before each test
    await indexedDBStorage.clearIcons();
  });

  test('should store and retrieve icons', async () => {
    const testIcon = {
      id: 'test-1',
      name: 'Test Icon',
      data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
    };

    // Save icon
    await indexedDBStorage.saveIcons([testIcon]);

    // Load icons
    const loadedIcons = await indexedDBStorage.loadIcons();

    expect(loadedIcons).toHaveLength(1);
    expect(loadedIcons[0].name).toBe('Test Icon');
    expect(loadedIcons[0].data).toContain('data:image/png;base64');
  });

  test('should handle storage info', async () => {
    const info = await indexedDBStorage.getStorageInfo();
    
    expect(info).toHaveProperty('totalSizeMB');
    expect(info).toHaveProperty('quotaMB');
    expect(info).toHaveProperty('iconCount');
    expect(info.storageType).toBe('IndexedDB');
  });

  test('should delete icons', async () => {
    const testIcon = {
      id: 'test-delete',
      name: 'Delete Me',
      data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
    };

    // Save icon
    await indexedDBStorage.saveIcons([testIcon]);
    
    // Verify it exists
    let icons = await indexedDBStorage.loadIcons();
    expect(icons).toHaveLength(1);

    // Delete icon
    await indexedDBStorage.deleteIcon('test-delete');

    // Verify it's gone
    icons = await indexedDBStorage.loadIcons();
    expect(icons).toHaveLength(0);
  });
});
