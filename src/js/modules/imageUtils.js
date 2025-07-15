// Road Trip Bingo - Image Utilities
// Provides functions for handling images

/**
 * Compress an image to reduce its size
 * @param {Blob} blob - The image blob to compress
 * @returns {Promise<Blob>} - Promise that resolves with the compressed image
 */
function compressImage(blob) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        let objectUrl = null;
        
        // Create cleanup function to ensure URL object is revoked
        function cleanupUrl() {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
                objectUrl = null;
            }
        }
        
        img.onload = function() {
            try {
                // Create a canvas to resize the image
                const canvas = document.createElement('canvas');
                
                // Calculate new dimensions while maintaining aspect ratio
                let width = img.width;
                let height = img.height;
                const maxDimension = 400; // Reduced from 800 to 400px for smaller storage size
                
                if (width > height && width > maxDimension) {
                    height = Math.round(height * (maxDimension / width));
                    width = maxDimension;
                } else if (height > maxDimension) {
                    width = Math.round(width * (maxDimension / height));
                    height = maxDimension;
                }
                
                // Set canvas dimensions
                canvas.width = width;
                canvas.height = height;
                
                // Draw the image onto the canvas
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // Clean up the URL
                cleanupUrl();
                
                // For PNG with transparency, keep as PNG
                const isPNG = blob.type === 'image/png';
                
                // Convert to blob
                canvas.toBlob(
                    compressedBlob => {
                        if (compressedBlob) {
                            resolve(compressedBlob);
                        } else {
                            reject(new Error('Failed to compress image'));
                        }
                    },
                    isPNG ? 'image/png' : 'image/jpeg',
                    isPNG ? 0.8 : 0.7 // Increased compression: 0.8 for PNG, 0.7 for JPEG
                );
            } catch (error) {
                cleanupUrl();
                reject(error);
            }
        };
        
        img.onerror = function() {
            cleanupUrl();
            reject(new Error('Failed to load image for compression'));
        };
        
        // Create an object URL for the blob
        objectUrl = URL.createObjectURL(blob);
        img.src = objectUrl;
    });
}

/**
 * Convert a Blob/File to a base64 encoded icon object
 * @param {Blob|File} blob - The image blob/file to convert
 * @param {string} name - The name of the icon
 * @returns {Promise<Object>} - Promise that resolves with the icon object
 */
function convertBlobToBase64Icon(blob, name) {
    return new Promise((resolve, reject) => {
        // Check if it's an SVG file - SVGs should not be compressed as they're already small
        const isSVG = blob.type === 'image/svg+xml';
        
        // First check if we need to compress the image (if it's too large and not an SVG)
        if (!isSVG && blob.size > 200 * 1024) { // Reduced threshold from 500KB to 200KB
            compressImage(blob)
                .then(compressedBlob => {
                    console.log(`Compressed image from ${(blob.size/1024).toFixed(2)}KB to ${(compressedBlob.size/1024).toFixed(2)}KB`);
                    processImage(compressedBlob);
                })
                .catch(err => {
                    console.warn('Image compression failed, using original:', err);
                    processImage(blob);
                });
        } else {
            processImage(blob);
        }
        
        function processImage(imageBlob) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const base64data = e.target.result;
                const iconName = name.replace(/\.[^/.]+$/, ""); // Remove file extension
                resolve({
                    id: Date.now() + '-' + Math.floor(Math.random() * 1000),
                    name: iconName,
                    image: base64data,
                    data: base64data  // Keep for backward compatibility
                });
            };
            reader.onerror = function() {
                reject(new Error('Failed to read image file'));
            };
            reader.readAsDataURL(imageBlob);
        }
    });
}

/**
 * Create and return an image element from base64 data
 * @param {string} base64Data - The base64 encoded image data
 * @returns {HTMLImageElement} - The created image element
 */
function createImageFromBase64(base64Data) {
    const img = new Image();
    img.src = base64Data;
    return img;
}

// Export functions
/**
 * Load an image from base64 data and get its natural dimensions
 * @param {string} base64Data - The base64 encoded image data
 * @returns {Promise<{width:number,height:number}>} - Promise resolving with dimensions
 */
function getImageDimensions(base64Data) {
    return new Promise((resolve) => {
        const img = createImageFromBase64(base64Data);
        if (img.complete && (img.naturalWidth || img.width)) {
            resolve({ width: img.naturalWidth || img.width, height: img.naturalHeight || img.height });
        } else {
            img.onload = function() {
                resolve({ width: img.naturalWidth || img.width, height: img.naturalHeight || img.height });
            };
            img.onerror = function() {
                resolve({ width: 100, height: 100 });
            };
        }
    });
}

export {
    compressImage,
    convertBlobToBase64Icon,
    createImageFromBase64,
    getImageDimensions
};
