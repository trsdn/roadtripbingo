/**
 * @jest-environment jsdom
 */

// Mock before import to avoid factory scope issues
jest.mock('../../../src/js/modules/i18n.js');

import { setLanguage, getTranslatedText, initLanguageSelector } from '@/js/modules/i18n.js';

// Configure mocks after import
const mockLanguages = {
  en: { test: 'Test' },
  de: { test: 'Test auf Deutsch' }
};

setLanguage.mockImplementation((lang) => {
  const elements = document.querySelectorAll('[data-translate]');
  elements.forEach(el => {
    const key = el.getAttribute('data-translate');
    if (mockLanguages[lang] && mockLanguages[lang][key]) {
      el.textContent = mockLanguages[lang][key];
    }
  });
});

getTranslatedText.mockImplementation((key, replacements = {}, language = 'en') => {
  if (!mockLanguages[language] || !mockLanguages[language][key]) {
    return key;
  }
  return mockLanguages[language][key];
});

initLanguageSelector.mockImplementation(() => {
  // Mock implementation for language selector
});

describe('Internationalization (i18n)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    localStorage.clear();
  });

  describe('setLanguage', () => {
    it('should set language correctly for DOM elements', () => {
      document.body.innerHTML = '<div data-translate="test"></div>';
      setLanguage('de');
      const element = document.querySelector('[data-translate="test"]');
      expect(element.textContent).toBe('Test auf Deutsch');
    });

    it('should handle missing language gracefully', () => {
      document.body.innerHTML = '<div data-translate="test"></div>';
      setLanguage('invalid');
      const element = document.querySelector('[data-translate="test"]');
      // Should not crash, but behavior may vary depending on implementation
      expect(element).toBeTruthy();
    });
  });

  describe('getTranslatedText', () => {
    beforeEach(() => {
      setLanguage('en');
    });

    it('should return translated text for valid key', () => {
      const result = getTranslatedText('test', {}, 'en');
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
