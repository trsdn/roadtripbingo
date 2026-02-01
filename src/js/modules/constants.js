/**
 * Constants used throughout the Road Trip Bingo application
 * Centralized location for all magic numbers and configuration values
 */

// Grid Size Constants
export const GRID_SIZES = {
  MIN: 3,
  MAX: 8,
  DEFAULT: 5,
  ODD_SIZES: [3, 5, 7], // Sizes that support center blank
};

// Image Processing Constants
export const IMAGE = {
  MAX_WIDTH: 400,
  MAX_HEIGHT: 400,
  JPEG_QUALITY: 0.7,
  PNG_QUALITY: 0.8,
  MAX_FILE_SIZE: 200 * 1024, // 200KB - trigger compression above this
  MAX_UPLOAD_SIZE: 5 * 1024 * 1024, // 5MB - maximum upload size
  ALLOWED_TYPES: ['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml'],
};

// PDF Generation Constants
export const PDF = {
  COMPRESSION_LEVELS: {
    NONE: 0,
    LIGHT: 1,
    MEDIUM: 2,
    HIGH: 3,
  },
  DEFAULT_COMPRESSION: 2, // Medium
  FORMAT: 'a4',
  ORIENTATION: 'portrait',
  MARGIN: 10, // mm
};

// Multi-Hit Mode Constants
export const MULTI_HIT = {
  DIFFICULTY: {
    LIGHT: 'light',
    MEDIUM: 'medium',
    HARD: 'hard',
  },
  PERCENTAGE_RANGES: {
    LIGHT: { MIN: 0.20, MAX: 0.30 }, // 20-30% of tiles
    MEDIUM: { MIN: 0.40, MAX: 0.50 }, // 40-50% of tiles
    HARD: { MIN: 0.60, MAX: 0.70 }, // 60-70% of tiles
  },
  HIT_COUNT: {
    MIN: 2,
    MAX: 5,
  },
};

// Storage Constants
export const STORAGE = {
  DB_NAME: 'roadtripBingo',
  DB_VERSION: 1,
  STORES: {
    ICONS: 'icons',
    SETTINGS: 'settings',
    GENERATIONS: 'gameStates',
  },
  MAX_ICONS: 1000, // Soft limit for performance
};

// API Constants
export const API = {
  BASE_URL: '/api',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
};

// Rate Limiting Constants
export const RATE_LIMIT = {
  WINDOW: 60 * 1000, // 1 minute
  MAX_REQUESTS: 30, // Per window
  AI_MAX_REQUESTS: 10, // Stricter limit for AI endpoints
};

// Request Size Limits
export const REQUEST_LIMITS = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_JSON_SIZE: 5 * 1024 * 1024, // 5MB
};

// Validation Constants
export const VALIDATION = {
  ICON_NAME_MAX_LENGTH: 100,
  SETTING_KEY_MAX_LENGTH: 50,
  STRING_MAX_LENGTH: 1000,
  CATEGORY_MAX_LENGTH: 50,
  TAG_MAX_LENGTH: 30,
  TAG_MAX_COUNT: 10,
};

// AI Service Constants
export const AI = {
  API_KEY_PREFIX: 'sk-',
  MAX_BATCH_SIZE: 10,
  MONTHLY_LIMIT: 100, // Default monthly request limit
  CACHE_TTL: 24 * 60 * 60 * 1000, // 24 hours
  TIMEOUT: 30000, // 30 seconds
};

// Language Constants
export const LANGUAGES = {
  DEFAULT: 'en',
  SUPPORTED: ['en', 'de'],
  FALLBACK: 'en',
};

// Theme Constants
export const THEMES = {
  DEFAULT: 'light',
  SUPPORTED: ['light', 'dark'],
};

// Card Generation Constants
export const CARD_GENERATION = {
  MIN_CARDS: 1,
  MAX_CARDS: 50,
  DEFAULT_CARDS: 1,
  MIN_ICONS_REQUIRED: 9, // Minimum for 3x3 grid
};

// Export Status Constants
export const EXPORT_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

// Feature Flags (for gradual rollout)
export const FEATURES = {
  AI_ANALYSIS: true,
  MULTI_HIT_MODE: true,
  CENTER_BLANK: true,
  ICON_LABELS: true,
  DARK_MODE: false, // Not yet implemented
  OFFLINE_MODE: false, // Future feature
};

// Error Messages
export const ERROR_MESSAGES = {
  GENERIC: 'An unexpected error occurred. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  STORAGE_FULL: 'Storage is full. Please delete some items.',
  INVALID_FILE: 'Invalid file format. Please upload an image.',
  FILE_TOO_LARGE: 'File is too large. Maximum size is 5MB.',
  RATE_LIMIT: 'Too many requests. Please try again later.',
  AI_SERVICE_ERROR: 'AI service is unavailable. Please try again later.',
  VALIDATION_ERROR: 'Invalid input. Please check your data.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  ICON_SAVED: 'Icon saved successfully',
  ICON_UPDATED: 'Icon updated successfully',
  ICON_DELETED: 'Icon deleted successfully',
  SETTINGS_SAVED: 'Settings saved successfully',
  BACKUP_CREATED: 'Backup created successfully',
  BACKUP_RESTORED: 'Backup restored successfully',
  CARDS_GENERATED: 'Bingo cards generated successfully',
  PDF_EXPORTED: 'PDF exported successfully',
};

// Development/Debug Constants
export const DEBUG = {
  ENABLED: process.env.NODE_ENV === 'development',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  VERBOSE: process.env.VERBOSE === 'true',
};

// Export all constants as default for convenience
export default {
  GRID_SIZES,
  IMAGE,
  PDF,
  MULTI_HIT,
  STORAGE,
  API,
  RATE_LIMIT,
  REQUEST_LIMITS,
  VALIDATION,
  AI,
  LANGUAGES,
  THEMES,
  CARD_GENERATION,
  EXPORT_STATUS,
  FEATURES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  DEBUG,
};
