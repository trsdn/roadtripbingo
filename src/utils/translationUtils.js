/**
 * Utility functions for handling icon translations
 */

/**
 * Get the icon name in the specified language or fallback to base name
 * @param {Object} icon - The icon object with name and translations
 * @param {string} language - The current language code (e.g., 'en', 'de', 'fr')
 * @param {string} baseLanguage - The base language code (default: 'en')
 * @returns {string} The translated name or fallback
 */
export function getTranslatedIconName(icon, language, baseLanguage = 'en') {
  if (!icon) return '';
  
  // If language is the base language or not specified, return the main name
  if (!language || language === baseLanguage) {
    return icon.name || '';
  }
  
  // Parse translations from JSON string or object
  let translations = {};
  if (icon.translations) {
    try {
      translations = typeof icon.translations === 'string' 
        ? JSON.parse(icon.translations) 
        : icon.translations;
    } catch (error) {
      console.warn('Failed to parse icon translations:', error);
    }
  }
  
  // Return translation for the requested language if it exists
  if (translations[language]) {
    return translations[language];
  }
  
  // Fallback to the main name (base language)
  return icon.name || '';
}

/**
 * Check if an icon has a translation for the given language
 * @param {Object} icon - The icon object
 * @param {string} language - The language code to check
 * @returns {boolean} True if translation exists
 */
export function hasTranslation(icon, language) {
  if (!icon || !language || language === 'en') {
    return true; // English is always available (main name)
  }
  
  let translations = {};
  if (icon.translations) {
    try {
      translations = typeof icon.translations === 'string' 
        ? JSON.parse(icon.translations) 
        : icon.translations;
    } catch (error) {
      return false;
    }
  }
  
  // Check if translation exists
  if (translations[language]) {
    return true;
  }
  
  // Note: nameDE legacy field is no longer used
  return false;
}

/**
 * Get the base language for the application
 * @returns {string} The base language code (typically 'en')
 */
export function getBaseLanguage() {
  return 'en'; // This could be configurable in the future
}

/**
 * Check if the given language is the base language
 * @param {string} language - The language code to check
 * @returns {boolean} True if it's the base language
 */
export function isBaseLanguage(language) {
  return language === getBaseLanguage();
}