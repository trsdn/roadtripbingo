// Server-side AI Service for OpenAI integration
// This module handles AI operations on the server using environment variables

class ServerAIService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.baseURL = 'https://api.openai.com/v1/chat/completions';
    this.defaultModel = process.env.OPENAI_MODEL_DEFAULT || 'gpt-4o-mini';
    this.maxTokens = parseInt(process.env.OPENAI_MAX_TOKENS) || 1000;
    this.temperature = parseFloat(process.env.OPENAI_TEMPERATURE) || 0.3;
    this.monthlyLimit = parseInt(process.env.AI_MONTHLY_LIMIT) || 1000;
    this.costLimit = parseFloat(process.env.AI_COST_LIMIT) || 10.00;
  }

  isConfigured() {
    return !!this.apiKey && this.apiKey.startsWith('sk-');
  }

  async analyzeIcon(icon, model = null) {
    if (!this.isConfigured()) {
      throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.');
    }

    const prompt = this.buildIconAnalysisPrompt(icon);
    const selectedModel = model || this.defaultModel;

    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            {
              role: 'system',
              content: 'You are an AI assistant helping to analyze icons for a road trip bingo game. Provide accurate categorization, tags, and difficulty ratings based on how easy the object would be to spot during a car journey.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: this.maxTokens,
          temperature: this.temperature,
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const analysis = JSON.parse(data.choices[0].message.content);
      
      // Get German translation separately using 4o-mini for better reliability
      let germanName = null;
      try {
        console.log('Attempting German translation for:', analysis.name_suggestion);
        germanName = await this.translateToGerman(analysis.name_suggestion);
        console.log('German translation result:', germanName);
        
        // Ensure we have a valid translation
        if (!germanName || germanName.trim() === '') {
          console.warn('Empty German translation, using fallback');
          germanName = analysis.name_suggestion; // Fallback to English
        }
      } catch (translationError) {
        console.error('German translation failed:', translationError.message);
        console.error('Translation error details:', translationError);
        germanName = analysis.name_suggestion; // Fallback to English
      }

      return {
        icon_id: icon.id,
        category_suggestion: analysis.category_suggestion,
        tags_suggestion: JSON.stringify(analysis.tags_suggestion || []),
        difficulty_suggestion: analysis.difficulty_suggestion,
        name_suggestion: analysis.name_suggestion,
        name_suggestion_de: germanName,
        description_suggestion: analysis.description_suggestion,
        reasoning: analysis.reasoning,
        confidence_score: this.calculateConfidence(analysis),
        ai_model: selectedModel,
        analysis_date: new Date().toISOString()
      };
    } catch (error) {
      console.error('Icon analysis failed:', error);
      throw error;
    }
  }

  async analyzeBatch(icons, model = null) {
    const results = [];
    for (const icon of icons) {
      try {
        const result = await this.analyzeIcon(icon, model);
        results.push({ success: true, data: result });
      } catch (error) {
        results.push({ 
          success: false, 
          error: error.message, 
          icon_id: icon.id 
        });
      }
    }
    return results;
  }

  async detectDuplicates(icons, sensitivity = 0.8, model = null) {
    if (!this.isConfigured()) {
      throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.');
    }

    const selectedModel = model || this.defaultModel;
    const iconList = icons.map(icon => ({
      id: icon.id,
      name: icon.name,
      category: icon.category,
      tags: icon.tags
    }));

    const prompt = `Find duplicate or very similar icons with similarity threshold ${sensitivity}.
    Consider both exact matches and semantic similarities (e.g., "car" and "automobile").
    Return JSON with this structure:
    {
      "groups": [
        {
          "group_id": "unique_id",
          "similarity_score": 0.95,
          "similarity_type": "exact|semantic|visual",
          "members": [
            {"id": "icon1", "reason": "why it's in this group"},
            {"id": "icon2", "reason": "why it's in this group"}
          ]
        }
      ]
    }
    
    Icons to analyze:
    ${JSON.stringify(iconList, null, 2)}`;

    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            {
              role: 'system',
              content: 'You are an AI assistant helping to identify duplicate or very similar icons in a road trip bingo game. Group icons that represent the same or very similar objects.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: this.maxTokens,
          temperature: 0.1,
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const duplicates = JSON.parse(data.choices[0].message.content);

      return {
        groups: duplicates.groups || [],
        total_icons_analyzed: icons.length,
        duplicates_found: duplicates.groups?.length || 0,
        ai_model: selectedModel,
        sensitivity: sensitivity,
        detected_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Duplicate detection failed:', error);
      throw error;
    }
  }

  async suggestMissingContent(icons, targetSet = 'general', model = null) {
    if (!this.isConfigured()) {
      throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.');
    }

    const selectedModel = model || this.defaultModel;
    const iconSummary = this.summarizeIconSet(icons);

    const prompt = `Analyze this icon set and suggest missing content for a balanced road trip bingo game:
    
    Current set summary:
    ${JSON.stringify(iconSummary, null, 2)}
    
    Target set type: ${targetSet}
    
    Please provide JSON with this structure:
    {
      "analysis": {
        "strengths": ["what's good about current set"],
        "gaps": ["what's missing"],
        "imbalances": ["difficulty or category imbalances"]
      },
      "suggestions": [
        {
          "type": "missing_category|difficulty_balance|thematic_gap",
          "category": "category name",
          "priority": "high|medium|low",
          "reason": "why this is needed",
          "examples": ["specific icon suggestions"]
        }
      ]
    }`;

    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            {
              role: 'system',
              content: 'You are an AI assistant helping to improve icon sets for a road trip bingo game. Suggest missing icons that would create a balanced, fun game experience.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: this.maxTokens,
          temperature: 0.7,
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const suggestions = JSON.parse(data.choices[0].message.content);

      return {
        target_set: targetSet,
        current_summary: iconSummary,
        analysis: suggestions.analysis || {},
        suggestions: suggestions.suggestions || [],
        ai_model: selectedModel,
        created_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Content suggestion failed:', error);
      throw error;
    }
  }

  async generateSmartSet(criteria, model = null) {
    if (!this.isConfigured()) {
      throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.');
    }

    const selectedModel = model || this.defaultModel;
    const theme = criteria.theme || 'General Road Trip';
    const gridSize = criteria.gridSize || 25;
    const difficultyDistribution = criteria.difficultyDistribution || 'balanced';

    const prompt = `Generate a themed icon set for a road trip bingo game:
    
    Theme: ${theme}
    Required icons: ${gridSize}
    Difficulty distribution: ${difficultyDistribution}
    
    Please provide JSON with this structure:
    {
      "set_name": "descriptive name",
      "description": "brief description of the set",
      "theme": "${theme}",
      "icons": [
        {
          "name": "icon name",
          "category": "Transport|Animals|Buildings|Nature|People|Signs|Food|Objects|Weather|Technology",
          "difficulty": 1-5,
          "description": "what to look for",
          "tags": ["tag1", "tag2"],
          "reasoning": "why this fits the theme"
        }
      ]
    }
    
    Ensure good difficulty distribution and thematic coherence.`;

    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            {
              role: 'system',
              content: 'You are an AI assistant creating balanced icon sets for a road trip bingo game. Create sets with good difficulty distribution and thematic coherence.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: this.maxTokens,
          temperature: 0.8,
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const setData = JSON.parse(data.choices[0].message.content);

      return {
        name: setData.set_name,
        description: setData.description,
        theme: setData.theme,
        icons: setData.icons || [],
        ai_model: selectedModel,
        created_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Set generation failed:', error);
      throw error;
    }
  }

  buildIconAnalysisPrompt(icon) {
    return `Analyze this icon for a road trip bingo game:
Name: ${icon.name}
Current Category: ${icon.category || 'None'}
Current Difficulty: ${icon.difficulty || 'Not set'}
Current Tags: ${icon.tags || 'None'}

Please provide the following in JSON format. ALL fields are MANDATORY and REQUIRED:
{
  "category_suggestion": "Most appropriate category (Transport, Animals, Buildings, Nature, People, Signs, Food, Objects, Weather, Technology)",
  "tags_suggestion": ["array", "of", "relevant", "tags", "max 8"],
  "difficulty_suggestion": 1-5 (1=very easy to spot, 5=very hard to spot),
  "name_suggestion": "Clear, concise name for the icon",
  "name_suggestion_de": "MANDATORY: German translation of the name. Examples: 'Airplane'→'Flugzeug', 'Car'→'Auto', 'Tree'→'Baum', 'House'→'Haus'",
  "description_suggestion": "Brief description of what to look for (max 100 chars)",
  "reasoning": "Brief explanation of your suggestions"
}

Consider:
- How common/rare the object is on roads
- How easy it is to spot while moving
- Size and visibility from a car

IMPORTANT: You MUST provide a German translation in the "name_suggestion_de" field. Do not leave it empty or null.

Examples of good German translations:
- "Car" → "Auto"
- "Truck" → "Lastwagen" 
- "Bridge" → "Brücke"
- "Gas Station" → "Tankstelle"
- "Traffic Light" → "Ampel"
- "Airplane" → "Flugzeug"`;
  }

  summarizeIconSet(icons) {
    const summary = {
      total_count: icons.length,
      categories: {},
      difficulties: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      common_tags: {}
    };

    icons.forEach(icon => {
      summary.categories[icon.category] = (summary.categories[icon.category] || 0) + 1;
      if (icon.difficulty) {
        summary.difficulties[icon.difficulty]++;
      }
      
      if (icon.tags) {
        try {
          const tags = typeof icon.tags === 'string' ? JSON.parse(icon.tags) : icon.tags;
          if (Array.isArray(tags)) {
            tags.forEach(tag => {
              summary.common_tags[tag] = (summary.common_tags[tag] || 0) + 1;
            });
          }
        } catch (e) {
          // Ignore JSON parse errors
        }
      }
    });

    return summary;
  }

  calculateConfidence(analysis) {
    let confidence = 0.8;
    
    if (analysis.reasoning && analysis.reasoning.length > 50) {
      confidence += 0.1;
    }
    
    if (analysis.tags_suggestion && analysis.tags_suggestion.length >= 3) {
      confidence += 0.1;
    }
    
    return Math.min(confidence, 1.0);
  }

  async translateToGerman(englishText) {
    if (!this.isConfigured()) {
      console.error('OpenAI API key not configured for translation');
      return null;
    }

    // Simple fallback translations for common terms
    const simpleTranslations = {
      'car': 'Auto',
      'truck': 'Lastwagen',
      'airplane': 'Flugzeug',
      'bridge': 'Brücke',
      'gas station': 'Tankstelle',
      'traffic light': 'Ampel',
      'tree': 'Baum',
      'house': 'Haus',
      'recreational vehicle': 'Wohnmobil',
      'rv': 'Wohnmobil',
      'motorhome': 'Wohnmobil'
    };

    const lowerText = englishText.toLowerCase();
    if (simpleTranslations[lowerText]) {
      console.log('Using simple translation for:', englishText, '->', simpleTranslations[lowerText]);
      return simpleTranslations[lowerText];
    }

    try {
      console.log('Calling OpenAI API for translation of:', englishText);
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a German translator. Translate the given English text to German. Respond with only the German translation, no explanation or quotes.'
            },
            {
              role: 'user',
              content: `Translate this to German: "${englishText}"`
            }
          ],
          max_tokens: 50,
          temperature: 0.1
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`Translation API error: ${response.status} ${response.statusText}`, errorData);
        return null;
      }

      const data = await response.json();
      const translation = data.choices[0].message.content.trim();
      console.log('OpenAI translation result:', englishText, '->', translation);
      return translation;
    } catch (error) {
      console.error('German translation failed:', error.message);
      return null;
    }
  }

  getStatus() {
    return {
      configured: this.isConfigured(),
      default_model: this.defaultModel,
      monthly_limit: this.monthlyLimit,
      cost_limit: this.costLimit
    };
  }
}

module.exports = ServerAIService;