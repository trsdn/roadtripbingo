import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { build } from '../../server/index.js';

describe('API Integration Tests', () => {
  let app;

  beforeAll(async () => {
    // Build the Fastify app for testing
    app = await build({ logger: false });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Icons API', () => {
    it('GET /api/icons returns icon list', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/icons'
      });

      expect(response.statusCode).toBe(200);
      const icons = JSON.parse(response.body);
      expect(Array.isArray(icons)).toBe(true);
    });

    it('POST /api/icons creates new icon', async () => {
      const newIcon = {
        name: 'Test Icon',
        category: 'test',
        difficulty: 3,
        data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/icons',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newIcon)
      });

      expect(response.statusCode).toBe(201);
      const createdIcon = JSON.parse(response.body);
      expect(createdIcon.name).toBe(newIcon.name);
      expect(createdIcon.id).toBeDefined();
    });

    it('PUT /api/icons/:id updates existing icon', async () => {
      // First create an icon
      const newIcon = {
        name: 'Test Icon',
        category: 'test',
        difficulty: 3,
        data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
      };

      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/icons',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newIcon)
      });

      const createdIcon = JSON.parse(createResponse.body);

      // Then update it
      const updatedIcon = {
        ...createdIcon,
        name: 'Updated Test Icon',
        category: 'updated'
      };

      const updateResponse = await app.inject({
        method: 'PUT',
        url: `/api/icons/${createdIcon.id}`,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedIcon)
      });

      expect(updateResponse.statusCode).toBe(200);
      const result = JSON.parse(updateResponse.body);
      expect(result.name).toBe('Updated Test Icon');
    });

    it('DELETE /api/icons/:id removes icon', async () => {
      // First create an icon
      const newIcon = {
        name: 'Test Icon to Delete',
        category: 'test',
        difficulty: 3,
        data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
      };

      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/icons',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newIcon)
      });

      const createdIcon = JSON.parse(createResponse.body);

      // Then delete it
      const deleteResponse = await app.inject({
        method: 'DELETE',
        url: `/api/icons/${createdIcon.id}`
      });

      expect(deleteResponse.statusCode).toBe(200);

      // Verify it's gone
      const getResponse = await app.inject({
        method: 'GET',
        url: `/api/icons/${createdIcon.id}`
      });

      expect(getResponse.statusCode).toBe(404);
    });
  });

  describe('Settings API', () => {
    it('GET /api/settings returns all settings', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/settings'
      });

      expect(response.statusCode).toBe(200);
      const settings = JSON.parse(response.body);
      expect(typeof settings).toBe('object');
    });

    it('POST /api/settings/:key sets setting value', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/settings/testSetting',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: 'testValue' })
      });

      expect(response.statusCode).toBe(200);
      const result = JSON.parse(response.body);
      expect(result.key).toBe('testSetting');
      expect(result.value).toBe('testValue');
    });

    it('GET /api/settings/:key returns specific setting', async () => {
      // First set a value
      await app.inject({
        method: 'POST',
        url: '/api/settings/testGet',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: 'getValue' })
      });

      // Then get it
      const response = await app.inject({
        method: 'GET',
        url: '/api/settings/testGet'
      });

      expect(response.statusCode).toBe(200);
      const result = JSON.parse(response.body);
      expect(result.value).toBe('getValue');
    });
  });

  describe('Error Handling', () => {
    it('returns 404 for non-existent icon', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/icons/nonexistent'
      });

      expect(response.statusCode).toBe(404);
    });

    it('returns 400 for invalid icon data', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/icons',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invalid: 'data' })
      });

      expect(response.statusCode).toBe(400);
    });

    it('returns 404 for non-existent routes', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/nonexistent'
      });

      expect(response.statusCode).toBe(404);
    });
  });
});