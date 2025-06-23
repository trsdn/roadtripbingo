// Store for localStorage mock, scoped to this module
let mockStore = {};

const localStorageMock = {
  setItem: jest.fn((key, value) => {
    mockStore[key] = String(value);
  }),
  getItem: jest.fn(key => mockStore[key] || null),
  removeItem: jest.fn(key => {
    delete mockStore[key];
  }),
  clear: jest.fn(() => {
    mockStore = {}; // Reset the store
  }),
  // Helper to inspect store during tests, if needed
  __getStore: () => mockStore
};

// Forcefully define localStorage on the window object (JSDOM environment)
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,    // Allows tests or other code to modify/re-spy if necessary
  configurable: true // Allows it to be deleted or reconfigured
});

// Mock IndexedDB with fake-indexeddb
require('fake-indexeddb/auto');

// Add structuredClone polyfill for Node.js
if (!global.structuredClone) {
  global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}

// Mock Blob constructor for JSDOM
if (!global.Blob) {
  // Use Node.js buffer-based Blob if available, otherwise create a simple mock
  try {
    const { Blob } = require('buffer');
    global.Blob = Blob;
  } catch {
    global.Blob = class MockBlob {
      constructor(parts, options = {}) {
        this.parts = parts || [];
        this.type = options.type || '';
        this.size = this.parts.reduce((total, part) => total + (part.length || 0), 0);
      }
    };
  }
}

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
    this.result = null;
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

  readAsDataURL(blob) {
    setTimeout(() => {
      this.result = 'data:image/png;base64,mock-base64-data';
      if (this.onload) {
        this.onload();
      }
    }, 0);
  }
};

// Note: Blob is already mocked above, no need to override it again

// Silence console during tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
};