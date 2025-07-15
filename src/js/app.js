// Road Trip Bingo - Main Application
// Main entry point that coordinates all modules and UI interactions

// Import modules
import storage from './modules/apiStorage.js';
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
let pdfLayout;
let iconCount;
let centerBlankToggle;
let sameCardToggle;
let showLabelsToggle;
let gameDifficulty;
let multiHitToggle;
let difficultyRadios;
let multiHitOptions;
let multiHitPreview;

// Enhanced CRUD DOM elements
let iconSearch;
let categoryFilter;
let difficultyFilter;
let dropZone;
let editIconModal;
let editIconModalContent;
let editIconName;
let editIconCategory;
let editIconTags;
let editIconAltText;
let editIconDifficulty;
let editIconPreview;
let editIconSaveBtn;
let editIconCancelBtn;
let editIconCloseBtn;

// Application state
let availableIcons = [];
let generatedCards = null;
let showLabels = true;

// Enhanced CRUD state
let filteredIcons = [];
let searchTerm = '';
let selectedCategory = '';
let selectedDifficulty = '';
let categories = [];
let currentEditingIcon = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    console.log('=== Road Trip Bingo Debug Info ===');
    console.log('DOMContentLoaded event fired');
    console.log('Document ready state:', document.readyState);
    
    try {
        console.log('Initializing Road Trip Bingo Generator...');

        // Initialize modules
        console.log('🔄 Initializing storage...');
        window.iconDB = storage; // For backward compatibility
        await storage.init();
        console.log('✅ Storage initialized');
        
        // ----- Load persisted settings *before* any long async work -----
        console.log('🔄 Loading settings...');
        const settings = await storage.loadSettings();
        console.log('✅ Settings loaded:', settings);

        // Extract values so we can apply them once the DOM elements exist
        showLabels = settings.showLabels !== false;          // default true
        const centerBlank     = settings.centerBlank !== false; // default true
        const sameCard        = settings.sameCard || false; // default false
        const multiHitMode    = settings.multiHitMode || false; // default false
        const multiHitDifficulty = settings.multiHitDifficulty || 'MEDIUM'; // default MEDIUM
        const iconDistribution = settings.iconDistribution || 'same-icons'; // default same-icons
        
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
        
        // Set icon distribution option
        const iconDistributionRadios = document.querySelectorAll('input[name="iconDistribution"]');
        if (iconDistributionRadios) {
            iconDistributionRadios.forEach(radio => {
                radio.checked = radio.value === iconDistribution;
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
        console.log('🔄 Loading icons...');
        await loadIcons();
        console.log('✅ Icons loading completed');
        
        // Load categories
        console.log('🔄 Loading categories...');
        await loadCategories();
        console.log('✅ Categories loading completed');
        
        // Setup drag and drop
        console.log('🔄 Setting up drag and drop...');
        setupDragAndDrop();
        console.log('✅ Drag and drop setup complete');
        
        // Update UI after icons are loaded
        console.log('🔄 Updating UI...');
        updateUI();
        console.log('✅ UI updated');
        
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
    uploadIconBtn = document.getElementById('uploadBtn');
    clearIconsBtn = document.getElementById('clearIconsBtn');
    optimizeStorageBtn = document.getElementById('optimizeStorage');
    iconGallery = document.getElementById('iconGallery');
    iconCount = document.getElementById('iconCount');
    backupBtn = document.getElementById('backupBtn');
    restoreBtn = document.getElementById('restoreBtn');
    restoreInput = document.getElementById('restoreInput');
    pdfCompression = document.getElementById('pdfCompression');
    pdfLayout = document.getElementById('pdfLayout');
    centerBlankToggle = document.getElementById('centerBlankToggle');
    sameCardToggle = document.getElementById('sameCardToggle');
    showLabelsToggle = document.getElementById('showLabelsToggle');
    gameDifficulty = document.getElementById('gameDifficulty');
    multiHitToggle = document.getElementById('multiHitToggle');
    multiHitOptions = document.getElementById('multiHitOptions');
    multiHitPreview = document.getElementById('multiHitPreview');
    difficultyRadios = document.querySelectorAll('input[name="difficulty"]');
    
    // Enhanced CRUD DOM elements
    iconSearch = document.getElementById('iconSearch');
    categoryFilter = document.getElementById('categoryFilter');
    difficultyFilter = document.getElementById('difficultyFilter');
    dropZone = document.getElementById('dropZone');
    editIconModal = document.getElementById('editIconModal');
    editIconModalContent = document.getElementById('editIconModalContent');
    editIconName = document.getElementById('editIconName');
    editIconCategory = document.getElementById('editIconCategory');
    editIconTags = document.getElementById('editIconTags');
    editIconAltText = document.getElementById('editIconAltText');
    editIconDifficulty = document.getElementById('editIconDifficulty');
    editIconPreview = document.getElementById('editIconPreview');
    editIconSaveBtn = document.getElementById('saveIconChanges');
    editIconCancelBtn = document.getElementById('cancelEditIcon');
    editIconCloseBtn = document.getElementById('closeEditModal');
    
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
        console.log('File input element:', iconUploadInput);
        if (iconUploadInput) {
            iconUploadInput.click();
            console.log('File input clicked');
        } else {
            console.error('File input element not found!');
            alert('File input not found! Please refresh the page.');
        }
    });
    
    // Icon upload file input
    console.log('Attaching file input listener to:', iconUploadInput);
    iconUploadInput.addEventListener('change', (event) => {
        console.log('📁 File input changed, calling uploadIcons');
        uploadIcons();
    });
    
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
        
        // Mark that event listeners are ready for testing
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
    
    // Icon distribution radio buttons
    const iconDistributionRadios = document.querySelectorAll('input[name="iconDistribution"]');
    if (iconDistributionRadios) {
        iconDistributionRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                if (radio.checked) {
                    storage.saveSettings({ iconDistribution: radio.value });
                    updateRequiredIconCount();
                }
            });
        });
    }
    
    // Enhanced CRUD event listeners
    if (iconSearch) {
        iconSearch.addEventListener('input', handleIconSearch);
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', handleCategoryFilter);
    }
    
    if (difficultyFilter) {
        difficultyFilter.addEventListener('change', handleDifficultyFilter);
    }
    
    if (editIconModal) {
        // Close modal when clicking outside
        editIconModal.addEventListener('click', (e) => {
            if (e.target === editIconModal) {
                closeEditModal();
            }
        });
    }
    
    if (editIconSaveBtn) {
        editIconSaveBtn.addEventListener('click', saveIconChanges);
    }
    
    if (editIconCancelBtn) {
        editIconCancelBtn.addEventListener('click', closeEditModal);
    }
    
    if (editIconCloseBtn) {
        editIconCloseBtn.addEventListener('click', closeEditModal);
    }
    
    // Escape key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && editIconModal && editIconModal.style.display === 'block') {
            closeEditModal();
        }
    });
    
    console.log('Event listeners setup complete');
    
    // Update the required icon count initially
    updateRequiredIconCount();
    
    // Update multi-hit preview initially
    updateMultiHitPreview();
}

