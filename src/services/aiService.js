/**
 * AI Integration Service
 * Provides AI-powered features for icon management
 */

const aiService = {
  /**
   * Analyze an image and suggest metadata
   * @param {string} imageData - Base64 encoded image data
   * @returns {Promise<Object>} Analysis results with suggestions
   */
  async analyzeIcon(imageData) {
    try {
      // For now, we'll use a mock AI service
      // In production, this would connect to OpenAI Vision API or similar
      const analysis = await this.mockAnalyzeImage(imageData);
      
      return {
        success: true,
        suggestions: {
          name: analysis.suggestedName,
          tags: analysis.suggestedTags,
          difficulty: analysis.suggestedDifficulty,
          description: analysis.description,
          confidence: analysis.confidence
        }
      };
    } catch (error) {
      console.error('AI analysis failed:', error);
      return {
        success: false,
        error: error.message,
        suggestions: null
      };
    }
  },

  /**
   * Generate icon name suggestions based on image content
   * @param {string} imageData - Base64 encoded image data
   * @returns {Promise<Array<string>>} Array of suggested names
   */
  async generateNameSuggestions(imageData) {
    try {
      const analysis = await this.analyzeIcon(imageData);
      if (analysis.success) {
        return [
          analysis.suggestions.name,
          ...this.generateVariations(analysis.suggestions.name)
        ].slice(0, 5);
      }
      return [];
    } catch (error) {
      console.error('Name generation failed:', error);
      return [];
    }
  },

  /**
   * Generate tag suggestions based on image content
   * @param {string} imageData - Base64 encoded image data
   * @returns {Promise<Array<string>>} Array of suggested tags
   */
  async generateTagSuggestions(imageData) {
    try {
      const analysis = await this.analyzeIcon(imageData);
      if (analysis.success) {
        return analysis.suggestions.tags;
      }
      return [];
    } catch (error) {
      console.error('Tag generation failed:', error);
      return [];
    }
  },

  /**
   * Suggest difficulty level based on image complexity
   * @param {string} imageData - Base64 encoded image data
   * @returns {Promise<number>} Suggested difficulty (1-3)
   */
  async suggestDifficulty(imageData) {
    try {
      const analysis = await this.analyzeIcon(imageData);
      if (analysis.success) {
        return analysis.suggestions.difficulty;
      }
      return 2; // Default to medium
    } catch (error) {
      console.error('Difficulty suggestion failed:', error);
      return 2;
    }
  },

  /**
   * Mock AI analysis for development
   * In production, this would be replaced with actual AI API calls
   */
  async mockAnalyzeImage(imageData) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Extract some basic info from the image data
    const isLarge = imageData.length > 100000;
    const mimeType = this.extractMimeType(imageData);
    
    // Generate mock suggestions based on simple heuristics
    const commonObjects = [
      'car', 'truck', 'motorcycle', 'bicycle', 'traffic light', 'stop sign',
      'tree', 'mountain', 'building', 'bridge', 'road', 'highway',
      'gas station', 'restaurant', 'hotel', 'church', 'school',
      'animal', 'bird', 'dog', 'cat', 'cow', 'horse',
      'sign', 'billboard', 'flag', 'landmark', 'statue'
    ];

    const roadTripTags = [
      'transportation', 'vehicle', 'landmark', 'nature', 'building',
      'sign', 'food', 'accommodation', 'scenic', 'urban', 'rural',
      'highway', 'roadside', 'tourist attraction'
    ];

    // Random selection for demo purposes
    const suggestedName = commonObjects[Math.floor(Math.random() * commonObjects.length)];
    const suggestedTags = this.shuffleArray(roadTripTags).slice(0, 3 + Math.floor(Math.random() * 3));
    const suggestedDifficulty = Math.ceil(Math.random() * 3);

    return {
      suggestedName,
      suggestedTags,
      suggestedDifficulty,
      description: `Detected a ${suggestedName} in the image. This appears to be a road trip-related item.`,
      confidence: 0.7 + Math.random() * 0.3,
      imageInfo: {
        mimeType,
        size: imageData.length,
        isLarge
      }
    };
  },

  /**
   * Extract MIME type from base64 data URI
   */
  extractMimeType(dataUri) {
    const match = dataUri.match(/^data:([^;]+);/);
    return match ? match[1] : 'image/unknown';
  },

  /**
   * Generate name variations
   */
  generateVariations(baseName) {
    const variations = [];
    
    // Add plural/singular forms
    if (baseName.endsWith('s')) {
      variations.push(baseName.slice(0, -1));
    } else {
      variations.push(baseName + 's');
    }
    
    // Add descriptive variations
    const descriptors = ['big', 'small', 'red', 'blue', 'old', 'new', 'classic'];
    const randomDescriptor = descriptors[Math.floor(Math.random() * descriptors.length)];
    variations.push(`${randomDescriptor} ${baseName}`);
    
    // Add location-based variations
    const locations = ['roadside', 'highway', 'urban', 'rural'];
    const randomLocation = locations[Math.floor(Math.random() * locations.length)];
    variations.push(`${randomLocation} ${baseName}`);
    
    return variations.slice(0, 3);
  },

  /**
   * Shuffle array helper
   */
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },

  /**
   * Enhanced icon search with AI-powered semantic matching
   * @param {Array} icons - Array of all icons
   * @param {string} query - Search query
   * @returns {Promise<Array>} Filtered and ranked icons
   */
  async enhancedSearch(icons, query) {
    try {
      if (!query || query.trim().length === 0) {
        return icons;
      }

      const lowerQuery = query.toLowerCase().trim();
      const results = [];

      for (const icon of icons) {
        let score = 0;
        
        // Exact name match
        if (icon.name.toLowerCase() === lowerQuery) {
          score += 100;
        } else if (icon.name.toLowerCase().includes(lowerQuery)) {
          score += 50;
        }
        
        // Tag matches
        if (icon.tags && Array.isArray(icon.tags)) {
          for (const tag of icon.tags) {
            if (tag.toLowerCase() === lowerQuery) {
              score += 30;
            } else if (tag.toLowerCase().includes(lowerQuery)) {
              score += 15;
            }
          }
        }
        
        // Semantic similarity (mock implementation)
        score += this.calculateSemanticSimilarity(icon.name, lowerQuery);
        
        if (score > 0) {
          results.push({ ...icon, searchScore: score });
        }
      }

      // Sort by score descending
      return results
        .sort((a, b) => b.searchScore - a.searchScore)
        .map(result => ({ ...result, searchScore: undefined }));
        
    } catch (error) {
      console.error('Enhanced search failed:', error);
      return icons.filter(icon => 
        icon.name.toLowerCase().includes(query.toLowerCase())
      );
    }
  },

  /**
   * Calculate semantic similarity between terms (mock implementation)
   */
  calculateSemanticSimilarity(term1, term2) {
    // This is a very basic similarity check
    // In production, you'd use proper semantic similarity algorithms
    const synonyms = {
      'car': ['vehicle', 'auto', 'automobile', 'sedan'],
      'truck': ['vehicle', 'lorry', 'pickup'],
      'building': ['structure', 'architecture', 'construction'],
      'tree': ['plant', 'vegetation', 'foliage'],
      'sign': ['signage', 'marker', 'indicator']
    };

    for (const [key, values] of Object.entries(synonyms)) {
      if (term1.includes(key) && values.some(v => term2.includes(v))) {
        return 20;
      }
      if (term2.includes(key) && values.some(v => term1.includes(v))) {
        return 20;
      }
    }

    return 0;
  },

  /**
   * Generate alternative icon suggestions for bingo cards
   * @param {Array} currentIcons - Currently selected icons
   * @param {Array} allIcons - All available icons
   * @returns {Promise<Array>} Suggested alternative icons
   */
  async suggestAlternatives(currentIcons, allIcons) {
    try {
      // Group current icons by tags and difficulty
      const currentTags = new Set();
      const difficultyCount = { 1: 0, 2: 0, 3: 0 };
      
      currentIcons.forEach(icon => {
        if (icon.tags) {
          icon.tags.forEach(tag => currentTags.add(tag));
        }
        difficultyCount[icon.difficulty || 2]++;
      });
      
      // Find icons that complement the current selection
      const alternatives = allIcons.filter(icon => {
        // Don't suggest already selected icons
        if (currentIcons.some(current => current.id === icon.id)) {
          return false;
        }
        
        // Prefer icons with similar or complementary tags
        if (icon.tags) {
          const hasCommonTag = icon.tags.some(tag => currentTags.has(tag));
          if (hasCommonTag) return true;
        }
        
        // Prefer balanced difficulty distribution
        const iconDifficulty = icon.difficulty || 2;
        const minCount = Math.min(...Object.values(difficultyCount));
        if (difficultyCount[iconDifficulty] === minCount) {
          return true;
        }
        
        return false;
      });
      
      // Return top 6 suggestions, shuffled for variety
      return this.shuffleArray(alternatives).slice(0, 6);
      
    } catch (error) {
      console.error('Alternative suggestions failed:', error);
      return allIcons.slice(0, 6);
    }
  },

  /**
   * Check if AI features are available
   */
  isAvailable() {
    // In production, check for API keys and connectivity
    return true;
  },

  /**
   * Get AI service status
   */
  getStatus() {
    return {
      available: this.isAvailable(),
      features: [
        'Icon Analysis',
        'Name Suggestions',
        'Tag Generation', 
        'Difficulty Assessment',
        'Enhanced Search',
        'Alternative Suggestions'
      ],
      version: '1.0.0',
      provider: 'Mock AI Service'
    };
  }
};

export default aiService;