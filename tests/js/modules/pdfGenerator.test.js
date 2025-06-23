/**
 * @jest-environment jsdom
 */

// Mock image utility before importing module under test
jest.mock('@/js/modules/imageUtils.js', () => ({
  createImageFromBase64: jest.fn(() => ({ width: 50, height: 50, complete: true }))
}));

import { generatePDF, downloadPDFBlob } from '@/js/modules/pdfGenerator.js';

// Mock imageUtils module  
jest.mock('@/js/modules/imageUtils.js', () => ({
  createImageFromBase64: jest.fn((data) => ({
    width: 100,
    height: 100,
    complete: true,
    onload: null
  }))
}));

// Enhanced mock jsPDF with element tracking for layout tests
class MockJsPDF {
  constructor(options) {
    this.options = options;
    this.pages = [];
    this.currentPage = 0;
    this.properties = {};
    this.elements = []; // Track added elements for verification
    this.fontSize = 12;
    this.textColor = { r: 0, g: 0, b: 0 };
    this.drawColor = { r: 0, g: 0, b: 0 };
    
    // Make methods spies
    this.setProperties = jest.fn().mockReturnValue(this);
    this.setFontSize = jest.fn().mockImplementation((size) => {
      this.fontSize = size;
      return this;
    });
    this.setTextColor = jest.fn().mockImplementation((r, g, b) => {
      this.textColor = { r, g, b };
      return this;
    });
    this.setDrawColor = jest.fn().mockImplementation((r, g, b) => {
      this.drawColor = { r, g, b };
      return this;
    });
    this.addPage = jest.fn().mockReturnValue(this);
    this.text = jest.fn().mockImplementation((text, x, y, options = {}) => {
      this.elements.push({
        type: 'text',
        text,
        x,
        y,
        options,
        fontSize: this.fontSize,
        textColor: { ...this.textColor }
      });
      return this;
    });
    this.rect = jest.fn().mockImplementation((x, y, width, height, style) => {
      this.elements.push({
        type: 'rect',
        x,
        y,
        width,
        height,
        style,
        drawColor: { ...this.drawColor }
      });
      return this;
    });
    this.addImage = jest.fn().mockImplementation((data, format, x, y, width, height, alias, compression, quality) => {
      this.elements.push({
        type: 'image',
        data,
        format,
        x,
        y,
        width,
        height,
        alias,
        compression,
        quality
      });
      return this;
    });
    this.output = jest.fn().mockImplementation((type) => {
      if (type === 'blob') {
        // Create a proper Blob object for testing
        return new Blob(['fake-pdf-content'], { type: 'application/pdf' });
      }
      return 'fake-pdf-content';
    });
    this.save = jest.fn().mockReturnValue(this);
  }

  internal = {
    pageSize: {
      getWidth: () => 210, // A4 width in mm
      getHeight: () => 297  // A4 height in mm
    }
  };
}

const mockJsPDF = jest.fn().mockImplementation((options) => new MockJsPDF(options));

global.window = global.window || {};
global.window.jspdf = {
  jsPDF: mockJsPDF
};

