import React, { useState, useEffect } from 'react';
import { FaRobot, FaLightbulb, FaSync, FaCheck, FaTimes } from 'react-icons/fa';
import LoadingSpinner from './LoadingSpinner';
import aiService from '../services/aiService';

function AiSuggestionsPanel({ imageData, onApplySuggestion, className = '' }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    name: true,
    tags: true,
    difficulty: true
  });

  useEffect(() => {
    if (imageData) {
      analyzeImage();
    }
  }, [imageData]);

  const analyzeImage = async () => {
    if (!imageData) return;
    
    setLoading(true);
    setError('');
    try {
      const result = await aiService.analyzeIcon(imageData);
      if (result.success) {
        setAnalysis(result.suggestions);
      } else {
        setError(result.error || 'Analysis failed');
      }
    } catch (error) {
      setError(`Analysis failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const applySuggestion = (type, value) => {
    onApplySuggestion(type, value);
  };

  if (!imageData) {
    return (
      <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-2 text-blue-700">
          <FaRobot className="w-5 h-5" />
          <span className="font-medium">AI Assistant</span>
        </div>
        <p className="text-sm text-blue-600 mt-2">
          Upload an image to get AI-powered suggestions for name, tags, and difficulty.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-2 text-blue-700 mb-3">
          <FaRobot className="w-5 h-5" />
          <span className="font-medium">AI Assistant</span>
        </div>
        <div className="flex items-center gap-2">
          <LoadingSpinner size="small" />
          <span className="text-sm text-blue-600">Analyzing image...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-red-700">
            <FaRobot className="w-5 h-5" />
            <span className="font-medium">AI Assistant</span>
          </div>
          <button
            onClick={analyzeImage}
            className="text-red-600 hover:text-red-800"
            title="Retry analysis"
          >
            <FaSync className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-red-600">{error}</p>
        <button
          onClick={analyzeImage}
          className="text-sm text-red-700 hover:text-red-900 mt-2 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  return (
    <div className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-green-700">
          <FaRobot className="w-5 h-5" />
          <span className="font-medium">AI Suggestions</span>
          <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">
            {Math.round(analysis.confidence * 100)}% confidence
          </span>
        </div>
        <button
          onClick={analyzeImage}
          className="text-green-600 hover:text-green-800"
          title="Refresh suggestions"
        >
          <FaSync className="w-4 h-4" />
        </button>
      </div>

      {analysis.description && (
        <div className="mb-4 p-3 bg-green-100 rounded-md">
          <p className="text-sm text-green-800">{analysis.description}</p>
        </div>
      )}

      {/* Name Suggestions */}
      <div className="mb-4">
        <button
          onClick={() => toggleSection('name')}
          className="flex items-center gap-2 w-full text-left font-medium text-green-800 mb-2 hover:text-green-900"
        >
          <FaLightbulb className="w-4 h-4" />
          <span>Suggested Name</span>
          <span className="text-xs text-green-600">({analysis.name})</span>
        </button>
        
        {expandedSections.name && (
          <div className="ml-6 space-y-2">
            <div className="flex items-center justify-between bg-white rounded-md p-2 border">
              <span className="text-sm font-medium">{analysis.name}</span>
              <button
                onClick={() => applySuggestion('name', analysis.name)}
                className="text-green-600 hover:text-green-800"
                title="Apply suggestion"
              >
                <FaCheck className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tag Suggestions */}
      <div className="mb-4">
        <button
          onClick={() => toggleSection('tags')}
          className="flex items-center gap-2 w-full text-left font-medium text-green-800 mb-2 hover:text-green-900"
        >
          <FaLightbulb className="w-4 h-4" />
          <span>Suggested Tags</span>
          <span className="text-xs text-green-600">({analysis.tags.length})</span>
        </button>
        
        {expandedSections.tags && (
          <div className="ml-6 space-y-2">
            <div className="flex flex-wrap gap-2">
              {analysis.tags.map((tag, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 bg-white rounded-full px-3 py-1 border text-sm"
                >
                  <span>{tag}</span>
                  <button
                    onClick={() => applySuggestion('tag', tag)}
                    className="text-green-600 hover:text-green-800 ml-1"
                    title="Add tag"
                  >
                    <FaCheck className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => applySuggestion('tags', analysis.tags)}
              className="text-sm text-green-700 hover:text-green-900 underline"
            >
              Apply all tags
            </button>
          </div>
        )}
      </div>

      {/* Difficulty Suggestion */}
      <div className="mb-2">
        <button
          onClick={() => toggleSection('difficulty')}
          className="flex items-center gap-2 w-full text-left font-medium text-green-800 mb-2 hover:text-green-900"
        >
          <FaLightbulb className="w-4 h-4" />
          <span>Suggested Difficulty</span>
          <span className="text-xs text-green-600">
            ({['Easy', 'Medium', 'Hard'][analysis.difficulty - 1]})
          </span>
        </button>
        
        {expandedSections.difficulty && (
          <div className="ml-6">
            <div className="flex items-center justify-between bg-white rounded-md p-2 border">
              <span className="text-sm font-medium">
                {['Easy', 'Medium', 'Hard'][analysis.difficulty - 1]} 
                <span className="text-gray-500 ml-1">
                  (Level {analysis.difficulty})
                </span>
              </span>
              <button
                onClick={() => applySuggestion('difficulty', analysis.difficulty)}
                className="text-green-600 hover:text-green-800"
                title="Apply suggestion"
              >
                <FaCheck className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AiSuggestionsPanel;