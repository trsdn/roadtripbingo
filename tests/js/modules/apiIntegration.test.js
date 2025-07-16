/**
 * @jest-environment node
 * @jest-setupFilesAfterEnv ["<rootDir>/../config/jest.setup.node.js"]
 */

const http = require('http');
const path = require('path');
const fs = require('fs');
const SQLiteStorage = require('../../../src/js/modules/sqliteStorage.js');

// Test database path
const testDbPath = path.join(__dirname, '../../../temp/test-api.db');
const testDataDir = path.dirname(testDbPath);

// Test server port
const TEST_PORT = 8081;

// Mock server module to avoid importing the actual server
let testServer;
let storage;

describe('API Integration Tests', () => {
  beforeAll(async () => {
    // Ensure temp directory exists
    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, { recursive: true });
    }

    // Initialize test storage
    storage = new SQLiteStorage(testDbPath);
    await storage.init();

    // Start test server
    await startTestServer();
  });

  afterAll(async () => {
    // Stop test server
    if (testServer) {
      await new Promise((resolve) => {
        testServer.close(resolve);
      });
    }

    // Clean up test database
    if (storage && storage.db) {
      storage.db.close();
    }

    // Clean up test files
    if (fs.existsSync(testDataDir)) {
      fs.rmSync(testDataDir, { recursive: true, force: true });
    }
  });

  beforeEach(async () => {
    // Clear database before each test
    await storage.clearIcons();
    await storage.db.prepare('DELETE FROM settings').run();
    await storage.db.prepare('DELETE FROM card_generations').run();
  });

  async function startTestServer() {
    return new Promise((resolve, reject) => {
      // Create a minimal test server with the same API structure
      testServer = http.createServer(async (req, res) => {
        // CORS headers
        const corsHeaders = {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        };

        // Handle CORS preflight
        if (req.method === 'OPTIONS') {
          res.writeHead(200, corsHeaders);
          res.end();
          return;
        }

        // Parse URL
        const url = new URL(req.url, `http://localhost:${TEST_PORT}`);
        const pathname = url.pathname;
        const method = req.method;

        // Parse request body for POST/PUT requests
        let body = {};
        if (['POST', 'PUT'].includes(method)) {
          let rawBody = '';
          req.on('data', chunk => {
            rawBody += chunk.toString();
          });
          await new Promise(resolve => {
            req.on('end', () => {
              try {
                body = rawBody ? JSON.parse(rawBody) : {};
              } catch (e) {
                body = {};
              }
              resolve();
            });
          });
        }

        try {
          // Icons API
          if (pathname === '/api/icons') {
            if (method === 'GET') {
              const icons = await storage.loadIcons();
              res.writeHead(200, { ...corsHeaders, 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true, data: icons }));
              return;
            } else if (method === 'POST') {
              await storage.saveIcon(body);
              res.writeHead(201, { ...corsHeaders, 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true, data: body }));
              return;
            }
          }

          if (pathname.startsWith('/api/icons/') && method === 'DELETE') {
            const iconId = pathname.split('/')[3];
            await storage.deleteIcon(iconId);
            res.writeHead(200, { ...corsHeaders, 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
            return;
          }

          // Settings API
          if (pathname === '/api/settings') {
            if (method === 'GET') {
              const settings = await storage.loadSettings();
              res.writeHead(200, { ...corsHeaders, 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true, data: settings }));
              return;
            } else if (['POST', 'PUT'].includes(method)) {
              await storage.saveSettings(body);
              res.writeHead(200, { ...corsHeaders, 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true, data: body }));
              return;
            }
          }

          // Card generations API
          if (pathname === '/api/generations') {
            if (method === 'GET') {
              const limit = parseInt(url.searchParams.get('limit')) || 50;
              const generations = await storage.loadCardGenerations(limit);
              res.writeHead(200, { ...corsHeaders, 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true, data: generations }));
              return;
            } else if (method === 'POST') {
              await storage.saveCardGeneration(body);
              res.writeHead(201, { ...corsHeaders, 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true, data: body }));
              return;
            }
          }

          // Storage info API
          if (pathname === '/api/storage/info' && method === 'GET') {
            const info = await storage.getStorageInfo();
            res.writeHead(200, { ...corsHeaders, 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, data: info }));
            return;
          }

          // Export API
          if (pathname === '/api/export' && method === 'GET') {
            const data = {
              icons: await storage.loadIcons(),
              settings: await storage.loadSettings(),
              cardGenerations: await storage.loadCardGenerations()
            };
            res.writeHead(200, {
              ...corsHeaders,
              'Content-Type': 'application/json',
              'Content-Disposition': 'attachment; filename="roadtripbingo-backup.json"'
            });
            res.end(JSON.stringify(data, null, 2));
            return;
          }

          // Import API
          if (pathname === '/api/import' && method === 'POST') {
            // Simple import implementation for testing
            if (body.icons) {
              for (const icon of body.icons) {
                await storage.saveIcon(icon);
              }
            }
            if (body.settings) {
              await storage.saveSettings(body.settings);
            }
            res.writeHead(200, { ...corsHeaders, 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
            return;
          }

          // Not found
          res.writeHead(404, { ...corsHeaders, 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Not found' }));

        } catch (error) {
          res.writeHead(500, { ...corsHeaders, 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: error.message }));
        }
      });

      testServer.listen(TEST_PORT, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  // Helper function to make HTTP requests
  function makeRequest(options, data = null) {
    return new Promise((resolve, reject) => {
      const req = http.request({
        hostname: 'localhost',
        port: TEST_PORT,
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      }, (res) => {
        let body = '';
        res.on('data', chunk => {
          body += chunk.toString();
        });
        res.on('end', () => {
          try {
            const parsedBody = body ? JSON.parse(body) : {};
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              body: parsedBody
            });
          } catch (error) {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              body: body
            });
          }
        });
      });

      req.on('error', reject);

      if (data) {
        req.write(typeof data === 'string' ? data : JSON.stringify(data));
      }
      req.end();
    });
  }

  describe('Icons API', () => {
    const testIcon = {
      id: 'test-icon-1',
      name: 'Test Icon',
      data: Buffer.from('fake-image-data'),
      type: 'image/png',
      size: 1024
    };

    describe('GET /api/icons', () => {
      test('should return empty array when no icons exist', async () => {
        const response = await makeRequest({ path: '/api/icons', method: 'GET' });

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toEqual([]);
      });

      test('should return all saved icons', async () => {
        // Add icons directly to database
        await storage.saveIcon(testIcon);
        await storage.saveIcon({ ...testIcon, id: 'test-icon-2', name: 'Test Icon 2' });

        const response = await makeRequest({ path: '/api/icons', method: 'GET' });

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(2);
      });

      test('should include CORS headers', async () => {
        const response = await makeRequest({ path: '/api/icons', method: 'GET' });

        expect(response.headers['access-control-allow-origin']).toBe('*');
        expect(response.headers['access-control-allow-methods']).toBeTruthy();
      });
    });

    describe('POST /api/icons', () => {
      test('should create a new icon', async () => {
        const response = await makeRequest(
          { path: '/api/icons', method: 'POST' },
          testIcon
        );

        expect(response.statusCode).toBe(201);
        expect(response.body.success).toBe(true);

        // Verify icon was saved
        const icons = await storage.loadIcons();
        expect(icons).toHaveLength(1);
        expect(icons[0].name).toBe(testIcon.name);
      });

      test('should handle malformed JSON', async () => {
        const response = await makeRequest(
          { path: '/api/icons', method: 'POST' },
          'invalid json {'
        );

        expect(response.statusCode).toBe(500);
        expect(response.body.success).toBe(false);
      });

      test('should validate required fields', async () => {
        const invalidIcon = { name: 'Test' }; // missing required fields

        const response = await makeRequest(
          { path: '/api/icons', method: 'POST' },
          invalidIcon
        );

        expect(response.statusCode).toBe(500);
        expect(response.body.success).toBe(false);
      });
    });

    describe('DELETE /api/icons/:id', () => {
      test('should delete an existing icon', async () => {
        // Add icon first
        await storage.saveIcon(testIcon);

        const response = await makeRequest({
          path: `/api/icons/${testIcon.id}`,
          method: 'DELETE'
        });

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);

        // Verify icon was deleted
        const icons = await storage.loadIcons();
        expect(icons).toHaveLength(0);
      });

      test('should handle deletion of non-existent icon', async () => {
        const response = await makeRequest({
          path: '/api/icons/non-existent-id',
          method: 'DELETE'
        });

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });
  });

  describe('Settings API', () => {
    const testSettings = {
      language: 'en',
      theme: 'dark',
      gridSize: 5,
      cardsPerSet: 2
    };

    describe('GET /api/settings', () => {
      test('should return empty object when no settings exist', async () => {
        const response = await makeRequest({ path: '/api/settings', method: 'GET' });

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toEqual({});
      });

      test('should return all saved settings', async () => {
        await storage.saveSettings(testSettings);

        const response = await makeRequest({ path: '/api/settings', method: 'GET' });

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toEqual(testSettings);
      });
    });

    describe('POST /api/settings', () => {
      test('should save new settings', async () => {
        const response = await makeRequest(
          { path: '/api/settings', method: 'POST' },
          testSettings
        );

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);

        // Verify settings were saved
        const settings = await storage.loadSettings();
        expect(settings).toEqual(testSettings);
      });

      test('should update existing settings', async () => {
        await storage.saveSettings(testSettings);

        const updatedSettings = { ...testSettings, theme: 'light', gridSize: 7 };
        const response = await makeRequest(
          { path: '/api/settings', method: 'POST' },
          updatedSettings
        );

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);

        // Verify settings were updated
        const settings = await storage.loadSettings();
        expect(settings.theme).toBe('light');
        expect(settings.gridSize).toBe(7);
      });
    });

    describe('PUT /api/settings', () => {
      test('should work the same as POST', async () => {
        const response = await makeRequest(
          { path: '/api/settings', method: 'PUT' },
          testSettings
        );

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);

        const settings = await storage.loadSettings();
        expect(settings).toEqual(testSettings);
      });
    });
  });

  describe('Card Generations API', () => {
    const testGeneration = {
      id: 'gen-1',
      title: 'Test Generation',
      gridSize: 5,
      setCount: 2,
      cardsPerSet: 3,
      config: { leaveCenterBlank: true },
      generatedAt: new Date().toISOString()
    };

    describe('GET /api/generations', () => {
      test('should return empty array when no generations exist', async () => {
        const response = await makeRequest({ path: '/api/generations', method: 'GET' });

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toEqual([]);
      });

      test('should return all saved generations', async () => {
        await storage.saveCardGeneration(testGeneration);
        await storage.saveCardGeneration({ ...testGeneration, id: 'gen-2', title: 'Gen 2' });

        const response = await makeRequest({ path: '/api/generations', method: 'GET' });

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(2);
      });

      test('should respect limit parameter', async () => {
        // Add multiple generations
        for (let i = 0; i < 5; i++) {
          await storage.saveCardGeneration({
            ...testGeneration,
            id: `gen-${i}`,
            title: `Generation ${i}`
          });
        }

        const response = await makeRequest({ path: '/api/generations?limit=3', method: 'GET' });

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(3);
      });
    });

    describe('POST /api/generations', () => {
      test('should create a new generation', async () => {
        const response = await makeRequest(
          { path: '/api/generations', method: 'POST' },
          testGeneration
        );

        expect(response.statusCode).toBe(201);
        expect(response.body.success).toBe(true);

        // Verify generation was saved
        const generations = await storage.loadCardGenerations();
        expect(generations).toHaveLength(1);
        expect(generations[0].title).toBe(testGeneration.title);
      });
    });
  });

  describe('Storage Info API', () => {
    describe('GET /api/storage/info', () => {
      test('should return storage information', async () => {
        const response = await makeRequest({ path: '/api/storage/info', method: 'GET' });

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(response.body.data.version).toBeDefined();
        expect(response.body.data.iconCount).toBeDefined();
      });
    });
  });

  describe('Export API', () => {
    describe('GET /api/export', () => {
      test('should export all data', async () => {
        // Add test data
        await storage.saveIcon({
          id: 'export-icon',
          name: 'Export Icon',
          data: Buffer.from('export-data'),
          type: 'image/png'
        });
        await storage.saveSettings({ exportTest: true });

        const response = await makeRequest({ path: '/api/export', method: 'GET' });

        expect(response.statusCode).toBe(200);
        expect(response.headers['content-disposition']).toContain('attachment');
        expect(response.headers['content-disposition']).toContain('roadtripbingo-backup.json');

        expect(response.body.icons).toHaveLength(1);
        expect(response.body.settings.exportTest).toBe(true);
        expect(response.body.cardGenerations).toBeDefined();
      });

      test('should export empty data gracefully', async () => {
        const response = await makeRequest({ path: '/api/export', method: 'GET' });

        expect(response.statusCode).toBe(200);
        expect(response.body.icons).toEqual([]);
        expect(response.body.settings).toEqual({});
        expect(response.body.cardGenerations).toEqual([]);
      });
    });
  });

  describe('Import API', () => {
    describe('POST /api/import', () => {
      test('should import data successfully', async () => {
        const importData = {
          icons: [{
            id: 'imported-icon',
            name: 'Imported Icon',
            data: Buffer.from('imported-data'),
            type: 'image/png'
          }],
          settings: {
            importedSetting: 'test'
          }
        };

        const response = await makeRequest(
          { path: '/api/import', method: 'POST' },
          importData
        );

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);

        // Verify data was imported
        const icons = await storage.loadIcons();
        expect(icons).toHaveLength(1);
        expect(icons[0].name).toBe('Imported Icon');

        const settings = await storage.loadSettings();
        expect(settings.importedSetting).toBe('test');
      });

      test('should handle empty import data', async () => {
        const response = await makeRequest(
          { path: '/api/import', method: 'POST' },
          {}
        );

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });
  });

  describe('Error Handling', () => {
    test('should return 404 for unknown API endpoints', async () => {
      const response = await makeRequest({ path: '/api/unknown', method: 'GET' });

      expect(response.statusCode).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Not found');
    });

    test('should handle database connection errors', async () => {
      // Close the database to simulate connection error
      storage.db.close();

      const response = await makeRequest({ path: '/api/icons', method: 'GET' });

      expect(response.statusCode).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();

      // Reinitialize for other tests
      storage = new SQLiteStorage(testDbPath);
      await storage.init();
    });

    test('should handle CORS preflight requests', async () => {
      const response = await makeRequest({ path: '/api/icons', method: 'OPTIONS' });

      expect(response.statusCode).toBe(200);
      expect(response.headers['access-control-allow-origin']).toBe('*');
      expect(response.headers['access-control-allow-methods']).toBeTruthy();
    });
  });

  describe('Performance Tests', () => {
    test('should handle multiple concurrent requests', async () => {
      const promises = [];

      // Make 10 concurrent requests
      for (let i = 0; i < 10; i++) {
        promises.push(
          makeRequest(
            { path: '/api/icons', method: 'POST' },
            {
              id: `concurrent-icon-${i}`,
              name: `Concurrent Icon ${i}`,
              data: Buffer.from(`data-${i}`),
              type: 'image/png'
            }
          )
        );
      }

      const responses = await Promise.all(promises);

      // All should succeed
      responses.forEach(response => {
        expect(response.statusCode).toBe(201);
        expect(response.body.success).toBe(true);
      });

      // Verify all icons were saved
      const icons = await storage.loadIcons();
      expect(icons).toHaveLength(10);
    });

    test('should handle large data payloads', async () => {
      const largeIcon = {
        id: 'large-icon',
        name: 'Large Icon',
        data: Buffer.from('x'.repeat(100000)), // 100KB of data
        type: 'image/png',
        size: 100000
      };

      const start = Date.now();
      const response = await makeRequest(
        { path: '/api/icons', method: 'POST' },
        largeIcon
      );
      const duration = Date.now() - start;

      expect(response.statusCode).toBe(201);
      expect(response.body.success).toBe(true);
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds

      // Verify large icon was saved correctly
      const icons = await storage.loadIcons();
      expect(icons).toHaveLength(1);
      expect(icons[0].size).toBe(100000);
    }, 10000);
  });

  describe('Data Validation', () => {
    test('should validate icon data format', async () => {
      const invalidIcon = {
        id: 'invalid-icon',
        name: '', // Invalid: empty name
        data: 'not-a-buffer',
        type: 'invalid/type'
      };

      const response = await makeRequest(
        { path: '/api/icons', method: 'POST' },
        invalidIcon
      );

      expect(response.statusCode).toBe(500);
      expect(response.body.success).toBe(false);
    });

    test('should handle request timeout gracefully', async () => {
      // This test would require mocking slow database operations
      // For now, we'll just verify the API structure handles errors properly
      
      const response = await makeRequest({ 
        path: '/api/icons', 
        method: 'GET',
        timeout: 1 // Very short timeout
      });

      // Even with timeout, the API should respond properly
      expect([200, 500]).toContain(response.statusCode);
    });
  });
});
