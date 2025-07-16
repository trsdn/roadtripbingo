/**
 * @jest-environment jsdom
 */

// Simple test to check if the module loads
describe('IndexedDBMigrator - Basic Loading', () => {
  it('should be able to require the module', () => {
    expect(() => {
      require('../src/js/modules/indexedDBMigrator.js');
    }).not.toThrow();
  });
});
