// Road Trip Bingo - Main Application
// Main entry point that coordinates all modules and UI interactions

// Import modules
import storage from './modules/apiStorage.js';
import { setLanguage, getTranslatedText, initLanguageSelector } from './modules/i18n.js';
import { convertBlobToBase64Icon } from './modules/imageUtils.js';
import { generateBingoCards, calculateExpectedMultiHitCount } from './modules/cardGenerator.js';
import { generatePDF, downloadPDFBlob } from './modules/pdfGenerator.js';
import aiService from './modules/aiService.js';

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

// Navigation elements
let navGeneratorBtn;
let navIconManagerBtn;
let generatorPage;
let iconManagerPage;

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
let editIconExcludeFromMultiHit;
let editIconPreview;
let editIconSaveBtn;
let editIconCancelBtn;
let editIconCloseBtn;

// Icon Manager DOM elements
let setsGrid;
let iconTable;
let iconTableBody;
let selectAllCheckbox;
let bulkOperations;
let selectedCount;
let viewToggle;
let iconTableView;
let iconGridView;
let setFilter;
let createSetBtn;
let setModal;
let addToSetModal;
let translationModal;

// Generator Icon Selection DOM elements
let iconSetSelector;
let selectedIconsPreview;
let selectIconsBtn;
let iconSelectionModal;
let iconSelectionGrid;
let iconSelectionSearch;
let iconSelectionCategoryFilter;
let selectAllIcons;
let deselectAllIcons;
let selectionCountText;
let confirmIconSelection;
let cancelIconSelection;
let closeIconSelectionModal;

// Application state
let availableIcons = [];
let generatedCards = null;
let showLabels = true;
let currentPage = 'generator';

// Enhanced CRUD state
let filteredIcons = [];
let searchTerm = '';
let selectedCategory = '';
let selectedDifficulty = '';
let categories = [];
let currentEditingIcon = null;

// Icon Manager state
let iconSets = [];
let selectedIcons = new Set();
let currentView = 'table';
let sortField = 'name';
let sortDirection = 'asc';
let currentEditingSet = null;

// Generator Icon Selection state
let selectedIconsForGeneration = new Set();
let generatorIconSets = [];
let filteredIconsForSelection = [];

// Notification System
class NotificationSystem {
    constructor() {
        this.container = document.getElementById('notificationContainer');
        this.notifications = new Map();
        this.counter = 0;
    }

