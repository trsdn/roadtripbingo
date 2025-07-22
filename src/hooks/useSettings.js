import { useState, useEffect } from 'react';
import settingsService from '../services/settingsService';
import { useNotifications } from '../components/NotificationContainer';

export function useSettings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showError, showSuccess } = useNotifications();
  
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await settingsService.getAll();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      showError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };
  
  const updateSetting = async (key, value) => {
    try {
      setSaving(true);
      await settingsService.set(key, value);
      setSettings(prev => ({ ...prev, [key]: value }));
      showSuccess(`Setting "${key}" updated`);
    } catch (error) {
      console.error('Error updating setting:', error);
      showError(`Failed to update setting "${key}"`);
    } finally {
      setSaving(false);
    }
  };
  
  const updateSettings = async (newSettings) => {
    try {
      setSaving(true);
      await settingsService.setBatch(newSettings);
      setSettings(prev => ({ ...prev, ...newSettings }));
      showSuccess('Settings updated successfully');
    } catch (error) {
      console.error('Error updating settings:', error);
      showError('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };
  
  const resetSettings = async () => {
    try {
      setSaving(true);
      // Delete all settings to restore defaults
      const keys = Object.keys(settings);
      await Promise.all(keys.map(key => settingsService.delete(key)));
      await fetchSettings(); // Reload to get defaults
      showSuccess('Settings reset to defaults');
    } catch (error) {
      console.error('Error resetting settings:', error);
      showError('Failed to reset settings');
    } finally {
      setSaving(false);
    }
  };
  
  useEffect(() => {
    fetchSettings();
  }, []);
  
  return {
    settings,
    loading,
    saving,
    updateSetting,
    updateSettings,
    resetSettings,
    refetch: fetchSettings,
  };
}

export function useGeneratorSettings() {
  const [settings, setSettings] = useState({
    gridSize: 5,
    centerBlank: true,
    showLabels: true,
    multiHitMode: false,
    multiHitDifficulty: 2,
    sameCard: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showError, showSuccess } = useNotifications();
  
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await settingsService.getGeneratorDefaults();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching generator settings:', error);
      showError('Failed to load generator settings');
    } finally {
      setLoading(false);
    }
  };
  
  const saveSettings = async (newSettings) => {
    try {
      setSaving(true);
      await settingsService.saveGeneratorDefaults(newSettings);
      setSettings(newSettings);
      showSuccess('Generator settings saved');
    } catch (error) {
      console.error('Error saving generator settings:', error);
      showError('Failed to save generator settings');
    } finally {
      setSaving(false);
    }
  };
  
  useEffect(() => {
    fetchSettings();
  }, []);
  
  return {
    settings,
    loading,
    saving,
    updateSettings: setSettings,
    saveSettings,
  };
}