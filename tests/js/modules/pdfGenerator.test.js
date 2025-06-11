/**
 * @jest-environment jsdom
 */

// Mock image utility before importing module under test
jest.mock('@/js/modules/imageUtils.js', () => ({
  createImageFromBase64: jest.fn(() => ({ width: 50, height: 50, complete: true }))
}));

import { generatePDF, downloadPDFBlob } from '@/js/modules/pdfGenerator.js';

// Mock createImageFromBase64 to return a loaded image
jest.mock('@/js/modules/imageUtils.js', () => ({
  createImageFromBase64: jest.fn(() => ({ width: 100, height: 100, complete: true }))
}));

// Mock jsPDF - it's accessed via window.jspdf.jsPDF
const mockJsPDF = jest.fn().mockImplementation(() => ({
  addImage: jest.fn(),
  text: jest.fn(),
  addPage: jest.fn(),
  save: jest.fn(),
  setProperties: jest.fn(),
  setFontSize: jest.fn(),
  setTextColor: jest.fn(),
  setDrawColor: jest.fn(),
  rect: jest.fn(),
  output: jest.fn().mockReturnValue('mock-blob'),
  internal: {
    pageSize: {
      getWidth: jest.fn().mockReturnValue(210),
      getHeight: jest.fn().mockReturnValue(297)
    }
  }
}));

global.window = global.window || {};
global.window.jspdf = {
  jsPDF: mockJsPDF
};

describe('PDF Generator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generatePDF', () => {
    it('should generate PDF with cards', async () => {
      const mockCardSets = [
        {
          cards: [
            {
              title: 'Test Bingo',
              grid: [
                [{ id: 1, name: 'Item 1', data: 'data:image/jpeg;base64,mock', icon: null, text: 'Item 1', isFreeSpace: false }, { icon: null, text: 'Item 2', isFreeSpace: false }, { icon: null, text: 'Item 3', isFreeSpace: false }, { icon: null, text: 'Item 4', isFreeSpace: false }, { icon: null, text: 'Item 5', isFreeSpace: false }],
                [{ icon: null, text: 'Item 6', isFreeSpace: false }, { icon: null, text: 'Item 7', isFreeSpace: false }, { icon: null, text: 'Item 8', isFreeSpace: false }, { icon: null, text: 'Item 9', isFreeSpace: false }, { icon: null, text: 'Item 10', isFreeSpace: false }],
                [{ icon: null, text: 'Item 11', isFreeSpace: false }, { icon: null, text: 'Item 12', isFreeSpace: false }, { icon: null, text: 'FREE', isFreeSpace: true }, { icon: null, text: 'Item 13', isFreeSpace: false }, { icon: null, text: 'Item 14', isFreeSpace: false }],
                [{ icon: null, text: 'Item 15', isFreeSpace: false }, { icon: null, text: 'Item 16', isFreeSpace: false }, { icon: null, text: 'Item 17', isFreeSpace: false }, { icon: null, text: 'Item 18', isFreeSpace: false }, { icon: null, text: 'Item 19', isFreeSpace: false }],
                [{ icon: null, text: 'Item 20', isFreeSpace: false }, { icon: null, text: 'Item 21', isFreeSpace: false }, { icon: null, text: 'Item 22', isFreeSpace: false }, { icon: null, text: 'Item 23', isFreeSpace: false }, { icon: null, text: 'Item 24', isFreeSpace: false }]
              ]
            }
          ]
        }
      ];

      const options = {
        cardSets: mockCardSets,
        identifier: 'test-id',
        compressionLevel: 'MEDIUM',
        showLabels: true
      };

      const result = await generatePDF(options);

      expect(mockJsPDF).toHaveBeenCalled();
      const pdfInstance = mockJsPDF.mock.results[0].value;
      expect(pdfInstance.addImage).toHaveBeenCalled();
      const addImageArgs = pdfInstance.addImage.mock.calls;
      const hasExpectedCall = addImageArgs.some(([imageData, format, x, y, width, height, alias]) => format === 'JPEG' && alias.startsWith('img-'));
      expect(hasExpectedCall).toBe(true);
      expect(result).toBe('mock-blob');
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
      expect(result).toBe('mock-blob');
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
