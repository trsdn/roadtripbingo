/**
 * @jest-environment jsdom
 */

require('fake-indexeddb/auto');

describe('IndexedDB Setup Test', () => {
  it('should open IndexedDB without hanging', async () => {
    const dbName = 'testDB';
    
    const result = await new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('testStore')) {
          db.createObjectStore('testStore', { keyPath: 'id' });
        }
      };
    });
    
    expect(result).toBeDefined();
    result.close();
    
    // Clean up
    await new Promise((resolve) => {
      const deleteReq = indexedDB.deleteDatabase(dbName);
      deleteReq.onsuccess = () => resolve();
      deleteReq.onerror = () => resolve();
    });
  });
});