    show(message, type = 'info', duration = 5000) {
        const id = ++this.counter;
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">${this.getIcon(type)}</div>
                <div class="notification-text">${message}</div>
            </div>
            <button class="notification-close" onclick="window.notifications.hide(${id})">&times;</button>
            <div class="notification-progress"></div>
        `;

        this.container.appendChild(notification);
        this.notifications.set(id, notification);

        // Trigger animation
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });

        // Auto-hide with progress bar
        if (duration > 0) {
            const progressBar = notification.querySelector('.notification-progress');
            progressBar.style.width = '100%';
            progressBar.style.transitionDuration = `${duration}ms`;
            
            setTimeout(() => {
                progressBar.style.width = '0%';
            }, 100);

            setTimeout(() => {
                this.hide(id);
            }, duration);
        }

        return id;
    }

    hide(id) {
        const notification = this.notifications.get(id);
        if (notification) {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
                this.notifications.delete(id);
            }, 300);
        }
    }

    getIcon(type) {
        switch (type) {
            case 'success': return '✓';
            case 'error': return '✕';
            case 'warning': return '⚠';
            case 'info': return 'ℹ';
            default: return 'ℹ';
        }
    }

    success(message, duration = 4000) {
        return this.show(message, 'success', duration);
    }

    error(message, duration = 6000) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration = 5000) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration = 4000) {
        return this.show(message, 'info', duration);
    }
}

// Initialize notification system
window.notifications = new NotificationSystem();

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
        
        // Load icon sets for generator
        console.log('🔄 Loading icon sets for generator...');
        await loadIconSetsForGenerator();
        console.log('✅ Icon sets for generator loaded');
        
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
        window.notifications.error('There was an error initializing the application. Please check the browser console for details.');
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
    
    // Navigation elements
    navGeneratorBtn = document.getElementById('navGenerator');
    navIconManagerBtn = document.getElementById('navIconManager');
    generatorPage = document.getElementById('generatorPage');
    iconManagerPage = document.getElementById('iconManagerPage');
    
    // Debug navigation elements
    console.log('Navigation elements:', {
        navGeneratorBtn: !!navGeneratorBtn,
        navIconManagerBtn: !!navIconManagerBtn,
        generatorPage: !!generatorPage,
        iconManagerPage: !!iconManagerPage
    });
    
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
    editIconExcludeFromMultiHit = document.getElementById('editIconExcludeFromMultiHit');
    editIconPreview = document.getElementById('editIconPreview');
    editIconSaveBtn = document.getElementById('saveIconChanges');
    editIconCancelBtn = document.getElementById('cancelEditIcon');
    editIconCloseBtn = document.getElementById('closeEditModal');
    
    // Icon Manager DOM elements
    setsGrid = document.getElementById('setsGrid');
    iconTable = document.getElementById('iconTable');
    iconTableBody = document.getElementById('iconTableBody');
    selectAllCheckbox = document.getElementById('selectAllCheckbox');
    bulkOperations = document.getElementById('bulkOperations');
    selectedCount = document.getElementById('selectedCount');
    viewToggle = document.getElementById('viewToggle');
    iconTableView = document.getElementById('iconTableView');
    iconGridView = document.getElementById('iconGridView');
    setFilter = document.getElementById('setFilter');
    createSetBtn = document.getElementById('createSetBtn');
    setModal = document.getElementById('setModal');
    addToSetModal = document.getElementById('addToSetModal');
    translationModal = document.getElementById('translationModal');
    
    // Generator Icon Selection DOM elements
    iconSetSelector = document.getElementById('iconSetSelector');
    selectedIconsPreview = document.getElementById('selectedIconsPreview');
    selectIconsBtn = document.getElementById('selectIconsBtn');
    iconSelectionModal = document.getElementById('iconSelectionModal');
    iconSelectionGrid = document.getElementById('iconSelectionGrid');
    iconSelectionSearch = document.getElementById('iconSelectionSearch');
    iconSelectionCategoryFilter = document.getElementById('iconSelectionCategoryFilter');
    selectAllIcons = document.getElementById('selectAllIcons');
    deselectAllIcons = document.getElementById('deselectAllIcons');
    selectionCountText = document.getElementById('selectionCountText');
    confirmIconSelection = document.getElementById('confirmIconSelection');
    cancelIconSelection = document.getElementById('cancelIconSelection');
    closeIconSelectionModal = document.getElementById('closeIconSelectionModal');
    
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
        window.notifications.error('Some buttons are not working. Missing elements: ' + missingElements.join(', '));
    }
}

// Setup all event listeners
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Navigation
    if (navGeneratorBtn) {
        console.log('✅ Generator button found, adding event listener');
        navGeneratorBtn.addEventListener('click', () => {
            console.log('🔄 Generator button clicked');
            switchToPage('generator');
        });
    } else {
        console.error('❌ Generator button not found');
    }
    
    if (navIconManagerBtn) {
        console.log('✅ Icon Manager button found, adding event listener');
        navIconManagerBtn.addEventListener('click', () => {
            console.log('🔄 Icon Manager button clicked');
            switchToPage('iconManager');
        });
    } else {
        console.error('❌ Icon Manager button not found');
    }
    
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
            window.notifications.error('File input not found! Please refresh the page.');
        }
    });
    
    // Icon upload file input
    console.log('Attaching file input listener to:', iconUploadInput);
    iconUploadInput.addEventListener('change', (event) => {
        console.log('📁 File input changed, calling uploadIcons');
        uploadIcons();
    });
    
    // Generator Icon Selection
    if (selectIconsBtn) {
        selectIconsBtn.addEventListener('click', openIconSelectionModal);
    }
    if (iconSetSelector) {
        iconSetSelector.addEventListener('change', loadIconsForSelectedSet);
    }
    if (closeIconSelectionModal) {
        closeIconSelectionModal.addEventListener('click', closeIconSelectionModalHandler);
    }
    if (selectAllIcons) {
        selectAllIcons.addEventListener('click', selectAllIconsForGeneration);
    }
    if (deselectAllIcons) {
        deselectAllIcons.addEventListener('click', deselectAllIconsForGeneration);
    }
    if (confirmIconSelection) {
        confirmIconSelection.addEventListener('click', confirmIconSelectionHandler);
    }
    if (cancelIconSelection) {
        cancelIconSelection.addEventListener('click', closeIconSelectionModalHandler);
    }
    if (iconSelectionSearch) {
        iconSelectionSearch.addEventListener('input', filterIconsForSelection);
    }
    if (iconSelectionCategoryFilter) {
        iconSelectionCategoryFilter.addEventListener('change', filterIconsForSelection);
    }
    
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

// Navigation functions
function switchToPage(page) {
    console.log(`Switching to page: ${page}`);
    
    currentPage = page;
    
    // Update navigation buttons
    if (navGeneratorBtn && navIconManagerBtn) {
        navGeneratorBtn.classList.toggle('active', page === 'generator');
        navIconManagerBtn.classList.toggle('active', page === 'iconManager');
    }
    
    // Update page visibility
    if (generatorPage && iconManagerPage) {
        generatorPage.classList.toggle('active', page === 'generator');
        iconManagerPage.classList.toggle('active', page === 'iconManager');
    }
    
    // Initialize page-specific functionality
    if (page === 'iconManager') {
        initializeIconManager();
    }
}

// Initialize Icon Manager functionality
async function initializeIconManager() {
    console.log('Initializing Icon Manager...');
    
    try {
        // Load icon sets
        await loadIconSets();
        
        // Load icons for table view
        await loadIconsForTable();
        
        // Setup Icon Manager event listeners
        setupIconManagerEventListeners();
        
        console.log('Icon Manager initialized successfully');
    } catch (error) {
        console.error('Error initializing Icon Manager:', error);
    }
}

// Load icons from storage
async function loadIcons() {
    try {
        console.log('🔄 Starting to load icons from storage...');
        availableIcons = await storage.loadIcons();
        console.log(`✅ Loaded ${availableIcons.length} icons from storage`);
        
        // Apply current filters
        filterIcons();
        
        // Initialize selected icons for generation with all available icons
        selectedIconsForGeneration.clear();
        availableIcons.forEach(icon => {
            selectedIconsForGeneration.add(icon.id);
        });
        
        updateIconGallery();
        updateStorageInfo();
        updateRequiredIconCount(); // Update UI state after loading icons
        updateSelectedIconsPreview(); // Update the preview with all icons
        
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
        window.notifications.warning('Please select at least one image file');
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
                    window.notifications.error(`Error saving icon "${iconData.name}": ${error.message}`);
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
            
            // Show success notification
            window.notifications.success(`Successfully uploaded ${newIcons.length} icon${newIcons.length > 1 ? 's' : ''}`);
        }
    } catch (error) {
        console.error('Error uploading icons:', error);
        window.notifications.error('Error uploading one or more icons. Please try again.');
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
            
            // Show success notification
            window.notifications.success('All icons cleared successfully');
        } catch (error) {
            console.error('Error clearing icons:', error);
            window.notifications.error('Error clearing icons. Please try again.');
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
        window.notifications.error('Failed to delete the icon. Please try again.');
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
        // Use only the selected icons for generation (filtered by user)
        const selectedIconsData = availableIcons.filter(icon => selectedIconsForGeneration.has(icon.id));
        
        console.log(`🎯 Generating cards with ${selectedIconsData.length} selected icons`);
        
        // Generate the cards
        const result = generateBingoCards({
            icons: selectedIconsData,
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
        window.notifications.success(`Successfully generated ${setCount} set(s) with ${cardsPerSet} card(s) each.`);
    } catch (error) {
        console.error('Error generating cards:', error);
        window.notifications.error(`Error generating cards: ${error.message}`);
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
            window.notifications.error('Error generating PDF. Please try again.');
            
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
        window.notifications.success(getTranslatedText('backupSuccess'));
    } catch (error) {
        console.error('Error backing up data:', error);
        window.notifications.error(`Error backing up data: ${error.message}`);
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
        window.notifications.success(getTranslatedText('restoreSuccess'));
        
        // Reload the page to reflect the restored data
        setTimeout(() => {
            window.location.reload();
        }, 500);
    } catch (error) {
        console.error('Error restoring data:', error);
        window.notifications.error(getTranslatedText('restoreError'));
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
    if (editIconExcludeFromMultiHit) editIconExcludeFromMultiHit.checked = icon.excludeFromMultiHit || false;
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
    if (editIconExcludeFromMultiHit) editIconExcludeFromMultiHit.checked = false;
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
        const newExcludeFromMultiHit = editIconExcludeFromMultiHit ? editIconExcludeFromMultiHit.checked : currentEditingIcon.excludeFromMultiHit;
        
        // Update icon in available icons array
        const iconIndex = availableIcons.findIndex(i => i.id === currentEditingIcon.id);
        if (iconIndex !== -1) {
            availableIcons[iconIndex] = {
                ...availableIcons[iconIndex],
                name: newName || 'Unnamed',
                category: newCategory || 'default',
                tags: newTags || [],
                altText: newAltText || '',
                difficulty: newDifficulty || 3,
                excludeFromMultiHit: newExcludeFromMultiHit || false
            };
        }
        
        // Save to storage using the new updateIcon method
        await storage.updateIcon(currentEditingIcon.id, {
            name: newName || 'Unnamed',
            category: newCategory || 'default',
            tags: newTags || [],
            alt_text: newAltText || '',
            difficulty: newDifficulty || 3,
            excludeFromMultiHit: newExcludeFromMultiHit || false
        });
        
        // Reload categories and apply filters
        await loadCategories();
        filterIcons();
        
        // Update UI
        updateIconGallery();
        
        // Close modal
        closeEditModal();
        
        console.log('Icon updated successfully');
        
        // Show success notification
        window.notifications.success('Icon updated successfully');
    } catch (error) {
        console.error('Error saving icon changes:', error);
        window.notifications.error('Error saving changes. Please try again.');
    }
}

// ========== ICON MANAGER FUNCTIONS ==========

// Load icon sets from storage
async function loadIconSets() {
    try {
        const response = await fetch('/api/icon-sets');
        const result = await response.json();
        
        if (result.success) {
            iconSets = result.data;
            console.log(`Loaded ${iconSets.length} icon sets`);
            renderIconSets();
            updateSetFilter();
        } else {
            console.error('Failed to load icon sets:', result.error);
            iconSets = [];
        }
    } catch (error) {
        console.error('Error loading icon sets:', error);
        iconSets = [];
    }
}

// Render icon sets grid
function renderIconSets() {
    if (!setsGrid) return;
    
    setsGrid.innerHTML = '';
    
    iconSets.forEach(set => {
        const setCard = document.createElement('div');
        setCard.className = 'set-card';
        setCard.innerHTML = `
            <div class="set-card-header">
                <h4 class="set-card-name">${set.name}</h4>
                <span class="set-card-count">${set.iconCount}</span>
            </div>
            <div class="set-card-description">${set.description || 'No description'}</div>
            <div class="set-card-actions">
                <button class="btn-primary" onclick="viewSet('${set.id}')">View</button>
                <button class="btn-secondary" onclick="editSet('${set.id}')">Edit</button>
                ${set.id !== 'all-icons' ? `<button class="btn-danger" onclick="deleteSet('${set.id}')">Delete</button>` : ''}
            </div>
        `;
        setsGrid.appendChild(setCard);
    });
}

// Update set filter dropdown
function updateSetFilter() {
    if (!setFilter) return;
    
    setFilter.innerHTML = '<option value="all">All Sets</option>';
    
    iconSets.forEach(set => {
        const option = document.createElement('option');
        option.value = set.id;
        option.textContent = set.name;
        setFilter.appendChild(option);
    });
}

// Load icons for table view
async function loadIconsForTable() {
    try {
        // Load icons with extended information
        const response = await fetch('/api/icons');
        const result = await response.json();
        
        if (result.success) {
            availableIcons = result.data;
            
            // Load additional information for each icon
            for (const icon of availableIcons) {
                // Load sets containing this icon
                const setsResponse = await fetch(`/api/icons/${icon.id}/sets`);
                const setsResult = await setsResponse.json();
                icon.sets = setsResult.success ? setsResult.data : [];
                
                // Load translations for this icon
                const translationsResponse = await fetch(`/api/icons/${icon.id}/translations`);
                const translationsResult = await translationsResponse.json();
                icon.translations = translationsResult.success ? translationsResult.data : {};
            }
            
            renderIconTable();
        } else {
            console.error('Failed to load icons:', result.error);
        }
    } catch (error) {
        console.error('Error loading icons for table:', error);
    }
}

// Render icon table
function renderIconTable() {
    if (!iconTableBody) return;
    
    iconTableBody.innerHTML = '';
    
    // Sort icons
    const sortedIcons = [...availableIcons].sort((a, b) => {
        const aValue = a[sortField] || '';
        const bValue = b[sortField] || '';
        
        if (sortDirection === 'asc') {
            return aValue.toString().localeCompare(bValue.toString());
        } else {
            return bValue.toString().localeCompare(aValue.toString());
        }
    });
    
    sortedIcons.forEach(icon => {
        const row = document.createElement('tr');
        row.className = selectedIcons.has(icon.id) ? 'selected' : '';
        
        // Convert difficulty to stars
        const difficultyStars = '⭐'.repeat(icon.difficulty || 3);
        
        // Format multi-hit exclusion status
        const excludeFromMultiHit = icon.excludeFromMultiHit || false;
        const exclusionHtml = excludeFromMultiHit ? 
            '<span class="exclusion-badge excluded">Excluded</span>' : 
            '<span class="exclusion-badge included">Included</span>';
        
        // Format sets
        const setsHtml = (icon.sets || []).map(set => 
            `<span class="set-tag">${set.name}</span>`
        ).join('');
        
        // Format translations
        const translationsHtml = Object.keys(icon.translations || {}).map(lang => 
            `<span class="translation-badge">${lang}</span>`
        ).join('');
        
        row.innerHTML = `
            <td class="select-column">
                <input type="checkbox" ${selectedIcons.has(icon.id) ? 'checked' : ''} 
                       onchange="toggleIconSelection('${icon.id}')">
            </td>
            <td class="icon-preview-cell">
                <img src="${icon.image || icon.data}" alt="${icon.name}">
            </td>
            <td class="icon-name-cell">${icon.name || 'Unnamed'}</td>
            <td class="icon-category-cell">${icon.category || 'default'}</td>
            <td class="icon-difficulty-cell">${difficultyStars}</td>
            <td class="icon-exclusion-cell">${exclusionHtml}</td>
            <td class="icon-sets-cell">${setsHtml}</td>
            <td class="icon-translations-cell">${translationsHtml}</td>
            <td class="icon-actions-cell">
                <button class="btn-primary" onclick="editIcon('${icon.id}')">Edit</button>
                <button class="btn-secondary" onclick="openTranslationModal('${icon.id}')">Translate</button>
                <button class="btn-danger" onclick="deleteIcon('${icon.id}')">Delete</button>
            </td>
        `;
        
        iconTableBody.appendChild(row);
    });
    
    updateBulkOperationsVisibility();
}

// Toggle icon selection
function toggleIconSelection(iconId) {
    if (selectedIcons.has(iconId)) {
        selectedIcons.delete(iconId);
    } else {
        selectedIcons.add(iconId);
    }
    
    updateBulkOperationsVisibility();
    
    // Trigger selection change event for AI button
    const selectionChangedEvent = new CustomEvent('selectionChanged');
    document.dispatchEvent(selectionChangedEvent);
    
    renderIconTable(); // Re-render to update selection visual
}

// Update bulk operations visibility
function updateBulkOperationsVisibility() {
    if (!bulkOperations || !selectedCount) return;
    
    const count = selectedIcons.size;
    
    if (count > 0) {
        bulkOperations.style.display = 'flex';
        selectedCount.textContent = count;
    } else {
        bulkOperations.style.display = 'none';
    }
}

// Setup Icon Manager event listeners
function setupIconManagerEventListeners() {
    // Create set button
    if (createSetBtn) {
        createSetBtn.addEventListener('click', openCreateSetModal);
    }
    
    // Search and filter controls
    if (iconSearch) {
        iconSearch.addEventListener('input', handleIconManagerSearch);
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', handleIconManagerCategoryFilter);
    }
    
    if (difficultyFilter) {
        difficultyFilter.addEventListener('change', handleIconManagerDifficultyFilter);
    }
    
    if (setFilter) {
        setFilter.addEventListener('change', handleIconManagerSetFilter);
    }
    
    // Table sorting
    if (iconTable) {
        iconTable.addEventListener('click', (e) => {
            if (e.target.matches('.sort-column') || e.target.closest('.sort-column')) {
                const column = e.target.closest('.sort-column');
                const field = column.dataset.sort;
                handleTableSort(field);
            }
        });
    }
    
    // Select all checkbox
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', (e) => {
            const isChecked = e.target.checked;
            selectedIcons.clear();
            
            if (isChecked) {
                availableIcons.forEach(icon => selectedIcons.add(icon.id));
            }
            
            renderIconTable();
        });
    }
    
    // View toggle - handle both table and grid view buttons
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Remove active class from all buttons
            viewButtons.forEach(button => button.classList.remove('active'));
            // Add active class to clicked button
            e.target.classList.add('active');
            
            const view = e.target.dataset.view;
            console.log('🔄 Switching to view:', view);
            switchView(view);
        });
    });
    
    // Bulk operations
    const bulkAddToSetBtn = document.getElementById('bulkAddToSet');
    const bulkRemoveFromSetBtn = document.getElementById('bulkRemoveFromSet');
    const bulkExcludeFromMultiHitBtn = document.getElementById('bulkExcludeFromMultiHit');
    const bulkIncludeInMultiHitBtn = document.getElementById('bulkIncludeInMultiHit');
    const applySmartDefaultsBtn = document.getElementById('applySmartDefaults');
    const bulkDeleteBtn = document.getElementById('bulkDelete');
    const bulkClearSelectionBtn = document.getElementById('bulkClearSelection');
    
    if (bulkAddToSetBtn) {
        bulkAddToSetBtn.addEventListener('click', openBulkAddToSetModal);
    }
    
    if (bulkRemoveFromSetBtn) {
        bulkRemoveFromSetBtn.addEventListener('click', bulkRemoveFromSet);
    }
    
    if (bulkExcludeFromMultiHitBtn) {
        bulkExcludeFromMultiHitBtn.addEventListener('click', bulkExcludeFromMultiHit);
    }
    
    if (bulkIncludeInMultiHitBtn) {
        bulkIncludeInMultiHitBtn.addEventListener('click', bulkIncludeInMultiHit);
    }
    
    if (applySmartDefaultsBtn) {
        applySmartDefaultsBtn.addEventListener('click', applySmartDefaults);
    }
    
    if (bulkDeleteBtn) {
        bulkDeleteBtn.addEventListener('click', bulkDeleteIcons);
    }
    
    if (bulkClearSelectionBtn) {
        bulkClearSelectionBtn.addEventListener('click', clearSelection);
    }

    // AI Features event listeners
    initializeAIFeatures();
}

// Initialize AI features
function initializeAIFeatures() {
    const openAIFeaturesBtn = document.getElementById('openAIFeatures');
    const closeAIPanelBtn = document.getElementById('closeAIPanel');
    const aiPanel = document.getElementById('aiFeatures');
    const analyzeSelectedBtn = document.getElementById('analyzeSelectedIcons');
    const analyzeAllBtn = document.getElementById('analyzeAllIcons');
    const detectDuplicatesBtn = document.getElementById('detectDuplicates');
    const getContentSuggestionsBtn = document.getElementById('getContentSuggestions');
    const generateSmartSetBtn = document.getElementById('generateSmartSet');
    const duplicateSensitivity = document.getElementById('duplicateSensitivity');
    const sensitivityValue = document.getElementById('sensitivityValue');

    // Initialize AI service
    aiService.initialize().then(() => {
        updateAIStatusDisplay();
    });

    // Open AI panel
    if (openAIFeaturesBtn) {
        openAIFeaturesBtn.addEventListener('click', () => {
            aiPanel.style.display = 'block';
            document.body.appendChild(createOverlay());
            updateAIUsageDisplay();
            updateAIStatusDisplay();
        });
    }

    // Close AI panel
    if (closeAIPanelBtn) {
        closeAIPanelBtn.addEventListener('click', closeAIPanel);
    }

    // Analyze selected icons
    if (analyzeSelectedBtn) {
        analyzeSelectedBtn.addEventListener('click', analyzeSelectedIcons);
    }

    // Analyze all icons
    if (analyzeAllBtn) {
        analyzeAllBtn.addEventListener('click', analyzeAllIcons);
    }

    // Detect duplicates
    if (detectDuplicatesBtn) {
        detectDuplicatesBtn.addEventListener('click', detectDuplicates);
    }

    // Get content suggestions
    if (getContentSuggestionsBtn) {
        getContentSuggestionsBtn.addEventListener('click', getContentSuggestions);
    }

    // Generate smart set
    if (generateSmartSetBtn) {
        generateSmartSetBtn.addEventListener('click', generateSmartSet);
    }

    // Duplicate sensitivity slider
    if (duplicateSensitivity && sensitivityValue) {
        duplicateSensitivity.addEventListener('input', (e) => {
            sensitivityValue.textContent = e.target.value;
        });
    }

    // Update analyze selected button state based on selection
    document.addEventListener('selectionChanged', () => {
        if (analyzeSelectedBtn) {
            const selectedCount = getSelectedIcons().length;
            analyzeSelectedBtn.disabled = selectedCount === 0;
            analyzeSelectedBtn.querySelector('.ai-cost').textContent = `(~$${(selectedCount * 0.01).toFixed(2)})`;
        }
    });
}

// Create overlay for modal
function createOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'ai-overlay';
    overlay.addEventListener('click', closeAIPanel);
    return overlay;
}

// Close AI panel
function closeAIPanel() {
    const aiPanel = document.getElementById('aiFeatures');
    const overlay = document.querySelector('.ai-overlay');
    
    if (aiPanel) aiPanel.style.display = 'none';
    if (overlay) overlay.remove();
}

// Analyze selected icons
async function analyzeSelectedIcons() {
    console.log('analyzeSelectedIcons called');
    const selectedIcons = getSelectedIcons();
    console.log('Selected icons:', selectedIcons);
    
    if (selectedIcons.length === 0) {
        window.notifications.show('Please select icons to analyze', 'warning');
        return;
    }

    try {
        window.notifications.show('Analyzing icons with AI...', 'info');
        const iconIds = selectedIcons.map(icon => icon.id);
        console.log('Icon IDs to analyze:', iconIds);
        
        const response = await fetch('/api/ai/analyze-batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ iconIds })
        });

        console.log('API response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API error response:', errorText);
            throw new Error('Failed to analyze icons');
        }

        const result = await response.json();
        console.log('Analysis result:', result);
        showAIAnalysisResults(result.data);
        window.notifications.show('AI analysis complete', 'success');
    } catch (error) {
        console.error('Error analyzing icons:', error);
        window.notifications.show('Failed to analyze icons: ' + error.message, 'error');
    }
}

// Analyze all icons
async function analyzeAllIcons() {
    try {
        const icons = await storage.loadIcons();
        if (icons.length === 0) {
            window.notifications.show('No icons to analyze', 'warning');
            return;
        }

        window.notifications.show('Analyzing all icons with AI...', 'info');
        const iconIds = icons.map(icon => icon.id);
        const response = await fetch('/api/ai/analyze-batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ iconIds })
        });

        if (!response.ok) {
            throw new Error('Failed to analyze icons');
        }

        const result = await response.json();
        showAIAnalysisResults(result.data);
        window.notifications.show('AI analysis complete', 'success');
    } catch (error) {
        console.error('Error analyzing icons:', error);
        window.notifications.show('Failed to analyze icons: ' + error.message, 'error');
    }
}

// Detect duplicates
async function detectDuplicates() {
    try {
        window.notifications.show('Detecting duplicates with AI...', 'info');
        const response = await fetch('/api/ai/detect-duplicates', {
            method: 'POST'
        });

        if (!response.ok) {
            throw new Error('Failed to detect duplicates');
        }

        const result = await response.json();
        showDuplicateResults(result.data);
        window.notifications.show('Duplicate detection complete', 'success');
    } catch (error) {
        console.error('Error detecting duplicates:', error);
        window.notifications.show('Failed to detect duplicates: ' + error.message, 'error');
    }
}

// Get content suggestions
async function getContentSuggestions() {
    try {
        const targetSet = document.getElementById('targetSetSelect').value;
        window.notifications.show('Getting AI content suggestions...', 'info');
        
        const response = await fetch(`/api/ai/content-suggestions?targetSet=${targetSet}`);
        
        if (!response.ok) {
            throw new Error('Failed to get content suggestions');
        }

        const result = await response.json();
        showContentSuggestions(result.data);
        window.notifications.show('Content suggestions ready', 'success');
    } catch (error) {
        console.error('Error getting content suggestions:', error);
        window.notifications.show('Failed to get suggestions: ' + error.message, 'error');
    }
}

// Generate smart set
async function generateSmartSet() {
    try {
        const theme = document.getElementById('setThemeInput').value.trim();
        if (!theme) {
            window.notifications.show('Please enter a theme for the set', 'warning');
            return;
        }

        window.notifications.show('Generating smart set with AI...', 'info');
        const response = await fetch('/api/ai/generate-set', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ theme })
        });

        if (!response.ok) {
            throw new Error('Failed to generate smart set');
        }

        const result = await response.json();
        showSmartSetResults(result.data);
        window.notifications.show('Smart set generated', 'success');
    } catch (error) {
        console.error('Error generating smart set:', error);
        window.notifications.show('Failed to generate set: ' + error.message, 'error');
    }
}

// Update AI status display
async function updateAIStatusDisplay() {
    const statusIndicator = document.getElementById('aiStatusIndicator');
    const statusText = document.getElementById('aiStatusText');
    
    if (!statusIndicator || !statusText) return;
    
    const status = aiService.getStatus();
    
    if (status && status.configured) {
        statusIndicator.className = 'status-indicator configured';
        statusText.textContent = 'Configured';
        statusText.style.color = '#28a745';
    } else {
        statusIndicator.className = 'status-indicator not-configured';
        statusText.textContent = 'Not Configured';
        statusText.style.color = '#dc3545';
    }
}

// Show AI analysis results
function showAIAnalysisResults(results) {
    console.log('Showing AI results:', results);
    
    if (!results || results.length === 0) {
        window.notifications.show('No analysis results to display', 'info');
        return;
    }
    
    // Create and show results modal
    const modal = document.createElement('div');
    modal.className = 'ai-results-modal';
    
    const resultsHTML = results.map(result => {
        // Handle different result structures
        const data = result.success ? result.data : result;
        const iconId = data.icon_id;
        const category = data.category_suggestion;
        const difficulty = data.difficulty_suggestion;
        const name = data.name_suggestion;
        const tags = data.tags_suggestion;
        const confidence = Math.round((data.confidence_score || 0) * 100);
        
        return `
            <div class="ai-result-item">
                <h5>Analysis for Icon ID: ${iconId}</h5>
                <div class="ai-suggestion">
                    <span><strong>Category:</strong> ${category}</span>
                    <div class="ai-suggestion-actions">
                        <button class="ai-accept" onclick="acceptSuggestion('${iconId}', 'category', '${category}')">Accept</button>
                        <button class="ai-reject">Reject</button>
                    </div>
                </div>
                <div class="ai-suggestion">
                    <span><strong>Name:</strong> ${name}</span>
                    <div class="ai-suggestion-actions">
                        <button class="ai-accept" onclick="acceptSuggestion('${iconId}', 'name', '${name}')">Accept</button>
                        <button class="ai-reject">Reject</button>
                    </div>
                </div>
                <div class="ai-suggestion">
                    <span><strong>Difficulty:</strong> ${difficulty}/5</span>
                    <div class="ai-suggestion-actions">
                        <button class="ai-accept" onclick="acceptSuggestion('${iconId}', 'difficulty', ${difficulty})">Accept</button>
                        <button class="ai-reject">Reject</button>
                    </div>
                </div>
                <div class="ai-suggestion">
                    <span><strong>Tags:</strong> ${tags}</span>
                    <div class="ai-suggestion-actions">
                        <button class="ai-accept" onclick="acceptSuggestion('${iconId}', 'tags', '${tags}')">Accept</button>
                        <button class="ai-reject">Reject</button>
                    </div>
                </div>
                <div class="ai-confidence">
                    <small>Confidence: ${confidence}%</small>
                </div>
            </div>
        `;
    }).join('');
    
    modal.innerHTML = `
        <div class="modal-header">
            <h3>AI Analysis Results</h3>
            <button class="btn-close" onclick="this.parentElement.parentElement.remove(); document.querySelector('.ai-overlay').remove();">&times;</button>
        </div>
        <div class="modal-content">
            ${resultsHTML}
            <div style="margin-top: 20px; text-align: center;">
                <button onclick="this.parentElement.parentElement.parentElement.remove(); document.querySelector('.ai-overlay').remove();" class="btn-secondary">Close</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.appendChild(createOverlay());
}

// Show duplicate results
function showDuplicateResults(results) {
    console.log('Duplicate results:', results);
    window.notifications.show(`Found ${results.duplicates_found} potential duplicates`, 'info');
}

// Show content suggestions
function showContentSuggestions(suggestions) {
    console.log('Content suggestions:', suggestions);
    window.notifications.show('Content suggestions available in console', 'info');
}

// Show smart set results
function showSmartSetResults(setData) {
    console.log('Smart set data:', setData);
    window.notifications.show(`Generated set: ${setData.name}`, 'info');
}

// Accept AI suggestion
window.acceptSuggestion = async function(iconId, field, value) {
    try {
        console.log('Accepting suggestion:', { iconId, field, value });
        
        const updateData = {};
        updateData[field] = value;
        
        console.log('Update data:', updateData);
        
        const response = await fetch(`/api/icons/${iconId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData)
        });

        console.log('Update response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Update error response:', errorText);
            throw new Error(`Failed to update icon: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        console.log('Update result:', result);
        
        window.notifications.show('Suggestion applied', 'success');
        await loadIconsForTable(); // Refresh the icon list
    } catch (error) {
        console.error('Error accepting suggestion:', error);
        window.notifications.show('Failed to apply suggestion: ' + error.message, 'error');
    }
};

// Update AI usage display
async function updateAIUsageDisplay() {
    try {
        const response = await fetch('/api/ai/usage/check');
        if (response.ok) {
            const usage = await response.json();
            const display = document.getElementById('aiUsageDisplay');
            if (display) {
                display.textContent = `${usage.data.usage} / ${usage.data.limit}`;
                display.style.color = usage.data.within_limits ? '#333' : '#dc3545';
            }
        }
    } catch (error) {
        console.error('Error updating usage display:', error);
    }
}

// Helper function to get selected icons
function getSelectedIcons() {
    const selectedIds = Array.from(selectedIcons).map(id => ({ id }));
    console.log('Selected icon IDs from Set:', selectedIds);
    return selectedIds;
}

// Handle table sorting
function handleTableSort(field) {
    if (sortField === field) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        sortField = field;
        sortDirection = 'asc';
    }
    
    // Update sort indicators
    document.querySelectorAll('.sort-indicator').forEach(indicator => {
        indicator.className = 'sort-indicator';
    });
    
    const currentColumn = document.querySelector(`[data-sort="${field}"] .sort-indicator`);
    if (currentColumn) {
        currentColumn.classList.add(sortDirection);
    }
    
    renderIconTable();
}

// Switch between table and grid view
function switchView(view) {
    console.log('🔄 switchView called with:', view);
    currentView = view;
    
    if (iconTableView && iconGridView) {
        iconTableView.style.display = view === 'table' ? 'block' : 'none';
        iconGridView.style.display = view === 'grid' ? 'block' : 'none';
        console.log('✅ View switched to:', view);
    } else {
        console.error('❌ iconTableView or iconGridView not found');
    }
    
    if (view === 'grid') {
        console.log('🔄 Updating icon gallery for grid view');
        updateIconManagerGridView(); // Use specific function for Icon Manager grid view
    }
}

// Update icon gallery specifically for Icon Manager grid view
function updateIconManagerGridView() {
    if (!iconGallery) {
        console.error('❌ iconGallery element not found');
        return;
    }
    
    console.log('🔄 Updating Icon Manager grid view');
    iconGallery.innerHTML = '';
    
    // Use availableIcons (same data as table view)
    const iconsToDisplay = availableIcons;
    
    iconsToDisplay.forEach((icon, index) => {
        const iconElement = document.createElement('div');
        iconElement.className = 'icon-item enhanced';
        
        // Icon image
        const img = document.createElement('img');
        img.src = icon.image || icon.data;
        img.alt = icon.name || 'Unnamed';
        img.title = icon.name || 'Unnamed';
        
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
        categoryElement.textContent = icon.category || 'default';
        
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
        deleteBtn.addEventListener('click', () => deleteIconFromManager(icon.id));
        
        actionsContainer.appendChild(editBtn);
        actionsContainer.appendChild(deleteBtn);
        
        iconElement.appendChild(img);
        iconElement.appendChild(infoContainer);
        iconElement.appendChild(difficultyElement);
        iconElement.appendChild(actionsContainer);
        iconGallery.appendChild(iconElement);
    });
    
    console.log(`✅ Icon Manager grid view updated with ${iconsToDisplay.length} icons`);
}

// Clear all selections
function clearSelection() {
    selectedIcons.clear();
    renderIconTable();
}

// Icon Manager filtering functions
let iconManagerFilters = {
    search: '',
    category: '',
    difficulty: '',
    set: ''
};

function handleIconManagerSearch(event) {
    iconManagerFilters.search = event.target.value.trim().toLowerCase();
    applyIconManagerFilters();
}

function handleIconManagerCategoryFilter(event) {
    iconManagerFilters.category = event.target.value;
    applyIconManagerFilters();
}

function handleIconManagerDifficultyFilter(event) {
    iconManagerFilters.difficulty = event.target.value;
    applyIconManagerFilters();
}

function handleIconManagerSetFilter(event) {
    iconManagerFilters.set = event.target.value;
    applyIconManagerFilters();
}

function applyIconManagerFilters() {
    // Start with all icons
    let filteredIcons = [...availableIcons];
    
    // Apply search filter
    if (iconManagerFilters.search) {
        filteredIcons = filteredIcons.filter(icon => 
            (icon.name || '').toLowerCase().includes(iconManagerFilters.search) ||
            (icon.altText || '').toLowerCase().includes(iconManagerFilters.search)
        );
    }
    
    // Apply category filter
    if (iconManagerFilters.category && iconManagerFilters.category !== 'all') {
        filteredIcons = filteredIcons.filter(icon => 
            (icon.category || 'default') === iconManagerFilters.category
        );
    }
    
    // Apply difficulty filter
    if (iconManagerFilters.difficulty && iconManagerFilters.difficulty !== 'all') {
        const targetDifficulty = parseInt(iconManagerFilters.difficulty);
        filteredIcons = filteredIcons.filter(icon => 
            (icon.difficulty || 3) === targetDifficulty
        );
    }
    
    // Apply set filter
    if (iconManagerFilters.set && iconManagerFilters.set !== 'all') {
        filteredIcons = filteredIcons.filter(icon => 
            (icon.sets || []).some(set => set.id === iconManagerFilters.set)
        );
    }
    
    // Update availableIcons temporarily for rendering
    const originalIcons = [...availableIcons];
    availableIcons = filteredIcons;
    
    // Re-render table
    renderIconTable();
    
    // Restore original icons
    availableIcons = originalIcons;
}

// Make functions globally accessible for onclick handlers
window.toggleIconSelection = toggleIconSelection;
window.editIcon = openEditModal;
window.deleteIcon = deleteIconFromManager;
window.viewSet = viewSet;
window.editSet = editSet;
window.deleteSet = deleteSet;
window.openTranslationModal = openTranslationModal;

// Placeholder functions for modal operations (to be implemented)
function openCreateSetModal() {
    if (!setModal) return;
    
    // Setup modal for creating new set
    const modalTitle = document.getElementById('setModalTitle');
    const setNameInput = document.getElementById('setName');
    const setDescriptionInput = document.getElementById('setDescription');
    const saveBtn = document.getElementById('saveSetBtn');
    const cancelBtn = document.getElementById('cancelSetBtn');
    const closeBtn = document.getElementById('closeSetModal');
    
    // Set modal title and clear inputs
    if (modalTitle) modalTitle.textContent = 'Create Icon Set';
    if (setNameInput) setNameInput.value = '';
    if (setDescriptionInput) setDescriptionInput.value = '';
    
    // Reset editing state
    currentEditingSet = null;
    
    // Show modal
    setModal.style.display = 'block';
    
    // Focus on name input
    if (setNameInput) setNameInput.focus();
    
    const handleSave = async () => {
        const name = setNameInput?.value.trim();
        const description = setDescriptionInput?.value.trim();
        
        if (!name) {
            alert('Set name is required');
            return;
        }
        
        try {
            const response = await fetch('/api/icon-sets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    description
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Refresh icon sets
                await loadIconSets();
                
                alert('Icon set created successfully');
                closeModal();
            } else {
                alert('Failed to create icon set: ' + (result.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error creating icon set:', error);
            alert('Error creating icon set');
        }
    };
    
    const closeModal = () => {
        setModal.style.display = 'none';
        currentEditingSet = null;
        // Remove event listeners
        saveBtn?.removeEventListener('click', handleSave);
        cancelBtn?.removeEventListener('click', closeModal);
        closeBtn?.removeEventListener('click', closeModal);
    };
    
    // Add event listeners
    saveBtn?.addEventListener('click', handleSave);
    cancelBtn?.addEventListener('click', closeModal);
    closeBtn?.addEventListener('click', closeModal);
    
    // Handle Enter key in name input
    setNameInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSave();
        }
    });
}

function editSet(setId) {
    const set = iconSets.find(s => s.id === setId);
    if (!set || !setModal) return;
    
    // Setup modal for editing set
    const modalTitle = document.getElementById('setModalTitle');
    const setNameInput = document.getElementById('setName');
    const setDescriptionInput = document.getElementById('setDescription');
    const saveBtn = document.getElementById('saveSetBtn');
    const cancelBtn = document.getElementById('cancelSetBtn');
    const closeBtn = document.getElementById('closeSetModal');
    
    // Set modal title and populate inputs
    if (modalTitle) modalTitle.textContent = 'Edit Icon Set';
    if (setNameInput) setNameInput.value = set.name;
    if (setDescriptionInput) setDescriptionInput.value = set.description || '';
    
    // Set editing state
    currentEditingSet = set;
    
    // Show modal
    setModal.style.display = 'block';
    
    // Focus on name input
    if (setNameInput) setNameInput.focus();
    
    const handleSave = async () => {
        const name = setNameInput?.value.trim();
        const description = setDescriptionInput?.value.trim();
        
        if (!name) {
            alert('Set name is required');
            return;
        }
        
        try {
            const response = await fetch(`/api/icon-sets/${setId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    description
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Refresh icon sets
                await loadIconSets();
                
                alert('Icon set updated successfully');
                closeModal();
            } else {
                alert('Failed to update icon set: ' + (result.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error updating icon set:', error);
            alert('Error updating icon set');
        }
    };
    
    const closeModal = () => {
        setModal.style.display = 'none';
        currentEditingSet = null;
        // Remove event listeners
        saveBtn?.removeEventListener('click', handleSave);
        cancelBtn?.removeEventListener('click', closeModal);
        closeBtn?.removeEventListener('click', closeModal);
    };
    
    // Add event listeners
    saveBtn?.addEventListener('click', handleSave);
    cancelBtn?.addEventListener('click', closeModal);
    closeBtn?.addEventListener('click', closeModal);
    
    // Handle Enter key in name input
    setNameInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSave();
        }
    });
}

async function deleteSet(setId) {
    if (setId === 'all-icons') {
        alert('Cannot delete the default "All Icons" set');
        return;
    }
    
    const set = iconSets.find(s => s.id === setId);
    if (!set) return;
    
    if (confirm(`Are you sure you want to delete the set "${set.name}"?`)) {
        try {
            const response = await fetch(`/api/icon-sets/${setId}`, {
                method: 'DELETE'
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Refresh icon sets
                await loadIconSets();
                
                alert('Icon set deleted successfully');
            } else {
                alert('Failed to delete icon set: ' + (result.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error deleting icon set:', error);
            alert('Error deleting icon set');
        }
    }
}

function viewSet(setId) {
    // Filter the table to show only icons from this set
    if (setFilter) {
        setFilter.value = setId;
        iconManagerFilters.set = setId;
        applyIconManagerFilters();
    }
    
    // Scroll to the icons table
    if (iconTableView) {
        iconTableView.scrollIntoView({ behavior: 'smooth' });
    }
}

function openTranslationModal(iconId) {
    const icon = availableIcons.find(i => i.id === iconId);
    if (!icon || !translationModal) return;
    
    // Setup modal elements
    const iconPreview = document.getElementById('translationIconPreview');
    const translationsList = document.getElementById('translationsList');
    const languageSelect = document.getElementById('translationLanguage');
    const translationTextInput = document.getElementById('translationText');
    const addTranslationBtn = document.getElementById('addTranslationBtn');
    const closeBtn = document.getElementById('closeTranslationBtn');
    const closeModalBtn = document.getElementById('closeTranslationModal');
    
    // Show icon preview
    if (iconPreview) {
        iconPreview.innerHTML = `
            <img src="${icon.image || icon.data}" alt="${icon.name}" style="width: 60px; height: 60px; object-fit: contain;">
            <h4>${icon.name}</h4>
        `;
    }
    
    // Load and display existing translations
    loadTranslationsForIcon(iconId, translationsList);
    
    // Show modal
    translationModal.style.display = 'block';
    
    const handleAddTranslation = async () => {
        const language = languageSelect?.value;
        const text = translationTextInput?.value.trim();
        
        if (!language || !text) {
            alert('Please select a language and enter a translation');
            return;
        }
        
        try {
            const response = await fetch(`/api/icons/${iconId}/translations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    languageCode: language,
                    translatedName: text
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Clear input
                if (translationTextInput) translationTextInput.value = '';
                
                // Reload translations
                loadTranslationsForIcon(iconId, translationsList);
                
                // Refresh icon table to show updated translations
                await loadIconsForTable();
                
                alert('Translation added successfully');
            } else {
                alert('Failed to add translation: ' + (result.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error adding translation:', error);
            alert('Error adding translation');
        }
    };
    
    const closeModal = () => {
        translationModal.style.display = 'none';
        // Remove event listeners
        addTranslationBtn?.removeEventListener('click', handleAddTranslation);
        closeBtn?.removeEventListener('click', closeModal);
        closeModalBtn?.removeEventListener('click', closeModal);
    };
    
    // Add event listeners
    addTranslationBtn?.addEventListener('click', handleAddTranslation);
    closeBtn?.addEventListener('click', closeModal);
    closeModalBtn?.addEventListener('click', closeModal);
    
    // Handle Enter key in translation input
    translationTextInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleAddTranslation();
        }
    });
}

// Helper function to load translations for an icon
async function loadTranslationsForIcon(iconId, translationsList) {
    if (!translationsList) return;
    
    try {
        const response = await fetch(`/api/icons/${iconId}/translations`);
        const result = await response.json();
        
        if (result.success) {
            const translations = result.data;
            
            translationsList.innerHTML = '';
            
            if (Object.keys(translations).length === 0) {
                translationsList.innerHTML = '<p>No translations available</p>';
                return;
            }
            
            Object.entries(translations).forEach(([language, text]) => {
                const translationItem = document.createElement('div');
                translationItem.className = 'translation-item';
                translationItem.innerHTML = `
                    <div class="translation-info">
                        <div class="translation-lang">${language.toUpperCase()}</div>
                        <div class="translation-text">${text}</div>
                    </div>
                    <button class="btn-danger" onclick="deleteTranslation('${iconId}', '${language}')">Delete</button>
                `;
                translationsList.appendChild(translationItem);
            });
        }
    } catch (error) {
        console.error('Error loading translations:', error);
        if (translationsList) {
            translationsList.innerHTML = '<p>Error loading translations</p>';
        }
    }
}

// Delete translation function
async function deleteTranslation(iconId, language) {
    if (confirm(`Delete ${language.toUpperCase()} translation?`)) {
        try {
            const response = await fetch(`/api/icons/${iconId}/translations/${language}`, {
                method: 'DELETE'
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Reload translations
                const translationsList = document.getElementById('translationsList');
                loadTranslationsForIcon(iconId, translationsList);
                
                // Refresh icon table
                await loadIconsForTable();
                
                alert('Translation deleted successfully');
            } else {
                alert('Failed to delete translation');
            }
        } catch (error) {
            console.error('Error deleting translation:', error);
            alert('Error deleting translation');
        }
    }
}

// Make delete translation function globally accessible
window.deleteTranslation = deleteTranslation;

function openBulkAddToSetModal() {
    if (selectedIcons.size === 0) return;
    
    // Populate the modal with available sets
    const targetSetSelect = document.getElementById('targetSet');
    const selectedIconsPreview = document.getElementById('selectedIconsPreview');
    
    if (!targetSetSelect || !selectedIconsPreview || !addToSetModal) return;
    
    // Clear and populate sets dropdown
    targetSetSelect.innerHTML = '<option value="">Select a set...</option>';
    iconSets.forEach(set => {
        const option = document.createElement('option');
        option.value = set.id;
        option.textContent = set.name;
        targetSetSelect.appendChild(option);
    });
    
    // Show selected icons preview
    selectedIconsPreview.innerHTML = '';
    Array.from(selectedIcons).forEach(iconId => {
        const icon = availableIcons.find(i => i.id === iconId);
        if (icon) {
            const img = document.createElement('img');
            img.src = icon.image || icon.data;
            img.alt = icon.name;
            img.className = 'selected-icon-preview';
            selectedIconsPreview.appendChild(img);
        }
    });
    
    // Show modal
    addToSetModal.style.display = 'block';
    
    // Setup modal buttons
    const confirmBtn = document.getElementById('confirmAddToSet');
    const cancelBtn = document.getElementById('cancelAddToSet');
    const closeBtn = document.getElementById('closeAddToSetModal');
    
    const handleConfirm = async () => {
        const selectedSetId = targetSetSelect.value;
        if (!selectedSetId) {
            alert('Please select a set');
            return;
        }
        
        try {
            const promises = Array.from(selectedIcons).map(iconId =>
                fetch(`/api/icon-sets/${selectedSetId}/icons/${iconId}`, { method: 'POST' })
                    .then(response => response.json())
            );
            
            const results = await Promise.all(promises);
            const successCount = results.filter(result => result.success).length;
            
            if (successCount > 0) {
                // Refresh the icon table to show updated sets
                await loadIconsForTable();
                
                // Clear selection
                selectedIcons.clear();
                
                alert(`Successfully added ${successCount} icon${successCount > 1 ? 's' : ''} to set`);
                closeModal();
            } else {
                alert('Failed to add icons to set');
            }
        } catch (error) {
            console.error('Error adding icons to set:', error);
            alert('Error adding icons to set');
        }
    };
    
    const closeModal = () => {
        addToSetModal.style.display = 'none';
        // Remove event listeners
        confirmBtn.removeEventListener('click', handleConfirm);
        cancelBtn.removeEventListener('click', closeModal);
        closeBtn.removeEventListener('click', closeModal);
    };
    
    // Add event listeners
    confirmBtn.addEventListener('click', handleConfirm);
    cancelBtn.addEventListener('click', closeModal);
    closeBtn.addEventListener('click', closeModal);
}

function bulkRemoveFromSet() {
    console.log('Bulk removing from set...');
    // TODO: Implement bulk remove from set
}

async function bulkExcludeFromMultiHit() {
    if (selectedIcons.size === 0) return;
    
    const count = selectedIcons.size;
    notificationSystem.show(`Excluding ${count} icon${count > 1 ? 's' : ''} from multi-hit mode...`, 'info');
    
    try {
        const iconIds = Array.from(selectedIcons);
        const promises = iconIds.map(iconId => 
            fetch(`/api/icons/${iconId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    excludeFromMultiHit: true
                })
            })
            .then(response => response.json())
        );
        
        await Promise.all(promises);
        notificationSystem.show(`${count} icon${count > 1 ? 's' : ''} excluded from multi-hit mode successfully!`, 'success');
        
        // Refresh the icon list
        await loadIcons();
        clearSelection();
    } catch (error) {
        console.error('Error excluding icons from multi-hit:', error);
        notificationSystem.show('Failed to exclude icons from multi-hit mode', 'error');
    }
}

async function bulkIncludeInMultiHit() {
    if (selectedIcons.size === 0) return;
    
    const count = selectedIcons.size;
    notificationSystem.show(`Including ${count} icon${count > 1 ? 's' : ''} in multi-hit mode...`, 'info');
    
    try {
        const iconIds = Array.from(selectedIcons);
        const promises = iconIds.map(iconId => 
            fetch(`/api/icons/${iconId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    excludeFromMultiHit: false
                })
            })
            .then(response => response.json())
        );
        
        await Promise.all(promises);
        notificationSystem.show(`${count} icon${count > 1 ? 's' : ''} included in multi-hit mode successfully!`, 'success');
        
        // Refresh the icon list
        await loadIcons();
        clearSelection();
    } catch (error) {
        console.error('Error including icons in multi-hit:', error);
        notificationSystem.show('Failed to include icons in multi-hit mode', 'error');
    }
}

