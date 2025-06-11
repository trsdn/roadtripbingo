// Road Trip Bingo - Main Application
// Main entry point that coordinates all modules and UI interactions

// Import modules
import storage from './modules/indexedDBStorage.js';
import { setLanguage, getTranslatedText, initLanguageSelector } from './modules/i18n.js';
import { convertBlobToBase64Icon } from './modules/imageUtils.js';
import { generateBingoCards, calculateExpectedMultiHitCount } from './modules/cardGenerator.js';
import { generatePDF, downloadPDFBlob } from './modules/pdfGenerator.js';

// DOM elements
let titleInput;
let gridSizeSelect;
let setCountInput;
let setCountInfo;
let cardCountInput;
let generateBtn;
let downloadBtn;
let cardPreview;
let identifierElement;
let iconUploadInput;
let uploadIconBtn;
let clearIconsBtn;
let optimizeStorageBtn;
let iconGallery;
let backupBtn;
let restoreBtn;
let restoreInput;
let pdfCompression;
let iconCount;
let centerBlankToggle;
let sameCardToggle;
let showLabelsToggle;
let multiHitToggle;
let difficultyRadios;
let multiHitOptions;
let multiHitPreview;

// Application state
let availableIcons = [];
let generatedCards = null;
let showLabels = true;

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    console.log('=== Road Trip Bingo Debug Info ===');
    console.log('DOMContentLoaded event fired');
    console.log('Document ready state:', document.readyState);
    
    try {
        console.log('Initializing Road Trip Bingo Generator...');

        // Initialize modules
        window.iconDB = storage; // For backward compatibility
        await storage.init();
        console.log('Storage initialized');
        // ----- Load persisted settings *before* any long async work -----
        const settings = await storage.loadSettings();
        console.log('Settings loaded');

        // Extract values so we can apply them once the DOM elements exist
        showLabels = settings.showLabels !== false;          // default true
        const centerBlank     = settings.centerBlank !== false; // default true
        const sameCard        = settings.sameCard || false; // default false
        const multiHitMode    = settings.multiHitMode || false; // default false
        const multiHitDifficulty = settings.multiHitDifficulty || 'MEDIUM'; // default MEDIUM
        
        // Initialize DOM elements
        initializeDOMElements();
        console.log('DOM elements initialized');
        // ----- Apply the loaded settings to UI controls -----
        if (showLabelsToggle) showLabelsToggle.checked = showLabels;
        if (centerBlankToggle) centerBlankToggle.checked = centerBlank;
        if (sameCardToggle) sameCardToggle.checked = sameCard;

        if (multiHitToggle) {
            multiHitToggle.checked = multiHitMode;
            if (multiHitOptions) {
                multiHitOptions.style.display = multiHitMode ? 'block' : 'none';
            }
        }
        if (difficultyRadios) {
            difficultyRadios.forEach(radio => {
                radio.checked = radio.value === multiHitDifficulty;
            });
        }
        
        // Initialize language selector with persisted language if available
        initLanguageSelector((language) => {
            // Save language preference
            storage.saveSettings({ language });
            updateUI();
        }, settings.language || 'en');
        console.log('Language selector initialized');

        // Load saved icons
        await loadIcons();
        console.log('Icons loading completed');
        
        // Update UI after icons are loaded
        updateUI();
        
        // Add event listeners
        setupEventListeners();
        console.log('Event listeners setup complete');
        
        console.log('Application initialized successfully');
    } catch (error) {
        console.error('Error during initialization:', error);
        alert('There was an error initializing the application. Please check the browser console for details.');
    }
});

