// Server-side AI Service for OpenAI-compatible chat APIs and OpenAI image generation.
// Chat requests go to OPENAI_BASE_URL (e.g. a local OpenAI-compatible proxy),
// image generation always needs a real OpenAI account (OPENAI_IMAGE_API_KEY).

class ServerAIService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.baseURL = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '');
    this.defaultModel = process.env.OPENAI_MODEL_DEFAULT || 'gpt-5.4';
    this.maxTokens = parseInt(process.env.OPENAI_MAX_TOKENS) || 1000;
    this.temperature = parseFloat(process.env.OPENAI_TEMPERATURE) || 0.3;

    // Image generation (separate credentials: must be a real OpenAI key)
    this.imageApiKey = process.env.OPENAI_IMAGE_API_KEY || '';
    this.imageBaseURL = (process.env.OPENAI_IMAGE_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '');
    this.imageModel = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1';
  }

  isConfigured() {
    return !!this.apiKey;
  }

  isImageConfigured() {
    return !!this.imageApiKey;
  }

  /**
   * Send a JSON-mode chat completion and return the parsed JSON content.
   * @param {string} systemPrompt - system message
   * @param {string} userPrompt - user message
   * @param {object} options - { model, temperature }
   * @returns {Promise<object>} parsed JSON response content
   */
  async chatJSON(systemPrompt, userPrompt, { model = null, temperature = null } = {}) {
    if (!this.isConfigured()) {
      throw new Error('AI API key not configured. Please set OPENAI_API_KEY environment variable.');
    }

    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: model || this.defaultModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: this.maxTokens,
        temperature: temperature !== null ? temperature : this.temperature,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`AI API error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  }

  async analyzeIcon(icon, model = null) {
    const selectedModel = model || this.defaultModel;
    try {
      const analysis = await this.chatJSON(
        'You are an AI assistant helping to analyze icons for a road trip bingo game. Provide accurate categorization, tags, and difficulty ratings based on how easy the object would be to spot during a car journey.',
        this.buildIconAnalysisPrompt(icon),
        { model: selectedModel }
      );

      return {
        icon_id: icon.id,
        category_suggestion: analysis.category_suggestion,
        tags_suggestion: JSON.stringify(analysis.tags_suggestion || []),
        difficulty_suggestion: analysis.difficulty_suggestion,
        name_suggestion: analysis.name_suggestion,
        name_suggestion_de: analysis.name_suggestion_de,
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
      const duplicates = await this.chatJSON(
        'You are an AI assistant helping to identify duplicate or very similar icons in a road trip bingo game. Group icons that represent the same or very similar objects.',
        prompt,
        { model: selectedModel, temperature: 0.1 }
      );

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
      const suggestions = await this.chatJSON(
        'You are an AI assistant helping to improve icon sets for a road trip bingo game. Suggest missing icons that would create a balanced, fun game experience.',
        prompt,
        { model: selectedModel, temperature: 0.7 }
      );

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
      const setData = await this.chatJSON(
        'You are an AI assistant creating balanced icon sets for a road trip bingo game. Create sets with good difficulty distribution and thematic coherence.',
        prompt,
        { model: selectedModel, temperature: 0.8 }
      );

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

  /**
   * Generate a bingo icon image via the OpenAI Images API.
   * @param {object} request - { name, description, style }
   * @returns {Promise<object>} { imageData (data URL), prompt, model }
   */
  async generateIconImage({ name, description = '', style = 'flat' } = {}) {
    if (!this.isImageConfigured()) {
      throw new Error('Image generation not configured. Please set OPENAI_IMAGE_API_KEY environment variable.');
    }
    if (!name) {
      throw new Error('Icon name is required for image generation.');
    }

    const styleHints = {
      flat: 'flat design, simple solid colors, minimal details',
      outline: 'bold outline style, line art, minimal fill',
      cartoon: 'friendly cartoon style, soft colors, kid-friendly',
      realistic: 'simplified realistic illustration, clear shapes'
    };
    const styleHint = styleHints[style] || styleHints.flat;

    const prompt = `A single pictogram of "${name}" for a children's road trip bingo card.` +
      (description ? ` ${description}.` : '') +
      ` Style: ${styleHint}. Centered single object, no text, no border, no background scenery,` +
      ' transparent background, high contrast, instantly recognizable at small print size.';

    const response = await fetch(`${this.imageBaseURL}/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.imageApiKey}`
      },
      body: JSON.stringify({
        model: this.imageModel,
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'medium',
        background: 'transparent',
        output_format: 'png'
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Image API error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const b64 = data.data?.[0]?.b64_json;
    if (!b64) {
      throw new Error('Image API returned no image data.');
    }

    return {
      imageData: `data:image/png;base64,${b64}`,
      prompt: prompt,
      model: this.imageModel,
      created_at: new Date().toISOString()
    };
  }

  buildIconAnalysisPrompt(icon) {
    return `Analyze this icon for a road trip bingo game:
Name: ${icon.name}
Current Category: ${icon.category || 'None'}
Current Difficulty: ${icon.difficulty || 'Not set'}
Current Tags: ${icon.tags || 'None'}

Please provide the following in JSON format:
{
  "category_suggestion": "Most appropriate category (Transport, Animals, Buildings, Nature, People, Signs, Food, Objects, Weather, Technology)",
  "tags_suggestion": ["array", "of", "relevant", "tags", "max 8"],
  "difficulty_suggestion": 1-5 (1=very easy to spot, 5=very hard to spot),
  "name_suggestion": "Clear, concise name for the icon",
  "name_suggestion_de": "German translation of the name",
  "description_suggestion": "Brief description of what to look for (max 100 chars)",
  "reasoning": "Brief explanation of your suggestions"
}

Consider:
- How common/rare the object is on roads
- How easy it is to spot while moving
- Size and visibility from a car
- Regional variations
- Typical road trip scenarios

For the German translation, provide a natural German term that would be appropriate for a road trip bingo game played in Germany.`;
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

  getStatus() {
    return {
      configured: this.isConfigured(),
      image_configured: this.isImageConfigured(),
      default_model: this.defaultModel,
      image_model: this.imageModel
    };
  }
}

module.exports = ServerAIService;