async function applySmartDefaults() {
    notificationSystem.show('Applying smart defaults for multi-hit exclusion...', 'info');
    
    try {
        const response = await fetch('/api/icons/smart-defaults', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            notificationSystem.show(`Smart defaults applied successfully! ${result.updated} icons updated.`, 'success');
            
            // Refresh the icon list
            await loadIcons();
            clearSelection();
        } else {
            notificationSystem.show('Failed to apply smart defaults', 'error');
        }
    } catch (error) {
        console.error('Error applying smart defaults:', error);
        notificationSystem.show('Failed to apply smart defaults', 'error');
    }
}

async function bulkDeleteIcons() {
    if (selectedIcons.size === 0) return;
    
    const count = selectedIcons.size;
    if (confirm(`Are you sure you want to delete ${count} selected icon${count > 1 ? 's' : ''}?`)) {
        try {
            const iconIds = Array.from(selectedIcons);
            const promises = iconIds.map(iconId => 
                fetch(`/api/icons/${iconId}`, { method: 'DELETE' })
                    .then(response => response.json())
            );
            
            const results = await Promise.all(promises);
            
            // Count successful deletions
            const successCount = results.filter(result => result.success).length;
            
            if (successCount > 0) {
                // Remove deleted icons from arrays
                availableIcons = availableIcons.filter(icon => !selectedIcons.has(icon.id));
                selectedIcons.clear();
                
                // Re-render
                renderIconTable();
                
                alert(`Successfully deleted ${successCount} icon${successCount > 1 ? 's' : ''}`);
            } else {
                alert('Failed to delete icons');
            }
        } catch (error) {
            console.error('Error bulk deleting icons:', error);
            alert('Error deleting icons');
        }
    }
}