describe('PDF Generator', () => {
  let mockPDFInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    // Get a fresh mock instance for each test
    mockPDFInstance = new MockJsPDF();
    mockJsPDF.mockImplementation(() => mockPDFInstance);
  });

  // Sample test data with correct structure based on updated cardGenerator
  const sampleCardSets = [
    {
      cards: [
        {
          title: 'Card 1',
          identifier: 'A01',
          grid: [
            [
              { id: 1, name: 'Item 1', data: 'data:image/jpeg;base64,/9j/4AAQSkZJRg', isFreeSpace: false },
              { id: 2, name: 'Item 2', data: 'data:image/jpeg;base64,/9j/4AAQSkZJRg', isFreeSpace: false }
            ],
            [
              { id: 3, name: 'FREE', data: null, isFreeSpace: true },
              { id: 4, name: 'Item 4', data: 'data:image/jpeg;base64,/9j/4AAQSkZJRg', isFreeSpace: false }
            ]
          ]
        },
        {
          title: 'Card 2',
          identifier: 'A02',
          grid: [
            [
              { id: 5, name: 'Item 5', data: 'data:image/jpeg;base64,/9j/4AAQSkZJRg', isFreeSpace: false },
              { id: 6, name: 'Item 6', data: 'data:image/jpeg;base64,/9j/4AAQSkZJRg', isFreeSpace: false }
            ],
            [
              { id: 7, name: 'FREE', data: null, isFreeSpace: true },
              { id: 8, name: 'Item 8', data: 'data:image/jpeg;base64,/9j/4AAQSkZJRg', isFreeSpace: false }
            ]
          ]
        }
      ]
    }
  ];

  describe('generatePDF', () => {
    it('should generate PDF with cards', async () => {
      const options = {
        cardSets: sampleCardSets,
        identifier: 'test-id',
        compressionLevel: 'MEDIUM',
        showLabels: true
      };

      const result = await generatePDF(options);

      expect(mockJsPDF).toHaveBeenCalled();
      
      // Check what output was called with
      expect(mockPDFInstance.output).toHaveBeenCalledWith('blob');
      
      // Check the actual result
      const outputResult = mockPDFInstance.output('blob');
      expect(outputResult).toBeInstanceOf(Blob);
      
      expect(result).toBeInstanceOf(Blob);
      expect(mockPDFInstance.setProperties).toHaveBeenCalledWith({
        title: 'Road Trip Bingo Cards',
        subject: 'Bingo Cards for Road Trips',
        author: 'Road Trip Bingo Generator',
        keywords: 'bingo, road trip, game',
        creator: 'Road Trip Bingo Generator'
      });
    });

    it('should pass image quality before compression', async () => {
      const mockCardSets = [
        {
          cards: [
            {
              title: 'Image Bingo',
              grid: [[{ id: '1', data: 'data:image/jpeg;base64,abcd', name: 'Item', isFreeSpace: false }]]
            }
          ]
        }
      ];

      const options = {
        cardSets: mockCardSets,
        identifier: 'test-id',
        compressionLevel: 'FAST',
        showLabels: true
      };

      await generatePDF(options);

      const instance = mockJsPDF.mock.results[0].value;
      expect(instance.addImage).toHaveBeenCalledWith(
        'data:image/jpeg;base64,abcd',
        'JPEG',
        expect.any(Number),
        expect.any(Number),
        expect.any(Number),
        expect.any(Number),
        'img-1',
        0.9,
        'FAST'
      );
    });

    it('should handle empty cards array', async () => {
      const options = {
        cardSets: [],
        identifier: 'test-id',
        compressionLevel: 'MEDIUM',
        showLabels: true
      };

      const result = await generatePDF(options);
      
      expect(mockJsPDF).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Blob);
    });

    it('should default to one-per-page layout when no layout specified', async () => {
      const options = {
        cardSets: sampleCardSets,
        identifier: 'TEST-001'
      };

      const result = await generatePDF(options);

      expect(result).toBeInstanceOf(Blob);
      // Should add a page for the second card (first card uses initial page)
      expect(mockPDFInstance.addPage).toHaveBeenCalledTimes(1);
    });

    it('should accept one-per-page layout explicitly', async () => {
      const options = {
        cardSets: sampleCardSets,
        identifier: 'TEST-001',
        layout: 'one-per-page'
      };

      const result = await generatePDF(options);

      expect(result).toBeInstanceOf(Blob);
      // Should add a page for the second card
      expect(mockPDFInstance.addPage).toHaveBeenCalledTimes(1);
    });

    it('should accept two-per-page layout', async () => {
      const options = {
        cardSets: sampleCardSets,
        identifier: 'TEST-001',
        layout: 'two-per-page'
      };

      const result = await generatePDF(options);

      expect(result).toBeInstanceOf(Blob);
      // Should not add any pages since 2 cards fit on one page
      expect(mockPDFInstance.addPage).toHaveBeenCalledTimes(0);
    });

    it('should handle compression levels correctly', async () => {
      const compressionLevels = ['NONE', 'FAST', 'MEDIUM', 'SLOW'];
      
      for (const level of compressionLevels) {
        // Create fresh instance for each test
        mockPDFInstance = new MockJsPDF();
        mockJsPDF.mockImplementation(() => mockPDFInstance);
        
        const options = {
          cardSets: sampleCardSets,
          identifier: 'TEST-001',
          compressionLevel: level
        };

        const result = await generatePDF(options);
        expect(result).toBeInstanceOf(Blob);
      }
    });

    it('should handle showLabels option', async () => {
      const optionsWithLabels = {
        cardSets: sampleCardSets,
        identifier: 'TEST-001',
        showLabels: true
      };

      const optionsWithoutLabels = {
        cardSets: sampleCardSets,
        identifier: 'TEST-001',
        showLabels: false
      };

      const resultWith = await generatePDF(optionsWithLabels);
      const resultWithout = await generatePDF(optionsWithoutLabels);

      expect(resultWith).toBeInstanceOf(Blob);
      expect(resultWithout).toBeInstanceOf(Blob);
    });
  });

  describe('Two-per-page layout specifics', () => {
    it('should place two cards on one page when using two-per-page layout', async () => {
      const options = {
        cardSets: sampleCardSets,
        identifier: 'TEST-001',
        layout: 'two-per-page'
      };

      await generatePDF(options);

      // Check that cards are rendered at different Y offsets
      const cardTitles = mockPDFInstance.elements.filter(el => 
        el.type === 'text' && 
        (el.text === 'Card 1' || el.text === 'Card 2')
      );

      expect(cardTitles).toHaveLength(2);
      
      // Cards should be at different Y positions (top and bottom of page)
      const yPositions = cardTitles.map(el => el.y);
      expect(yPositions[0]).not.toEqual(yPositions[1]);
    });

    it('should add new page when more than two cards in two-per-page layout', async () => {
      const threeCardSets = [
        {
          cards: [
            sampleCardSets[0].cards[0],
            sampleCardSets[0].cards[1],
            {
              title: 'Card 3',
              identifier: 'A03',
              grid: sampleCardSets[0].cards[0].grid
            }
          ]
        }
      ];

      const options = {
        cardSets: threeCardSets,
        identifier: 'TEST-001',
        layout: 'two-per-page'
      };

      await generatePDF(options);

      // Should add one page for the third card
      expect(mockPDFInstance.addPage).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple card sets with two-per-page layout', async () => {
      const multipleCardSets = [
        sampleCardSets[0],
        {
          cards: [
            {
              title: 'Card 3',
              identifier: 'B01',
              grid: sampleCardSets[0].cards[0].grid
            },
            {
              title: 'Card 4', 
              identifier: 'B02',
              grid: sampleCardSets[0].cards[0].grid
            }
          ]
        }
      ];

      const options = {
        cardSets: multipleCardSets,
        identifier: 'TEST-001',
        layout: 'two-per-page'
      };

      await generatePDF(options);

      // Should add one page for cards 3 and 4
      expect(mockPDFInstance.addPage).toHaveBeenCalledTimes(1);
    });

    it('should render card titles with appropriate font size', async () => {
      const options = {
        cardSets: sampleCardSets,
        identifier: 'TEST-001',
        layout: 'two-per-page'
      };

      await generatePDF(options);

      const titleElements = mockPDFInstance.elements.filter(el => 
        el.type === 'text' && 
        (el.text === 'Card 1' || el.text === 'Card 2')
      );

      expect(titleElements).toHaveLength(2);
      titleElements.forEach(el => {
        expect(el.fontSize).toBe(14); // Should use smaller font for two-per-page
      });
    });

    it('should render grid cells with proper borders', async () => {
      const options = {
        cardSets: sampleCardSets,
        identifier: 'TEST-001',
        layout: 'two-per-page'
      };

      await generatePDF(options);

      const rectElements = mockPDFInstance.elements.filter(el => el.type === 'rect');
      
      // Should have rectangles for grid cells (2x2 grid for each of 2 cards = 8 rectangles)
      expect(rectElements.length).toBeGreaterThanOrEqual(8);
      
      rectElements.forEach(rect => {
        expect(rect.style).toBe('S'); // Stroke style for borders
        expect(rect.width).toBeGreaterThan(0);
        expect(rect.height).toBeGreaterThan(0);
      });
    });

    it('should add images for non-free spaces', async () => {
      const options = {
        cardSets: sampleCardSets,
        identifier: 'TEST-001',
        layout: 'two-per-page'
      };

      await generatePDF(options);

      const imageElements = mockPDFInstance.elements.filter(el => el.type === 'image');
      
      // Should have images for non-free space cells (3 per card × 2 cards = 6 images)
      expect(imageElements).toHaveLength(6);
      
      imageElements.forEach(img => {
        expect(img.format).toBe('JPEG');
        expect(img.width).toBeGreaterThan(0);
        expect(img.height).toBeGreaterThan(0);
        expect(img.quality).toBeDefined();
      });
    });

    it('should include labels when showLabels is true', async () => {
      const options = {
        cardSets: sampleCardSets,
        identifier: 'TEST-001',
        layout: 'two-per-page',
        showLabels: true
      };

      await generatePDF(options);

      const labelElements = mockPDFInstance.elements.filter(el => 
        el.type === 'text' && 
        ['Item 1', 'Item 2', 'Item 4', 'Item 5', 'Item 6', 'Item 8'].includes(el.text)
      );

      expect(labelElements).toHaveLength(6); // Labels for non-free space items
      
      labelElements.forEach(label => {
        expect(label.fontSize).toBe(6); // Smaller font for labels in two-per-page
      });
    });

    it('should not include labels when showLabels is false', async () => {
      const options = {
        cardSets: sampleCardSets,
        identifier: 'TEST-001',
        layout: 'two-per-page',
        showLabels: false
      };

      await generatePDF(options);

      const labelElements = mockPDFInstance.elements.filter(el => 
        el.type === 'text' && 
        ['Item 1', 'Item 2', 'Item 4', 'Item 5', 'Item 6', 'Item 8'].includes(el.text)
      );

      expect(labelElements).toHaveLength(0); // No labels should be present
    });

    it('should position cards correctly in two-per-page layout', async () => {
      const options = {
        cardSets: sampleCardSets,
        identifier: 'TEST-001',
        layout: 'two-per-page'
      };

      await generatePDF(options);

      const cardTitles = mockPDFInstance.elements.filter(el => 
        el.type === 'text' && 
        (el.text === 'Card 1' || el.text === 'Card 2')
      );

      expect(cardTitles).toHaveLength(2);
      
      // First card should be at top of page (smaller Y)
      // Second card should be at bottom of page (larger Y)
      const card1Title = cardTitles.find(el => el.text === 'Card 1');
      const card2Title = cardTitles.find(el => el.text === 'Card 2');
      
      expect(card1Title.y).toBeLessThan(card2Title.y);
    });

    it('should handle page identifiers correctly', async () => {
      const options = {
        cardSets: sampleCardSets,
        identifier: 'TEST-IDENTIFIER',
        layout: 'two-per-page'
      };

      await generatePDF(options);

      const identifierElements = mockPDFInstance.elements.filter(el => 
        el.type === 'text' && 
        el.text === 'TEST-IDENTIFIER'
      );

      expect(identifierElements.length).toBeGreaterThanOrEqual(1); // Should appear at least once per page
      
      // Check if we have identifiers on both left and right sides
      const rightIdentifier = identifierElements.find(el => el.options.align === 'right');
      const leftIdentifier = identifierElements.find(el => el.options.align === 'left');
      
      // Verify right side identifier
      expect(rightIdentifier).toBeDefined();
      expect(rightIdentifier.fontSize).toBe(8);
      
      // Verify left side identifier if it exists
      if (leftIdentifier) {
        expect(leftIdentifier.fontSize).toBe(8);
      }
    });
  });

  describe('Error handling', () => {
    it('should handle empty card sets gracefully', async () => {
      const options = {
        cardSets: [],
        identifier: 'TEST-001',
        layout: 'two-per-page'
      };

      const result = await generatePDF(options);
      expect(result).toBeInstanceOf(Blob);
    });

    it('should handle invalid layout parameter', async () => {
      const options = {
        cardSets: sampleCardSets,
        identifier: 'TEST-001',
        layout: 'invalid-layout'
      };

      // Should default to one-per-page layout
      const result = await generatePDF(options);
      expect(result).toBeInstanceOf(Blob);
      // Should still add page for second card in one-per-page mode
      expect(mockPDFInstance.addPage).toHaveBeenCalledTimes(1);
    });

    it('should handle missing optional parameters', async () => {
      const options = {
        cardSets: sampleCardSets,
        identifier: 'TEST-001'
        // No layout, compressionLevel, or showLabels specified
      };

      const result = await generatePDF(options);
      expect(result).toBeInstanceOf(Blob);
    });
  });

  describe('downloadPDFBlob', () => {
    it('should trigger download', () => {
      // Mock URL.createObjectURL and createElement
      global.URL.createObjectURL = jest.fn().mockReturnValue('mock-url');
      global.URL.revokeObjectURL = jest.fn();
      
      const mockLink = {
        href: '',
        download: '',
        click: jest.fn(),
        style: { display: '' }
      };
      
      document.createElement = jest.fn().mockReturnValue(mockLink);
      document.body.appendChild = jest.fn();
      document.body.removeChild = jest.fn();

      downloadPDFBlob('mock-blob', 'test.pdf');
      
      expect(mockLink.click).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('mock-url');
    });
  });
});
