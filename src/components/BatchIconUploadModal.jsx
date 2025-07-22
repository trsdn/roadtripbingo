import React, { useState } from 'react';
import { IoMdClose } from 'react-icons/io';
import { FaUpload, FaTags, FaRobot } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import { useNotifications } from './NotificationContainer';
import DragDropUpload from './DragDropUpload';
import AiSuggestionsPanel from './AiSuggestionsPanel';
import LoadingSpinner from './LoadingSpinner';
import aiService from '../services/aiService';

function BatchIconUploadModal({ onClose, onUpload }) {
  const { t } = useLanguage();
  const { showSuccess, showError, showWarning } = useNotifications();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [useAiSuggestions, setUseAiSuggestions] = useState(true);

  const handleFilesSelected = async (files) => {
    setSelectedFiles(files);
    
    // If AI suggestions are enabled, get suggestions for each file
    if (useAiSuggestions && aiService.isAvailable()) {
      const updatedFiles = [];
      
      for (const file of files) {
        try {
          const analysis = await aiService.analyzeIcon(file.data);
          if (analysis.success) {
            updatedFiles.push({
              ...file,
              name: analysis.suggestions.name || file.name,
              difficulty: analysis.suggestions.difficulty || file.difficulty,
              tags: analysis.suggestions.tags || file.tags,
              aiSuggestions: analysis.suggestions
            });
          } else {
            updatedFiles.push(file);
          }
        } catch (error) {
          console.warn('AI analysis failed for', file.name, error);
          updatedFiles.push(file);
        }
      }
      
      setSelectedFiles(updatedFiles);
    }
  };

  const updateFileData = (index, field, value) => {
    setSelectedFiles(prev => 
      prev.map((file, i) => 
        i === index ? { ...file, [field]: value } : file
      )
    );
  };

  const addTagToFile = (index, tag) => {
    const file = selectedFiles[index];
    if (!file.tags.includes(tag)) {
      updateFileData(index, 'tags', [...file.tags, tag]);
    }
  };

  const removeTagFromFile = (index, tagToRemove) => {
    updateFileData(index, 'tags', 
      selectedFiles[index].tags.filter(tag => tag !== tagToRemove)
    );
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const applyAiSuggestionsToFile = (index, suggestions) => {
    const updates = {};
    if (suggestions.name) updates.name = suggestions.name;
    if (suggestions.difficulty) updates.difficulty = suggestions.difficulty;
    if (suggestions.tags) updates.tags = [...new Set([...selectedFiles[index].tags, ...suggestions.tags])];
    
    setSelectedFiles(prev => 
      prev.map((file, i) => 
        i === index ? { ...file, ...updates } : file
      )
    );
  };

  const handleUploadAll = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    const results = { success: 0, failed: 0, errors: [] };

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      
      try {
        setUploadProgress(prev => ({ 
          ...prev, 
          [i]: { status: 'uploading', progress: 0 } 
        }));

        await onUpload({
          name: file.name,
          data: file.data,
          difficulty: file.difficulty,
          tags: file.tags.filter(tag => tag.trim())
        });

        setUploadProgress(prev => ({ 
          ...prev, 
          [i]: { status: 'complete', progress: 100 } 
        }));

        results.success++;
      } catch (error) {
        console.error('Upload error for', file.name, error);
        setUploadProgress(prev => ({ 
          ...prev, 
          [i]: { status: 'error', progress: 100, error: error.message } 
        }));
        results.failed++;
        results.errors.push(`${file.name}: ${error.message}`);
      }
    }

    setUploading(false);

    // Show results
    if (results.success > 0 && results.failed === 0) {
      showSuccess(`Successfully uploaded ${results.success} icons!`);
      setTimeout(() => onClose(), 1500);
    } else if (results.success > 0 && results.failed > 0) {
      showWarning(`Uploaded ${results.success} icons, ${results.failed} failed.`);
    } else {
      showError(`Failed to upload icons. ${results.errors[0] || 'Unknown error'}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold">Batch Icon Upload</h3>
            {aiService.isAvailable() && (
              <button
                onClick={() => setUseAiSuggestions(!useAiSuggestions)}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs border ${
                  useAiSuggestions
                    ? 'bg-green-100 text-green-700 border-green-300'
                    : 'bg-gray-100 text-gray-600 border-gray-300'
                }`}
                title="Enable AI suggestions for uploaded images"
              >
                <FaRobot className="w-3 h-3" />
                AI Suggestions
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={uploading}
          >
            <IoMdClose className="w-6 h-6" />
          </button>
        </div>

        {/* Drag and Drop Upload */}
        <DragDropUpload
          onFilesSelected={handleFilesSelected}
          maxFiles={10}
          disabled={uploading}
          multiple={true}
          className="mb-6"
        />

        {/* Selected Files for Review */}
        {selectedFiles.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold">
                Review and Edit ({selectedFiles.length} files)
              </h4>
              <button
                onClick={handleUploadAll}
                disabled={uploading || selectedFiles.length === 0}
                className="btn-primary disabled:opacity-50"
              >
                <FaUpload />
                {uploading ? 'Uploading...' : `Upload All (${selectedFiles.length})`}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {selectedFiles.map((file, index) => (
                <div 
                  key={index} 
                  className={`border rounded-lg p-4 ${
                    uploadProgress[index]?.status === 'complete' ? 'bg-green-50 border-green-200' :
                    uploadProgress[index]?.status === 'error' ? 'bg-red-50 border-red-200' :
                    uploadProgress[index]?.status === 'uploading' ? 'bg-blue-50 border-blue-200' :
                    'bg-white border-gray-200'
                  }`}
                >
                  {/* Upload Progress */}
                  {uploadProgress[index] && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium capitalize">
                          {uploadProgress[index].status}
                        </span>
                        {uploadProgress[index].status === 'uploading' && (
                          <LoadingSpinner size="small" />
                        )}
                      </div>
                      {uploadProgress[index].status === 'error' && (
                        <div className="text-sm text-red-600">
                          {uploadProgress[index].error}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Image Preview */}
                    <div className="space-y-2">
                      <img
                        src={file.data}
                        alt={file.name}
                        className="w-full h-32 object-contain bg-gray-50 rounded border"
                      />
                      <button
                        onClick={() => removeFile(index)}
                        className="w-full text-sm text-red-600 hover:text-red-800 underline"
                        disabled={uploading}
                      >
                        Remove
                      </button>
                    </div>

                    {/* Form Fields */}
                    <div className="md:col-span-2 space-y-4">
                      {/* Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Icon Name
                        </label>
                        <input
                          type="text"
                          value={file.name}
                          onChange={(e) => updateFileData(index, 'name', e.target.value)}
                          className="input"
                          disabled={uploading}
                        />
                      </div>

                      {/* Difficulty */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Difficulty
                        </label>
                        <select
                          value={file.difficulty}
                          onChange={(e) => updateFileData(index, 'difficulty', parseInt(e.target.value))}
                          className="input"
                          disabled={uploading}
                        >
                          <option value={1}>Easy</option>
                          <option value={2}>Medium</option>
                          <option value={3}>Hard</option>
                        </select>
                      </div>

                      {/* Tags */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tags
                        </label>
                        {file.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {file.tags.map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                              >
                                {tag}
                                <button
                                  onClick={() => removeTagFromFile(index, tag)}
                                  className="text-blue-600 hover:text-blue-800"
                                  disabled={uploading}
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        )}

                        {/* AI Suggestions */}
                        {file.aiSuggestions && (
                          <div className="mt-2 p-2 bg-green-50 rounded text-xs">
                            <div className="font-medium text-green-800 mb-1">AI Suggestions:</div>
                            <div className="flex flex-wrap gap-1">
                              {file.aiSuggestions.tags?.slice(0, 3).map((tag, tagIndex) => (
                                <button
                                  key={tagIndex}
                                  onClick={() => addTagToFile(index, tag)}
                                  className="px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                                  disabled={uploading || file.tags.includes(tag)}
                                >
                                  {file.tags.includes(tag) ? '✓' : '+'} {tag}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 mt-6 pt-4 border-t">
          <button
            onClick={onClose}
            className="flex-1 btn-outline justify-center"
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Cancel'}
          </button>
          {selectedFiles.length > 0 && (
            <button
              onClick={handleUploadAll}
              disabled={uploading}
              className="flex-1 btn-primary justify-center"
            >
              <FaUpload />
              {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} Icons`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default BatchIconUploadModal;