// Load icons from storage
async function loadIcons() {
    try {
        console.log('🔄 Starting to load icons from storage...');
        availableIcons = await storage.loadIcons();
        console.log(`✅ Loaded ${availableIcons.length} icons from storage`);
        
        // Apply current filters
        filterIcons();
        
        updateIconGallery();
        updateStorageInfo();
        updateRequiredIconCount(); // Update UI state after loading icons
        
        console.log(`🎯 Generate button should now be ${availableIcons.length >= 25 ? 'enabled' : 'disabled'}`);
    } catch (error) {
        console.error('❌ Error loading icons:', error);
        availableIcons = []; // Ensure we have an empty array on error
        filteredIcons = [];
        updateIconGallery();
        updateStorageInfo();
        updateRequiredIconCount();
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
        
        if (!info) {
            console.warn('No storage info received');
            return;
        }
        
        // SQLite storage doesn't have quotas like IndexedDB, so we'll show basic info
        iconCountElement.style.color = '#333';
        
        const totalSizeMB = info.totalSizeMB || 0;
        const iconSizeMB = info.iconSizeMB || 0;
        
        iconCountElement.title = `Database size: ${totalSizeMB.toFixed(1)}MB (icons: ${iconSizeMB.toFixed(2)}MB)`;
        
        // Only show optimize button if we have a significant amount of data
        if (optimizeStorageBtn) {
            if (totalSizeMB > 10) {
                optimizeStorageBtn.style.display = 'inline-block';
            } else {
                optimizeStorageBtn.style.display = 'none';
            }
        }
        
        console.log(`📊 Storage info: ${totalSizeMB.toFixed(1)}MB total, ${iconSizeMB.toFixed(2)}MB icons`);
    } catch (error) {
        console.error('📊 Error getting storage info:', error);
    }
}

