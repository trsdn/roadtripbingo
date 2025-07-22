import React, { useState } from 'react';
import { IoMdClose } from 'react-icons/io';
import { FaUpload, FaTags } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import { compressImage, validateImageFile } from '../services/imageUtils';
import AiSuggestionsPanel from './AiSuggestionsPanel';

function IconUploadModal({ onClose, onUpload }) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    difficulty: 1,
    tags: []
  });
  const [newTag, setNewTag] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState(null);
  const [error, setError] = useState('');
  
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    setError('');
    
    if (file) {
      // Validate file
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        setError(validation.errors.join(', '));
        return;
      }
      
      try {
        // Compress image
        const compressed = await compressImage(file, {
          maxWidth: 400,
          maxHeight: 400,
          quality: 0.8
        });
        
        setImageFile(file);
        setImagePreview(compressed.data);
        setCompressionInfo(compressed);
      } catch (error) {
        setError(`Image processing failed: ${error.message}`);
      }
    }
  };
  
  const handleAiSuggestion = (type, value) => {
    switch (type) {
      case 'name':
        setFormData(prev => ({ ...prev, name: value }));
        break;
      case 'difficulty':
        setFormData(prev => ({ ...prev, difficulty: value }));
        break;
      case 'tag':
        if (!formData.tags.includes(value)) {
          setFormData(prev => ({ 
            ...prev, 
            tags: [...prev.tags, value] 
          }));
        }
        break;
      case 'tags':
        setFormData(prev => ({ 
          ...prev, 
          tags: [...new Set([...prev.tags, ...value])] 
        }));
        break;
    }
  };

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
    if (!imageFile || !formData.name) return;
    
    setUploading(true);
    try {
      await onUpload({
        ...formData,
        data: imagePreview,
        tags: formData.tags.filter(tag => tag.trim())
      });
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{t('uploadIcon')}</h3>
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
              {t('iconName')}
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
              placeholder="Enter icon name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image File
            </label>
            <input
              type="file"
              accept="image/*"
              required
              onChange={handleImageChange}
              className="input"
            />
          </div>
          
          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}
          
          {imagePreview && (
            <div className="space-y-2">
              <div className="flex justify-center">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-20 h-20 object-contain border rounded"
                />
              </div>
              {compressionInfo && (
                <div className="text-sm text-gray-600 text-center">
                  {compressionInfo.width}×{compressionInfo.height} • 
                  {compressionInfo.compressionRatio > 0 
                    ? ` ${compressionInfo.compressionRatio}% smaller` 
                    : ' No compression needed'
                  }
                </div>
              )}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('difficulty')}
            </label>
            <select
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: parseInt(e.target.value) })}
              className="input"
            >
              <option value={1}>Easy</option>
              <option value={2}>Medium</option>
              <option value={3}>Hard</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="input flex-1"
                placeholder="Add a tag"
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
          
          {/* AI Suggestions Panel */}
          <AiSuggestionsPanel 
            imageData={imagePreview} 
            onApplySuggestion={handleAiSuggestion}
            className="mt-4"
          />
          
          <div className="flex gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-outline justify-center"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={uploading || !imageFile || !formData.name}
              className="flex-1 btn-primary justify-center disabled:opacity-50"
            >
              <FaUpload />
              {uploading ? 'Uploading...' : t('uploadIcon')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default IconUploadModal;