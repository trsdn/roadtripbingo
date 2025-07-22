import React, { useState, useEffect } from 'react';
import { FaDownload, FaUpload, FaInfoCircle, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import { useNotifications } from '../components/NotificationContainer';
import backupService from '../services/backupService';
import LoadingSpinner from '../components/LoadingSpinner';

function Backup() {
  const [backupInfo, setBackupInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importOptions, setImportOptions] = useState({
    importIcons: true,
    importSettings: true,
    overwriteExisting: false
  });
  const { showSuccess, showError, showWarning } = useNotifications();
  
  useEffect(() => {
    loadBackupInfo();
  }, []);
  
  const loadBackupInfo = async () => {
    try {
      setLoading(true);
      const info = await backupService.getBackupInfo();
      setBackupInfo(info);
    } catch (error) {
      console.error('Error loading backup info:', error);
      showError('Failed to load backup information');
    } finally {
      setLoading(false);
    }
  };
  
  const handleExportFull = async () => {
    try {
      setExporting(true);
      const result = await backupService.exportBackup({
        includeIcons: true,
        includeSettings: true
      });
      
      showSuccess(
        `Backup exported successfully! ${result.iconCount} icons and ${result.settingsCount} settings saved to ${result.filename}`
      );
    } catch (error) {
      console.error('Export error:', error);
      showError(`Export failed: ${error.message}`);
    } finally {
      setExporting(false);
    }
  };
  
  const handleExportIcons = async () => {
    try {
      setExporting(true);
      const result = await backupService.exportBackup({
        includeIcons: true,
        includeSettings: false,
        filename: `bingo-icons-${new Date().toISOString().split('T')[0]}.json`
      });
      
      showSuccess(`${result.iconCount} icons exported successfully!`);
    } catch (error) {
      console.error('Export error:', error);
      showError(`Export failed: ${error.message}`);
    } finally {
      setExporting(false);
    }
  };
  
  const handleExportSettings = async () => {
    try {
      setExporting(true);
      const result = await backupService.exportBackup({
        includeIcons: false,
        includeSettings: true,
        filename: `bingo-settings-${new Date().toISOString().split('T')[0]}.json`
      });
      
      showSuccess(`${result.settingsCount} settings exported successfully!`);
    } catch (error) {
      console.error('Export error:', error);
      showError(`Export failed: ${error.message}`);
    } finally {
      setExporting(false);
    }
  };
  
  const handleImport = async (file) => {
    const validation = backupService.validateBackupFile(file);
    if (!validation.isValid) {
      showError(validation.error);
      return;
    }
    
    try {
      setImporting(true);
      const result = await backupService.importBackup(file, importOptions);
      
      let message = 'Import completed! ';
      if (result.iconsImported > 0) {
        message += `${result.iconsImported} icons imported. `;
      }
      if (result.settingsImported > 0) {
        message += `${result.settingsImported} settings imported. `;
      }
      
      if (result.errors.length > 0) {
        message += `${result.errors.length} errors occurred.`;
        showWarning(message);
        console.warn('Import errors:', result.errors);
      } else {
        showSuccess(message);
      }
      
      // Reload backup info
      await loadBackupInfo();
    } catch (error) {
      console.error('Import error:', error);
      showError(`Import failed: ${error.message}`);
    } finally {
      setImporting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" text="Loading backup information..." />
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Backup & Restore</h2>
        <p className="text-gray-600">
          Export your icons and settings to create backups, or import data from backup files.
        </p>
      </div>
      
      {/* Current Data Overview */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FaInfoCircle className="text-blue-500" />
          Current Data
        </h3>
        
        {backupInfo && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">{backupInfo.iconCount}</div>
              <div className="text-sm text-gray-600">Icons</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">{backupInfo.settingsCount}</div>
              <div className="text-sm text-gray-600">Settings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">
                {backupService.formatFileSize(backupInfo.totalSize)}
              </div>
              <div className="text-sm text-gray-600">Est. Backup Size</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">2.0</div>
              <div className="text-sm text-gray-600">Version</div>
            </div>
          </div>
        )}
      </div>
      
      {/* Export Section */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FaDownload className="text-green-500" />
          Export Data
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={handleExportFull}
            disabled={exporting}
            className="btn-primary justify-center h-24 flex-col"
          >
            <FaDownload className="mb-2" />
            <span className="font-medium">Full Backup</span>
            <span className="text-sm opacity-75">Icons + Settings</span>
          </button>
          
          <button
            onClick={handleExportIcons}
            disabled={exporting}
            className="btn-secondary justify-center h-24 flex-col"
          >
            <FaDownload className="mb-2" />
            <span className="font-medium">Icons Only</span>
            <span className="text-sm opacity-75">{backupInfo?.iconCount || 0} icons</span>
          </button>
          
          <button
            onClick={handleExportSettings}
            disabled={exporting}
            className="btn-outline justify-center h-24 flex-col"
          >
            <FaDownload className="mb-2" />
            <span className="font-medium">Settings Only</span>
            <span className="text-sm opacity-75">{backupInfo?.settingsCount || 0} settings</span>
          </button>
        </div>
        
        {exporting && (
          <div className="mt-4 flex items-center gap-2 text-blue-600">
            <LoadingSpinner size="small" />
            <span>Creating backup...</span>
          </div>
        )}
      </div>
      
      {/* Import Section */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FaUpload className="text-purple-500" />
          Import Data
        </h3>
        
        {/* Import Options */}
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Import Options</h4>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={importOptions.importIcons}
                onChange={(e) => setImportOptions({
                  ...importOptions,
                  importIcons: e.target.checked
                })}
                className="mr-2"
              />
              <span className="text-sm">Import icons</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={importOptions.importSettings}
                onChange={(e) => setImportOptions({
                  ...importOptions,
                  importSettings: e.target.checked
                })}
                className="mr-2"
              />
              <span className="text-sm">Import settings</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={importOptions.overwriteExisting}
                onChange={(e) => setImportOptions({
                  ...importOptions,
                  overwriteExisting: e.target.checked
                })}
                className="mr-2"
              />
              <span className="text-sm text-orange-600">Overwrite existing data</span>
            </label>
          </div>
        </div>
        
        {/* File Upload */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <input
            type="file"
            accept=".json"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) handleImport(file);
            }}
            className="hidden"
            id="backup-upload"
            disabled={importing}
          />
          
          <label
            htmlFor="backup-upload"
            className={`cursor-pointer ${importing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <FaUpload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-lg font-medium text-gray-700">
              {importing ? 'Importing...' : 'Choose backup file'}
            </p>
            <p className="text-sm text-gray-500">
              Drag and drop or click to select a JSON backup file
            </p>
          </label>
        </div>
        
        {importing && (
          <div className="mt-4 flex items-center gap-2 text-purple-600">
            <LoadingSpinner size="small" />
            <span>Processing backup file...</span>
          </div>
        )}
      </div>
      
      {/* Warning */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <FaExclamationTriangle className="text-amber-600" />
          <span className="font-medium text-amber-800">Important Notes</span>
        </div>
        <ul className="text-sm text-amber-700 space-y-1">
          <li>• Backups include all your icons and settings</li>
          <li>• Large collections may take time to export/import</li>
          <li>• Always verify your backup files after creation</li>
          <li>• Imports with "overwrite existing" will replace duplicate items</li>
        </ul>
      </div>
    </div>
  );
}

export default Backup;