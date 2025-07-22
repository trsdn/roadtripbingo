import { describe, it, expect, vi, beforeEach } from 'vitest';
import settingsService from '../../../src/services/settingsService';

describe('settingsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('get', () => {
    it('fetches setting value successfully', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ key: 'language', value: 'en' })
      });

      const result = await settingsService.get('language');

      expect(global.fetch).toHaveBeenCalledWith('/api/settings/language');
      expect(result).toBe('en');
    });

    it('returns default value when setting not found', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 404
      });

      const result = await settingsService.get('nonexistent', 'default');

      expect(result).toBe('default');
    });

    it('handles fetch error', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      await expect(settingsService.get('language')).rejects.toThrow();
    });
  });

  describe('set', () => {
    it('saves setting successfully', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ key: 'language', value: 'de' })
      });

      const result = await settingsService.set('language', 'de');

      expect(global.fetch).toHaveBeenCalledWith('/api/settings/language', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: 'de' })
      });
      expect(result).toEqual({ key: 'language', value: 'de' });
    });

    it('handles save error', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request'
      });

      await expect(settingsService.set('language', 'invalid')).rejects.toThrow();
    });
  });

  describe('getAll', () => {
    it('fetches all settings successfully', async () => {
      const mockSettings = {
        language: 'en',
        theme: 'light',
        gridSize: '5'
      };

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockSettings)
      });

      const result = await settingsService.getAll();

      expect(global.fetch).toHaveBeenCalledWith('/api/settings');
      expect(result).toEqual(mockSettings);
    });

    it('returns empty object when no settings found', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({})
      });

      const result = await settingsService.getAll();

      expect(result).toEqual({});
    });
  });

  describe('delete', () => {
    it('deletes setting successfully', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      const result = await settingsService.delete('language');

      expect(global.fetch).toHaveBeenCalledWith('/api/settings/language', {
        method: 'DELETE'
      });
      expect(result).toEqual({ success: true });
    });
  });
});