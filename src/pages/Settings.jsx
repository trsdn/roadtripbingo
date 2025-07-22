import React, { useState } from 'react';
import { FaCog, FaSave, FaUndo, FaDownload, FaUpload, FaTrash } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import { useGeneratorSettings } from '../hooks/useSettings';
import { useNotifications } from '../components/NotificationContainer';
import LoadingSpinner from '../components/LoadingSpinner';

function Settings() {
  const { t } = useLanguage();
  const { settings, loading, saving, updateSettings, saveSettings } = useGeneratorSettings();
  const { showSuccess, showError, showInfo } = useNotifications();
  const [localSettings, setLocalSettings] = useState(settings);
  
  React.useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);
  
  const handleSave = async () => {
    await saveSettings(localSettings);
  };
  
  const handleReset = () => {
    const defaults = {
      gridSize: 5,
      centerBlank: true,
      showLabels: true,
      multiHitMode: false,
      multiHitDifficulty: 2,
      sameCard: false,
    };
    setLocalSettings(defaults);
    showInfo('Settings reset to defaults (click Save to apply)');
  };
  
  const handleExportSettings = () => {
    const dataStr = JSON.stringify(localSettings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'bingo-settings.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showSuccess('Settings exported successfully');
  };
  
  const handleImportSettings = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target.result);
          setLocalSettings({ ...localSettings, ...importedSettings });
          showSuccess('Settings imported successfully (click Save to apply)');
        } catch (error) {
          showError('Invalid settings file');
        }
      };
      reader.readAsText(file);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" text="Loading settings..." />
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FaCog className="w-6 h-6 text-primary-600" />
          <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="btn-outline"
            title="Reset to defaults"
          >
            <FaUndo />
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary"
          >
            <FaSave />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Generator Settings */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Generator Defaults</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Grid Size
              </label>
              <select
                value={localSettings.gridSize}
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  gridSize: parseInt(e.target.value)
                })}
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
                  checked={localSettings.centerBlank}
                  onChange={(e) => setLocalSettings({
                    ...localSettings,
                    centerBlank: e.target.checked
                  })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Center blank by default</span>
              </label>
            </div>
            
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={localSettings.showLabels}
                  onChange={(e) => setLocalSettings({
                    ...localSettings,
                    showLabels: e.target.checked
                  })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Show icon labels by default</span>
              </label>
            </div>
            
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={localSettings.multiHitMode}
                  onChange={(e) => setLocalSettings({
                    ...localSettings,
                    multiHitMode: e.target.checked
                  })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Multi-hit mode by default</span>
              </label>
            </div>
            
            {localSettings.multiHitMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Multi-hit Difficulty
                </label>
                <select
                  value={localSettings.multiHitDifficulty}
                  onChange={(e) => setLocalSettings({
                    ...localSettings,
                    multiHitDifficulty: parseInt(e.target.value)
                  })}
                  className="input"
                >
                  <option value={1}>Easy (More hits)</option>
                  <option value={2}>Medium</option>
                  <option value={3}>Hard (Fewer hits)</option>
                </select>
              </div>
            )}
            
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={localSettings.sameCard}
                  onChange={(e) => setLocalSettings({
                    ...localSettings,
                    sameCard: e.target.checked
                  })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Generate same card by default</span>
              </label>
            </div>
          </div>
        </div>
        
        {/* Import/Export Settings */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Backup & Restore</h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-3">
                Export your settings to backup or share with others.
              </p>
              <button
                onClick={handleExportSettings}
                className="w-full btn-secondary justify-center"
              >
                <FaDownload />
                Export Settings
              </button>
            </div>
            
            <div>
              <p className="text-sm text-gray-600 mb-3">
                Import settings from a backup file.
              </p>
              <label className="w-full btn-outline justify-center cursor-pointer">
                <FaUpload />
                Import Settings
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportSettings}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
      
      {/* Advanced Settings */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Advanced</h3>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <FaTrash className="w-4 h-4 text-yellow-600" />
            <span className="font-medium text-yellow-800">Danger Zone</span>
          </div>
          <p className="text-sm text-yellow-700 mb-3">
            These actions cannot be undone. Please be careful.
          </p>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to reset all settings? This cannot be undone.')) {
                handleReset();
                handleSave();
              }
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <FaTrash className="w-4 h-4" />
            Reset All Settings
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;