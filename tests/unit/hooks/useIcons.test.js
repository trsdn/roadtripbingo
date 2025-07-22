import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import useIcons from '../../../src/hooks/useIcons';

// Mock the iconService
vi.mock('../../../src/services/iconService', () => ({
  default: {
    getAll: vi.fn(),
    save: vi.fn(),
    delete: vi.fn(),
    update: vi.fn()
  }
}));

import iconService from '../../../src/services/iconService';

const mockIcons = [
  { id: '1', name: 'Car', category: 'transport' },
  { id: '2', name: 'Tree', category: 'nature' }
];

describe('useIcons', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads icons on mount', async () => {
    iconService.getAll.mockResolvedValue(mockIcons);

    const { result } = renderHook(() => useIcons());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.icons).toEqual(mockIcons);
    expect(iconService.getAll).toHaveBeenCalledOnce();
  });

  it('handles loading error', async () => {
    const error = new Error('Failed to load icons');
    iconService.getAll.mockRejectedValue(error);

    const { result } = renderHook(() => useIcons());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(error);
  });

  it('adds new icon', async () => {
    iconService.getAll.mockResolvedValue(mockIcons);
    iconService.save.mockResolvedValue({ id: '3', name: 'Mountain', category: 'nature' });

    const { result } = renderHook(() => useIcons());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const newIcon = { name: 'Mountain', category: 'nature' };
    await result.current.addIcon(newIcon);

    expect(iconService.save).toHaveBeenCalledWith(newIcon);
  });

  it('removes icon', async () => {
    iconService.getAll.mockResolvedValue(mockIcons);
    iconService.delete.mockResolvedValue();

    const { result } = renderHook(() => useIcons());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await result.current.removeIcon('1');

    expect(iconService.delete).toHaveBeenCalledWith('1');
  });
});