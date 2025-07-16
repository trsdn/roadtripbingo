class AIService {
  constructor() {
    this.status = null;
    this.preferences = null;
  }

  async initialize() {
    try {
      console.log('Initializing AI service...');
      
      // Check server-side AI status
      const statusResponse = await fetch('/api/ai/status');
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        this.status = statusData.data;
        console.log('AI status loaded:', this.status);
      } else {
        console.error('Failed to load AI status:', statusResponse.status);
      }
      
      // Load user preferences
      const prefsResponse = await fetch('/api/ai/preferences');
      if (prefsResponse.ok) {
        const prefsData = await prefsResponse.json();
        this.preferences = prefsData.data;
        console.log('AI preferences loaded:', this.preferences);
      } else {
        console.error('Failed to load AI preferences:', prefsResponse.status);
        this.preferences = {
          preferred_model: 'gpt-4o-mini',
          duplicate_detection_sensitivity: 0.8,
          suggestion_aggressiveness: 'moderate'
        };
      }
    } catch (error) {
      console.error('Failed to initialize AI service:', error);
    }
  }

  async analyzeIcon(icon) {
    if (!this.isConfigured()) {
      throw new Error('OpenAI API key not configured on server');
    }

    const model = this.preferences?.preferred_model || 'gpt-4o-mini';

    try {
      const response = await fetch('/api/ai/analyze-icon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ iconId: icon.id, model })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to analyze icon');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Icon analysis failed:', error);
      throw error;
    }
  }

  async detectDuplicates(icons) {
    if (!this.isConfigured()) {
      throw new Error('OpenAI API key not configured on server');
    }

    const model = this.preferences?.preferred_model || 'gpt-4o-mini';
    const sensitivity = this.preferences?.duplicate_detection_sensitivity || 0.8;

    try {
      const response = await fetch('/api/ai/detect-duplicates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sensitivity, model })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to detect duplicates');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Duplicate detection failed:', error);
      throw error;
    }
  }

  async suggestMissingContent(currentIcons, targetSet = 'general') {
    if (!this.isConfigured()) {
      throw new Error('OpenAI API key not configured on server');
    }

    const model = this.preferences?.preferred_model || 'gpt-4o-mini';

    try {
      const response = await fetch(`/api/ai/content-suggestions?targetSet=${targetSet}&model=${model}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get content suggestions');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Content suggestion failed:', error);
      throw error;
    }
  }

  async generateSmartSet(criteria) {
    if (!this.isConfigured()) {
      throw new Error('OpenAI API key not configured on server');
    }

    const model = this.preferences?.preferred_model || 'gpt-4o-mini';

    try {
      const response = await fetch('/api/ai/generate-set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...criteria, model })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate smart set');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Set generation failed:', error);
      throw error;
    }
  }

  isConfigured() {
    return this.status && this.status.configured;
  }

  async checkUsageLimits() {
    try {
      const response = await fetch('/api/ai/usage/check');
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Failed to check usage limits:', error);
    }
    return { within_limits: true, usage: 0, limit: 1000 };
  }

  getStatus() {
    return this.status;
  }
}

export default new AIService();