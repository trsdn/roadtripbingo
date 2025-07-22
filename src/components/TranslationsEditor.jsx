import React, { useState, useEffect } from 'react';
import { FaPlus, FaTimes } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';

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

function TranslationsEditor({ translations, onChange, existingNameDE }) {
  const { t } = useLanguage();
  const [localTranslations, setLocalTranslations] = useState({});
  const [selectedLanguage, setSelectedLanguage] = useState('');

  useEffect(() => {
    // Initialize with existing translations
    const parsed = typeof translations === 'string' ? JSON.parse(translations || '{}') : translations || {};
    
    // Migrate legacy nameDE if it exists and not in translations
    if (existingNameDE && !parsed.de) {
      parsed.de = existingNameDE;
    }
    
    setLocalTranslations(parsed);
  }, [translations, existingNameDE]);

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
    lang => !Object.keys(localTranslations).includes(lang.code)
  );

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        {t('iconTranslations')}
      </label>
      
      {/* Existing translations */}
      {Object.entries(localTranslations).map(([langCode, translation]) => {
        const language = SUPPORTED_LANGUAGES.find(l => l.code === langCode);
        return (
          <div key={langCode} className="flex gap-2">
            <div className="w-32 flex items-center">
              <span className="text-sm font-medium text-gray-600">
                {language?.nativeName || langCode}
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
}

export default TranslationsEditor;