// Delete icon function for Icon Manager
async function deleteIconFromManager(iconId) {
    if (confirm('Are you sure you want to delete this icon?')) {
        try {
            const response = await fetch(`/api/icons/${iconId}`, {
                method: 'DELETE'
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Remove from arrays
                availableIcons = availableIcons.filter(icon => icon.id !== iconId);
                selectedIcons.delete(iconId);
                
                // Re-render
                renderIconTable();
                console.log('Icon deleted successfully');
            } else {
                console.error('Failed to delete icon:', result.error);
                alert('Failed to delete icon');
            }
        } catch (error) {
            console.error('Error deleting icon:', error);
            alert('Error deleting icon');
        }
    }
}

// Icon Selection Functions for Generator

// Load icon sets for the generator dropdown
async function loadIconSetsForGenerator() {
    try {
        const response = await fetch('/api/icon-sets');
        const result = await response.json();
        
        if (result.success) {
            generatorIconSets = result.data;
            populateIconSetSelector();
        }
    } catch (error) {
        console.error('Error loading icon sets for generator:', error);
    }
}

// Populate the icon set selector dropdown
function populateIconSetSelector() {
    if (!iconSetSelector) return;
    
    iconSetSelector.innerHTML = '<option value="all-icons">All Icons</option>';
    
    generatorIconSets.forEach(set => {
        if (set.id !== 'all-icons') {
            const option = document.createElement('option');
            option.value = set.id;
            option.textContent = set.name;
            iconSetSelector.appendChild(option);
        }
    });
}

// Load icons for the selected set
async function loadIconsForSelectedSet() {
    const selectedSetId = iconSetSelector.value;
    console.log('🔄 Loading icons for set:', selectedSetId);
    
    try {
        let response;
        if (selectedSetId === 'all-icons') {
            response = await fetch('/api/icons');
        } else {
            response = await fetch(`/api/icon-sets/${selectedSetId}/icons`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            availableIcons = result.data || [];
            console.log(`✅ Loaded ${availableIcons.length} icons for set ${selectedSetId}`);
            
            // Update the selected icons to show all icons from the set
            selectedIconsForGeneration.clear();
            availableIcons.forEach(icon => {
                selectedIconsForGeneration.add(icon.id);
            });
            
            // Update UI components
            updateSelectedIconsPreview();
            updateRequiredIconCount();
        } else {
            console.error('❌ Failed to load icons for set:', result.error);
        }
    } catch (error) {
        console.error('Error loading icons for selected set:', error);
    }
}

// Open icon selection modal
async function openIconSelectionModal() {
    if (!iconSelectionModal) return;
    
    // Load all icons for selection
    await loadIconsForSelection();
    
    // Show modal
    iconSelectionModal.style.display = 'block';
    
    // Render icons
    renderIconSelectionGrid();
}

// Load icons for selection modal
async function loadIconsForSelection() {
    try {
        const response = await fetch('/api/icons');
        const result = await response.json();
        
        if (result.success) {
            filteredIconsForSelection = result.data;
            
            // Also populate category filter
            const categories = [...new Set(result.data.map(icon => icon.category))];
            populateIconSelectionCategoryFilter(categories);
        }
    } catch (error) {
        console.error('Error loading icons for selection:', error);
    }
}

// Populate category filter in selection modal
function populateIconSelectionCategoryFilter(categories) {
    if (!iconSelectionCategoryFilter) return;
    
    iconSelectionCategoryFilter.innerHTML = '<option value="all">All Categories</option>';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        iconSelectionCategoryFilter.appendChild(option);
    });
}

