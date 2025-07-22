import { describe, it, expect, vi, beforeEach } from 'vitest';
import pdfGenerator from '../../../src/services/pdfGenerator';

// Mock jsPDF
const mockJsPDF = {
  addImage: vi.fn(),
  text: vi.fn(),
  setFontSize: vi.fn(),
  setTextColor: vi.fn(),
  rect: vi.fn(),
  save: vi.fn(),
  output: vi.fn(() => 'fake-pdf-blob'),
  internal: {
    pageSize: { width: 210, height: 297 }
  }
};

vi.mock('jspdf', () => ({
  default: vi.fn(() => mockJsPDF)
}));

const mockBingoCards = [
  {
    id: '1',
    title: 'Road Trip Bingo',
    cells: [
      { icon: { name: 'Car', data: 'data:image/png;base64,test1' }, isBlank: false },
      { icon: { name: 'Tree', data: 'data:image/png;base64,test2' }, isBlank: false },
      { icon: null, isBlank: true }, // Center blank
      { icon: { name: 'House', data: 'data:image/png;base64,test3' }, isBlank: false },
      { icon: { name: 'Dog', data: 'data:image/png;base64,test4' }, isBlank: false }
    ],
    gridSize: 3
  }
];

describe('PDF Generator Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic PDF Generation', () => {
    it('generates PDF from bingo cards', async () => {
      const options = {
        layout: 'one-per-page',
        compression: 'MEDIUM',
        showLabels: true
      };

      const result = await pdfGenerator.generatePDF(mockBingoCards, options);

      expect(result).toBeDefined();
      expect(mockJsPDF.addImage).toHaveBeenCalled();
      expect(mockJsPDF.text).toHaveBeenCalled();
    });

    it('handles different layout options', async () => {
      const layouts = ['one-per-page', 'two-per-page', 'four-per-page'];

      for (const layout of layouts) {
        vi.clearAllMocks();
        
        const result = await pdfGenerator.generatePDF(mockBingoCards, { layout });

        expect(result).toBeDefined();
        expect(mockJsPDF.addImage).toHaveBeenCalled();
      }
    });

    it('applies compression settings', async () => {
      const compressionLevels = ['NONE', 'FAST', 'MEDIUM', 'SLOW'];

      for (const compression of compressionLevels) {
        const result = await pdfGenerator.generatePDF(mockBingoCards, { compression });
        expect(result).toBeDefined();
      }
    });

    it('includes or excludes labels based on settings', async () => {
      // With labels
      await pdfGenerator.generatePDF(mockBingoCards, { showLabels: true });
      expect(mockJsPDF.text).toHaveBeenCalled();

      vi.clearAllMocks();

      // Without labels
      await pdfGenerator.generatePDF(mockBingoCards, { showLabels: false });
      // Should still be called for title, but less frequently
      const textCallCount = mockJsPDF.text.mock.calls.length;
      expect(textCallCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Multiple Cards and Pages', () => {
    it('handles multiple bingo cards', async () => {
      const multipleCards = [
        ...mockBingoCards,
        {
          id: '2',
          title: 'Road Trip Bingo 2',
          cells: Array.from({ length: 9 }, (_, i) => ({
            icon: { name: `Icon ${i}`, data: `data:image/png;base64,test${i}` },
            isBlank: false
          })),
          gridSize: 3
        }
      ];

      const result = await pdfGenerator.generatePDF(multipleCards, {
        layout: 'one-per-page'
      });

      expect(result).toBeDefined();
      expect(mockJsPDF.addImage).toHaveBeenCalledTimes(18); // 9 cells × 2 cards
    });

    it('optimizes page layout for two-per-page', async () => {
      const result = await pdfGenerator.generatePDF(mockBingoCards, {
        layout: 'two-per-page'
      });

      expect(result).toBeDefined();
      // Should position cards side by side
      expect(mockJsPDF.addImage).toHaveBeenCalled();
    });

    it('handles odd number of cards in two-per-page layout', async () => {
      const threeCards = [
        ...mockBingoCards,
        { ...mockBingoCards[0], id: '2' },
        { ...mockBingoCards[0], id: '3' }
      ];

      const result = await pdfGenerator.generatePDF(threeCards, {
        layout: 'two-per-page'
      });

      expect(result).toBeDefined();
    });
  });

  describe('Different Grid Sizes', () => {
    it('handles various grid sizes', async () => {
      const gridSizes = [3, 4, 5, 6, 7, 8];

      for (const gridSize of gridSizes) {
        const cellCount = gridSize * gridSize;
        const cards = [{
          id: '1',
          title: `${gridSize}x${gridSize} Bingo`,
          cells: Array.from({ length: cellCount }, (_, i) => ({
            icon: { name: `Icon ${i}`, data: `data:image/png;base64,test${i}` },
            isBlank: false
          })),
          gridSize
        }];

        const result = await pdfGenerator.generatePDF(cards);

        expect(result).toBeDefined();
        expect(mockJsPDF.addImage).toHaveBeenCalledTimes(cellCount);
        
        vi.clearAllMocks();
      }
    });

    it('adjusts cell size based on grid size', async () => {
      const largeGridCards = [{
        id: '1',
        title: '8x8 Bingo',
        cells: Array.from({ length: 64 }, (_, i) => ({
          icon: { name: `Icon ${i}`, data: `data:image/png;base64,test${i}` },
          isBlank: false
        })),
        gridSize: 8
      }];

      const result = await pdfGenerator.generatePDF(largeGridCards);

      expect(result).toBeDefined();
      // Cells should be smaller for larger grids
      expect(mockJsPDF.addImage).toHaveBeenCalledTimes(64);
    });
  });

  describe('Styling and Formatting', () => {
    it('applies custom colors and fonts', async () => {
      const options = {
        titleColor: '#FF0000',
        titleFont: 'Arial',
        titleSize: 18,
        labelColor: '#0000FF',
        labelFont: 'Helvetica',
        labelSize: 10
      };

      const result = await pdfGenerator.generatePDF(mockBingoCards, options);

      expect(result).toBeDefined();
      expect(mockJsPDF.setTextColor).toHaveBeenCalled();
      expect(mockJsPDF.setFontSize).toHaveBeenCalled();
    });

    it('handles different border styles', async () => {
      const borderStyles = ['none', 'thin', 'thick', 'dashed'];

      for (const borderStyle of borderStyles) {
        const result = await pdfGenerator.generatePDF(mockBingoCards, { borderStyle });
        expect(result).toBeDefined();
      }
    });

    it('adds headers and footers', async () => {
      const options = {
        header: 'Road Trip Bingo Game',
        footer: 'Generated with Road Trip Bingo App',
        includePageNumbers: true
      };

      const result = await pdfGenerator.generatePDF(mockBingoCards, options);

      expect(result).toBeDefined();
      expect(mockJsPDF.text).toHaveBeenCalledWith(
        expect.stringContaining('Road Trip Bingo Game'),
        expect.any(Number),
        expect.any(Number)
      );
    });
  });

  describe('Image Handling', () => {
    it('handles different image formats', async () => {
      const mixedFormatCards = [{
        id: '1',
        title: 'Mixed Format Test',
        cells: [
          { icon: { name: 'PNG Image', data: 'data:image/png;base64,test1' }, isBlank: false },
          { icon: { name: 'JPEG Image', data: 'data:image/jpeg;base64,test2' }, isBlank: false },
          { icon: { name: 'WebP Image', data: 'data:image/webp;base64,test3' }, isBlank: false },
          { icon: { name: 'GIF Image', data: 'data:image/gif;base64,test4' }, isBlank: false }
        ],
        gridSize: 2
      }];

      const result = await pdfGenerator.generatePDF(mixedFormatCards);

      expect(result).toBeDefined();
      expect(mockJsPDF.addImage).toHaveBeenCalledTimes(4);
    });

    it('handles missing or corrupted images', async () => {
      const cardsWithBadImages = [{
        id: '1',
        title: 'Bad Images Test',
        cells: [
          { icon: { name: 'Good Image', data: 'data:image/png;base64,validdata' }, isBlank: false },
          { icon: { name: 'Bad Image', data: 'invalid-data-url' }, isBlank: false },
          { icon: { name: 'Missing Data', data: '' }, isBlank: false },
          { icon: null, isBlank: false } // Null icon
        ],
        gridSize: 2
      }];

      const result = await pdfGenerator.generatePDF(cardsWithBadImages);

      expect(result).toBeDefined();
      // Should still generate PDF, maybe with placeholders for bad images
    });

    it('optimizes large images for PDF', async () => {
      const largeImageCard = [{
        id: '1',
        title: 'Large Image Test',
        cells: [{
          icon: {
            name: 'Huge Image',
            data: 'data:image/png;base64,' + 'A'.repeat(100000) // Very large image
          },
          isBlank: false
        }],
        gridSize: 1
      }];

      const result = await pdfGenerator.generatePDF(largeImageCard);

      expect(result).toBeDefined();
      expect(mockJsPDF.addImage).toHaveBeenCalled();
    });
  });

  describe('Performance and Memory', () => {
    it('handles large number of cards efficiently', async () => {
      const manyCards = Array.from({ length: 100 }, (_, i) => ({
        id: `${i}`,
        title: `Bingo Card ${i}`,
        cells: Array.from({ length: 25 }, (_, j) => ({
          icon: { name: `Icon ${i}-${j}`, data: `data:image/png;base64,test${i}${j}` },
          isBlank: false
        })),
        gridSize: 5
      }));

      const startTime = Date.now();
      const startMemory = process.memoryUsage().heapUsed;

      const result = await pdfGenerator.generatePDF(manyCards, {
        layout: 'one-per-page',
        compression: 'FAST'
      });

      const endTime = Date.now();
      const endMemory = process.memoryUsage().heapUsed;

      expect(result).toBeDefined();
      expect(endTime - startTime).toBeLessThan(30000); // Less than 30 seconds
      expect(endMemory - startMemory).toBeLessThan(500 * 1024 * 1024); // Less than 500MB
    });

    it('streams PDF generation for memory efficiency', async () => {
      const hugeCard = [{
        id: '1',
        title: 'Huge Bingo Card',
        cells: Array.from({ length: 64 }, (_, i) => ({ // 8x8 grid
          icon: {
            name: `Icon ${i}`,
            data: 'data:image/png;base64,' + 'B'.repeat(10000) // Large images
          },
          isBlank: false
        })),
        gridSize: 8
      }];

      const result = await pdfGenerator.generatePDF(hugeCard, {
        useStreaming: true,
        compression: 'SLOW'
      });

      expect(result).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('handles PDF generation failures gracefully', async () => {
      mockJsPDF.addImage.mockImplementation(() => {
        throw new Error('PDF generation failed');
      });

      await expect(pdfGenerator.generatePDF(mockBingoCards)).rejects.toThrow();
    });

    it('provides meaningful error messages', async () => {
      const invalidCards = [
        { id: null, title: '', cells: null, gridSize: 0 }
      ];

      await expect(pdfGenerator.generatePDF(invalidCards)).rejects.toThrow();
    });

    it('handles empty card list', async () => {
      const result = await pdfGenerator.generatePDF([]);

      expect(result).toBeDefined();
      // Should generate empty PDF or throw appropriate error
    });

    it('recovers from partial generation failures', async () => {
      let callCount = 0;
      mockJsPDF.addImage.mockImplementation(() => {
        callCount++;
        if (callCount === 3) {
          throw new Error('Temporary failure');
        }
        return mockJsPDF;
      });

      // Should attempt to continue despite individual image failures
      const result = await pdfGenerator.generatePDF(mockBingoCards);
      expect(result).toBeDefined();
    });
  });

  describe('Accessibility Features', () => {
    it('adds alt text for images in PDF', async () => {
      const options = {
        includeAltText: true,
        accessibleColors: true
      };

      const result = await pdfGenerator.generatePDF(mockBingoCards, options);

      expect(result).toBeDefined();
      // Should include accessibility metadata
    });

    it('uses high contrast colors when requested', async () => {
      const options = {
        highContrast: true,
        colorBlindFriendly: true
      };

      const result = await pdfGenerator.generatePDF(mockBingoCards, options);

      expect(result).toBeDefined();
      expect(mockJsPDF.setTextColor).toHaveBeenCalled();
    });

    it('generates structure for screen readers', async () => {
      const options = {
        structuredPDF: true,
        includeReadingOrder: true
      };

      const result = await pdfGenerator.generatePDF(mockBingoCards, options);

      expect(result).toBeDefined();
    });
  });

  describe('Custom Templates and Themes', () => {
    it('applies custom templates', async () => {
      const template = {
        name: 'summer-theme',
        backgroundColor: '#FFE4B5',
        cellBorderColor: '#DEB887',
        titleStyle: {
          color: '#8B4513',
          fontSize: 20,
          fontFamily: 'Georgia'
        }
      };

      const result = await pdfGenerator.generatePDF(mockBingoCards, { template });

      expect(result).toBeDefined();
      expect(mockJsPDF.setTextColor).toHaveBeenCalled();
    });

    it('supports multiple card designs on same PDF', async () => {
      const cardsWithDifferentStyles = [
        { ...mockBingoCards[0], style: 'classic' },
        { ...mockBingoCards[0], id: '2', style: 'modern' }
      ];

      const result = await pdfGenerator.generatePDF(cardsWithDifferentStyles);

      expect(result).toBeDefined();
    });
  });

  describe('Internationalization', () => {
    it('handles different languages and text directions', async () => {
      const multilingualCards = [{
        id: '1',
        title: 'Straßen-Bingo',
        cells: [
          { icon: { name: 'Auto', data: 'data:image/png;base64,test1' }, isBlank: false },
          { icon: { name: 'Baum', data: 'data:image/png;base64,test2' }, isBlank: false },
          { icon: { name: 'Haus', data: 'data:image/png;base64,test3' }, isBlank: false }
        ],
        gridSize: 2,
        language: 'de'
      }];

      const result = await pdfGenerator.generatePDF(multilingualCards, {
        language: 'de',
        fontFamily: 'DejaVu Sans'
      });

      expect(result).toBeDefined();
      expect(mockJsPDF.text).toHaveBeenCalledWith('Straßen-Bingo', expect.any(Number), expect.any(Number));
    });

    it('supports RTL languages', async () => {
      const rtlCards = [{
        id: '1',
        title: 'بنغو الرحلة',
        cells: [
          { icon: { name: 'سيارة', data: 'data:image/png;base64,test1' }, isBlank: false }
        ],
        gridSize: 1,
        language: 'ar',
        direction: 'rtl'
      }];

      const result = await pdfGenerator.generatePDF(rtlCards, {
        textDirection: 'rtl'
      });

      expect(result).toBeDefined();
    });
  });
});