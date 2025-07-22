import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import useSettings from '../../../src/hooks/useSettings';

// Mock the settingsService
vi.mock('../../../src/services/settingsService', () => ({
  default: {
    get: vi.fn(),
    set: vi.fn(),
    getAll: vi.fn()
  }
}));

import settingsService from '../../../src/services/settingsService';

describe('useSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads settings on mount', async () => {
    const mockSettings = { language: 'en', theme: 'light' };
    settingsService.getAll.mockResolvedValue(mockSettings);

    const { result } = renderHook(() => useSettings());

    await waitFor(() => {
      expect(result.current.settings).toEqual(mockSettings);
    });

    expect(settingsService.getAll).toHaveBeenCalledOnce();
  });

  it('updates individual setting', async () => {
    settingsService.getAll.mockResolvedValue({ language: 'en', theme: 'light' });
    settingsService.set.mockResolvedValue();

    const { result } = renderHook(() => useSettings());

    await waitFor(() => {
      expect(result.current.settings).toBeDefined();
    });

    await result.current.updateSetting('language', 'de');

    expect(settingsService.set).toHaveBeenCalledWith('language', 'de');
  });

  it('gets specific setting value', async () => {
    const mockSettings = { language: 'en', theme: 'light' };
    settingsService.getAll.mockResolvedValue(mockSettings);

    const { result } = renderHook(() => useSettings());

    await waitFor(() => {
      expect(result.current.settings).toEqual(mockSettings);
    });

    expect(result.current.getSetting('language')).toBe('en');
    expect(result.current.getSetting('theme')).toBe('light');
  });

  it('returns default value for missing setting', async () => {
    settingsService.getAll.mockResolvedValue({});

    const { result } = renderHook(() => useSettings());

    await waitFor(() => {
      expect(result.current.settings).toEqual({});
    });

    expect(result.current.getSetting('language', 'en')).toBe('en');
  });
});