// Upload new icons (supports both file input and drag & drop)
async function uploadIcons(files = null) {
    console.log('🔄 uploadIcons function called');
    console.log('📁 Files parameter:', files);
    console.log('📁 iconUploadInput:', iconUploadInput);
    console.log('📁 iconUploadInput.files:', iconUploadInput?.files);
    
    const filesToProcess = files || iconUploadInput.files;
    console.log('📁 Selected files:', filesToProcess ? filesToProcess.length : 'none');
    
    if (filesToProcess && filesToProcess.length > 0) {
        console.log('📁 Files to process:');
        for (let i = 0; i < filesToProcess.length; i++) {
            console.log(`  - ${filesToProcess[i].name} (${filesToProcess[i].type})`);
        }
    }
    
    if (!filesToProcess || filesToProcess.length === 0) {
        alert('Please select at least one image file');
        return;
    }
    
    try {
        const newIcons = [];
        for (let i = 0; i < filesToProcess.length; i++) {
            const file = filesToProcess[i];
            
            // Check if it's an image
            if (!file.type.startsWith('image/')) {
                console.warn(`Skipping non-image file: ${file.name}`);
                continue;
            }
            
            const iconData = await convertBlobToBase64Icon(file, file.name);
            // Add default category if not already set
            if (!iconData.category) {
                iconData.category = 'Uncategorized';
            }
            newIcons.push(iconData);
        }
        
        if (newIcons.length > 0) {
            // Save each icon individually to storage
            for (const iconData of newIcons) {
                try {
                    const savedIcon = await storage.saveIcon(iconData);
                    console.log('Icon saved:', savedIcon);
                } catch (error) {
                    console.error('Error saving icon:', iconData.name, error);
                    alert(`Error saving icon "${iconData.name}": ${error.message}`);
                }
            }
            
            // Reload all icons from storage to get the latest data
            await loadIcons();
            
            // Reset the file input if it was used
            if (!files && iconUploadInput) {
                iconUploadInput.value = '';
            }
            
            // Update categories and apply filters
            await loadCategories();
            filterIcons();
            
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
        try {
            // Use storage's clearIcons method for API-based clearing
            await storage.clearIcons();
            
            // Reload from storage to ensure consistency
            await loadIcons();
            
            // Reset filters
            searchTerm = '';
            selectedCategory = '';
            selectedDifficulty = '';
            
            // Clear search input and category filter UI
            if (iconSearch) iconSearch.value = '';
            if (categoryFilter) categoryFilter.value = 'all';
            if (difficultyFilter) difficultyFilter.value = 'all';
            
            // Update categories (should be empty now)
            await loadCategories();
            
            // Apply filters (which should show all icons - none in this case)
            filterIcons();
            
            // Update UI
            updateIconGallery();
            updateRequiredIconCount();
            updateStorageInfo();
            console.log('Icons cleared successfully');
        } catch (error) {
            console.error('Error clearing icons:', error);
            alert('Error clearing icons. Please try again.');
        }
    } else {
        console.log('User cancelled icon clearing');
    }
}

// Update icon count display
function updateIconCount() {
    if (iconCount) {
        iconCount.textContent = availableIcons.length;
        console.log(`📊 Icon count updated to: ${availableIcons.length}`);
    }
    updateStorageInfo(); // This is now async but we don't need to wait
}

// Update the icon gallery display
function updateIconGallery() {
    if (!iconGallery) return;
    
    iconGallery.innerHTML = '';
    
    // Use filteredIcons if available, otherwise use all icons
    const iconsToDisplay = filteredIcons.length > 0 || searchTerm || selectedCategory ? filteredIcons : availableIcons;
    
    iconsToDisplay.forEach((icon, index) => {
        const iconElement = document.createElement('div');
        iconElement.className = 'icon-item enhanced';
        
        // Icon image
        const img = document.createElement('img');
        img.src = icon.data;
        img.alt = icon.name;
        img.title = icon.name;
        
        // Icon info container
        const infoContainer = document.createElement('div');
        infoContainer.className = 'icon-info';
        
        // Icon name
        const nameElement = document.createElement('div');
        nameElement.className = 'icon-name';
        nameElement.textContent = icon.name || 'Unnamed';
        
        // Icon category
        const categoryElement = document.createElement('div');
        categoryElement.className = 'icon-category';
        categoryElement.textContent = icon.category || 'Uncategorized';
        
        infoContainer.appendChild(nameElement);
        infoContainer.appendChild(categoryElement);
        
        // Difficulty indicator
        const difficultyElement = document.createElement('div');
        difficultyElement.className = 'icon-difficulty';
        const difficultyStars = '⭐'.repeat(icon.difficulty || 3);
        difficultyElement.textContent = difficultyStars;
        difficultyElement.title = `Difficulty: ${icon.difficulty || 3}/5`;
        
        // Action buttons container
        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'icon-actions';
        
        // Edit button
        const editBtn = document.createElement('button');
        editBtn.className = 'edit-icon-btn';
        editBtn.textContent = 'Edit';
        editBtn.title = 'Edit this icon';
        editBtn.addEventListener('click', () => openEditModal(icon.id));
        
        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-icon-btn';
        deleteBtn.textContent = 'Delete';
        deleteBtn.title = 'Remove this icon';
        deleteBtn.addEventListener('click', () => deleteIcon(icon.id, index));
        
        actionsContainer.appendChild(editBtn);
        actionsContainer.appendChild(deleteBtn);
        
        iconElement.appendChild(img);
        iconElement.appendChild(infoContainer);
        iconElement.appendChild(difficultyElement);
        iconElement.appendChild(actionsContainer);
        iconGallery.appendChild(iconElement);
    });
    
    updateIconCount();
}

// Delete a single icon
async function deleteIcon(id, index) {
    try {
        console.log(`🗑️ Deleting icon with ID: ${id}`);
        
        // Delete from storage
        const result = await storage.deleteIcon(id);
        
        if (result) {
            console.log('✅ Icon deleted from storage');
            
            // Reload all icons from storage to ensure consistency
            await loadIcons();
            
            // Update categories since an icon was removed
            await loadCategories();
            
            // Apply current filters
            filterIcons();
            
            // Update UI
            updateIconGallery();
            updateRequiredIconCount();
            updateStorageInfo();
            
            console.log('✅ UI updated after deletion');
        } else {
            throw new Error('Delete operation returned false');
        }
    } catch (error) {
        console.error('❌ Error deleting icon:', error);
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
    
    // Calculate icons needed based on sameCard option and distribution mode
    let iconsNeededPerSet;
    if (sameCard) {
        // If using identical cards, we only need icons for one card
        iconsNeededPerSet = cellsPerCard;
    } else {
        // Get the current icon distribution mode
        let iconDistribution = 'same-icons'; // default
        const iconDistributionRadios = document.querySelectorAll('input[name="iconDistribution"]');
        if (iconDistributionRadios) {
            for (const radio of iconDistributionRadios) {
                if (radio.checked) {
                    iconDistribution = radio.value;
                    break;
                }
            }
        }
        
        // Calculate icons needed based on distribution mode
        if (iconDistribution === 'different-icons') {
            // For different-icons mode, we need unique icons for each card
            iconsNeededPerSet = cellsPerCard * cardsPerSet;
        } else {
            // For same-icons mode, we reuse the same icons on each card
            iconsNeededPerSet = cellsPerCard;
        }
    }
    
    // Update info text
    let infoText = '';
    
    console.log(`🎮 Generate button logic: Available icons: ${availableIcons.length}, Needed: ${iconsNeededPerSet}`);
    
    if (availableIcons.length < iconsNeededPerSet) {
        // Not enough icons
        infoText = getTranslatedText('needIcons', { count: iconsNeededPerSet });
        generateBtn.disabled = true;
        console.log(`❌ Generate button DISABLED - not enough icons (need ${iconsNeededPerSet}, have ${availableIcons.length})`);
    } else {
        // Enough icons
        if (setCount > 1) {
            infoText = getTranslatedText('manyUniqueSets', { count: availableIcons.length });
        }
        generateBtn.disabled = false;
        console.log(`✅ Generate button ENABLED - sufficient icons (need ${iconsNeededPerSet}, have ${availableIcons.length})`);
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
    
    // Get icon distribution mode
    let iconDistribution = 'same-icons'; // default
    const iconDistributionRadios = document.querySelectorAll('input[name="iconDistribution"]');
    if (iconDistributionRadios) {
        for (const radio of iconDistributionRadios) {
            if (radio.checked) {
                iconDistribution = radio.value;
                break;
            }
        }
    }
    
    // Get game difficulty
    const gameDifficultyValue = gameDifficulty ? gameDifficulty.value : 'MEDIUM';
    
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
            difficulty,
            iconDistribution,
            gameDifficulty: gameDifficultyValue
        });
        
        generatedCards = result;
        
        // Display the identifier without the "ID:" prefix
        const cleanIdentifier = result.identifier.replace(/^ID:/, '');
        identifierElement.textContent = cleanIdentifier;
        
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
            // Get selected compression level and layout
            const compressionLevel = pdfCompression.value;
            const layout = pdfLayout.value;
            
            // Get game mode and difficulty information
            const isMultiHit = multiHitToggle && multiHitToggle.checked;
            let multiHitDifficulty = 'MEDIUM';
            if (difficultyRadios) {
                for (const radio of difficultyRadios) {
                    if (radio.checked) {
                        multiHitDifficulty = radio.value;
                        break;
                    }
                }
            }
            const gameMode = isMultiHit ? `Multi-Hit Mode (${multiHitDifficulty})` : 'Standard Mode';
            const gameDifficultyValue = gameDifficulty ? gameDifficulty.value : 'MEDIUM';
            
            // Generate the PDF
            const pdfBlob = await generatePDF({
                cardSets: generatedCards.cardSets,
                identifier: generatedCards.identifier,
                compressionLevel,
                layout,
                showLabels, // include toggle state
                gameMode,
                gameDifficulty: gameDifficultyValue
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

// Enhanced CRUD Functions

// Filter icons based on search term and category
function filterIcons() {
    filteredIcons = availableIcons.filter(icon => {
        const matchesSearch = !searchTerm || 
            icon.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !selectedCategory || selectedCategory === 'all' ||
            icon.category === selectedCategory;
        const matchesDifficulty = !selectedDifficulty || selectedDifficulty === 'all' ||
            (icon.difficulty || 3).toString() === selectedDifficulty;
        
        return matchesSearch && matchesCategory && matchesDifficulty;
    });
    
    console.log(`Filtered ${filteredIcons.length} icons from ${availableIcons.length} total`);
}

// Load categories from available icons
async function loadCategories() {
    try {
        // Extract unique categories from available icons
        const categorySet = new Set();
        availableIcons.forEach(icon => {
            if (icon.category) {
                categorySet.add(icon.category);
            } else {
                categorySet.add('Uncategorized');
            }
        });
        
        categories = Array.from(categorySet).sort();
        console.log('Categories loaded:', categories);
        
        // Update the category filter dropdown
        updateCategoryFilter();
    } catch (error) {
        console.error('Error loading categories:', error);
        categories = [];
    }
}

// Update category filter dropdown
function updateCategoryFilter() {
    if (!categoryFilter) return;
    
    // Clear existing options
    categoryFilter.innerHTML = '';
    
    // Add default "All Categories" option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'All Categories';
    categoryFilter.appendChild(defaultOption);
    
    // Add category options
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
    
    // Set selected value
    categoryFilter.value = selectedCategory;
}

// Handle search input
function handleIconSearch(event) {
    searchTerm = event.target.value.trim();
    filterIcons();
    updateIconGallery();
}

// Handle category filter change
function handleCategoryFilter(event) {
    selectedCategory = event.target.value;
    filterIcons();
    updateIconGallery();
}

// Handle difficulty filter change
function handleDifficultyFilter(event) {
    selectedDifficulty = event.target.value;
    filterIcons();
    updateIconGallery();
}

// Setup drag and drop functionality
function setupDragAndDrop() {
    if (!dropZone) return;
    
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });
    
    // Highlight drop zone when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });
    
    // Handle dropped files
    dropZone.addEventListener('drop', handleDrop, false);
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    function highlight(e) {
        dropZone.classList.add('dragover');
    }
    
    function unhighlight(e) {
        dropZone.classList.remove('dragover');
    }
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            uploadIcons(files);
        }
    }
}