// Initialize DOM elements
function initializeDOMElements() {
    console.log('Initializing DOM elements...');
    
    titleInput = document.getElementById('title');
    gridSizeSelect = document.getElementById('gridSize');
    setCountInput = document.getElementById('setCount');
    setCountInfo = document.getElementById('setCountInfo');
    cardCountInput = document.getElementById('cardCount');
    generateBtn = document.getElementById('generateBtn');
    downloadBtn = document.getElementById('downloadBtn');
    cardPreview = document.getElementById('cardPreview');
    identifierElement = document.getElementById('identifier');
    iconUploadInput = document.getElementById('iconUpload');
    uploadIconBtn = document.getElementById('uploadIconBtn');
    clearIconsBtn = document.getElementById('clearIcons');
    optimizeStorageBtn = document.getElementById('optimizeStorage');
    iconGallery = document.getElementById('iconGallery');
    iconCount = document.getElementById('iconCount');
    backupBtn = document.getElementById('backupBtn');
    restoreBtn = document.getElementById('restoreBtn');
    restoreInput = document.getElementById('restoreInput');
    pdfCompression = document.getElementById('pdfCompression');
    centerBlankToggle = document.getElementById('centerBlankToggle');
    sameCardToggle = document.getElementById('sameCardToggle');
    showLabelsToggle = document.getElementById('showLabelsToggle');
    multiHitToggle = document.getElementById('multiHitToggle');
    multiHitOptions = document.getElementById('multiHitOptions');
    multiHitPreview = document.getElementById('multiHitPreview');
    difficultyRadios = document.querySelectorAll('input[name="difficulty"]');
    
    // Debug: Check if critical elements are found
    console.log('Upload button found:', !!uploadIconBtn);
    console.log('File input found:', !!iconUploadInput);
    console.log('Clear button found:', !!clearIconsBtn);
    
    // Verify required elements exist
    const missingElements = [];
    if (!uploadIconBtn) missingElements.push('uploadIconBtn');
    if (!iconUploadInput) missingElements.push('iconUpload');
    if (!clearIconsBtn) missingElements.push('clearIcons');
    
    if (missingElements.length > 0) {
        console.error('Missing DOM elements:', missingElements);
        alert('Some buttons are not working. Missing elements: ' + missingElements.join(', '));
    }
}

// Setup all event listeners
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Grid size change
    gridSizeSelect.addEventListener('change', () => {
        updateRequiredIconCount();
        updateMultiHitPreview();
    });
    
    // Set count change
    setCountInput.addEventListener('change', updateRequiredIconCount);
    
    // Cards per set change
    cardCountInput.addEventListener('change', updateRequiredIconCount);
    
    // Generate button
    generateBtn.addEventListener('click', generateCards);
    
    // Download button
    downloadBtn.addEventListener('click', downloadPDF);
    
    // Icon upload button
    console.log('Attaching upload button listener to:', uploadIconBtn);
    uploadIconBtn.addEventListener('click', () => {
        console.log('Upload button clicked!');
        iconUploadInput.click();
    });
    
    // Icon upload file input
    console.log('Attaching file input listener to:', iconUploadInput);
    iconUploadInput.addEventListener('change', uploadIcons);
    
    // Clear icons
    console.log('Attaching clear icons listener to:', clearIconsBtn);
    clearIconsBtn.addEventListener('click', clearIcons);
    
    // Optimize storage
    if (optimizeStorageBtn) {
        optimizeStorageBtn.addEventListener('click', optimizeStorageManually);
    }
    
    // Backup data
    backupBtn.addEventListener('click', backupData);
    
    // Restore data
    restoreBtn.addEventListener('click', () => restoreInput.click());
    restoreInput.addEventListener('change', restoreData);
    
    // Center blank toggle
    if (centerBlankToggle) {
        centerBlankToggle.addEventListener('change', () => {
            storage.saveSettings({ centerBlank: centerBlankToggle.checked });
            updateRequiredIconCount();
            updateMultiHitPreview();
        });
    }

    // Same card toggle
    if (sameCardToggle) {
        sameCardToggle.addEventListener('change', () => {
            storage.saveSettings({ sameCard: sameCardToggle.checked });
            updateRequiredIconCount();
        });
    }
    
    // Show labels toggle
    if (showLabelsToggle) {
        showLabelsToggle.addEventListener('change', () => {
            showLabels = showLabelsToggle.checked;
            storage.saveSettings({ showLabels });
            updateUI();
        });
    }
    
    // Multi-hit mode toggle
    if (multiHitToggle) {
        multiHitToggle.addEventListener('change', () => {
            const isEnabled = multiHitToggle.checked;
            if (multiHitOptions) {
                multiHitOptions.style.display = isEnabled ? 'block' : 'none';
            }
            storage.saveSettings({ multiHitMode: isEnabled });
            updateMultiHitPreview();
        });
        
        // Tell the Cypress hook that listeners are ready
        multiHitToggle._hasEventListeners = true;
    }
    
    // Difficulty radio buttons
    if (difficultyRadios) {
        difficultyRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                if (radio.checked) {
                    storage.saveSettings({ multiHitDifficulty: radio.value });
                    updateMultiHitPreview();
                }
            });
        });
    }
    
    console.log('Event listeners setup complete');
    
    // Update the required icon count initially
    updateRequiredIconCount();
    
    // Update multi-hit preview initially
    updateMultiHitPreview();
}

