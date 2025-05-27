/**
 * @jest-environment jsdom
 */

import { convertBlobToBase64Icon } from '@/js/modules/imageUtils.js';

describe('Image Utils', () => {
  describe('convertBlobToBase64Icon', () => {
    it('should convert blob to base64', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/png' });
      const mockFile = new File([mockBlob], 'test.png', { type: 'image/png' });
      
      // Mock FileReader
      const mockFileReader = {
        readAsDataURL: jest.fn(),
        result: 'data:image/png;base64,dGVzdA==',
        onload: null,
        onerror: null
      };
      
      global.FileReader = jest.fn(() => mockFileReader);
      
      const promise = convertBlobToBase64Icon(mockFile, 'test.png');
      
      // Simulate successful read with proper event structure
      mockFileReader.onload({ target: { result: 'data:image/png;base64,dGVzdA==' } });
      
      const result = await promise;
      expect(result).toEqual({
        id: expect.any(String),
        name: 'test',
        data: 'data:image/png;base64,dGVzdA=='
      });
    });

    it('should handle file read error', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/png' });
      const mockFile = new File([mockBlob], 'test.png', { type: 'image/png' });
      
      const mockFileReader = {
        readAsDataURL: jest.fn(),
        onerror: null,
        onload: null
      };
      
      global.FileReader = jest.fn(() => mockFileReader);
      
      const promise = convertBlobToBase64Icon(mockFile, 'test.png');
      
      // Simulate error - the function doesn't pass the error object, just calls onerror
      mockFileReader.onerror();
      
      await expect(promise).rejects.toThrow('Failed to read image file');
    });
  });
});
