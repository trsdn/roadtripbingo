import { describe, it, expect, beforeEach, vi } from 'vitest';
import aiService from '../../../src/services/aiService';

describe('AI Service', () => {
  beforeEach(() => {
    // Reset any mocks before each test
    vi.clearAllMocks();
  });

  describe('Service Status', () => {
    it('should be available', () => {
      expect(aiService.isAvailable()).toBe(true);
    });

    it('should return service status', () => {
      const status = aiService.getStatus();
      
      expect(status).toHaveProperty('available', true);
      expect(status).toHaveProperty('features');
      expect(status).toHaveProperty('version');
      expect(status).toHaveProperty('provider');
      
      expect(Array.isArray(status.features)).toBe(true);
      expect(status.features.length).toBeGreaterThan(0);
    });
  });

  describe('Image Analysis', () => {
    const mockImageData = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/wAALCAACAAIDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

    it('should analyze icon and return suggestions', async () => {
      const result = await aiService.analyzeIcon(mockImageData);
      
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('suggestions');
      
      if (result.success) {
        expect(result.suggestions).toHaveProperty('name');
        expect(result.suggestions).toHaveProperty('tags');
        expect(result.suggestions).toHaveProperty('difficulty');
        expect(result.suggestions).toHaveProperty('description');
        expect(result.suggestions).toHaveProperty('confidence');
        
        expect(typeof result.suggestions.name).toBe('string');
        expect(Array.isArray(result.suggestions.tags)).toBe(true);
        expect(typeof result.suggestions.difficulty).toBe('number');
        expect(result.suggestions.difficulty).toBeGreaterThanOrEqual(1);
        expect(result.suggestions.difficulty).toBeLessThanOrEqual(3);
      }
    });

    it('should generate name suggestions', async () => {
      const suggestions = await aiService.generateNameSuggestions(mockImageData);
      
      expect(Array.isArray(suggestions)).toBe(true);
      suggestions.forEach(suggestion => {
        expect(typeof suggestion).toBe('string');
        expect(suggestion.length).toBeGreaterThan(0);
      });
    });

    it('should generate tag suggestions', async () => {
      const tags = await aiService.generateTagSuggestions(mockImageData);
      
      expect(Array.isArray(tags)).toBe(true);
      tags.forEach(tag => {
        expect(typeof tag).toBe('string');
        expect(tag.length).toBeGreaterThan(0);
      });
    });

    it('should suggest difficulty level', async () => {
      const difficulty = await aiService.suggestDifficulty(mockImageData);
      
      expect(typeof difficulty).toBe('number');
      expect(difficulty).toBeGreaterThanOrEqual(1);
      expect(difficulty).toBeLessThanOrEqual(3);
    });
  });

  describe('Enhanced Search', () => {
    const mockIcons = [
      { id: 1, name: 'car', tags: ['vehicle', 'transportation'], difficulty: 2 },
      { id: 2, name: 'truck', tags: ['vehicle', 'transportation'], difficulty: 2 },
      { id: 3, name: 'tree', tags: ['nature', 'plant'], difficulty: 1 },
      { id: 4, name: 'building', tags: ['architecture', 'structure'], difficulty: 3 },
      { id: 5, name: 'automobile', tags: ['vehicle', 'car'], difficulty: 2 }
    ];

    it('should return all icons for empty query', async () => {
      const results = await aiService.enhancedSearch(mockIcons, '');
      expect(results).toEqual(mockIcons);
    });

    it('should find exact name matches', async () => {
      const results = await aiService.enhancedSearch(mockIcons, 'car');
      
      expect(results.length).toBeGreaterThan(0);
      const carIcon = results.find(icon => icon.name === 'car');
      expect(carIcon).toBeDefined();
    });

    it('should find partial name matches', async () => {
      const results = await aiService.enhancedSearch(mockIcons, 'tru');
      
      expect(results.length).toBeGreaterThan(0);
      const truckIcon = results.find(icon => icon.name === 'truck');
      expect(truckIcon).toBeDefined();
    });

    it('should find tag matches', async () => {
      const results = await aiService.enhancedSearch(mockIcons, 'vehicle');
      
      expect(results.length).toBeGreaterThan(0);
      results.forEach(result => {
        expect(result.tags).toContain('vehicle');
      });
    });

    it('should handle case insensitive search', async () => {
      const results = await aiService.enhancedSearch(mockIcons, 'CAR');
      
      expect(results.length).toBeGreaterThan(0);
      const carIcon = results.find(icon => icon.name === 'car');
      expect(carIcon).toBeDefined();
    });
  });

  describe('Alternative Suggestions', () => {
    const mockAllIcons = [
      { id: 1, name: 'car', tags: ['vehicle', 'transportation'], difficulty: 2 },
      { id: 2, name: 'truck', tags: ['vehicle', 'transportation'], difficulty: 2 },
      { id: 3, name: 'tree', tags: ['nature', 'plant'], difficulty: 1 },
      { id: 4, name: 'building', tags: ['architecture', 'structure'], difficulty: 3 },
      { id: 5, name: 'mountain', tags: ['nature', 'landscape'], difficulty: 1 },
      { id: 6, name: 'bridge', tags: ['architecture', 'structure'], difficulty: 3 },
    ];

    it('should suggest alternatives based on current selection', async () => {
      const currentIcons = [mockAllIcons[0]]; // Just car
      const alternatives = await aiService.suggestAlternatives(currentIcons, mockAllIcons);
      
      expect(Array.isArray(alternatives)).toBe(true);
      expect(alternatives.length).toBeLessThanOrEqual(6);
      
      // Should not include the already selected icon
      const hasSelectedIcon = alternatives.some(icon => icon.id === 1);
      expect(hasSelectedIcon).toBe(false);
    });

    it('should return empty array if all icons are already selected', async () => {
      const alternatives = await aiService.suggestAlternatives(mockAllIcons, mockAllIcons);
      expect(alternatives).toEqual([]);
    });

    it('should limit suggestions to maximum 6 items', async () => {
      const currentIcons = [];
      const alternatives = await aiService.suggestAlternatives(currentIcons, mockAllIcons);
      
      expect(alternatives.length).toBeLessThanOrEqual(6);
    });
  });

  describe('Utility Functions', () => {
    it('should extract MIME type from data URI', () => {
      const jpegData = 'data:image/jpeg;base64,abcd';
      const pngData = 'data:image/png;base64,efgh';
      
      expect(aiService.extractMimeType(jpegData)).toBe('image/jpeg');
      expect(aiService.extractMimeType(pngData)).toBe('image/png');
    });

    it('should generate name variations', () => {
      const variations = aiService.generateVariations('car');
      
      expect(Array.isArray(variations)).toBe(true);
      expect(variations.length).toBeGreaterThan(0);
      expect(variations.length).toBeLessThanOrEqual(3);
      
      variations.forEach(variation => {
        expect(typeof variation).toBe('string');
        expect(variation.length).toBeGreaterThan(0);
      });
    });

    it('should shuffle array without modifying original', () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = aiService.shuffleArray(original);
      
      expect(shuffled).not.toBe(original); // Different array reference
      expect(shuffled.length).toBe(original.length);
      expect(shuffled.sort()).toEqual(original.sort()); // Same elements
    });

    it('should calculate semantic similarity', () => {
      const similarity1 = aiService.calculateSemanticSimilarity('car', 'vehicle');
      const similarity2 = aiService.calculateSemanticSimilarity('car', 'unrelated');
      
      expect(typeof similarity1).toBe('number');
      expect(typeof similarity2).toBe('number');
      expect(similarity1).toBeGreaterThanOrEqual(0);
      expect(similarity2).toBeGreaterThanOrEqual(0);
    });
  });
});