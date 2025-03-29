// Road Trip Bingo Generator
// Global variables
let availableIcons = [];
let generatedCards = [];
let currentLanguage = 'en'; // Track current language
let currentSettings = {
    language: 'en',
    theme: 'light',
    gridSize: 5,
    cardsPerSet: 1
};

// DOM Elements
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
let uploadBtn;
let clearIconsBtn;
let iconGallery;
let iconCountElement;
let backupBtn;
let restoreBtn;
let restoreInput;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initializeDOMElements();
    initializeApp();
    setupEventListeners();
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
    uploadBtn = document.getElementById('uploadBtn');
    clearIconsBtn = document.getElementById('clearIconsBtn');
    iconGallery = document.getElementById('iconGallery');
    iconCountElement = document.getElementById('iconCount');
    backupBtn = document.getElementById('backupBtn');
    restoreBtn = document.getElementById('restoreBtn');
    restoreInput = document.getElementById('restoreInput');

    // Verify all required elements exist
    const requiredElements = {
        titleInput,
        gridSizeSelect,
        setCountInput,
        setCountInfo,
        cardCountInput,
        generateBtn,
        downloadBtn,
        cardPreview,
        identifierElement,
        iconUploadInput,
        uploadBtn,
        clearIconsBtn,
        iconGallery,
        iconCountElement,
        backupBtn,
        restoreBtn,
        restoreInput
    };

    const missingElements = Object.entries(requiredElements)
        .filter(([name, element]) => !element)
        .map(([name]) => name);

    if (missingElements.length > 0) {
        console.error('Missing required DOM elements:', missingElements);
        throw new Error('Required DOM elements not found');
    }

    // Set initial language
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
        currentLanguage = languageSelect.value || 'en';
    }
}

// Initialize the app and storage
async function initializeApp() {
    try {
        // Initialize the storage system
        await window.iconDB.init();
        
        // Load settings
        currentSettings = await window.iconDB.loadSettings();
        
        // Apply settings
        applySettings(currentSettings);
        
        // Load icons from storage
        const icons = await loadIconsFromStorage();
        
        // Update UI now that icons are loaded
        checkIconAvailability();
    } catch (error) {
        console.error('Error initializing app:', error);
        // If there's an error, at least attempt to check icon availability
        checkIconAvailability();
    }
}

// Apply settings to the UI
function applySettings(settings) {
    // Apply language
    if (settings.language) {
        currentLanguage = settings.language;
        document.getElementById('languageSelect').value = settings.language;
    }
    
    // Apply grid size
    if (settings.gridSize) {
        gridSizeSelect.value = settings.gridSize;
    }
    
    // Apply cards per set
    if (settings.cardsPerSet) {
        cardCountInput.value = settings.cardsPerSet;
    }
    
    // Apply theme
    if (settings.theme) {
        document.body.className = settings.theme;
    }
}

// Set up event listeners
function setupEventListeners() {
    gridSizeSelect.addEventListener('change', () => {
        checkIconAvailability();
        saveSettings();
    });
    
    setCountInput.addEventListener('change', updateCardGeneration);
    generateBtn.addEventListener('click', generateBingoCards);
    downloadBtn.addEventListener('click', downloadPDF);
    
    // Icon manager event listeners
    uploadBtn.addEventListener('click', uploadIcons);
    clearIconsBtn.addEventListener('click', clearIcons);
    
    // Backup/Restore event listeners
    backupBtn.addEventListener('click', () => {
        window.iconDB.exportData();
    });
    
    restoreBtn.addEventListener('click', () => {
        restoreInput.click();
    });
    
    restoreInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (file) {
            try {
                await window.iconDB.importData(file);
                // Reload icons and settings after restore
                availableIcons = await window.iconDB.loadIcons();
                currentSettings = await window.iconDB.loadSettings();
                updateIconGallery();
                applySettings(currentSettings);
                alert('Data restored successfully!');
            } catch (error) {
                console.error('Error restoring data:', error);
                alert('Error restoring data. Please check the console for details.');
            }
        }
    });
    
    // Language switch event listener
    const languageSelect = document.getElementById('languageSelect');
    languageSelect.addEventListener('change', () => {
        currentLanguage = languageSelect.value;
        currentSettings.language = currentLanguage;
        saveSettings();
        checkIconAvailability(); // Update messages with new language
    });
    
    // Cards per set change listener
    cardCountInput.addEventListener('change', saveSettings);
}

