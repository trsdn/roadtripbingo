import { describe, it, expect, vi, beforeEach } from 'vitest';
import iconService from '../../../src/services/iconService';

describe('iconService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('fetches all icons successfully', async () => {
      const mockIcons = [
        { id: '1', name: 'Car', category: 'transport' },
        { id: '2', name: 'Tree', category: 'nature' }
      ];

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockIcons)
      });

      const result = await iconService.getAll();

      expect(global.fetch).toHaveBeenCalledWith('/api/icons');
      expect(result).toEqual(mockIcons);
    });

    it('handles fetch error', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      await expect(iconService.getAll()).rejects.toThrow('HTTP error! status: 500');
    });
  });

  describe('save', () => {
    it('saves icon successfully', async () => {
      const newIcon = { name: 'Mountain', category: 'nature', data: 'base64data' };
      const savedIcon = { id: '3', ...newIcon };

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(savedIcon)
      });

      const result = await iconService.save(newIcon);

      expect(global.fetch).toHaveBeenCalledWith('/api/icons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newIcon)
      });
      expect(result).toEqual(savedIcon);
    });

    it('handles save error', async () => {
      const newIcon = { name: 'Mountain', category: 'nature' };

      global.fetch.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request'
      });

      await expect(iconService.save(newIcon)).rejects.toThrow('HTTP error! status: 400');
    });
  });

  describe('delete', () => {
    it('deletes icon successfully', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      const result = await iconService.delete('1');

      expect(global.fetch).toHaveBeenCalledWith('/api/icons/1', {
        method: 'DELETE'
      });
      expect(result).toEqual({ success: true });
    });
  });

  describe('update', () => {
    it('updates icon successfully', async () => {
      const updatedIcon = { id: '1', name: 'Updated Car', category: 'transport' };

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(updatedIcon)
      });

      const result = await iconService.update('1', updatedIcon);

      expect(global.fetch).toHaveBeenCalledWith('/api/icons/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedIcon)
      });
      expect(result).toEqual(updatedIcon);
    });
  });
});