import React, { useState, useEffect, useMemo } from 'react';
import { FaSearch, FaRobot, FaTimes, FaFilter } from 'react-icons/fa';
import aiService from '../services/aiService';
import LoadingSpinner from './LoadingSpinner';
import { getTranslatedIconName } from '../utils/translationUtils';
import { useLanguage } from '../context/LanguageContext';

function IconSearch({ icons, onFilteredIcons, className = '' }) {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [useAiSearch, setUseAiSearch] = useState(false);
  const [aiSearching, setAiSearching] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    difficulty: 'all',
    tags: []
  });
  const [availableTags, setAvailableTags] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filteredCount, setFilteredCount] = useState(icons.length);

  // Update filtered count when icons change
  useEffect(() => {
    setFilteredCount(icons.length);
  }, [icons]);

  // Extract all unique tags from icons
  useEffect(() => {
    const tagSet = new Set();
    icons.forEach(icon => {
      if (icon.tags && Array.isArray(icon.tags)) {
        icon.tags.forEach(tag => tagSet.add(tag));
      }
    });
    setAvailableTags(Array.from(tagSet).sort());
  }, [icons]);

  // Enhanced search with AI integration
  useEffect(() => {
    const performSearch = async () => {
      let filtered = [...icons];

      // Text search
      if (searchQuery.trim()) {
        if (useAiSearch && aiService.isAvailable()) {
          setAiSearching(true);
          try {
            filtered = await aiService.enhancedSearch(filtered, searchQuery);
          } catch (error) {
            console.error('AI search failed, falling back to basic search:', error);
            // Fall back to basic search
            filtered = filtered.filter(icon => {
              const translatedName = getTranslatedIconName(icon, language);
              return icon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                     translatedName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                     (icon.tags && icon.tags.some(tag => 
                       tag.toLowerCase().includes(searchQuery.toLowerCase())
                     ));
            });
          }
          setAiSearching(false);
        } else {
          // Basic text search
          filtered = filtered.filter(icon => {
            const translatedName = getTranslatedIconName(icon, language);
            return icon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   translatedName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   (icon.tags && icon.tags.some(tag => 
                     tag.toLowerCase().includes(searchQuery.toLowerCase())
                   ));
          });
        }
      }

      // Difficulty filter
      if (filterOptions.difficulty !== 'all') {
        const difficulty = parseInt(filterOptions.difficulty);
        filtered = filtered.filter(icon => (icon.difficulty || 2) === difficulty);
      }

      // Tag filter
      if (filterOptions.tags.length > 0) {
        filtered = filtered.filter(icon =>
          icon.tags && filterOptions.tags.some(tag => icon.tags.includes(tag))
        );
      }

      onFilteredIcons(filtered);
      setFilteredCount(filtered.length);
    };

    performSearch();
  }, [icons, searchQuery, useAiSearch, filterOptions, onFilteredIcons]);

  const clearSearch = () => {
    setSearchQuery('');
    setFilterOptions({
      difficulty: 'all',
      tags: []
    });
  };

  const toggleTag = (tag) => {
    setFilterOptions(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const hasActiveFilters = searchQuery.trim() || 
    filterOptions.difficulty !== 'all' || 
    filterOptions.tags.length > 0;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search icons by name or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          )}
          {aiSearching && (
            <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
              <LoadingSpinner size="small" />
            </div>
          )}
        </div>

        {/* AI Search Toggle */}
        {aiService.isAvailable() && (
          <button
            onClick={() => setUseAiSearch(!useAiSearch)}
            className={`px-3 py-2 rounded-lg border transition-colors ${
              useAiSearch
                ? 'bg-green-100 text-green-700 border-green-300'
                : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
            }`}
            title="Enable AI-powered semantic search"
          >
            <FaRobot className="w-4 h-4" />
          </button>
        )}

        {/* Advanced Filters Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`px-3 py-2 rounded-lg border transition-colors ${
            showAdvanced || hasActiveFilters
              ? 'bg-blue-100 text-blue-700 border-blue-300'
              : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
          }`}
          title="Advanced filters"
        >
          <FaFilter className="w-4 h-4" />
        </button>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearSearch}
            className="px-3 py-2 bg-red-100 text-red-700 border border-red-300 rounded-lg hover:bg-red-200 transition-colors"
            title="Clear all filters"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level
              </label>
              <select
                value={filterOptions.difficulty}
                onChange={(e) => setFilterOptions(prev => ({ 
                  ...prev, 
                  difficulty: e.target.value 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Difficulties</option>
                <option value="1">Easy</option>
                <option value="2">Medium</option>
                <option value="3">Hard</option>
              </select>
            </div>

            {/* Tag Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags ({filterOptions.tags.length} selected)
              </label>
              <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-lg bg-white">
                {availableTags.length === 0 ? (
                  <div className="p-3 text-gray-500 text-sm">No tags available</div>
                ) : (
                  <div className="p-2 space-y-1">
                    {availableTags.map(tag => (
                      <label key={tag} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filterOptions.tags.includes(tag)}
                          onChange={() => toggleTag(tag)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">{tag}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Selected Tags Display */}
          {filterOptions.tags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selected Tags:
              </label>
              <div className="flex flex-wrap gap-2">
                {filterOptions.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      onClick={() => toggleTag(tag)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search Status */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-4">
          {useAiSearch && aiService.isAvailable() && (
            <div className="flex items-center gap-1 text-green-600">
              <FaRobot className="w-3 h-3" />
              <span>AI Enhanced</span>
            </div>
          )}
          {hasActiveFilters && (
            <div className="text-blue-600">
              Filters applied
            </div>
          )}
        </div>
        
        <div>
          <span className="font-medium">{filteredCount}</span> of {icons.length} icons
        </div>
      </div>
    </div>
  );
}

export default IconSearch;