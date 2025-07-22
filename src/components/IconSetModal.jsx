import React, { useState } from 'react';
import { IoMdClose } from 'react-icons/io';
import { FaSave } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';

const PRESET_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F97316', // Orange
  '#6366F1', // Indigo
  '#84CC16', // Lime
];

function IconSetModal({ iconSet, onClose, onSave }) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: iconSet?.name || '',
    description: iconSet?.description || '',
    color: iconSet?.color || '#3B82F6',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    setSaving(true);
    try {
      await onSave(formData);
      onClose();
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
          <h3 className="text-lg font-semibold">
            {iconSet ? t('editIconSet') : t('createIconSet')}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <IoMdClose className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('iconSetName')}
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
              placeholder="e.g., Vehicles, Animals, Buildings"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('iconSetDescription')}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input"
              rows={3}
              placeholder="Optional description for this icon set"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('iconSetColor')}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-12 h-12 border border-gray-300 rounded cursor-pointer"
              />
              <div className="flex gap-1">
                {PRESET_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className="w-8 h-8 rounded border-2"
                    style={{ 
                      backgroundColor: color,
                      borderColor: formData.color === color ? color : 'transparent'
                    }}
                  />
                ))}
              </div>
            </div>
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
              disabled={saving || !formData.name.trim()}
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

export default IconSetModal;