// Load icons from storage
async function loadIcons() {
    try {
        availableIcons = await storage.loadIcons();
        updateIconGallery();
        updateStorageInfo();
        updateRequiredIconCount(); // Update UI state after loading icons
        console.log(`Loaded ${availableIcons.length} icons from storage`);
    } catch (error) {
        console.error('Error loading icons:', error);
    }
}

// Save icons to storage
async function saveIconsToStorage() {
    try {
        const result = await storage.saveIcons(availableIcons);
        // Handle case where storage optimized the icons
        if (result && result.length !== availableIcons.length) {
            availableIcons = result;
            updateIconGallery();
        }
        updateIconCount();
        updateStorageInfo();
        console.log(`Saved ${availableIcons.length} icons to storage`);
        return true;
    } catch (error) {
        console.error('Error saving icons to storage:', error);
        
        // Check if it's a quota exceeded error
        if (error.name === 'QuotaExceededError' || 
            error.toString().includes('quota') || 
            error.toString().includes('storage')) {
            showStorageWarning('Storage limit exceeded. Try removing some icons or using smaller images.');
        } else {
            showStorageWarning('Error saving icons. Please try again.');
        }
        return false;
    }
}

// Show storage warning to user
function showStorageWarning(message) {
    // Remove existing warnings first
    const existingWarnings = document.querySelectorAll('.storage-warning');
    existingWarnings.forEach(warning => warning.remove());
    
    const warning = document.createElement('div');
    warning.className = 'storage-warning';
    warning.textContent = message;
    
    const iconManager = document.getElementById('iconManager');
    iconManager.insertBefore(warning, iconManager.firstChild);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
        if (warning.parentNode) {
            warning.remove();
        }
    }, 10000);
}

// Show storage info message
function showStorageInfo(message) {
    const existingInfo = document.querySelector('.storage-info');
    if (existingInfo) {
        existingInfo.remove();
    }
    
    const info = document.createElement('div');
    info.className = 'storage-info';
    info.textContent = message;
    
    const iconManager = document.getElementById('iconManager');
    iconManager.insertBefore(info, iconManager.firstChild);
    
    // Auto-remove after 8 seconds
    setTimeout(() => {
        if (info.parentNode) {
            info.remove();
        }
    }, 8000);
}

