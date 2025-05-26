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
      
      const promise = convertBlobToBase64Icon(mockFile);
      
      // Simulate successful read
      mockFileReader.onload();
      
      const result = await promise;
      expect(result).toEqual({
        data: 'data:image/png;base64,dGVzdA==',
        name: 'test.png'
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
      
      const promise = convertBlobToBase64Icon(mockFile);
      
      // Simulate error
      mockFileReader.onerror(new Error('Read error'));
      
      await expect(promise).rejects.toThrow('Read error');
    });
  });
});