// Render icon selection grid
function renderIconSelectionGrid() {
    if (!iconSelectionGrid) return;
    
    iconSelectionGrid.innerHTML = '';
    
    filteredIconsForSelection.forEach(icon => {
        const iconDiv = document.createElement('div');
        iconDiv.className = 'icon-selection-item';
        iconDiv.innerHTML = `
            <div class="icon-checkbox">
                <input type="checkbox" id="select-${icon.id}" 
                       ${selectedIconsForGeneration.has(icon.id) ? 'checked' : ''}>
            </div>
            <div class="icon-preview">
                <img src="${icon.image}" alt="${icon.name}" title="${icon.name}">
            </div>
            <div class="icon-name">${icon.name}</div>
        `;
        
        // Add click handler
        const checkbox = iconDiv.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                selectedIconsForGeneration.add(icon.id);
            } else {
                selectedIconsForGeneration.delete(icon.id);
            }
            updateSelectionCount();
        });
        
        iconSelectionGrid.appendChild(iconDiv);
    });
    
    updateSelectionCount();
}

// Filter icons for selection
function filterIconsForSelection() {
    const searchTerm = iconSelectionSearch ? iconSelectionSearch.value.toLowerCase() : '';
    const categoryFilter = iconSelectionCategoryFilter ? iconSelectionCategoryFilter.value : 'all';
    
    // Load all icons first
    loadIconsForSelection().then(() => {
        // Apply filters
        filteredIconsForSelection = filteredIconsForSelection.filter(icon => {
            const matchesSearch = icon.name.toLowerCase().includes(searchTerm);
            const matchesCategory = categoryFilter === 'all' || icon.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });
        
        renderIconSelectionGrid();
    });
}

