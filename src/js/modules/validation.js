/**
 * Input validation utilities for server API
 * Provides validation functions for API request parameters
 */

/**
 * Validates an icon object
 * @param {Object} icon - Icon object to validate
 * @returns {Object} { valid: boolean, errors: string[] }
 */
function validateIcon(icon) {
  const errors = [];
  
  if (!icon || typeof icon !== 'object') {
    return { valid: false, errors: ['Icon must be an object'] };
  }
  
  // Required fields
  if (!icon.name || typeof icon.name !== 'string') {
    errors.push('Icon name is required and must be a string');
  } else if (icon.name.length > 100) {
    errors.push('Icon name must not exceed 100 characters');
  }
  
  if (!icon.imageData || typeof icon.imageData !== 'string') {
    errors.push('Icon imageData is required and must be a string');
  } else if (!icon.imageData.startsWith('data:image/')) {
    errors.push('Icon imageData must be a valid data URL');
  } else if (icon.imageData.length > 5 * 1024 * 1024) { // 5MB limit
    errors.push('Icon imageData size exceeds 5MB limit');
  }
  
  // Optional fields validation
  if (icon.category && typeof icon.category !== 'string') {
    errors.push('Icon category must be a string');
  }
  
  if (icon.tags && !Array.isArray(icon.tags)) {
    errors.push('Icon tags must be an array');
  }
  
  if (icon.difficulty && !['easy', 'medium', 'hard'].includes(icon.difficulty)) {
    errors.push('Icon difficulty must be "easy", "medium", or "hard"');
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Validates a setting object
 * @param {Object} setting - Setting object to validate
 * @returns {Object} { valid: boolean, errors: string[] }
 */
function validateSetting(setting) {
  const errors = [];
  
  if (!setting || typeof setting !== 'object') {
    return { valid: false, errors: ['Setting must be an object'] };
  }
  
  if (!setting.key || typeof setting.key !== 'string') {
    errors.push('Setting key is required and must be a string');
  } else if (setting.key.length > 50) {
    errors.push('Setting key must not exceed 50 characters');
  }
  
  if (setting.value === undefined || setting.value === null) {
    errors.push('Setting value is required');
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Validates a card generation object
 * @param {Object} generation - Card generation object to validate
 * @returns {Object} { valid: boolean, errors: string[] }
 */
function validateCardGeneration(generation) {
  const errors = [];
  
  if (!generation || typeof generation !== 'object') {
    return { valid: false, errors: ['Card generation must be an object'] };
  }
  
  if (!generation.gridSize || typeof generation.gridSize !== 'number') {
    errors.push('Grid size is required and must be a number');
  } else if (generation.gridSize < 3 || generation.gridSize > 8) {
    errors.push('Grid size must be between 3 and 8');
  }
  
  if (!generation.cards || !Array.isArray(generation.cards)) {
    errors.push('Cards array is required');
  }
  
  if (generation.timestamp && typeof generation.timestamp !== 'number') {
    errors.push('Timestamp must be a number');
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Sanitizes a string input
 * @param {string} input - String to sanitize
 * @param {number} maxLength - Maximum allowed length
 * @returns {string} Sanitized string
 */
function sanitizeString(input, maxLength = 1000) {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Remove null bytes and control characters
  let sanitized = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // Trim and limit length
  sanitized = sanitized.trim().substring(0, maxLength);
  
  return sanitized;
}

/**
 * Validates request query parameters
 * @param {Object} query - Query parameters object
 * @param {string[]} allowedParams - Array of allowed parameter names
 * @returns {Object} { valid: boolean, errors: string[] }
 */
function validateQueryParams(query, allowedParams) {
  const errors = [];
  
  if (!query || typeof query !== 'object') {
    return { valid: true, errors: [] }; // Empty query is valid
  }
  
  const queryKeys = Object.keys(query);
  const invalidParams = queryKeys.filter(key => !allowedParams.includes(key));
  
  if (invalidParams.length > 0) {
    errors.push(`Invalid query parameters: ${invalidParams.join(', ')}`);
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Validates file upload data
 * @param {string} dataUrl - Data URL of the uploaded file
 * @param {string[]} allowedTypes - Array of allowed MIME types
 * @param {number} maxSize - Maximum file size in bytes
 * @returns {Object} { valid: boolean, errors: string[] }
 */
function validateFileUpload(dataUrl, allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml'], maxSize = 5 * 1024 * 1024) {
  const errors = [];
  
  if (!dataUrl || typeof dataUrl !== 'string') {
    return { valid: false, errors: ['File data is required'] };
  }
  
  if (!dataUrl.startsWith('data:')) {
    errors.push('File must be a valid data URL');
    return { valid: false, errors };
  }
  
  // Extract MIME type
  const mimeMatch = dataUrl.match(/^data:([^;]+);/);
  if (!mimeMatch) {
    errors.push('Invalid data URL format');
    return { valid: false, errors };
  }
  
  const mimeType = mimeMatch[1];
  if (!allowedTypes.includes(mimeType)) {
    errors.push(`File type ${mimeType} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
  }
  
  // Check file size (approximate)
  const base64Data = dataUrl.split(',')[1];
  if (base64Data) {
    const estimatedSize = (base64Data.length * 3) / 4; // Base64 to bytes approximation
    if (estimatedSize > maxSize) {
      errors.push(`File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`);
    }
  }
  
  return { valid: errors.length === 0, errors };
}

module.exports = {
  validateIcon,
  validateSetting,
  validateCardGeneration,
  sanitizeString,
  validateQueryParams,
  validateFileUpload
};
