// Road Trip Bingo - Internationalization
// Provides language translations and utilities

// Define all supported languages and their translations
const languages = {
    en: {
        title: "Road Trip Bingo Generator",
        bingoCardTitle: "Bingo Card Title:",
        gridSize: "Grid Size:",
        numberOfSets: "Number of Sets:",
        cardsPerSet: "Cards per Set:",
        generateBtn: "Generate Bingo Cards",
        iconManager: "Icon Manager",
        uploadIcons: "Upload Icons",
        clearIcons: "Clear All Icons",
        currentlyUsing: "Currently using",
        icons: "icons",
        preview: "Preview",
        downloadPDF: "Download PDF",
        needIcons: "Need at least {count} icons for a single set",
        manyUniqueSets: "Many unique sets possible with {count} icons",
        iconsAvailable: "{available} icons available ({needed} needed per set)",
        backupData: "Backup Data",
        restoreData: "Restore Data",
        backupSuccess: "Data backup created successfully",
        restoreSuccess: "Data restored successfully",
        restoreError: "Failed to restore data. Please make sure you selected a valid backup file.",
        pdfCompression: "PDF Compression:",
        showLabelsToggle: "Show text labels on icons",
        centerBlankToggle: "Leave center cell blank (odd grids only)",
        sameCardToggle: "Use identical card for all players",
        multiHitToggle: "Enable Multi-Hit Mode",
        difficulty: "Difficulty:",
        difficultyLight: "Light (20-30% tiles, 2-3 hits)",
        difficultyMedium: "Medium (40-50% tiles, 2-4 hits)",
        difficultyHard: "Hard (60-70% tiles, 3-5 hits)",
        multiHitPreview: "Expected multi-hit tiles: {count}",
        multiHitInstructions: "Multi-Hit Mode Instructions",
        iconDistributionLabel: "Icon Distribution:",
        sameIcons: "Same icons (different arrangements)",
        differentIcons: "Different icons for each card",
        iconDistributionInfo: "Choose how icons are distributed across cards within each set.",
        // New translations for enhanced UI
        navGenerator: "Generator",
        navIconManager: "Icon Manager",
        iconManagerDescription: "Manage your icon collection, organize them into sets, and add translations.",
        iconSets: "Icon Sets",
        createSet: "Create New Set",
        iconManagement: "Icon Management",
        tableView: "Table View",
        gridView: "Grid View",
        searchIcons: "Search icons...",
        allCategories: "All Categories",
        allSets: "All Sets",
        itemsSelected: "items selected",
        addToSet: "Add to Set",
        removeFromSet: "Remove from Set",
        deleteSelected: "Delete Selected",
        clearSelection: "Clear Selection",
        dropZoneText: "Drop images here to upload",
        name: "Name",
        category: "Category",
        difficulty: "Difficulty",
        preview: "Preview",
        sets: "Sets",
        translations: "Translations",
        actions: "Actions",
        dataManagement: "Data Management",
        selectIconSet: "Select Icon Set:",
        allIcons: "All Icons",
        selectedIcons: "Selected Icons:",
        selectIcons: "Select Icons",
        selectIconsForGeneration: "Select Icons for Card Generation",
        selectAll: "Select All",
        deselectAll: "Deselect All",
        confirmSelection: "Confirm Selection",
        cancel: "Cancel",
        close: "Close",
        saveChanges: "Save Changes",
        editIcon: "Edit Icon",
        iconName: "Icon Name:",
        tags: "Tags (comma-separated):",
        altText: "Alt Text:",
        createSet: "Create Set",
        setName: "Set Name:",
        setDescription: "Description:",
        saveSet: "Save Set",
        selectSet: "Select Set:",
        selectSetOption: "Select a set...",
        manageTranslations: "Manage Translations",
        language: "Language:",
        translatedName: "Translated Name:",
        addTranslation: "Add Translation",
        gameDifficulty: "Game Difficulty:",
        pdfLayout: "PDF Layout:"
    },
    de: {
        title: "Auto Bingo Generator",
        bingoCardTitle: "Bingo Kartentitel:",
        gridSize: "Rastergröße:",
        numberOfSets: "Anzahl der Sets:",
        cardsPerSet: "Karten pro Set:",
        generateBtn: "Bingo Karten generieren",
        iconManager: "Icon Manager",
        uploadIcons: "Icons hochladen",
        clearIcons: "Alle Icons löschen",
        currentlyUsing: "Derzeit verwendet",
        icons: "Icons",
        preview: "Vorschau",
        downloadPDF: "PDF herunterladen",
        needIcons: "Mindestens {count} Icons für ein einzelnes Set erforderlich",
        manyUniqueSets: "Viele einzigartige Sets möglich mit {count} Icons",
        iconsAvailable: "{available} Icons verfügbar ({needed} pro Set erforderlich)",
        backupData: "Daten sichern",
        restoreData: "Daten wiederherstellen",
        backupSuccess: "Datensicherung erfolgreich erstellt",
        restoreSuccess: "Daten erfolgreich wiederhergestellt",
        restoreError: "Fehler beim Wiederherstellen der Daten. Bitte stellen Sie sicher, dass Sie eine gültige Sicherungsdatei ausgewählt haben.",
        pdfCompression: "PDF-Komprimierung:",
        showLabelsToggle: "Textbeschriftungen auf Icons anzeigen",
        centerBlankToggle: "Mittleres Feld leer lassen (nur ungerade Raster)",
        sameCardToggle: "Identische Karte für alle Spieler verwenden",
        multiHitToggle: "Multi-Hit-Modus aktivieren",
        difficulty: "Schwierigkeit:",
        difficultyLight: "Leicht (20-30% Felder, 2-3 Treffer)",
        difficultyMedium: "Mittel (40-50% Felder, 2-4 Treffer)",
        difficultyHard: "Schwer (60-70% Felder, 3-5 Treffer)",
        multiHitPreview: "Erwartete Multi-Hit-Felder: {count}",
        multiHitInstructions: "Multi-Hit-Modus Anweisungen",
        iconDistributionLabel: "Icon-Verteilung:",
        sameIcons: "Gleiche Icons (unterschiedliche Anordnungen)",
        differentIcons: "Verschiedene Icons für jede Karte",
        iconDistributionInfo: "Wählen Sie, wie Icons auf Karten innerhalb eines Sets verteilt werden.",
        // New translations for enhanced UI
        navGenerator: "Generator",
        navIconManager: "Icon Manager",
        iconManagerDescription: "Verwalten Sie Ihre Icon-Sammlung, organisieren Sie sie in Sets und fügen Sie Übersetzungen hinzu.",
        iconSets: "Icon Sets",
        createSet: "Neues Set erstellen",
        iconManagement: "Icon Verwaltung",
        tableView: "Tabellenansicht",
        gridView: "Rasteransicht",
        searchIcons: "Icons suchen...",
        allCategories: "Alle Kategorien",
        allSets: "Alle Sets",
        itemsSelected: "Elemente ausgewählt",
        addToSet: "Zu Set hinzufügen",
        removeFromSet: "Aus Set entfernen",
        deleteSelected: "Ausgewählte löschen",
        clearSelection: "Auswahl aufheben",
        dropZoneText: "Bilder hier ablegen zum Hochladen",
        name: "Name",
        category: "Kategorie",
        difficulty: "Schwierigkeit",
        preview: "Vorschau",
        sets: "Sets",
        translations: "Übersetzungen",
        actions: "Aktionen",
        dataManagement: "Datenverwaltung",
        selectIconSet: "Icon Set auswählen:",
        allIcons: "Alle Icons",
        selectedIcons: "Ausgewählte Icons:",
        selectIcons: "Icons auswählen",
        selectIconsForGeneration: "Icons für Kartenerstellung auswählen",
        selectAll: "Alle auswählen",
        deselectAll: "Alle abwählen",
        confirmSelection: "Auswahl bestätigen",
        cancel: "Abbrechen",
        close: "Schließen",
        saveChanges: "Änderungen speichern",
        editIcon: "Icon bearbeiten",
        iconName: "Icon Name:",
        tags: "Tags (durch Komma getrennt):",
        altText: "Alt Text:",
        createSet: "Set erstellen",
        setName: "Set Name:",
        setDescription: "Beschreibung:",
        saveSet: "Set speichern",
        selectSet: "Set auswählen:",
        selectSetOption: "Set auswählen...",
        manageTranslations: "Übersetzungen verwalten",
        language: "Sprache:",
        translatedName: "Übersetzter Name:",
        addTranslation: "Übersetzung hinzufügen",
        gameDifficulty: "Spiel-Schwierigkeit:",
        pdfLayout: "PDF-Layout:"
    }
};