// Update storage information display
async function updateStorageInfo() {
    try {
        const info = await storage.getStorageInfo();
        const iconCountElement = document.getElementById('iconCount');
        
        if (info.isOverLimit) {
            iconCountElement.style.color = '#ff6b6b';
            iconCountElement.title = `Storage over limit: ${info.totalSizeMB.toFixed(1)}MB / ${info.quotaMB.toFixed(1)}MB`;
            if (optimizeStorageBtn) {
                optimizeStorageBtn.style.display = 'inline-block';
            }
            showStorageWarning(`Storage is full (${info.totalSizeMB.toFixed(1)}MB). Some features may not work properly.`);
        } else if (info.isNearLimit) {
            iconCountElement.style.color = '#ffa726';
            iconCountElement.title = `Storage near limit: ${info.totalSizeMB.toFixed(1)}MB / ${info.quotaMB.toFixed(1)}MB`;
            if (optimizeStorageBtn) {
                optimizeStorageBtn.style.display = 'inline-block';
            }
        } else {
            iconCountElement.style.color = '#4CAF50';
            iconCountElement.title = `IndexedDB storage: ${info.totalSizeMB.toFixed(1)}MB / ${info.quotaMB.toFixed(1)}MB`;
            if (optimizeStorageBtn) {
                optimizeStorageBtn.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Error getting storage info:', error);
    }
}

// Upload new icons
async function uploadIcons() {
    console.log('uploadIcons function called');
    const files = iconUploadInput.files;
    console.log('Selected files:', files ? files.length : 'none');
    
    if (!files || files.length === 0) {
        alert('Please select at least one image file');
        return;
    }
    
    try {
        const newIcons = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            // Check if it's an image
            if (!file.type.startsWith('image/')) {
                console.warn(`Skipping non-image file: ${file.name}`);
                continue;
            }
            
            const iconData = await convertBlobToBase64Icon(file, file.name);
            newIcons.push(iconData);
        }
        
        if (newIcons.length > 0) {
            // Add new icons to existing ones
            availableIcons = [...availableIcons, ...newIcons];
            
            // Save to storage
            const saveResult = await saveIconsToStorage();
            
            // Reset the file input
            iconUploadInput.value = '';
            
            // Update UI
            updateIconGallery();
            updateRequiredIconCount();
        }
    } catch (error) {
        console.error('Error uploading icons:', error);
        alert('Error uploading one or more icons. Please try again.');
    }
}

// Clear all icons
async function clearIcons() {
    console.log('clearIcons function called');
    if (confirm('Are you sure you want to remove all icons?')) {
        console.log('User confirmed icon clearing');
        availableIcons = [];
        await saveIconsToStorage();
        updateIconGallery();
        updateRequiredIconCount();
        console.log('Icons cleared successfully');
    } else {
        console.log('User cancelled icon clearing');
    }
}

// Update icon count display
function updateIconCount() {
    if (iconCount) {
        iconCount.textContent = availableIcons.length;
    }
    updateStorageInfo(); // This is now async but we don't need to wait
}

// Update the icon gallery display
function updateIconGallery() {
    if (!iconGallery) return;
    
    iconGallery.innerHTML = '';
    
    availableIcons.forEach((icon, index) => {
        const iconElement = document.createElement('div');
        iconElement.className = 'icon-item';
        
        const img = document.createElement('img');
        img.src = icon.data;
        img.alt = icon.name;
        img.title = icon.name;
        
        const deleteBtn = document.createElement('span');
        deleteBtn.className = 'delete-icon';
        deleteBtn.textContent = '×';
        deleteBtn.title = 'Remove this icon';
        deleteBtn.addEventListener('click', () => deleteIcon(icon.id, index));
        
        iconElement.appendChild(img);
        iconElement.appendChild(deleteBtn);
        iconGallery.appendChild(iconElement);
    });
    
    updateIconCount();
}

// Delete a single icon
async function deleteIcon(id, index) {
    try {
        // Delete from storage
        await storage.deleteIcon(id);
        
        // Also remove from the local array
        availableIcons.splice(index, 1);
        
        // Update UI
        updateIconGallery();
        updateRequiredIconCount();
    } catch (error) {
        console.error('Error deleting icon:', error);
        alert('Failed to delete the icon. Please try again.');
    }
}

// Update the required icon count based on selected options
function updateRequiredIconCount() {
    const gridSize = parseInt(gridSizeSelect.value);
    const setCount = parseInt(setCountInput.value);
    const cardsPerSet = parseInt(cardCountInput.value);
    const leaveCenterBlank = centerBlankToggle && centerBlankToggle.checked;
    const sameCard = sameCardToggle && sameCardToggle.checked;
    let cellsPerCard = gridSize * gridSize;
    if (leaveCenterBlank && (gridSize === 5 || gridSize === 7 || gridSize === 9)) {
        cellsPerCard -= 1;
    }
    const iconsNeededPerSet = cellsPerCard * (sameCard ? 1 : cardsPerSet);
    
    // Update info text
    let infoText = '';
    
    if (availableIcons.length < iconsNeededPerSet) {
        // Not enough icons
        infoText = getTranslatedText('needIcons', { count: iconsNeededPerSet });
        generateBtn.disabled = true;
    } else {
        // Enough icons
        if (setCount > 1) {
            infoText = getTranslatedText('manyUniqueSets', { count: availableIcons.length });
        }
        generateBtn.disabled = false;
    }
    
    // Update icon availability text
    const availabilityText = getTranslatedText('iconsAvailable', {
        available: availableIcons.length,
        needed: iconsNeededPerSet
    });
    
    // Update UI
    setCountInfo.textContent = infoText;
    document.getElementById('iconAvailability').textContent = availabilityText;
}

// Update multi-hit preview display
function updateMultiHitPreview() {
    if (!multiHitToggle || !multiHitPreview) return;
    
    if (!multiHitToggle.checked) {
        multiHitPreview.textContent = '';
        return;
    }
    
    const gridSize = parseInt(gridSizeSelect.value);
    const leaveCenterBlank = centerBlankToggle && centerBlankToggle.checked;
    
    // Get selected difficulty
    let selectedDifficulty = 'MEDIUM';
    if (difficultyRadios) {
        for (const radio of difficultyRadios) {
            if (radio.checked) {
                selectedDifficulty = radio.value;
                break;
            }
        }
    }
    
    const expectedCount = calculateExpectedMultiHitCount(gridSize, leaveCenterBlank, selectedDifficulty);
    const totalCells = leaveCenterBlank && (gridSize === 5 || gridSize === 7 || gridSize === 9) 
        ? gridSize * gridSize - 1 
        : gridSize * gridSize;
    
    multiHitPreview.textContent = `Expected: ~${expectedCount} of ${totalCells} tiles will require multiple hits`;
}

// Generate Bingo cards
function generateCards() {
    const gridSize = parseInt(gridSizeSelect.value);
    const setCount = parseInt(setCountInput.value);
    const cardsPerSet = parseInt(cardCountInput.value);
    const title = titleInput.value.trim();
    const leaveCenterBlank = centerBlankToggle && centerBlankToggle.checked;
    const sameCard = sameCardToggle && sameCardToggle.checked;
    
    // Get multi-hit settings
    const multiHitMode = multiHitToggle && multiHitToggle.checked;
    let difficulty = 'MEDIUM';
    if (difficultyRadios) {
        for (const radio of difficultyRadios) {
            if (radio.checked) {
                difficulty = radio.value;
                break;
            }
        }
    }
    
    try {
        // Generate the cards
        const result = generateBingoCards({
            icons: availableIcons,
            gridSize,
            setCount,
            cardsPerSet,
            title,
            leaveCenterBlank,
            sameCard,
            multiHitMode,
            difficulty
        });
        
        generatedCards = result;
        
        // Display the identifier
        identifierElement.textContent = result.identifier;
        
        // Enable download button
        downloadBtn.disabled = false;
        
        // Display preview of the first card
        displayCardPreview(result.cardSets[0].cards[0]);
        
        // Save generation parameters to storage
        storage.saveSettings({
            lastGeneration: {
                gridSize,
                setCount,
                cardsPerSet,
                title,
                timestamp: new Date().toISOString()
            }
        });
        
        // Show success message
        alert(`Successfully generated ${setCount} set(s) with ${cardsPerSet} card(s) each.`);
    } catch (error) {
        console.error('Error generating cards:', error);
        alert(`Error generating cards: ${error.message}`);
    }
}

// Display card preview
function displayCardPreview(card) {
  // Defensive check
  if (!card || !Array.isArray(card.grid)) {
    cardPreview.innerHTML = '<div class="error-message">Error: Card data is invalid or missing. Please check your icon selection and try again.</div>';
    console.error('displayCardPreview: card or card.grid is undefined', card);
    return;
  }
  // Use CSS grid for preview
  cardPreview.innerHTML = '';
  const gridSize = card.grid.length;
  const container = document.createElement('div');
  container.className = 'bingo-card-preview-grid';
  container.style.display = 'grid';
  container.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
  container.style.gap = '6px';
  container.style.background = '#fff';
  container.style.padding = '12px';
  container.style.border = '2px solid #000';
  container.style.maxWidth = '420px';
  container.style.margin = '0 auto';

  // Add card title
  const title = document.createElement('div');
  title.className = 'card-title';
  title.textContent = card.title;
  title.style.gridColumn = `1 / span ${gridSize}`;
  title.style.textAlign = 'center';
  title.style.fontWeight = 'bold';
  title.style.fontSize = '1.2em';
  title.style.marginBottom = '8px';
  container.appendChild(title);

  // Render grid cells
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const cell = card.grid[row][col];
      const cellDiv = document.createElement('div');
      cellDiv.className = 'bingo-cell';
      cellDiv.style.background = cell.isFreeSpace ? '#f5f5f5' : '#fff';
      cellDiv.style.display = 'flex';
      cellDiv.style.flexDirection = 'column';
      cellDiv.style.alignItems = 'center';
      cellDiv.style.justifyContent = 'center';
      cellDiv.style.aspectRatio = '1/1';
      cellDiv.style.border = '1px solid #ddd';
      cellDiv.style.position = 'relative';
      cellDiv.style.overflow = 'hidden';
      if (cell.isFreeSpace) {
        cellDiv.classList.add('free-space');
      } else if (cell.data) {
        const img = document.createElement('img');
        img.src = cell.data;
        img.alt = cell.name || '';
        img.style.maxWidth = '80%';
        img.style.maxHeight = showLabels ? '60%' : '80%';
        img.style.objectFit = 'contain';
        img.style.margin = '0 auto';
        cellDiv.appendChild(img);
        
        // Add multi-hit badge if applicable
        if (cell.isMultiHit && cell.hitCount > 1) {
          const badge = document.createElement('div');
          badge.className = 'multi-hit-badge';
          badge.textContent = cell.hitCount;
          badge.style.position = 'absolute';
          badge.style.top = '4px';
          badge.style.right = '4px';
          badge.style.width = '20px';
          badge.style.height = '20px';
          badge.style.borderRadius = '50%';
          badge.style.backgroundColor = '#ff4444';
          badge.style.color = 'white';
          badge.style.fontSize = '11px';
          badge.style.fontWeight = 'bold';
          badge.style.display = 'flex';
          badge.style.alignItems = 'center';
          badge.style.justifyContent = 'center';
          badge.style.border = '2px solid white';
          badge.style.boxShadow = '0 1px 3px rgba(0,0,0,0.3)';
          badge.style.zIndex = '10';
          cellDiv.appendChild(badge);
        }
        
        if (showLabels) {
          const label = document.createElement('div');
          label.className = 'icon-label';
          label.textContent = cell.name || '';
          label.style.fontSize = '0.9em';
          label.style.marginTop = '4px';
          label.style.textAlign = 'center';
          label.style.wordBreak = 'break-word';
          label.style.width = '100%';
          cellDiv.appendChild(label);
        }
      }
      container.appendChild(cellDiv);
    }
  }
  cardPreview.appendChild(container);
}