// Save current settings
async function saveSettings() {
    currentSettings = {
        language: currentLanguage,
        theme: document.body.className || 'light',
        gridSize: parseInt(gridSizeSelect.value),
        cardsPerSet: parseInt(cardCountInput.value)
    };
    await window.iconDB.saveSettings(currentSettings);
}

// Load icons from storage
async function loadIconsFromStorage() {
    try {
        // Load icons from storage
        const icons = await window.iconDB.loadIcons();
        
        // Update global variable
        availableIcons = icons;
        
        // Update UI
        updateIconGallery();
        console.log(`Loaded ${availableIcons.length} icons from storage`);
        
        return icons;
    } catch (error) {
        console.error('Error loading icons from storage:', error);
        availableIcons = [];
        return [];
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
            
            // Save to storage and update UI
            await saveIconsToStorage();
            updateIconGallery();
            checkIconAvailability(); // Check if we now have enough icons
            
            // Reset the file input
            iconUploadInput.value = '';
            
            console.log(`Successfully uploaded ${newIcons.length} icons`);
        }
    } catch (error) {
        console.error('Error uploading icons:', error);
        alert('There was an error uploading one or more icons');
    }
}

// Convert a Blob/File to a base64 encoded icon object
function convertBlobToBase64Icon(blob, name) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            resolve({
                name: name,
                data: e.target.result,
                id: Date.now() + '-' + Math.random().toString(36).substr(2, 9)
            });
        };
        reader.readAsDataURL(blob);
    });
}

// Save icons to storage
async function saveIconsToStorage() {
    try {
        await window.iconDB.saveIcons(availableIcons);
        updateIconCount();
        console.log(`Saved ${availableIcons.length} icons to storage`);
    } catch (error) {
        console.error('Error saving icons to storage:', error);
        alert('There was an error saving the icons. Please try again.');
    }
}

// Update the icon count display
function updateIconCount() {
    iconCountElement.textContent = availableIcons.length;
}

// Update the icon gallery display
function updateIconGallery() {
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
        await window.iconDB.deleteIcon(id);
        
        // Also remove from the local array
        availableIcons.splice(index, 1);
        
        // Update UI
        updateIconGallery();
        checkIconAvailability();
    } catch (error) {
        console.error('Error deleting icon:', error);
        alert('Failed to delete the icon. Please try again.');
    }
}

// Clear all icons
async function clearIcons() {
    if (confirm('Are you sure you want to delete all icons? This cannot be undone.')) {
        try {
            await window.iconDB.clearIcons();
            availableIcons = [];
            updateIconGallery();
            checkIconAvailability();
        } catch (error) {
            console.error('Error clearing icons:', error);
            alert('Failed to clear icons. Please try again.');
        }
    }
}

// Helper to get translated text with replacements
function getTranslatedText(key, replacements = {}) {
    const languages = window.languages || { 
        en: {}, // Fallback empty language
        de: {}
    };
    
    let text = languages[currentLanguage]?.[key] || key;
    
    // Replace placeholders with actual values
    for (const [placeholder, value] of Object.entries(replacements)) {
        text = text.replace(`{${placeholder}}`, value);
    }
    
    return text;
}

