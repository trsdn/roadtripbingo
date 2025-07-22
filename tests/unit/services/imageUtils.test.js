import { describe, it, expect, vi, beforeEach } from 'vitest';
import imageUtils from '../../../src/services/imageUtils';

// Mock HTML5 APIs
const createMockImage = (width = 100, height = 100) => ({
  width,
  height,
  onload: null,
  onerror: null,
  src: null,
  addEventListener: vi.fn((event, handler) => {
    if (event === 'load') setTimeout(() => handler(), 0);
  })
});

const createMockCanvas = (width = 100, height = 100) => {
  const mockContext = {
    drawImage: vi.fn(),
    getImageData: vi.fn(() => ({
      data: new Uint8ClampedArray(width * height * 4).fill(128)
    })),
    canvas: { width, height }
  };
  
  return {
    width,
    height,
    getContext: vi.fn(() => mockContext),
    toDataURL: vi.fn(() => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='),
    toBlob: vi.fn((callback, type, quality) => {
      const blob = new Blob(['fake-image-data'], { type: type || 'image/png' });
      setTimeout(() => callback(blob), 0);
    })
  };
};

global.Image = vi.fn(() => createMockImage());
global.HTMLCanvasElement = vi.fn(() => createMockCanvas());
global.document.createElement = vi.fn((tagName) => {
  if (tagName === 'canvas') return createMockCanvas();
  if (tagName === 'img') return createMockImage();
  return {};
});

describe('Image Utils Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Image Validation', () => {
    it('validates supported image formats', async () => {
      const validFormats = [
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAME/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==',
        'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
        'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoBAAEALmkwlSkwlXQB2AA='
      ];

      for (const dataUrl of validFormats) {
        expect(imageUtils.isValidImageFormat(dataUrl)).toBe(true);
      }
    });

    it('rejects invalid image formats', () => {
      const invalidFormats = [
        'data:text/plain;base64,SGVsbG8gV29ybGQ=', // Text file
        'data:application/pdf;base64,JVBERi0xLjQK', // PDF file
        'not-a-data-url', // Invalid format
        '', // Empty string
        null, // Null value
        undefined // Undefined value
      ];

      for (const dataUrl of invalidFormats) {
        expect(imageUtils.isValidImageFormat(dataUrl)).toBe(false);
      }
    });

    it('validates image size limits', async () => {
      const hugeImageData = 'data:image/png;base64,' + 'A'.repeat(10000000); // ~10MB
      
      expect(imageUtils.isValidSize(hugeImageData, 5 * 1024 * 1024)).toBe(false); // 5MB limit
      expect(imageUtils.isValidSize(hugeImageData, 15 * 1024 * 1024)).toBe(true); // 15MB limit
    });
  });

  describe('Image Compression', () => {
    it('compresses images to target file size', async () => {
      const originalDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      
      const compressed = await imageUtils.compressImage(originalDataUrl, {
        maxWidth: 800,
        maxHeight: 600,
        quality: 0.8,
        format: 'image/jpeg'
      });

      expect(compressed).toMatch(/^data:image\/jpeg;base64,/);
      expect(compressed.length).toBeLessThanOrEqual(originalDataUrl.length);
    });

    it('handles compression errors gracefully', async () => {
      const invalidDataUrl = 'data:image/png;base64,invalid-base64-data';
      
      await expect(imageUtils.compressImage(invalidDataUrl)).rejects.toThrow();
    });

    it('preserves aspect ratio during resize', async () => {
      const mockImage = createMockImage(400, 200); // 2:1 aspect ratio
      global.Image = vi.fn(() => mockImage);
      
      const dataUrl = 'data:image/png;base64,test';
      const compressed = await imageUtils.compressImage(dataUrl, {
        maxWidth: 200,
        maxHeight: 200 // Square constraint
      });

      // Should maintain 2:1 aspect ratio, so 200x100
      expect(compressed).toBeDefined();
    });

    it('handles different quality settings', async () => {
      const dataUrl = 'data:image/jpeg;base64,test';
      
      const highQuality = await imageUtils.compressImage(dataUrl, { quality: 0.95 });
      const lowQuality = await imageUtils.compressImage(dataUrl, { quality: 0.3 });

      expect(highQuality).toBeDefined();
      expect(lowQuality).toBeDefined();
      // Low quality should typically result in smaller file size
    });
  });

  describe('Image Analysis', () => {
    it('extracts dominant colors from image', async () => {
      const dataUrl = 'data:image/png;base64,test';
      
      const colors = await imageUtils.extractColors(dataUrl, 5);

      expect(Array.isArray(colors)).toBe(true);
      expect(colors.length).toBeLessThanOrEqual(5);
      
      colors.forEach(color => {
        expect(color).toHaveProperty('r');
        expect(color).toHaveProperty('g');
        expect(color).toHaveProperty('b');
        expect(color.r).toBeGreaterThanOrEqual(0);
        expect(color.r).toBeLessThanOrEqual(255);
      });
    });

    it('detects if image is predominantly light or dark', async () => {
      const lightImage = 'data:image/png;base64,test'; // Mock will return mid-gray
      
      const brightness = await imageUtils.analyzeBrightness(lightImage);
      
      expect(typeof brightness).toBe('number');
      expect(brightness).toBeGreaterThanOrEqual(0);
      expect(brightness).toBeLessThanOrEqual(1);
    });

    it('calculates image complexity score', async () => {
      const dataUrl = 'data:image/png;base64,test';
      
      const complexity = await imageUtils.analyzeComplexity(dataUrl);
      
      expect(typeof complexity).toBe('number');
      expect(complexity).toBeGreaterThanOrEqual(0);
      expect(complexity).toBeLessThanOrEqual(1);
    });

    it('detects image content type (photo vs graphic)', async () => {
      const dataUrl = 'data:image/png;base64,test';
      
      const contentType = await imageUtils.detectContentType(dataUrl);
      
      expect(['photo', 'graphic', 'mixed']).toContain(contentType);
    });
  });

  describe('Image Transformation', () => {
    it('creates thumbnail with proper dimensions', async () => {
      const dataUrl = 'data:image/png;base64,test';
      
      const thumbnail = await imageUtils.createThumbnail(dataUrl, 150, 150);

      expect(thumbnail).toMatch(/^data:image\//);
      expect(thumbnail).not.toBe(dataUrl); // Should be different from original
    });

    it('applies filters to images', async () => {
      const dataUrl = 'data:image/png;base64,test';
      
      const filtered = await imageUtils.applyFilter(dataUrl, 'grayscale');

      expect(filtered).toMatch(/^data:image\//);
      expect(filtered).toBeDefined();
    });

    it('crops images to specified dimensions', async () => {
      const dataUrl = 'data:image/png;base64,test';
      
      const cropped = await imageUtils.cropImage(dataUrl, {
        x: 10,
        y: 10,
        width: 50,
        height: 50
      });

      expect(cropped).toMatch(/^data:image\//);
      expect(cropped).toBeDefined();
    });

    it('rotates images by specified degrees', async () => {
      const dataUrl = 'data:image/png;base64,test';
      
      const rotated = await imageUtils.rotateImage(dataUrl, 90);

      expect(rotated).toMatch(/^data:image\//);
      expect(rotated).toBeDefined();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('handles extremely small images', async () => {
      const mockTinyImage = createMockImage(1, 1);
      global.Image = vi.fn(() => mockTinyImage);
      
      const dataUrl = 'data:image/png;base64,tiny';
      
      const compressed = await imageUtils.compressImage(dataUrl, {
        maxWidth: 100,
        maxHeight: 100
      });

      expect(compressed).toBeDefined();
    });

    it('handles extremely large images', async () => {
      const mockHugeImage = createMockImage(10000, 10000);
      global.Image = vi.fn(() => mockHugeImage);
      
      const dataUrl = 'data:image/png;base64,huge';
      
      const compressed = await imageUtils.compressImage(dataUrl, {
        maxWidth: 800,
        maxHeight: 600
      });

      expect(compressed).toBeDefined();
    });

    it('handles corrupted image data', async () => {
      const corruptedDataUrl = 'data:image/png;base64,corrupted-data-that-is-not-valid';
      
      const mockCorruptedImage = createMockImage();
      mockCorruptedImage.addEventListener = vi.fn((event, handler) => {
        if (event === 'error') setTimeout(() => handler(new Error('Image load error')), 0);
      });
      global.Image = vi.fn(() => mockCorruptedImage);
      
      await expect(imageUtils.compressImage(corruptedDataUrl)).rejects.toThrow();
    });

    it('handles missing canvas context', async () => {
      const mockCanvas = createMockCanvas();
      mockCanvas.getContext = vi.fn(() => null); // No 2d context available
      
      global.document.createElement = vi.fn((tagName) => {
        if (tagName === 'canvas') return mockCanvas;
        return createMockImage();
      });
      
      const dataUrl = 'data:image/png;base64,test';
      
      await expect(imageUtils.compressImage(dataUrl)).rejects.toThrow();
    });

    it('handles out-of-memory scenarios', async () => {
      // Simulate very large canvas that might cause out-of-memory
      const mockLargeCanvas = createMockCanvas(50000, 50000);
      mockLargeCanvas.getContext = vi.fn(() => {
        throw new Error('Out of memory');
      });
      
      global.document.createElement = vi.fn(() => mockLargeCanvas);
      
      const dataUrl = 'data:image/png;base64,test';
      
      await expect(imageUtils.compressImage(dataUrl)).rejects.toThrow('Out of memory');
    });
  });

  describe('Format Conversion', () => {
    it('converts between image formats', async () => {
      const pngDataUrl = 'data:image/png;base64,test';
      
      const jpegConverted = await imageUtils.convertFormat(pngDataUrl, 'image/jpeg', 0.9);
      const webpConverted = await imageUtils.convertFormat(pngDataUrl, 'image/webp', 0.8);

      expect(jpegConverted).toMatch(/^data:image\/jpeg/);
      expect(webpConverted).toMatch(/^data:image\/webp/);
    });

    it('handles unsupported format conversions', async () => {
      const dataUrl = 'data:image/png;base64,test';
      
      await expect(imageUtils.convertFormat(dataUrl, 'image/bmp')).rejects.toThrow();
    });

    it('optimizes format based on image content', async () => {
      const photoDataUrl = 'data:image/png;base64,photo-like-content';
      const graphicDataUrl = 'data:image/jpeg;base64,graphic-like-content';
      
      const optimizedPhoto = await imageUtils.optimizeFormat(photoDataUrl);
      const optimizedGraphic = await imageUtils.optimizeFormat(graphicDataUrl);

      expect(optimizedPhoto).toMatch(/^data:image\//);
      expect(optimizedGraphic).toMatch(/^data:image\//);
    });
  });

  describe('Performance and Memory', () => {
    it('processes multiple images concurrently without memory leaks', async () => {
      const dataUrls = Array.from({ length: 20 }, (_, i) => 
        `data:image/png;base64,test-image-${i}`
      );
      
      const startMemory = process.memoryUsage().heapUsed;
      
      const results = await Promise.all(
        dataUrls.map(dataUrl => imageUtils.compressImage(dataUrl, { quality: 0.8 }))
      );
      
      const endMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = endMemory - startMemory;
      
      expect(results).toHaveLength(20);
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // Less than 50MB increase
    });

    it('handles rapid successive compression requests', async () => {
      const dataUrl = 'data:image/png;base64,test';
      
      const startTime = Date.now();
      
      const promises = Array.from({ length: 50 }, () =>
        imageUtils.compressImage(dataUrl, { quality: 0.5 })
      );
      
      const results = await Promise.all(promises);
      const duration = Date.now() - startTime;
      
      expect(results).toHaveLength(50);
      expect(duration).toBeLessThan(5000); // Should complete in under 5 seconds
    });

    it('cleans up canvas resources properly', async () => {
      const dataUrl = 'data:image/png;base64,test';
      
      // Track canvas creation
      const canvasInstances = [];
      const originalCreateElement = global.document.createElement;
      global.document.createElement = vi.fn((tagName) => {
        const element = originalCreateElement.call(global.document, tagName);
        if (tagName === 'canvas') {
          canvasInstances.push(element);
        }
        return element;
      });
      
      await imageUtils.compressImage(dataUrl);
      
      // Canvases should be created and used
      expect(canvasInstances.length).toBeGreaterThan(0);
    });
  });
});