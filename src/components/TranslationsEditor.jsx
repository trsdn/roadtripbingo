import React, { useState, useEffect } from 'react';
import { FaPlus, FaTimes } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import { getBaseLanguage, isBaseLanguage } from '../utils/translationUtils';

const SUPPORTED_LANGUAGES = [
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
];

function TranslationsEditor({ translations, onChange, currentLanguage, baseName = '', baseLanguage }) {
  try {
    const baseLanguageCode = baseLanguage || getBaseLanguage();
    const { t } = useLanguage();
    const [localTranslations, setLocalTranslations] = useState({});
    const [selectedLanguage, setSelectedLanguage] = useState('');

  useEffect(() => {
    // Initialize with existing translations
    const parsed = typeof translations === 'string' ? JSON.parse(translations || '{}') : translations || {};
    
    // If we're in a non-base language and base name exists, show it as a translation
    if (!isBaseLanguage(currentLanguage) && baseName) {
      parsed[baseLanguageCode] = baseName;
    }
    
    setLocalTranslations(parsed);
  }, [translations, currentLanguage, baseName, baseLanguageCode]);

  const addTranslation = () => {
    if (!selectedLanguage) return;
    
    const updated = { ...localTranslations, [selectedLanguage]: '' };
    setLocalTranslations(updated);
    onChange(updated);
    setSelectedLanguage('');
  };

  const updateTranslation = (lang, value) => {
    const updated = { ...localTranslations, [lang]: value };
    setLocalTranslations(updated);
    onChange(updated);
  };

  const removeTranslation = (lang) => {
    const updated = { ...localTranslations };
    delete updated[lang];
    setLocalTranslations(updated);
    onChange(updated);
  };

  const availableLanguages = SUPPORTED_LANGUAGES.filter(
    lang => lang.code !== currentLanguage && !Object.keys(localTranslations).includes(lang.code)
  );
  
  // Add base language to available languages if we're not in base language mode and it's not already shown
  if (!isBaseLanguage(currentLanguage) && !localTranslations[baseLanguageCode] && baseName) {
    // Base language is automatically shown, so don't add it to available languages
  } else if (!isBaseLanguage(currentLanguage) && !baseName) {
    // Add base language as an option if no base name exists
    const baseLang = { code: baseLanguageCode, name: 'English', nativeName: 'English' };
    if (!availableLanguages.find(l => l.code === baseLanguageCode)) {
      availableLanguages.unshift(baseLang);
    }
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        {t('iconTranslations')}
      </label>
      
      {/* Existing translations */}
      {Object.entries(localTranslations).filter(([langCode]) => langCode !== currentLanguage).map(([langCode, translation]) => {
        const language = SUPPORTED_LANGUAGES.find(l => l.code === langCode) || { code: langCode, name: langCode.toUpperCase(), nativeName: langCode.toUpperCase() };
        const isBaseLang = langCode === baseLanguageCode;
        const isReadOnly = false; // Make all languages editable
        
        return (
          <div key={langCode} className="flex gap-2">
            <div className="w-32 flex items-center">
              <span className="text-sm font-medium text-gray-600">
                {language?.nativeName || langCode}
                {isBaseLang && !isBaseLanguage(currentLanguage) && (
                  <span className="text-xs text-gray-400 block">(Original)</span>
                )}
              </span>
            </div>
            <input
              type="text"
              value={translation}
              onChange={(e) => updateTranslation(langCode, e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder={`${t('translation')} (${language?.name || langCode})`}
            />
            <button
              type="button"
              onClick={() => removeTranslation(langCode)}
              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>
        );
      })}
      
      {/* Add new translation */}
      {availableLanguages.length > 0 && (
        <div className="flex gap-2">
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">{t('language')}</option>
            {availableLanguages.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.nativeName} ({lang.name})
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={addTranslation}
            disabled={!selectedLanguage}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <FaPlus className="w-4 h-4" />
            {t('addTranslation')}
          </button>
        </div>
      )}
    </div>
  );
  } catch (error) {
    console.error('TranslationsEditor render error:', error);
    return (
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Translations (Error: {error.message})
        </label>
        <div className="text-red-600 text-sm">
          Unable to load translations editor. Please try again.
        </div>
      </div>
    );
  }
}

export default TranslationsEditor;