// Open edit modal for an icon
function openEditModal(iconId) {
    const icon = availableIcons.find(i => i.id === iconId);
    if (!icon || !editIconModal) return;
    
    currentEditingIcon = icon;
    
    // Populate modal fields
    if (editIconName) editIconName.value = icon.name || '';
    if (editIconCategory) editIconCategory.value = icon.category || 'default';
    if (editIconTags) editIconTags.value = (icon.tags || []).join(', ');
    if (editIconAltText) editIconAltText.value = icon.altText || '';
    if (editIconDifficulty) editIconDifficulty.value = icon.difficulty || 3;
    if (editIconPreview) {
        editIconPreview.src = icon.data || icon.image;
        editIconPreview.alt = icon.name || 'Icon preview';
    }
    
    console.log('🎯 Opening edit modal for:', icon.name, 'Difficulty:', icon.difficulty);
    
    // Show modal
    editIconModal.style.display = 'block';
}

// Close edit modal
function closeEditModal() {
    if (!editIconModal) return;
    
    editIconModal.style.display = 'none';
    currentEditingIcon = null;
    
    // Clear form fields
    if (editIconName) editIconName.value = '';
    if (editIconCategory) editIconCategory.value = 'default';
    if (editIconTags) editIconTags.value = '';
    if (editIconAltText) editIconAltText.value = '';
    if (editIconDifficulty) editIconDifficulty.value = '3';
    if (editIconPreview) editIconPreview.src = '';
}

