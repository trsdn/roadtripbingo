/**
 * @jest-environment jsdom
 */

import { setLanguage, getTranslatedText, initLanguageSelector } from '@/js/modules/i18n.js';

// Mock the languages module
jest.mock('../../../src/js/modules/languages.js', () => ({
  translations: {
    en: { test: 'Test' },
    de: { test: 'Test auf Deutsch' }
  }
}));

describe('Internationalization (i18n)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    localStorage.clear();
  });

  describe('setLanguage', () => {
    it('should set language correctly', () => {
      setLanguage('de');
      expect(localStorage.getItem('roadtripBingo')).toContain('"language":"de"');
    });

    it('should default to English for invalid language', () => {
      setLanguage('invalid');
      expect(localStorage.getItem('roadtripBingo')).toContain('"language":"en"');
    });
  });

  describe('getTranslatedText', () => {
    beforeEach(() => {
      setLanguage('en');
    });

    it('should return translated text for valid key', () => {
      const result = getTranslatedText('test');
      expect(result).toBe('Test');
    });

    it('should return key for missing translation', () => {
      const result = getTranslatedText('missing');
      expect(result).toBe('missing');
    });
  });

  describe('initLanguageSelector', () => {
    it('should initialize language selector', () => {
      document.body.innerHTML = '<select id="languageSelect"></select>';
      
      initLanguageSelector();
      
      const selector = document.getElementById('languageSelect');
      expect(selector).toBeTruthy();
    });
  });
});