// Select all icons for generation
function selectAllIconsForGeneration() {
    filteredIconsForSelection.forEach(icon => {
        selectedIconsForGeneration.add(icon.id);
    });
    renderIconSelectionGrid();
}

// Deselect all icons for generation
function deselectAllIconsForGeneration() {
    selectedIconsForGeneration.clear();
    renderIconSelectionGrid();
}

// Update selection count
function updateSelectionCount() {
    if (selectionCountText) {
        const count = selectedIconsForGeneration.size;
        selectionCountText.textContent = `${count} icons selected`;
    }
}

// Close icon selection modal
function closeIconSelectionModalHandler() {
    if (iconSelectionModal) {
        iconSelectionModal.style.display = 'none';
    }
}

// Confirm icon selection
function confirmIconSelectionHandler() {
    updateSelectedIconsPreview();
    closeIconSelectionModalHandler();
}

// Update selected icons preview in generator
function updateSelectedIconsPreview() {
    if (!selectedIconsPreview) return;
    
    console.log('🔄 Updating selected icons preview');
    selectedIconsPreview.innerHTML = '';
    
    const selectedIconIds = Array.from(selectedIconsForGeneration);
    const selectedIconsData = availableIcons.filter(icon => selectedIconIds.includes(icon.id));
    
    console.log(`Found ${selectedIconsData.length} selected icons from ${selectedIconIds.length} selected IDs`);
    
    if (selectedIconsData.length === 0) {
        selectedIconsPreview.innerHTML = '<p>No icons selected. Click "Select Icons" to choose icons for generation.</p>';
        return;
    }
    
    selectedIconsData.forEach(icon => {
        const iconDiv = document.createElement('div');
        iconDiv.className = 'selected-icon-item';
        iconDiv.innerHTML = `
            <img src="${icon.image || icon.data}" alt="${icon.name}" title="${icon.name}">
            <span>${icon.name}</span>
            <button class="remove-icon-btn" onclick="removeIconFromSelection('${icon.id}')">&times;</button>
        `;
        selectedIconsPreview.appendChild(iconDiv);
    });
    
    console.log('✅ Selected icons preview updated');
}

// Remove icon from selection
function removeIconFromSelection(iconId) {
    console.log('🗑️ Removing icon from selection:', iconId);
    selectedIconsForGeneration.delete(iconId);
    
    // Update the available icons to exclude the removed icon
    availableIcons = availableIcons.filter(icon => icon.id !== iconId);
    
    updateSelectedIconsPreview();
    updateRequiredIconCount();
}

// Make removeIconFromSelection globally accessible
window.removeIconFromSelection = removeIconFromSelection;

// Export for testing
// Convert from CommonJS to ES Module exports
const exports = {
    updateRequiredIconCount,
    generateCards,
    displayCardPreview,
    switchToPage,
    loadIconSets,
    renderIconTable
};

export default exports;