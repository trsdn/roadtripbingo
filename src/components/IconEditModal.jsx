import React, { useState, useEffect } from 'react';
import { IoMdClose } from 'react-icons/io';
import { FaSave, FaTags, FaBan } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import { getTranslatedIconName, getBaseLanguage, isBaseLanguage } from '../utils/translationUtils';
import TranslationsEditor from './TranslationsEditor';

function IconEditModal({ icon, onClose, onSave }) {
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({
    name: icon.name,
    translations: icon.translations || '{}',
    difficulty: icon.difficulty,
    tags: Array.isArray(icon.tags) ? icon.tags : [],
    excludeFromMultiHit: Boolean(icon.excludeFromMultiHit),
    altText: icon.altText || '',
    category: icon.category || 'default'
  });
  
  const [currentLanguageName, setCurrentLanguageName] = useState('');
  
  // Initialize the current language name when modal opens or language changes
  useEffect(() => {
    const displayName = getTranslatedIconName(icon, language);
    setCurrentLanguageName(displayName);
  }, [icon, language]);
  const [newTag, setNewTag] = useState('');
  const [saving, setSaving] = useState(false);

  const addTag = () => {
    const tag = newTag.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({ 
        ...prev, 
        tags: [...prev.tags, tag] 
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({ 
      ...prev, 
      tags: prev.tags.filter(tag => tag !== tagToRemove) 
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Prepare the data based on current language
      let updatedData = { ...formData };
      
      if (isBaseLanguage(language)) {
        // Editing base language name directly
        updatedData.name = currentLanguageName;
      } else {
        // Editing a translation - update translations object
        let translations = {};
        try {
          translations = JSON.parse(formData.translations || '{}');
        } catch (error) {
          translations = {};
        }
        
        // Update the translation for the current language
        translations[language] = currentLanguageName;
        updatedData.translations = JSON.stringify(translations);
        
        // Keep the original base language name unchanged
        updatedData.name = icon.name;
      }
      
      await onSave(updatedData);
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{t('editIcon')}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <IoMdClose className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex justify-center mb-4">
          <img
            src={icon.data}
            alt={icon.name}
            className="w-20 h-20 object-contain border rounded"
          />
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('iconName')} {!isBaseLanguage(language) && `(${language.toUpperCase()})`}
            </label>
            <input
              type="text"
              required
              value={currentLanguageName}
              onChange={(e) => setCurrentLanguageName(e.target.value)}
              className="input"
              placeholder={isBaseLanguage(language) ? t('iconName') : `${t('iconName')} in ${language.toUpperCase()}`}
            />
            {!isBaseLanguage(language) && (
              <p className="text-xs text-gray-500 mt-1">
                {t('editingTranslation')} • {t('originalName')}: {icon.name}
              </p>
            )}
          </div>

          {/* Show other translations (excluding current language) */}
          <TranslationsEditor
            translations={formData.translations}
            currentLanguage={language}
            currentLanguageName={currentLanguageName}
            baseName={icon.name}
            baseLanguage={getBaseLanguage()}
            onChange={(translations) => {
              const translationsStr = JSON.stringify(translations);
              setFormData({ 
                ...formData, 
                translations: translationsStr
              });
            }}
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('difficulty')}
            </label>
            <select
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: parseInt(e.target.value) })}
              className="input"
            >
              <option value={1}>{t('difficultyVeryEasy')}</option>
              <option value={2}>{t('difficultyEasy')}</option>
              <option value={3}>{t('difficultyMedium')}</option>
              <option value={4}>{t('difficultyHard')}</option>
              <option value={5}>{t('difficultyVeryHard')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('category')}
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="input"
              placeholder={t('categoryPlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('altText')}
            </label>
            <input
              type="text"
              value={formData.altText}
              onChange={(e) => setFormData({ ...formData, altText: e.target.value })}
              className="input"
              placeholder={t('altTextPlaceholder')}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('tags')}
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="input flex-1"
                placeholder={t('tagPlaceholder')}
              />
              <button
                type="button"
                onClick={addTag}
                className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <FaTags className="w-4 h-4" />
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.excludeFromMultiHit}
                onChange={(e) => setFormData({ ...formData, excludeFromMultiHit: e.target.checked })}
                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <span className="text-sm text-gray-700 flex items-center gap-1">
                <FaBan className="w-4 h-4 text-red-500" />
                {t('excludeFromMultiHit')}
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              {t('excludeFromMultiHitDescription')}
            </p>
          </div>
          
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-outline justify-center"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 btn-primary justify-center disabled:opacity-50"
            >
              <FaSave />
              {saving ? t('saving') : t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default IconEditModal;