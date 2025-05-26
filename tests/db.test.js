/**
 * @jest-environment jsdom
 */

import { Storage } from '@/js/modules/db.js';

describe('Storage', () => {
  let storage;

  beforeEach(async () => {
    // Clear mocked localStorage
    localStorage.clear();
    // Create a new storage instance
    storage = new Storage();
    // Initialize storage - called explicitly in relevant tests or describe blocks
    
    // Default mock for storage.save, can be overridden in specific describe blocks
    jest.spyOn(storage, 'save').mockResolvedValue(true); 
  });

  afterEach(() => {
    // Restore all mocks after each test to avoid interference
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    test('should initialize with default data structure', () => {
      // storage is created in global beforeEach
      expect(storage.data.icons).toEqual([]);
      expect(storage.data.settings).toEqual({
        language: 'en',
        theme: 'light',
        gridSize: 5,
        cardsPerSet: 1
      });
      expect(storage.data.gameStates).toEqual([]);
    });
  });

  describe('init', () => {
    // storage.save mock is not relevant here as init uses localStorage directly
    beforeEach(() => {
        // If storage.save was spied on in global beforeEach, restore it for init tests
        if (storage.save.mockRestore) storage.save.mockRestore();
    });

    test('should initialize with default data when localStorage is empty', async () => {
      await storage.init();
      expect(storage.data.icons).toEqual([]);
      expect(storage.data.settings.language).toBe('en');
      expect(storage.data.settings.theme).toBe('light');
      expect(storage.data.settings.gridSize).toBe(5);
      expect(storage.data.settings.cardsPerSet).toBe(1);
      expect(storage.data.gameStates).toEqual([]);
    });

    test('should load data from localStorage if present and valid', async () => {
      const testData = {
        icons: [{ id: 'test', name: 'Test Icon' }],
        settings: { language: 'fr', theme: 'dark', gridSize: 3, cardsPerSet: 2 },
        gameStates: [{ id: 'game1' }]
      };
      localStorage.setItem('roadtripbingo-data', JSON.stringify(testData));
      await storage.init();
      expect(storage.data.icons).toEqual(testData.icons);
      expect(storage.data.settings).toEqual(testData.settings);
      expect(storage.data.gameStates).toEqual(testData.gameStates);
    });

    test('should handle malformed JSON in localStorage and initialize with defaults', async () => {
      localStorage.setItem('roadtripbingo-data', 'this is not json');
      // Spy on console.error to check if the error is logged
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      await expect(storage.init()).rejects.toThrow(); // Current implementation rejects on parse error
      
      // Check that data remains constructor defaults after failed init
      expect(storage.data.icons).toEqual([]); 
      expect(storage.data.settings.language).toBe('en');

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error initializing storage:', expect.any(Error));
      // consoleErrorSpy.mockRestore(); // Restored in global afterEach
    });

    test('should resolve with default data if localStorage.getItem returns null', async () => {
      const originalGetItem = window.localStorage.getItem;
      window.localStorage.getItem = jest.fn().mockReturnValue(null);
      
      await expect(storage.init()).resolves.toEqual(storage.data); // storage.data is still constructor default
      expect(storage.data.settings.language).toBe('en'); // Confirm default data
      
      window.localStorage.getItem = originalGetItem;
    });
  });

  describe('save', () => {
    beforeEach(() => {
      if (storage.save.mockRestore) {
        storage.save.mockRestore();
      }
      // Access the mock functions directly from global.localStorage
      global.localStorage.setItem.mockClear();
      global.localStorage.getItem.mockClear();
      global.localStorage.clear.mockClear();
    });

    test('should reject with a custom QuotaExceededError when localStorage.setItem fails', async () => {
      global.localStorage.setItem.mockImplementationOnce(() => {
        const error = new Error('Mocked localStorage quota error');
        error.name = 'QuotaExceededError';
        throw error;
      });
      
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(storage.save()).rejects.toThrow('Storage quota exceeded');
      expect(global.localStorage.setItem).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error saving data:', expect.objectContaining({ name: 'QuotaExceededError' }));
      expect(consoleErrorSpy).toHaveBeenCalledWith('Storage quota exceeded. Data not saved.');
      
      // consoleErrorSpy is restored by global afterEach
      // global.localStorage.setItem mock behavior is reset by mockImplementationOnce or next mockClear
    });

    test('should resolve true when localStorage.setItem succeeds', async () => {
      // The default implementation of global.localStorage.setItem (from jest.setup.js) will be used.
      await expect(storage.save()).resolves.toBe(true);
      expect(global.localStorage.setItem).toHaveBeenCalledWith('roadtripbingo-data', JSON.stringify(storage.data));
      
      // Verify that the data was actually stored by the mock
      // Need to call the actual mock function's implementation, not another mock call.
      // The mock store is internal to jest.setup.js, but getItem should reflect the setItem call.
      expect(global.localStorage.getItem('roadtripbingo-data')).toBe(JSON.stringify(storage.data));
    });
  });

  // For Icon, Settings, GameState operations, we spy on `storage.save` from the global beforeEach
  // to ensure it's called, without actually hitting localStorage.

  describe('Icon operations', () => {
    beforeEach(async () => {
      await storage.init(); // Ensure this.data is initialized
      // storage.save is already mocked by global beforeEach
    });

    test('saveIcons should update icons and call save', async () => {
      const icons = [{ id: '1', name: 'icon1', data: 'data1' }];
      await storage.saveIcons(icons);
      expect(storage.data.icons).toEqual(icons);
      expect(storage.save).toHaveBeenCalled();
    });
    
    test('deleteIcon should remove an existing icon and call save', async () => {
      storage.data.icons = [{ id: '1', name: 'icon1' }, { id: '2', name: 'icon2' }];
      await storage.deleteIcon('1');
      expect(storage.data.icons).toEqual([{ id: '2', name: 'icon2' }]);
      expect(storage.save).toHaveBeenCalled();
    });

    test('deleteIcon should call save even if icon does not exist', async () => {
      storage.data.icons = [{ id: '1', name: 'icon1' }];
      await storage.deleteIcon('nonexistent');
      expect(storage.data.icons).toEqual([{ id: '1', name: 'icon1' }]); // Data remains unchanged
      expect(storage.save).toHaveBeenCalled();
    });

    test('clearIcons should set icons to an empty array and call save', async () => {
      storage.data.icons = [{ id: '1', name: 'icon1' }];
      await storage.clearIcons();
      expect(storage.data.icons).toEqual([]);
      expect(storage.save).toHaveBeenCalled();
    });
  });
  
  describe('Settings operations', () => {
    beforeEach(async () => {
      await storage.init();
    });

    test('saveSettings should merge with existing settings and call save', async () => {
      const initialSettings = { language: 'en', theme: 'light', gridSize: 5, cardsPerSet: 1 };
      storage.data.settings = { ...initialSettings }; // Start with known state
      
      const newSettings = { theme: 'dark', gridSize: 3 };
      const expectedSettings = { language: 'en', theme: 'dark', gridSize: 3, cardsPerSet: 1 };
      
      await storage.saveSettings(newSettings);
      expect(storage.data.settings).toEqual(expectedSettings);
      expect(storage.save).toHaveBeenCalled();
    });

    test('loadSettings should return current settings after init', async () => {
      // init ensures settings are defaults or loaded from localStorage
      const currentSettings = storage.data.settings;
      const loadedSettings = await storage.loadSettings();
      expect(loadedSettings).toEqual(currentSettings);
    });

    test('loadSettings should return default settings if init makes no changes from constructor', async () => {
        // Assuming localStorage is empty, init() will resolve with constructor defaults
        await storage.init(); 
        const loadedSettings = await storage.loadSettings();
        expect(loadedSettings).toEqual({
            language: 'en',
            theme: 'light',
            gridSize: 5,
            cardsPerSet: 1
        });
    });
  });

  describe('Game state operations', () => {
    beforeEach(async () => {
      await storage.init();
    });

    test('saveGameState should add a game state and call save', async () => {
      const gameState = { id: 'gameA', score: 10 };
      await storage.saveGameState(gameState);
      expect(storage.data.gameStates).toContainEqual(gameState);
      expect(storage.data.gameStates.length).toBe(1);
      expect(storage.save).toHaveBeenCalled();
    });

    test('saveGameState should accumulate multiple game states correctly', async () => {
      const gameState1 = { id: 'game1', score: 100 };
      const gameState2 = { id: 'game2', score: 200 };
      
      await storage.saveGameState(gameState1); // Calls save once
      await storage.saveGameState(gameState2); // Calls save again
      
      expect(storage.data.gameStates).toEqual([gameState1, gameState2]);
      expect(storage.save).toHaveBeenCalledTimes(2);
    });

    test('loadGameStates should return an empty array if no game states are saved', async () => {
      storage.data.gameStates = []; // Ensure it's empty
      const loadedStates = await storage.loadGameStates();
      expect(loadedStates).toEqual([]);
    });
  });

  describe('exportData', () => {
    // This test suite was well-defined previously, keeping its structure.
    // storage.save mock is not directly relevant to exportData's primary logic.
    let createElementSpy, appendChildSpy, removeChildSpy, clickSpy, createObjectURLSpy, revokeObjectURLSpy;
    let mockAnchor;

    beforeEach(async () => {
      await storage.init(); // Ensure data is initialized
      // Mocks specific to exportData
      createObjectURLSpy = jest.spyOn(URL, 'createObjectURL').mockReturnValue('mock-url');
      revokeObjectURLSpy = jest.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
      clickSpy = jest.fn();
      mockAnchor = { href: '', download: '', click: clickSpy };
      createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue(mockAnchor);
      appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation(() => {});
      removeChildSpy = jest.spyOn(document.body, 'removeChild').mockImplementation(() => {});
    });

    // afterEach is handled by global afterEach

    test('should create and trigger a download link, then clean up for current data', () => {
      storage.data.icons = [{id: 'testIcon'}]; // Add some data
      storage.exportData();

      expect(createElementSpy).toHaveBeenCalledWith('a');
      // Use expect.anything() as JSDOM's Blob representation is problematic for stricter checks here.
      // The other exportData test verifies the content stringified for the Blob.
      expect(createObjectURLSpy).toHaveBeenCalledWith(expect.anything()); 
      expect(mockAnchor.download).toBe('roadtripbingo-backup.json');
      expect(mockAnchor.href).toBe('mock-url'); //createObjectURL returns 'mock-url'
      expect(appendChildSpy).toHaveBeenCalledWith(mockAnchor);
      expect(clickSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalledWith(mockAnchor);
      expect(revokeObjectURLSpy).toHaveBeenCalledWith('mock-url');
    });

    test('should correctly export default/empty data state', () => {
      // Ensure storage.data is in its default state (constructor + empty init)
      const defaultData = { icons: [], settings: { language: 'en', theme: 'light', gridSize: 5, cardsPerSet: 1 }, gameStates: [] };
      storage.data = { ...defaultData }; 
      
      const jsonStringifySpy = jest.spyOn(JSON, 'stringify');
      storage.exportData();

      // Check that JSON.stringify was called with the correct data
      expect(jsonStringifySpy).toHaveBeenCalledWith(defaultData, null, 2);
      
      // Check other DOM interactions to ensure function completes
      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(mockAnchor.download).toBe('roadtripbingo-backup.json');
      expect(clickSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalledWith(mockAnchor); // From original test
      expect(revokeObjectURLSpy).toHaveBeenCalledWith('mock-url'); // From original test
      
      jsonStringifySpy.mockRestore();
    });
  });

  describe('importData', () => {
    // storage.save is mocked by global beforeEach
    let mockFile;
    let mockReaderInstance;

    beforeEach(async () => {
      await storage.init(); // Ensure this.data is initialized
      
      // Setup FileReader mock for each test in this suite
      mockReaderInstance = {
        readAsText: jest.fn(),
        // onload and onerror will be assigned by SUT
      };
      jest.spyOn(global, 'FileReader').mockImplementation(() => mockReaderInstance);
    });

    // afterEach is handled by global afterEach

    test('should import valid data successfully, call save, and update data', (done) => {
      // storage.save is already mocked (globally) to resolve true
      const dataToImport = {
        icons: [{ id: 'imported', name: 'Imported Icon' }],
        settings: { language: 'es', theme: 'sepia', gridSize: 6, cardsPerSet: 3 },
        gameStates: [{ id: 'importedGame' }]
      };
      const jsonData = JSON.stringify(dataToImport);
      mockFile = new Blob([jsonData], { type: 'application/json' }); // JSDOM Blob

      // Setup how readAsText and onload interact for this test
      mockReaderInstance.readAsText = jest.fn((file) => {
        // Simulate async read and then call onload
        process.nextTick(() => {
          if (mockReaderInstance.onload) {
            mockReaderInstance.onload({ target: { result: jsonData } });
          }
        });
      });
      
      storage.importData(mockFile).then(result => {
        expect(result).toBe(true);
        expect(storage.data).toEqual(dataToImport);
        expect(storage.save).toHaveBeenCalled();
        done();
      }).catch(error => {
        done(error); // Fail test if promise rejects unexpectedly
      });
    });

    test('should reject if JSON.parse throws an error', (done) => {
      const invalidJsonData = 'this is not json';
      mockFile = new Blob([invalidJsonData], { type: 'application/json' });

      mockReaderInstance.readAsText = jest.fn((file) => {
        process.nextTick(() => {
          if (mockReaderInstance.onload) {
            mockReaderInstance.onload({ target: { result: invalidJsonData } });
          }
        });
      });

      storage.importData(mockFile).then(() => {
        done(new Error('Promise should have rejected for invalid JSON'));
      }).catch(error => {
        // Expect a SyntaxError from JSON.parse or specific error from db.js
        expect(error).toBeInstanceOf(Error); 
        expect(storage.save).not.toHaveBeenCalled();
        done();
      });
    });

    test('should reject if this.save() fails after successful parse', (done) => {
      storage.save.mockRejectedValue(new Error('Simulated save failure'));

      const dataToImport = { icons: [], settings: { language: 'en', theme: 'light', gridSize: 5, cardsPerSet: 1 }, gameStates: [] };
      const jsonData = JSON.stringify(dataToImport);
      mockFile = new Blob([jsonData], { type: 'application/json' });

      mockReaderInstance.readAsText = jest.fn((file) => {
        process.nextTick(() => {
          if (mockReaderInstance.onload) {
            mockReaderInstance.onload({ target: { result: jsonData } });
          }
        });
      });
      
      storage.importData(mockFile).then(() => {
        done(new Error('Promise should have rejected due to save failure'));
      }).catch(error => {
        expect(error.message).toBe('Simulated save failure');
        expect(storage.data).toEqual(dataToImport); // Data is assigned
        expect(storage.save).toHaveBeenCalled();
        done();
      });
    });

    test('should reject if FileReader.onerror is triggered', (done) => {
      mockFile = new Blob(['test content'], { type: 'application/json' });
      const expectedError = new Error('Fake FileReader.onerror');

      mockReaderInstance.readAsText = jest.fn((file) => {
        process.nextTick(() => { // Simulate async error
            if (mockReaderInstance.onerror) {
                mockReaderInstance.onerror(expectedError);
            }
        });
      });
      
      storage.importData(mockFile).then(() => {
        done(new Error('Promise should have rejected due to FileReader error'));
      }).catch(error => {
        expect(error.message).toBe(expectedError.message);
        expect(storage.save).not.toHaveBeenCalled();
        done();
      });
    });

    // The current db.js version (from prompt) does not have the detailed structural validation
    // that was causing JSDOM Array.isArray issues. If that validation were present,
    // specific tests for it would be needed, along with notes on JSDOM limitations.
    // The current version's importData is simpler: it parses, assigns to this.data, then saves.
  });
});
// Adding a helper to mock Blob.text() if needed for exportData content check, though not used in current tests.
// global.Blob = class extends global.Blob {
//   constructor(blobParts, options) {
//     super(blobParts, options);
//     this.text = () => Promise.resolve(blobParts.join(''));
//   }
// };