// Download the Bingo cards as PDF
async function downloadPDF() {
    // Show loading indicator
    downloadBtn.textContent = 'Generating PDF...';
    downloadBtn.disabled = true;
    
    // Use setTimeout to allow the UI to update before starting PDF generation
    setTimeout(async () => {
        try {
            // Get selected compression level
            const compressionLevel = pdfCompression.value;
            
            // Generate the PDF
            const pdfBlob = await generatePDF({
                cardSets: generatedCards.cardSets,
                identifier: generatedCards.identifier,
                compressionLevel,
                showLabels // include toggle state
            });
            
            // Download the PDF
            downloadPDFBlob(pdfBlob, 'bingo-cards.pdf');
            
            // Reset button
            downloadBtn.textContent = 'Download PDF';
            downloadBtn.disabled = false;
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error generating PDF. Please try again.');
            
            // Reset button
            downloadBtn.textContent = 'Download PDF';
            downloadBtn.disabled = false;
        }
    }, 100);
}

// Backup data
function backupData() {
    try {
        storage.exportData();
        alert(getTranslatedText('backupSuccess'));
    } catch (error) {
        console.error('Error backing up data:', error);
        alert(`Error backing up data: ${error.message}`);
    }
}

// Restore data
async function restoreData() {
    const file = restoreInput.files[0];
    if (!file) {
        return;
    }
    
    try {
        await storage.importData(file);
        alert(getTranslatedText('restoreSuccess'));
        
        // Reload the page to reflect the restored data
        setTimeout(() => {
            window.location.reload();
        }, 500);
    } catch (error) {
        console.error('Error restoring data:', error);
        alert(getTranslatedText('restoreError'));
    } finally {
        // Clear the file input
        restoreInput.value = '';
    }
}

// Manually optimize storage by removing older icons
async function optimizeStorageManually() {
    if (availableIcons.length === 0) {
        alert('No icons to optimize.');
        return;
    }
    
    const originalCount = availableIcons.length;
    const keepCount = Math.max(20, Math.floor(originalCount * 0.6)); // Keep 60% or at least 20
    
    if (confirm(`This will keep only the first ${keepCount} icons out of ${originalCount}. Continue?`)) {
        availableIcons = availableIcons.slice(0, keepCount);
        await saveIconsToStorage();
        updateIconGallery();
        
        showStorageInfo(`Storage optimized: Kept ${keepCount} out of ${originalCount} icons`);
    }
}

// Update the UI based on current settings
function updateUI() {
    updateRequiredIconCount();
}

// Export for testing
// Convert from CommonJS to ES Module exports
const exports = {
    updateRequiredIconCount,
    generateCards,
    displayCardPreview
};

export default exports;