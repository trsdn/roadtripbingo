// Road Trip Bingo - Main Application
// Main entry point that coordinates all modules and UI interactions

// Import modules
import storage from './modules/storage.js';
import { setLanguage, getTranslatedText, initLanguageSelector } from './modules/i18n.js';
import { convertBlobToBase64Icon } from './modules/imageUtils.js';
import { generateBingoCards } from './modules/cardGenerator.js';
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
let clearIconsBtn;
let backupBtn;
let restoreBtn;
let restoreInput;
let pdfCompression;
let iconCount;

// Application state
let availableIcons = [];
let generatedCards = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Initializing Road Trip Bingo Generator...');

    // Initialize modules
    window.iconDB = storage; // For backward compatibility
    await storage.init();
    
    // Initialize DOM elements
    initializeDOMElements();
    
    // Initialize language selector
    initLanguageSelector((language) => {
        // Save language preference
        storage.saveSettings({ language });
        updateUI();
    });
    
    // Load saved icons
    loadIcons();
    
    // Add event listeners
    setupEventListeners();
    
    console.log('Application initialized successfully');
});

// Initialize DOM elements
function initializeDOMElements() {
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
    clearIconsBtn = document.getElementById('clearIconsBtn');
    iconCount = document.getElementById('iconCount');
    backupBtn = document.getElementById('backupBtn');
    restoreBtn = document.getElementById('restoreBtn');
    restoreInput = document.getElementById('restoreInput');
    pdfCompression = document.getElementById('pdfCompression');
}

// Setup all event listeners
function setupEventListeners() {
    // Grid size change
    gridSizeSelect.addEventListener('change', updateRequiredIconCount);
    
    // Set count change
    setCountInput.addEventListener('change', updateRequiredIconCount);
    
    // Cards per set change
    cardCountInput.addEventListener('change', updateRequiredIconCount);
    
    // Generate button
    generateBtn.addEventListener('click', generateCards);
    
    // Download button
    downloadBtn.addEventListener('click', downloadPDF);
    
    // Icon upload
    iconUploadInput.addEventListener('change', uploadIcons);
    
    // Clear icons
    clearIconsBtn.addEventListener('click', clearIcons);
    
    // Backup data
    backupBtn.addEventListener('click', backupData);
    
    // Restore data
    restoreBtn.addEventListener('click', () => restoreInput.click());
    restoreInput.addEventListener('change', restoreData);
    
    // Update the required icon count initially
    updateRequiredIconCount();
}

// Load icons from storage
async function loadIcons() {
    try {
        availableIcons = await storage.loadIcons();
        updateIconCount();
        console.log(`Loaded ${availableIcons.length} icons from storage`);
    } catch (error) {
        console.error('Error loading icons:', error);
    }
}

// Save icons to storage
async function saveIconsToStorage() {
    try {
        await storage.saveIcons(availableIcons);
        updateIconCount();
        console.log(`Saved ${availableIcons.length} icons to storage`);
        return true;
    } catch (error) {
        console.error('Error saving icons to storage:', error);
        
        // Check if it's a quota exceeded error
        if (error.name === 'QuotaExceededError' || 
            error.toString().includes('quota') || 
            error.toString().includes('storage')) {
            alert('Storage limit exceeded. Try removing some icons or using smaller images.');
        } else {
            // Even though we got an error, the icons are still in memory
            // So we don't show an error to the user unless it's a storage quota error
        }
        return false;
    }
}

// Upload new icons
async function uploadIcons() {
    const files = iconUploadInput.files;
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
            updateRequiredIconCount();
        }
    } catch (error) {
        console.error('Error uploading icons:', error);
        alert('Error uploading one or more icons. Please try again.');
    }
}

// Clear all icons
async function clearIcons() {
    if (confirm('Are you sure you want to remove all icons?')) {
        availableIcons = [];
        await saveIconsToStorage();
        updateRequiredIconCount();
    }
}

// Update icon count display
function updateIconCount() {
    if (iconCount) {
        iconCount.textContent = availableIcons.length;
    }
}

// Update the required icon count based on selected options
function updateRequiredIconCount() {
    const gridSize = parseInt(gridSizeSelect.value);
    const setCount = parseInt(setCountInput.value);
    const cardsPerSet = parseInt(cardCountInput.value);
    
    // Calculate required icons for a single set
    const cellsPerCard = gridSize * gridSize;
    const totalCellsPerSet = cellsPerCard * cardsPerSet;
    
    // No FREE space - all cells need icons
    const iconsNeededPerSet = totalCellsPerSet;
    
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

// Generate Bingo cards
function generateCards() {
    const gridSize = parseInt(gridSizeSelect.value);
    const setCount = parseInt(setCountInput.value);
    const cardsPerSet = parseInt(cardCountInput.value);
    const title = titleInput.value.trim();
    
    try {
        // Generate the cards
        const result = generateBingoCards({
            icons: availableIcons,
            gridSize,
            setCount,
            cardsPerSet,
            title
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
    // Clear preview
    cardPreview.innerHTML = '';
    
    // Create a table to display the grid
    const table = document.createElement('table');
    table.className = 'preview-grid';
    
    // Add title
    const titleRow = document.createElement('tr');
    const titleCell = document.createElement('th');
    titleCell.colSpan = card.grid.length;
    titleCell.textContent = card.title;
    titleRow.appendChild(titleCell);
    table.appendChild(titleRow);
    
    // Add grid cells
    for (let row = 0; row < card.grid.length; row++) {
        const tr = document.createElement('tr');
        for (let col = 0; col < card.grid[row].length; col++) {
            const cell = card.grid[row][col];
            const td = document.createElement('td');
            
            if (cell.isFreeSpace) {
                td.textContent = 'FREE';
                td.className = 'free-space';
            } else {
                if (cell.data) {
                    const img = document.createElement('img');
                    img.src = cell.data;
                    img.alt = cell.name;
                    td.appendChild(img);
                }
                
                const label = document.createElement('div');
                label.className = 'cell-label';
                label.textContent = cell.name;
                td.appendChild(label);
            }
            
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
    
    cardPreview.appendChild(table);
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
                compressionLevel
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