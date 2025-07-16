// Jest setup for Node.js environment tests
// This setup file is used for backend/SQLite tests that don't need jsdom

// No browser globals needed for Node.js tests
// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Suppress console.log, console.warn, console.info during tests unless explicitly needed
  log: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  // Keep error and debug for important information
  error: console.error,
  debug: console.debug,
};

// Mock setTimeout and setInterval for consistent test timing
global.setTimeout = jest.fn((fn, delay) => {
  if (typeof fn === 'function') {
    return setImmediate(fn);
  }
  return null;
});

global.setInterval = jest.fn((fn, interval) => {
  if (typeof fn === 'function') {
    return setImmediate(fn);
  }
  return null;
});

global.clearTimeout = jest.fn();
global.clearInterval = jest.fn();
