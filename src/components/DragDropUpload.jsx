import React, { useState, useRef } from 'react';
import { FaUpload, FaImages, FaTimes, FaCheck } from 'react-icons/fa';
import { validateImageFile, compressImage } from '../services/imageUtils';
import LoadingSpinner from './LoadingSpinner';

function DragDropUpload({ 
  onFilesSelected, 
  maxFiles = 5,
  disabled = false,
  className = '',
  accept = "image/*",
  multiple = true 
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const [processingFiles, setProcessingFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [errors, setErrors] = useState([]);
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    setDragCounter(prev => prev + 1);
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragCounter(prev => prev - 1);
    if (dragCounter === 1) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    setDragCounter(0);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    await processFiles(files);
  };

  const handleFileInput = async (e) => {
    const files = Array.from(e.target.files);
    await processFiles(files);
  };

  const processFiles = async (files) => {
    if (!files.length) return;

    // Filter to image files only
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      setErrors(['Please select image files only']);
      return;
    }

    // Limit number of files
    const filesToProcess = multiple 
      ? imageFiles.slice(0, maxFiles - uploadedFiles.length)
      : [imageFiles[0]];

    setProcessingFiles(filesToProcess.map(file => ({
      file,
      name: file.name,
      status: 'processing',
      progress: 0
    })));

    setErrors([]);
    const processedFiles = [];
    const processingErrors = [];

    for (let i = 0; i < filesToProcess.length; i++) {
      const file = filesToProcess[i];
      
      try {
        // Update progress
        setProcessingFiles(prev => 
          prev.map((item, index) => 
            index === i ? { ...item, status: 'validating', progress: 20 } : item
          )
        );

        // Validate file
        const validation = validateImageFile(file);
        if (!validation.isValid) {
          processingErrors.push(`${file.name}: ${validation.errors.join(', ')}`);
          setProcessingFiles(prev => 
            prev.map((item, index) => 
              index === i ? { ...item, status: 'error', progress: 100 } : item
            )
          );
          continue;
        }

        // Update progress
        setProcessingFiles(prev => 
          prev.map((item, index) => 
            index === i ? { ...item, status: 'compressing', progress: 50 } : item
          )
        );

        // Compress image
        const compressed = await compressImage(file, {
          maxWidth: 400,
          maxHeight: 400,
          quality: 0.8
        });

        // Update progress
        setProcessingFiles(prev => 
          prev.map((item, index) => 
            index === i ? { ...item, status: 'complete', progress: 100 } : item
          )
        );

        processedFiles.push({
          name: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
          file: file,
          data: compressed.data,
          compressed: compressed,
          difficulty: 2, // Default to medium
          tags: []
        });

      } catch (error) {
        processingErrors.push(`${file.name}: Processing failed - ${error.message}`);
        setProcessingFiles(prev => 
          prev.map((item, index) => 
            index === i ? { ...item, status: 'error', progress: 100 } : item
          )
        );
      }
    }

    // Update errors
    if (processingErrors.length > 0) {
      setErrors(processingErrors);
    }

    // Add to uploaded files
    setUploadedFiles(prev => [...prev, ...processedFiles]);

    // Clear processing files after a delay
    setTimeout(() => {
      setProcessingFiles([]);
    }, 2000);

    // Notify parent component
    if (processedFiles.length > 0) {
      onFilesSelected(processedFiles);
    }
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setUploadedFiles([]);
    setErrors([]);
    setProcessingFiles([]);
  };

  const openFileDialog = () => {
    if (fileInputRef.current && !disabled) {
      fileInputRef.current.click();
    }
  };

  const canAcceptMoreFiles = uploadedFiles.length < maxFiles;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={openFileDialog}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragging 
            ? 'border-primary-400 bg-primary-50' 
            : canAcceptMoreFiles && !disabled
              ? 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              : 'border-gray-200 bg-gray-100 cursor-not-allowed'
          }
          ${disabled ? 'opacity-50' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple && canAcceptMoreFiles}
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled || !canAcceptMoreFiles}
        />

        <div className="space-y-4">
          <div className={`mx-auto w-16 h-16 ${isDragging ? 'text-primary-500' : 'text-gray-400'}`}>
            {isDragging ? (
              <FaUpload className="w-full h-full animate-bounce" />
            ) : (
              <FaImages className="w-full h-full" />
            )}
          </div>

          <div>
            <p className={`text-lg font-medium ${isDragging ? 'text-primary-700' : 'text-gray-700'}`}>
              {isDragging 
                ? 'Drop images here' 
                : disabled 
                  ? 'Upload disabled'
                  : !canAcceptMoreFiles
                    ? `Maximum ${maxFiles} files reached`
                    : 'Drag and drop images here'
              }
            </p>
            {canAcceptMoreFiles && !disabled && (
              <p className="text-sm text-gray-500 mt-2">
                or click to browse files
              </p>
            )}
          </div>

          {multiple && canAcceptMoreFiles && (
            <p className="text-xs text-gray-400">
              {uploadedFiles.length}/{maxFiles} files • Max 5MB each • JPG, PNG, GIF, WebP
            </p>
          )}
        </div>

        {isDragging && (
          <div className="absolute inset-0 bg-primary-100 bg-opacity-50 rounded-lg flex items-center justify-center">
            <div className="text-primary-600 font-medium">Drop to upload</div>
          </div>
        )}
      </div>

      {/* Processing Files */}
      {processingFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Processing...</h4>
          {processingFiles.map((item, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{item.name}</span>
                  <span className="text-xs text-gray-500 capitalize">{item.status}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      item.status === 'error' ? 'bg-red-500' : 
                      item.status === 'complete' ? 'bg-green-500' : 
                      'bg-blue-500'
                    }`}
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>
              {item.status === 'processing' && <LoadingSpinner size="small" />}
              {item.status === 'complete' && <FaCheck className="w-4 h-4 text-green-500" />}
              {item.status === 'error' && <FaTimes className="w-4 h-4 text-red-500" />}
            </div>
          ))}
        </div>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">
              Ready to Upload ({uploadedFiles.length})
            </h4>
            <button
              onClick={clearAll}
              className="text-sm text-red-600 hover:text-red-800 underline"
            >
              Clear All
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {uploadedFiles.map((item, index) => (
              <div key={index} className="relative bg-white border rounded-lg p-3">
                <button
                  onClick={() => removeFile(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <FaTimes className="w-3 h-3" />
                </button>
                
                <div className="space-y-2">
                  <img
                    src={item.data}
                    alt={item.name}
                    className="w-full h-20 object-contain bg-gray-50 rounded border"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {item.name}
                    </p>
                    {item.compressed && (
                      <p className="text-xs text-gray-500">
                        {item.compressed.width}×{item.compressed.height}
                        {item.compressed.compressionRatio > 0 && 
                          ` • ${item.compressed.compressionRatio}% smaller`
                        }
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-red-700">Errors:</h4>
          <div className="space-y-1">
            {errors.map((error, index) => (
              <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                {error}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default DragDropUpload;