/**
 * Apply translations to all elements with data-translate attributes
 * @param {string} lang - Language code (e.g., 'en', 'de')
 */
function setLanguage(lang) {
    console.log('🔄 Setting language to:', lang);
    
    if (!languages[lang]) {
        console.error('❌ Language not supported:', lang);
        return;
    }
    
    const elements = document.querySelectorAll('[data-translate]');
    console.log(`🔄 Found ${elements.length} elements to translate`);
    
    elements.forEach(el => {
        const key = el.getAttribute('data-translate');
        const translation = languages[lang][key];
        if (translation) {
            el.textContent = translation;
        } else {
            console.warn(`⚠️ Translation missing for key: ${key} in language: ${lang}`);
        }
    });
    
    console.log('✅ Language set successfully');
}

/**
 * Get translated text with optional replacements
 * @param {string} key - The translation key
 * @param {Object} replacements - Key-value pairs for replacements
 * @param {string} language - The language code (defaults to 'en')
 * @returns {string} - The translated text with replacements
 */
function getTranslatedText(key, replacements = {}, language = 'en') {
    if (!languages[language]) {
        console.warn(`Language '${language}' not found, falling back to English`);
        language = 'en';
    }
    
    let text = languages[language]?.[key] || key;
    
    // Replace placeholders with actual values
    for (const [placeholder, value] of Object.entries(replacements)) {
        text = text.replace(`{${placeholder}}`, value);
    }
    
    return text;
}

/**
 * Initialize the language selector and set default language
 * @param {function} onChange - Callback when language changes
 */
function initLanguageSelector(onChange, initialLang = 'en') {
    const languageSelect = document.getElementById('languageSelect');
    if (!languageSelect) {
        console.error('❌ Language selector element not found');
        return;
    }

    console.log('✅ Language selector found, initializing with:', initialLang);

    // Set initial language
    setLanguage(initialLang);

    // Set the dropdown to match the initial language
    languageSelect.value = initialLang;

    // Add change event listener
    languageSelect.addEventListener('change', () => {
        const selectedLang = languageSelect.value;
        console.log('🔄 Language changed to:', selectedLang);
        setLanguage(selectedLang);

        // Call onChange callback if provided
        if (typeof onChange === 'function') {
            onChange(selectedLang);
        }
    });
    
    console.log('✅ Language selector initialized successfully');
}

// Export functions and data
export { 
    languages,
    setLanguage,
    getTranslatedText,
    initLanguageSelector
}; 