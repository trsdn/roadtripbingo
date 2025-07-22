import React from 'react';
import { useLanguage } from '../context/LanguageContext';

function GeneratorSettings({ settings, onSettingsChange }) {
  const { t } = useLanguage();
  
  const updateSetting = (key, value) => {
    onSettingsChange({ ...settings, [key]: value });
  };
  
  return (
    <div className="card space-y-4">
      <h3 className="text-lg font-semibold mb-4">Settings</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('bingoCardTitle')}
        </label>
        <input
          type="text"
          value={settings.title}
          onChange={(e) => updateSetting('title', e.target.value)}
          className="input"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('gridSize')}
        </label>
        <select
          value={settings.gridSize}
          onChange={(e) => updateSetting('gridSize', parseInt(e.target.value))}
          className="input"
        >
          <option value={3}>3x3</option>
          <option value={4}>4x4</option>
          <option value={5}>5x5</option>
          <option value={6}>6x6</option>
          <option value={7}>7x7</option>
          <option value={8}>8x8</option>
        </select>
      </div>
      
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={settings.multiHitMode}
            onChange={(e) => updateSetting('multiHitMode', e.target.checked)}
            className="mr-2"
          />
          <span className="text-sm text-gray-700">{t('multiHitMode')}</span>
        </label>
      </div>
      
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={settings.centerBlank}
            onChange={(e) => updateSetting('centerBlank', e.target.checked)}
            className="mr-2"
          />
          <span className="text-sm text-gray-700">{t('centerBlank')}</span>
        </label>
      </div>
      
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={settings.showLabels}
            onChange={(e) => updateSetting('showLabels', e.target.checked)}
            className="mr-2"
          />
          <span className="text-sm text-gray-700">{t('showLabels')}</span>
        </label>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Cards to Generate
        </label>
        <input
          type="number"
          min="1"
          max="10"
          value={settings.cardCount}
          onChange={(e) => updateSetting('cardCount', parseInt(e.target.value))}
          className="input"
        />
      </div>
    </div>
  );
}

export default GeneratorSettings;