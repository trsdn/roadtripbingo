// Tests for the server-side AI service (OpenAI-compatible chat + image generation)

const ServerAIService = require('../../../src/js/modules/serverAIService');

describe('ServerAIService', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    delete process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_BASE_URL;
    delete process.env.OPENAI_MODEL_DEFAULT;
    delete process.env.OPENAI_IMAGE_API_KEY;
    delete process.env.OPENAI_IMAGE_BASE_URL;
    delete process.env.OPENAI_IMAGE_MODEL;
    global.fetch = jest.fn();
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  function mockChatResponse(content) {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: JSON.stringify(content) } }]
      })
    });
  }

  describe('configuration', () => {
    it('is not configured without an API key', () => {
      const service = new ServerAIService();
      expect(service.isConfigured()).toBe(false);
    });

    it('accepts API keys without the sk- prefix (OpenAI-compatible proxies)', () => {
      process.env.OPENAI_API_KEY = 'copilot-wrapper-dummy';
      const service = new ServerAIService();
      expect(service.isConfigured()).toBe(true);
    });

    it('defaults to gpt-5.4 and the OpenAI base URL', () => {
      process.env.OPENAI_API_KEY = 'key';
      const service = new ServerAIService();
      expect(service.defaultModel).toBe('gpt-5.4');
      expect(service.baseURL).toBe('https://api.openai.com/v1');
    });

    it('uses OPENAI_BASE_URL and strips trailing slashes', () => {
      process.env.OPENAI_API_KEY = 'key';
      process.env.OPENAI_BASE_URL = 'http://192.168.2.177:8080/v1/';
      const service = new ServerAIService();
      expect(service.baseURL).toBe('http://192.168.2.177:8080/v1');
    });

    it('reports image configuration separately', () => {
      process.env.OPENAI_API_KEY = 'key';
      const service = new ServerAIService();
      expect(service.isImageConfigured()).toBe(false);

      process.env.OPENAI_IMAGE_API_KEY = 'sk-real';
      const withImages = new ServerAIService();
      expect(withImages.isImageConfigured()).toBe(true);
    });

    it('exposes status including image configuration', () => {
      process.env.OPENAI_API_KEY = 'key';
      process.env.OPENAI_IMAGE_API_KEY = 'sk-real';
      const service = new ServerAIService();
      expect(service.getStatus()).toEqual({
        configured: true,
        image_configured: true,
        default_model: 'gpt-5.4',
        image_model: 'gpt-image-1'
      });
    });
  });

  describe('chatJSON', () => {
    it('throws when not configured', async () => {
      const service = new ServerAIService();
      await expect(service.chatJSON('sys', 'user')).rejects.toThrow('not configured');
    });

    it('posts to the configured chat completions endpoint', async () => {
      process.env.OPENAI_API_KEY = 'key';
      process.env.OPENAI_BASE_URL = 'http://wrapper.local/v1';
      const service = new ServerAIService();
      mockChatResponse({ ok: true });

      const result = await service.chatJSON('sys', 'user', { model: 'gpt-5.4-mini' });

      expect(result).toEqual({ ok: true });
      const [url, options] = global.fetch.mock.calls[0];
      expect(url).toBe('http://wrapper.local/v1/chat/completions');
      const body = JSON.parse(options.body);
      expect(body.model).toBe('gpt-5.4-mini');
      expect(body.response_format).toEqual({ type: 'json_object' });
      expect(options.headers.Authorization).toBe('Bearer key');
    });

    it('throws a descriptive error on API failure', async () => {
      process.env.OPENAI_API_KEY = 'key';
      const service = new ServerAIService();
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 502,
        statusText: 'Bad Gateway',
        json: async () => ({ error: { message: 'upstream broke' } })
      });

      await expect(service.chatJSON('sys', 'user')).rejects.toThrow('upstream broke');
    });
  });

  describe('analyzeIcon', () => {
    it('maps analysis fields including the German name suggestion', async () => {
      process.env.OPENAI_API_KEY = 'key';
      const service = new ServerAIService();
      mockChatResponse({
        category_suggestion: 'Transport',
        tags_suggestion: ['car', 'road', 'vehicle'],
        difficulty_suggestion: 2,
        name_suggestion: 'Police Car',
        name_suggestion_de: 'Polizeiauto',
        description_suggestion: 'A police car with blue lights',
        reasoning: 'Police cars are common on highways and easy to recognize.'
      });

      const result = await service.analyzeIcon({ id: 'icon-1', name: 'police' });

      expect(result.icon_id).toBe('icon-1');
      expect(result.name_suggestion_de).toBe('Polizeiauto');
      expect(JSON.parse(result.tags_suggestion)).toEqual(['car', 'road', 'vehicle']);
      expect(result.ai_model).toBe('gpt-5.4');
      expect(result.confidence_score).toBeGreaterThan(0.8);
    });
  });

  describe('generateIconImage', () => {
    it('throws when image generation is not configured', async () => {
      process.env.OPENAI_API_KEY = 'key';
      const service = new ServerAIService();
      await expect(service.generateIconImage({ name: 'Cow' }))
        .rejects.toThrow('Image generation not configured');
    });

    it('throws when no name is given', async () => {
      process.env.OPENAI_IMAGE_API_KEY = 'sk-real';
      const service = new ServerAIService();
      await expect(service.generateIconImage({})).rejects.toThrow('name is required');
    });

    it('posts to the images endpoint and returns a data URL', async () => {
      process.env.OPENAI_IMAGE_API_KEY = 'sk-real';
      const service = new ServerAIService();
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [{ b64_json: 'aWNvbg==' }] })
      });

      const result = await service.generateIconImage({ name: 'Cow', style: 'outline' });

      const [url, options] = global.fetch.mock.calls[0];
      expect(url).toBe('https://api.openai.com/v1/images/generations');
      const body = JSON.parse(options.body);
      expect(body.model).toBe('gpt-image-1');
      expect(body.background).toBe('transparent');
      expect(body.prompt).toContain('Cow');
      expect(options.headers.Authorization).toBe('Bearer sk-real');
      expect(result.imageData).toBe('data:image/png;base64,aWNvbg==');
    });

    it('throws when the API returns no image data', async () => {
      process.env.OPENAI_IMAGE_API_KEY = 'sk-real';
      const service = new ServerAIService();
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] })
      });

      await expect(service.generateIconImage({ name: 'Cow' }))
        .rejects.toThrow('no image data');
    });
  });
});
