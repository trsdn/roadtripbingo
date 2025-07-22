import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Global test setup
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock HTML5 file API
global.FileReader = vi.fn().mockImplementation(() => ({
  readAsDataURL: vi.fn(),
  result: 'data:image/png;base64,test',
  onload: null,
}));

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:test');
global.URL.revokeObjectURL = vi.fn();

// Mock fetch globally for service tests
global.fetch = vi.fn();