// Save icon changes
async function saveIconChanges() {
    if (!currentEditingIcon) return;
    
    try {
        // Get updated values
        const newName = editIconName ? editIconName.value.trim() : currentEditingIcon.name;
        const newCategory = editIconCategory ? editIconCategory.value.trim() : currentEditingIcon.category;
        const newTags = editIconTags ? editIconTags.value.split(',').map(tag => tag.trim()).filter(tag => tag) : currentEditingIcon.tags;
        const newAltText = editIconAltText ? editIconAltText.value.trim() : currentEditingIcon.altText;
        const newDifficulty = editIconDifficulty ? parseInt(editIconDifficulty.value) : currentEditingIcon.difficulty;
        
        // Update icon in available icons array
        const iconIndex = availableIcons.findIndex(i => i.id === currentEditingIcon.id);
        if (iconIndex !== -1) {
            availableIcons[iconIndex] = {
                ...availableIcons[iconIndex],
                name: newName || 'Unnamed',
                category: newCategory || 'default',
                tags: newTags || [],
                altText: newAltText || '',
                difficulty: newDifficulty || 3
            };
        }
        
        // Save to storage using the new updateIcon method
        await storage.updateIcon(currentEditingIcon.id, {
            name: newName || 'Unnamed',
            category: newCategory || 'default',
            tags: newTags || [],
            alt_text: newAltText || '',
            difficulty: newDifficulty || 3
        });
        
        // Reload categories and apply filters
        await loadCategories();
        filterIcons();
        
        // Update UI
        updateIconGallery();
        
        // Close modal
        closeEditModal();
        
        console.log('Icon updated successfully');
    } catch (error) {
        console.error('Error saving icon changes:', error);
        alert('Error saving changes. Please try again.');
    }
}

// Export for testing
// Convert from CommonJS to ES Module exports
const exports = {
    updateRequiredIconCount,
    generateCards,
    displayCardPreview
};

export default exports;