// Check if we have enough icons available for the selected grid size and update set count
function checkIconAvailability() {
    const gridSize = parseInt(gridSizeSelect.value);
    const totalCellsPerSet = gridSize * gridSize;
    
    // Update preview grid columns
    cardPreview.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    cardPreview.innerHTML = ''; // Clear preview
    
    // Calculate max possible sets
    // With our implementation, the number of possible sets is much larger since
    // we only require at least 1 icon to be different between sets
    // We'll use a more reasonable limit based on permutations
    
    if (availableIcons.length < totalCellsPerSet) {
        // Not enough icons for even one set
        setCountInput.max = 0;
        setCountInput.value = 0;
        setCountInput.disabled = true;
        
        // Use translated text
        setCountInfo.textContent = getTranslatedText('needIcons', { count: totalCellsPerSet });
        setCountInfo.style.color = '#ff5722';
        
        generateBtn.disabled = true;
        
        let messageElement = document.getElementById('iconAvailabilityMessage');
        if (!messageElement) {
            messageElement = document.createElement('p');
            messageElement.id = 'iconAvailabilityMessage';
            messageElement.className = 'availability-message';
            gridSizeSelect.parentNode.appendChild(messageElement);
        }
        
        messageElement.textContent = getTranslatedText('iconsAvailable', { 
            available: availableIcons.length, 
            needed: totalCellsPerSet 
        });
        messageElement.style.color = '#ff5722';
        return;
    }
    
    // If we have more icons than needed for a single set, calculate theoretical maximum
    // This is a simplified calculation, real math would use combinations formula
    let maxSets;
    
    if (availableIcons.length === totalCellsPerSet) {
        // Only one possible set if we have exactly enough icons
        maxSets = 1;
    } else {
        // For simplicity, let's calculate this based on how many different icons we can swap in
        // With n icons and k needed per set, we can create roughly n choose k different sets
        // But we'll use a simplified formula that's more understandable for users
        
        // Calculate a reasonable maximum based on icon count and grid size
        // This is a heuristic rather than an exact mathematical formula
        const extraIcons = availableIcons.length - totalCellsPerSet;
        maxSets = Math.min(1000, extraIcons + 1); // Capped at 1000 to prevent UI issues
    }
    
    // Update set count input
    setCountInput.max = maxSets;
    setCountInput.disabled = false;
    
    if (parseInt(setCountInput.value) < 1 || parseInt(setCountInput.value) > maxSets || isNaN(parseInt(setCountInput.value))) {
        setCountInput.value = Math.max(1, Math.min(maxSets, parseInt(setCountInput.value) || 1));
    }
    
    // Update set count info text with translation
    setCountInfo.textContent = getTranslatedText('manyUniqueSets', { count: availableIcons.length });
    setCountInfo.style.color = '#4CAF50';
    
    // Update generate button status
    let messageElement = document.getElementById('iconAvailabilityMessage');
    if (!messageElement) {
        messageElement = document.createElement('p');
        messageElement.id = 'iconAvailabilityMessage';
        messageElement.className = 'availability-message';
        gridSizeSelect.parentNode.appendChild(messageElement);
    }
    
    generateBtn.disabled = false;
    messageElement.textContent = getTranslatedText('iconsAvailable', { 
        available: availableIcons.length, 
        needed: totalCellsPerSet 
    });
    messageElement.style.color = '#4CAF50';
}

// Update card generation settings when set count changes
function updateCardGeneration() {
    const setCount = parseInt(setCountInput.value);
    // Ensure value is at least 1
    if (setCount < 1 || isNaN(setCount)) {
        setCountInput.value = 1;
    }
}

