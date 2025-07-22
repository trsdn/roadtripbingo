/**
 * Image compression and processing utilities
 */

/**
 * Compress an image file to base64 with quality control
 */
export function compressImage(file, options = {}) {
  const {
    maxWidth = 400,
    maxHeight = 400,
    quality = 0.8,
    format = 'image/jpeg'
  } = options;
  
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Invalid image file'));
      return;
    }
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      try {
        // Calculate dimensions maintaining aspect ratio
        let { width, height } = calculateDimensions(img.width, img.height, maxWidth, maxHeight);
        
        canvas.width = width;
        canvas.height = height;
        
        // Fill with white background for JPEGs
        if (format === 'image/jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
        }
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL(format, quality);
        
        resolve({
          data: compressedDataUrl,
          width,
          height,
          originalSize: file.size,
          compressedSize: Math.round(compressedDataUrl.length * 0.75), // Rough base64 to bytes
          compressionRatio: Math.round((1 - (compressedDataUrl.length * 0.75) / file.size) * 100)
        });
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Calculate new dimensions maintaining aspect ratio
 */
function calculateDimensions(originalWidth, originalHeight, maxWidth, maxHeight) {
  let width = originalWidth;
  let height = originalHeight;
  
  // Scale down if too large
  if (width > maxWidth) {
    height = (height * maxWidth) / width;
    width = maxWidth;
  }
  
  if (height > maxHeight) {
    width = (width * maxHeight) / height;
    height = maxHeight;
  }
  
  return { width: Math.round(width), height: Math.round(height) };
}

/**
 * Convert blob to base64 icon data
 */
export function convertBlobToBase64Icon(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Get image dimensions from base64 data
 */
export function getImageDimensions(base64Data) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = reject;
    img.src = base64Data;
  });
}

/**
 * Create an image element from base64 data
 */
export function createImageFromBase64(base64Data, alt = '') {
  const img = new Image();
  img.src = base64Data;
  img.alt = alt;
  img.style.maxWidth = '100%';
  img.style.height = 'auto';
  return img;
}

/**
 * Validate image file type and size
 */
export function validateImageFile(file, options = {}) {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp']
  } = options;
  
  const errors = [];
  
  if (!file) {
    errors.push('No file provided');
    return { isValid: false, errors };
  }
  
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} not allowed. Allowed types: ${allowedTypes.join(', ')}`);
  }
  
  if (file.size > maxSize) {
    errors.push(`File size ${formatBytes(file.size)} exceeds maximum of ${formatBytes(maxSize)}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Format bytes to human readable string
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Batch compress multiple image files
 */
export async function batchCompressImages(files, options = {}) {
  const results = [];
  
  for (const file of files) {
    try {
      const result = await compressImage(file, options);
      results.push({ success: true, file: file.name, ...result });
    } catch (error) {
      results.push({ 
        success: false, 
        file: file.name, 
        error: error.message 
      });
    }
  }
  
  return results;
}