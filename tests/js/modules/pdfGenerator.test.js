/**
 * @jest-environment jsdom
 */

import { generatePDF, downloadPDFBlob } from '@/js/modules/pdfGenerator.js';

// Mock jsPDF
global.jsPDF = jest.fn().mockImplementation(() => ({
  addImage: jest.fn(),
  text: jest.fn(),
  addPage: jest.fn(),
  save: jest.fn(),
  output: jest.fn().mockReturnValue('mock-blob')
}));

describe('PDF Generator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generatePDF', () => {
    it('should generate PDF with cards', () => {
      const mockCards = [
        {
          title: 'Test Bingo',
          grid: [
            [{ icon: null, text: 'Item 1' }],
            [{ icon: null, text: 'Item 2' }]
          ]
        }
      ];

      const settings = {
        compression: 'MEDIUM',
        title: 'Test Bingo'
      };

      const result = generatePDF(mockCards, settings);
      
      expect(global.jsPDF).toHaveBeenCalled();
      expect(result).toBe('mock-blob');
    });

    it('should handle empty cards array', () => {
      const result = generatePDF([], { compression: 'MEDIUM' });
      
      expect(global.jsPDF).toHaveBeenCalled();
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