// Generate a unique identifier based on the used icons
function generateIdentifier(iconsUsed) {
    // Create a hash from the icon IDs used in this card
    let iconIdsString = iconsUsed.map(icon => icon.id).join('');
    let hash = 0;
    
    // Simple string hash function
    for (let i = 0; i < iconIdsString.length; i++) {
        const char = iconIdsString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    
    // Convert to base36 and ensure it's 5 characters
    let id = Math.abs(hash).toString(36).toUpperCase();
    
    // Ensure it's exactly 5 characters
    while (id.length < 5) {
        id = '0' + id;
    }
    if (id.length > 5) {
        id = id.substring(0, 5);
    }
    
    return id;
}

// Generate the bingo cards
function generateBingoCards() {
    const gridSize = parseInt(gridSizeSelect.value);
    const setCount = parseInt(setCountInput.value);
    const cardsPerSet = parseInt(cardCountInput.value);
    const title = titleInput.value || 'Road Trip Bingo';
    
    // Clear previous cards
    generatedCards = [];
    
    // Create sets of cards
    for (let setIndex = 0; setIndex < setCount; setIndex++) {
        // For each set, select a unique subset of icons
        const iconsForSet = selectIconsForSet(gridSize, setIndex, setCount);
        
        // Generate the requested number of cards for this set
        for (let cardIndex = 0; cardIndex < cardsPerSet; cardIndex++) {
            const card = generateSingleCard(gridSize, title, iconsForSet);
            generatedCards.push(card);
        }
    }
    
    // Display the first card as preview
    if (generatedCards.length > 0) {
        displayCardPreview(generatedCards[0]);
        
        // Enable download button
        downloadBtn.disabled = false;
    }
}

// Select icons for a specific set
function selectIconsForSet(gridSize, setIndex, totalSets) {
    const totalCellsPerSet = gridSize * gridSize;
    
    // Create a copy of the icons array
    const allIcons = [...availableIcons];
    
    // If we only have one set, or exactly enough icons for a single set,
    // just shuffle all available icons and take what we need
    if (totalSets === 1 || allIcons.length === totalCellsPerSet) {
        const shuffledIcons = [...allIcons];
        
        // Fisher-Yates shuffle
        for (let i = shuffledIcons.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledIcons[i], shuffledIcons[j]] = [shuffledIcons[j], shuffledIcons[i]];
        }
        
        return shuffledIcons.slice(0, totalCellsPerSet);
    }
    
    // For multiple sets with icon reuse:
    // Each set will be a shuffled subset of all available icons
    // We'll track previously selected icon sets to ensure minimum difference
    
    const previousSets = [];
    for (let i = 0; i < setIndex; i++) {
        // This value will be populated in the next generateBingoCards call
        // from the already-generated sets
        if (generatedCards[i * parseInt(cardCountInput.value)]) {
            previousSets.push(
                generatedCards[i * parseInt(cardCountInput.value)].cells.map(cell => cell.icon.id)
            );
        }
    }
    
    let attempts = 0;
    let selectedSet;
    
    // Try to find a set that differs by at least one icon from each previous set
    do {
        attempts++;
        
        // Shuffle the entire collection
        const shuffledIcons = [...allIcons];
        for (let i = shuffledIcons.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledIcons[i], shuffledIcons[j]] = [shuffledIcons[j], shuffledIcons[i]];
        }
        
        // Select the icons for this set
        selectedSet = shuffledIcons.slice(0, totalCellsPerSet);
        
        // Check if this set differs by at least one icon from each previous set
        const isDifferent = previousSets.every(prevSet => {
            const selectedIds = selectedSet.map(icon => icon.id);
            // Check if there is at least one different icon
            return selectedIds.some(id => !prevSet.includes(id)) || 
                   prevSet.some(id => !selectedIds.includes(id));
        });
        
        if (isDifferent || attempts > 50) {
            // Either we found a sufficiently different set or we've tried too many times
            break;
        }
    } while (true);
    
    return selectedSet;
}

