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
        pdfLayout: "PDF Layout:",
        multiHitExclusion: "Multi-Hit Exclusion",
        excludeFromMultiHit: "Exclude from Multi-Hit",
        includeInMultiHit: "Include in Multi-Hit",
        excludeFromMultiHitToggle: "Exclude from Multi-Hit Mode",
        excludeFromMultiHitHelp: "Icons excluded from multi-hit mode won't be selected for tiles that require multiple hits",
        excluded: "Excluded",
        included: "Included",
        applySmartDefaults: "Apply AI Defaults",
        // AI Features translations
        aiFeatures: "AI Features",
        aiAnalysis: "AI Analysis",
        aiAnalysisDesc: "Let AI suggest categories, tags, and difficulty ratings for your icons",
        analyzeSelected: "Analyze Selected Icons",
        analyzeAll: "Analyze All Icons",
        duplicateDetection: "Duplicate Detection",
        duplicateDetectionDesc: "Find semantically similar or duplicate icons in your library",
        scanForDuplicates: "Scan for Duplicates",
        sensitivity: "Sensitivity:",
        sensitivityMore: "More duplicates",
        sensitivityStrict: "Stricter (fewer)",
        contentSuggestions: "Content Suggestions",
        contentSuggestionsDesc: "Get AI recommendations for missing icons to improve your sets",
        getSuggestions: "Get Suggestions",
        generalSet: "General Set",
        highwaySet: "Highway Set",
        urbanSet: "Urban Set",
        natureSet: "Nature Set",
        smartSetGeneration: "Smart Set Generation",
        smartSetDesc: "Generate complete themed icon sets with AI",
        generateSet: "Generate Set",
        aiSettings: "AI Settings",
        aiStatus: "AI Status",
        aiConfigured: "Configured",
        aiNotConfigured: "Not Configured",
        aiStatusDescription: "AI features require an OpenAI API key to be configured by the server administrator.",
        autoApply: "Auto-apply Suggestions",
        aiModel: "AI Model:",
        modelServerDefault: "Server default",
        // AI icon generation
        aiIconGeneration: "AI Icon Generation",
        aiIconGenerationDesc: "Generate a new icon image with AI and add it to your library",
        iconGenNamePlaceholder: "Icon name (e.g., Windmill)",
        iconGenDescriptionPlaceholder: "Optional description",
        styleFlat: "Flat",
        styleOutline: "Outline",
        styleCartoon: "Cartoon",
        styleRealistic: "Realistic",
        generateIconImage: "Generate Icon",
        addToLibrary: "Add to library",
        regenerate: "Regenerate",
        generating: "Generating…",
        imageGenNotConfigured: "Image generation is not configured on the server.",
        iconGenNameRequired: "Please enter an icon name",
        // AI results
        aiResultCategory: "Category",
        aiResultName: "Name",
        aiResultNameDe: "German name",
        aiResultDifficulty: "Difficulty",
        aiResultTags: "Tags",
        aiAccept: "Accept",
        aiReject: "Reject",
        aiAcceptAll: "Accept All",
        aiApplied: "Applied",
        aiConfidence: "confidence",
        aiDuplicatesFound: "Found {count} duplicate group(s)",
        aiDeleteSelected: "Delete selected",
        aiNoDuplicates: "No duplicates found — your icon library looks good!",
        aiStrengths: "Strengths",
        aiGaps: "Gaps",
        aiImbalances: "Imbalances"
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
        pdfLayout: "PDF-Layout:",
        multiHitExclusion: "Multi-Hit-Ausschluss",
        excludeFromMultiHit: "Aus Multi-Hit ausschließen",
        includeInMultiHit: "In Multi-Hit einschließen",
        excludeFromMultiHitToggle: "Aus Multi-Hit-Modus ausschließen",
        excludeFromMultiHitHelp: "Icons, die aus dem Multi-Hit-Modus ausgeschlossen sind, werden nicht für Felder ausgewählt, die mehrere Treffer erfordern",
        excluded: "Ausgeschlossen",
        included: "Eingeschlossen",
        applySmartDefaults: "KI-Standards anwenden",
        // AI Features translations
        aiFeatures: "KI-Funktionen",
        aiAnalysis: "KI-Analyse",
        aiAnalysisDesc: "Lassen Sie KI Kategorien, Tags und Schwierigkeitsbewertungen für Ihre Icons vorschlagen",
        analyzeSelected: "Ausgewählte Icons analysieren",
        analyzeAll: "Alle Icons analysieren",
        duplicateDetection: "Duplikaterkennung",
        duplicateDetectionDesc: "Semantisch ähnliche oder doppelte Icons in Ihrer Bibliothek finden",
        scanForDuplicates: "Nach Duplikaten scannen",
        sensitivity: "Empfindlichkeit:",
        sensitivityMore: "Mehr Duplikate",
        sensitivityStrict: "Strenger (weniger)",
        contentSuggestions: "Inhaltvorschläge",
        contentSuggestionsDesc: "KI-Empfehlungen für fehlende Icons zur Verbesserung Ihrer Sets erhalten",
        getSuggestions: "Vorschläge erhalten",
        generalSet: "Allgemeines Set",
        highwaySet: "Autobahn Set",
        urbanSet: "Stadt Set",
        natureSet: "Natur Set",
        smartSetGeneration: "Intelligente Set-Generierung",
        smartSetDesc: "Vollständige thematische Icon-Sets mit KI generieren",
        generateSet: "Set generieren",
        aiSettings: "KI-Einstellungen",
        aiStatus: "KI-Status",
        aiConfigured: "Konfiguriert",
        aiNotConfigured: "Nicht konfiguriert",
        aiStatusDescription: "KI-Funktionen erfordern einen OpenAI API-Schlüssel, der vom Serveradministrator konfiguriert werden muss.",
        autoApply: "Vorschläge automatisch anwenden",
        aiModel: "KI-Modell:",
        modelServerDefault: "Server-Standard",
        // AI icon generation
        aiIconGeneration: "KI-Icon-Generierung",
        aiIconGenerationDesc: "Neues Icon-Bild mit KI erstellen und zur Bibliothek hinzufügen",
        iconGenNamePlaceholder: "Icon-Name (z. B. Windrad)",
        iconGenDescriptionPlaceholder: "Optionale Beschreibung",
        styleFlat: "Flach",
        styleOutline: "Umriss",
        styleCartoon: "Cartoon",
        styleRealistic: "Realistisch",
        generateIconImage: "Icon generieren",
        addToLibrary: "Zur Bibliothek hinzufügen",
        regenerate: "Neu generieren",
        generating: "Wird generiert…",
        imageGenNotConfigured: "Die Bildgenerierung ist auf dem Server nicht konfiguriert.",
        iconGenNameRequired: "Bitte einen Icon-Namen eingeben",
        // AI results
        aiResultCategory: "Kategorie",
        aiResultName: "Name",
        aiResultNameDe: "Deutscher Name",
        aiResultDifficulty: "Schwierigkeit",
        aiResultTags: "Tags",
        aiAccept: "Übernehmen",
        aiReject: "Ablehnen",
        aiAcceptAll: "Alle übernehmen",
        aiApplied: "Übernommen",
        aiConfidence: "Konfidenz",
        aiDuplicatesFound: "{count} Duplikat-Gruppe(n) gefunden",
        aiDeleteSelected: "Ausgewählte löschen",
        aiNoDuplicates: "Keine Duplikate gefunden – die Icon-Bibliothek sieht gut aus!",
        aiStrengths: "Stärken",
        aiGaps: "Lücken",
        aiImbalances: "Ungleichgewichte",
        // Additional AI-related translations for icon name translations
        suggestedName: "Vorgeschlagener Name:",
        suggestedCategory: "Vorgeschlagene Kategorie:",
        suggestedDifficulty: "Vorgeschlagene Schwierigkeit:",
        suggestedTags: "Vorgeschlagene Tags:",
        acceptSuggestion: "Vorschlag annehmen",
        rejectSuggestion: "Vorschlag ablehnen",
        applyingSuggestion: "Vorschlag wird angewendet...",
        suggestionApplied: "Vorschlag angewendet",
        suggestionFailed: "Vorschlag fehlgeschlagen"
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