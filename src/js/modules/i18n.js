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
        iconDistributionInfo: "Choose how icons are distributed across cards within each set."
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
        iconDistributionInfo: "Wählen Sie, wie Icons auf Karten innerhalb eines Sets verteilt werden."
    }
};

/**
 * Apply translations to all elements with data-translate attributes
 * @param {string} lang - Language code (e.g., 'en', 'de')
 */
function setLanguage(lang) {
    const elements = document.querySelectorAll('[data-translate]');
    elements.forEach(el => {
        const key = el.getAttribute('data-translate');
        el.textContent = languages[lang][key];
    });
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
        console.error('Language selector element not found');
        return;
    }

    // Set initial language
    setLanguage(initialLang);

    // Set the dropdown to match the initial language
    languageSelect.value = initialLang;

    // Add change event listener
    languageSelect.addEventListener('change', () => {
        const selectedLang = languageSelect.value;
        setLanguage(selectedLang);

        // Call onChange callback if provided
        if (typeof onChange === 'function') {
            onChange(selectedLang);
        }
    });
}

// Export functions and data
export { 
    languages,
    setLanguage,
    getTranslatedText,
    initLanguageSelector
}; 