// Generate a single bingo card
function generateSingleCard(gridSize, title, iconsForSet) {
    // Create a copy of the icons for this set to shuffle
    const shuffledIcons = [...iconsForSet];
    
    // Shuffle the icons for this specific card
    for (let i = shuffledIcons.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledIcons[i], shuffledIcons[j]] = [shuffledIcons[j], shuffledIcons[i]];
    }
    
    // Generate identifier based on the icons used in the set
    const identifier = generateIdentifier(iconsForSet);
    
    // Create card data
    const card = {
        title: title,
        identifier: identifier,
        cells: [],
        gridSize: gridSize
    };
    
    // Fill card with icons
    for (let i = 0; i < shuffledIcons.length; i++) {
        card.cells.push({
            icon: shuffledIcons[i]
        });
    }
    
    return card;
}

// Display a card in the preview area
function displayCardPreview(card) {
    cardPreview.innerHTML = '';
    cardPreview.style.gridTemplateColumns = `repeat(${card.gridSize}, 1fr)`;
    
    // Add card title
    const titleElement = document.createElement('div');
    titleElement.className = 'card-title';
    titleElement.textContent = card.title;
    titleElement.style.gridColumn = `1 / span ${card.gridSize}`;
    cardPreview.appendChild(titleElement);
    
    // Add card identifier
    identifierElement.textContent = `ID: ${card.identifier}`;
    
    // Add card cells
    card.cells.forEach(cell => {
        const cellElement = document.createElement('div');
        cellElement.className = 'bingo-cell';
        
        const img = document.createElement('img');
        img.src = cell.icon.data;
        img.alt = cell.icon.name;
        cellElement.appendChild(img);
        
        cardPreview.appendChild(cellElement);
    });
}

// Download the Bingo cards as PDF
async function downloadPDF() {
    // Show loading indicator
    downloadBtn.textContent = 'Generating PDF...';
    downloadBtn.disabled = true;
    
    // Use setTimeout to allow the UI to update before starting PDF generation
    setTimeout(async () => {
        try {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            
            // Constants for card sizing and positioning
            const margin = 10;
            
            for (let cardIndex = 0; cardIndex < generatedCards.length; cardIndex++) {
                const card = generatedCards[cardIndex];
                
                // Add new page for each new card except the first one
                if (cardIndex > 0) {
                    pdf.addPage();
                }
                
                // Calculate card dimensions based on page size and margins
                const cardWidth = pageWidth - 2 * margin;
                const cellSize = cardWidth / card.gridSize;
                
                // Add card title
                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(16);
                pdf.text(card.title, pageWidth / 2, margin + 7, { align: 'center' });
                
                // Add unique identifier above the bingo card on the right
                pdf.setFontSize(10);
                pdf.text(`ID: ${card.identifier}`, pageWidth - margin, margin + 4, { align: 'right' });
                
                // Draw card grid
                pdf.setDrawColor(0);
                pdf.setLineWidth(0.5);
                
                // Draw cells WITH images in the PDF
                for (let i = 0; i < card.cells.length; i++) {
                    const cell = card.cells[i];
                    const row = Math.floor(i / card.gridSize);
                    const col = i % card.gridSize;
                    
                    const x = margin + col * cellSize;
                    const y = margin + 10 + row * cellSize; // +10 for title space
                    
                    // Draw cell border
                    pdf.rect(x, y, cellSize, cellSize);
                    
                    // Add icon image
                    try {
                        // Calculate icon size (80% of cell size)
                        const iconSize = cellSize * 0.8;
                        
                        // Center icon in cell
                        const iconX = x + (cellSize - iconSize) / 2;
                        const iconY = y + (cellSize - iconSize) / 2;
                        
                        // Add image to PDF
                        pdf.addImage(
                            cell.icon.data,
                            'PNG',
                            iconX,
                            iconY,
                            iconSize,
                            iconSize
                        );
                    } catch (error) {
                        console.error(`Error adding image to PDF: ${error}`);
                    }
                }
            }
            
            // Save the PDF with Road Trip Bingo name
            pdf.save(`road_trip_bingo_cards.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        }
        
        // Reset button state
        downloadBtn.textContent = 'Download PDF';
        downloadBtn.disabled = false;
    }, 100);
}