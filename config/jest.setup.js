// Mock localStorage
class LocalStorageMock {
  constructor() {
    this.store = {};
  }

  clear() {
    this.store = {};
  }

  getItem(key) {
    return this.store[key] || null;
  }

  setItem(key, value) {
    this.store[key] = String(value);
  }

  removeItem(key) {
    delete this.store[key];
  }
}

// Set up local storage mock
global.localStorage = new LocalStorageMock();

// Mock document methods for minimal support
global.document = {
  createElement: () => ({
    click: jest.fn(),
    appendChild: jest.fn(),
    removeChild: jest.fn()
  }),
  body: {
    appendChild: jest.fn(),
    removeChild: jest.fn()
  }
};

// Mock URL for minimal support
global.URL = {
  createObjectURL: jest.fn(() => 'blob:mock-url'),
  revokeObjectURL: jest.fn()
};

// Mock FileReader for importData test
global.FileReader = class FileReader {
  constructor() {
    this.onload = null;
    this.onerror = null;
  }

  readAsText() {
    setTimeout(() => {
      if (this.onload) {
        this.onload({ 
          target: { 
            result: JSON.stringify({ 
              icons: [], 
              settings: { language: 'en' } 
            }) 
          } 
        });
      }
    }, 0);
  }
};

// Mock Blob for exportData test
global.Blob = class Blob {
  constructor() {
    return {};
  }
};

// Silence console during tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
}; 