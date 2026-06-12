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
        heroHeadline: "Build your road trip board",
        heroSubline: "// pick a size, hit generate, print & play",
        plateRegion: "ROAD TRIP",
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
        noIconsSelected: "No icons selected yet — click \"Select Icons\" to choose.",
        iconsSelectedSummary: "{count} of {total} icons included",
        selectionHint: "This is a preview. Use \"Select Icons\" below to choose which icons to include.",
        addTag: "Add tag",
        remove: "Remove",
        pdfFooterHint: "Spot it · mark it · first full line wins!",
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
        aiImbalances: "Imbalances",
        // Additional AI-related translations for icon name translations
        suggestedName: "Suggested name:",
        suggestedCategory: "Suggested category:",
        suggestedDifficulty: "Suggested difficulty:",
        suggestedTags: "Suggested tags:",
        acceptSuggestion: "Accept suggestion",
        rejectSuggestion: "Reject suggestion",
        applyingSuggestion: "Applying suggestion...",
        suggestionApplied: "Suggestion applied",
        suggestionFailed: "Suggestion failed",
        // Categories management
        categories: "Categories",
        addCategory: "Add category",
        newCategoryPlaceholder: "New category name",
        renameCategory: "Rename category",
        deleteCategory: "Delete category",
        save: "Save",
        categoryAdded: "Category \"{name}\" added",
        categoryRenamed: "Category renamed to \"{name}\"",
        categoryDeleted: "Category \"{name}\" deleted",
        categoryDeleteConfirm: "Delete category \"{name}\"? Icons in this category will be moved to \"Uncategorized\".",
        categoryNameRequired: "Please enter a category name",
        categoryOpFailed: "Category operation failed: {error}",
        // Select options and help texts
        allDifficulties: "All Difficulties",
        difficulty1: "⭐ Very Easy",
        difficulty2: "⭐⭐ Easy",
        difficulty3: "⭐⭐⭐ Medium",
        difficulty4: "⭐⭐⭐⭐ Hard",
        difficulty5: "⭐⭐⭐⭐⭐ Very Hard",
        difficultyHelpText: "Rate how difficult this icon is to spot during gameplay",
        gameDifficultyEasy: "Easy (More easy icons, balanced cards)",
        gameDifficultyMedium: "Medium (Balanced mix of all difficulties)",
        gameDifficultyHard: "Hard (More hard icons, challenging cards)",
        gameDifficultyExpert: "Expert (Mostly hard icons, very challenging)",
        gameDifficultyHelp: "Controls the overall difficulty of icon selection and card balance",
        compressionNone: "None (Largest file)",
        compressionFast: "Light (Smaller file)",
        compressionMedium: "Medium (Recommended)",
        compressionSlow: "High (Smallest file)",
        layoutOnePerPage: "One card per page",
        layoutTwoPerPage: "Two cards per page",
        optimizeStorage: "Optimize Storage",
        iconsSelectedCount: "{count} icons selected",
        // AI progress and results
        aiResultsTitle: "AI Analysis Results",
        collapse: "Collapse",
        aiAnalyzingIcons: "Analyzing icons with AI…",
        aiDetectingDuplicates: "Scanning for duplicates…",
        aiGettingSuggestions: "Getting content suggestions…",
        aiGeneratingSet: "Generating smart set…",
        imageGenTakesLong: "Generating icon image – this can take up to 90 seconds…",
        aiAnalysisComplete: "AI analysis complete",
        aiAnalysisFailed: "Failed to analyze icons: {error}",
        aiDuplicateScanComplete: "Duplicate detection complete",
        aiDuplicateScanFailed: "Failed to detect duplicates: {error}",
        aiSuggestionsReady: "Content suggestions ready",
        aiSuggestionsFailed: "Failed to get suggestions: {error}",
        aiSetGenerated: "Smart set generated",
        aiSetGenerationFailed: "Failed to generate set: {error}",
        setThemeRequired: "Please enter a theme for the set",
        setThemePlaceholder: "Enter theme (e.g., Winter Road Trip)",
        noIconsToAnalyze: "No icons to analyze",
        selectIconsToAnalyze: "Please select icons to analyze",
        tripContextPlaceholder: "e.g. highway trip Munich to the Baltic Sea in winter, 2 kids",
        tripContextLabel: "Trip context",
        // Inline editing
        iconUpdated: "Icon updated",
        iconUpdateFailed: "Failed to update icon: {error}",
        // Game modes
        gameMode: "Game Mode:",
        classicMode: "Classic Bingo",
        multihitMode: "Multi-Hit",
        scoringMode: "Scoring",
        classicModeHelp: "First player to complete a row, column, or diagonal calls \"Bingo!\" and wins.",
        multihitModeHelp: "Some squares must be spotted multiple times before they count as marked.",
        scoringModeHelp: "Players collect points for rows, columns, diagonals, and a full card — most points wins.",
        includeRulesPage: "Include rules page in PDF",
        // PDF rules page
        rulesTitle: "Road Trip Bingo — Game Rules",
        rulesObjectiveTitle: "Objective",
        rulesObjective1: "Spot objects along the road to complete lines on your bingo card.",
        rulesObjective2: "The first player to complete a line calls \"Bingo!\" — and wins.",
        rulesStandardTitle: "Standard Rules",
        rulesStandard1: "When you spot an object from your card in the real world, mark that square with your pen.",
        rulesStandard2: "Each sighting counts for one square only; if two players see the same object, both may mark it.",
        rulesStandard3: "The first player to complete a full row, column, or diagonal wins the round.",
        rulesStandard4: "Disputed sightings are settled by the co-driver (or by majority vote).",
        rulesFreeSquareTitle: "Free Square",
        rulesFreeSquare1: "The middle square is crossed out — it is a free square.",
        rulesFreeSquare2: "It counts as already marked for every player.",
        rulesMultiHitTitle: "Multi-Hit Mode",
        rulesMultiHit1: "Squares with a small counter (e.g. \"3x\") must be spotted that many times.",
        rulesMultiHit2: "Tick off one hit per sighting; the square only counts once all hits are collected.",
        rulesMultiHitDifficulty: "Selected intensity: {difficulty}",
        rulesScoringTitle: "Scoring Mode",
        rulesScoring1: "Keep playing after the first Bingo and collect points for every completed line.",
        rulesScoring2: "Row: {row} points, column: {column} points, diagonal: {diagonal} points.",
        rulesScoring3: "Full house (every square marked): {fullHouse} points.",
        rulesScoring4: "The player with the most points at the end of the trip wins.",
        // Score sheet
        scoreSheetTitle: "Score Sheet",
        scoreAchievement: "Achievement",
        scorePoints: "Points",
        scorePlayer: "Player",
        scoreRow: "Row",
        scoreColumn: "Column",
        scoreDiagonal: "Diagonal",
        scoreFullHouse: "Full House (all squares)",
        scoreTotal: "Total"
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
        heroHeadline: "Bau dein Road-Trip-Board",
        heroSubline: "// Größe wählen, generieren, drucken & spielen",
        plateRegion: "ROAD TRIP",
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
        noIconsSelected: "Noch keine Icons gewählt — auf \"Icons auswählen\" klicken.",
        iconsSelectedSummary: "{count} von {total} Icons enthalten",
        selectionHint: "Das ist eine Vorschau. Mit \"Icons auswählen\" unten festlegen, welche Icons verwendet werden.",
        addTag: "Tag hinzufügen",
        remove: "Entfernen",
        pdfFooterHint: "Entdecken · abhaken · erste volle Reihe gewinnt!",
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
        suggestionFailed: "Vorschlag fehlgeschlagen",
        // Categories management
        categories: "Kategorien",
        addCategory: "Kategorie hinzufügen",
        newCategoryPlaceholder: "Neuer Kategoriename",
        renameCategory: "Kategorie umbenennen",
        deleteCategory: "Kategorie löschen",
        save: "Speichern",
        categoryAdded: "Kategorie \"{name}\" hinzugefügt",
        categoryRenamed: "Kategorie umbenannt in \"{name}\"",
        categoryDeleted: "Kategorie \"{name}\" gelöscht",
        categoryDeleteConfirm: "Kategorie \"{name}\" löschen? Icons dieser Kategorie werden nach \"Uncategorized\" verschoben.",
        categoryNameRequired: "Bitte einen Kategorienamen eingeben",
        categoryOpFailed: "Kategorie-Aktion fehlgeschlagen: {error}",
        // Select options and help texts
        allDifficulties: "Alle Schwierigkeitsgrade",
        difficulty1: "⭐ Sehr leicht",
        difficulty2: "⭐⭐ Leicht",
        difficulty3: "⭐⭐⭐ Mittel",
        difficulty4: "⭐⭐⭐⭐ Schwer",
        difficulty5: "⭐⭐⭐⭐⭐ Sehr schwer",
        difficultyHelpText: "Bewerten Sie, wie schwer dieses Icon unterwegs zu entdecken ist",
        gameDifficultyEasy: "Leicht (mehr leichte Icons, ausgewogene Karten)",
        gameDifficultyMedium: "Mittel (ausgewogene Mischung aller Schwierigkeiten)",
        gameDifficultyHard: "Schwer (mehr schwere Icons, anspruchsvolle Karten)",
        gameDifficultyExpert: "Experte (überwiegend schwere Icons, sehr anspruchsvoll)",
        gameDifficultyHelp: "Steuert die Gesamtschwierigkeit der Icon-Auswahl und Kartenbalance",
        compressionNone: "Keine (größte Datei)",
        compressionFast: "Leicht (kleinere Datei)",
        compressionMedium: "Mittel (empfohlen)",
        compressionSlow: "Hoch (kleinste Datei)",
        layoutOnePerPage: "Eine Karte pro Seite",
        layoutTwoPerPage: "Zwei Karten pro Seite",
        optimizeStorage: "Speicher optimieren",
        iconsSelectedCount: "{count} Icons ausgewählt",
        // AI progress and results
        aiResultsTitle: "KI-Analyseergebnisse",
        collapse: "Einklappen",
        aiAnalyzingIcons: "Icons werden mit KI analysiert…",
        aiDetectingDuplicates: "Suche nach Duplikaten…",
        aiGettingSuggestions: "Inhaltsvorschläge werden geladen…",
        aiGeneratingSet: "Intelligentes Set wird generiert…",
        imageGenTakesLong: "Icon-Bild wird generiert – das kann bis zu 90 Sekunden dauern…",
        aiAnalysisComplete: "KI-Analyse abgeschlossen",
        aiAnalysisFailed: "Icon-Analyse fehlgeschlagen: {error}",
        aiDuplicateScanComplete: "Duplikaterkennung abgeschlossen",
        aiDuplicateScanFailed: "Duplikaterkennung fehlgeschlagen: {error}",
        aiSuggestionsReady: "Inhaltsvorschläge sind bereit",
        aiSuggestionsFailed: "Vorschläge konnten nicht geladen werden: {error}",
        aiSetGenerated: "Intelligentes Set generiert",
        aiSetGenerationFailed: "Set-Generierung fehlgeschlagen: {error}",
        setThemeRequired: "Bitte ein Thema für das Set eingeben",
        setThemePlaceholder: "Thema eingeben (z. B. Winter-Roadtrip)",
        noIconsToAnalyze: "Keine Icons zum Analysieren vorhanden",
        selectIconsToAnalyze: "Bitte Icons zum Analysieren auswählen",
        tripContextPlaceholder: "z. B. Autobahnfahrt München→Ostsee im Winter, 2 Kinder",
        tripContextLabel: "Reisekontext",
        // Inline editing
        iconUpdated: "Icon aktualisiert",
        iconUpdateFailed: "Icon konnte nicht aktualisiert werden: {error}",
        // Game modes
        gameMode: "Spielmodus:",
        classicMode: "Klassisches Bingo",
        multihitMode: "Multi-Hit",
        scoringMode: "Punktemodus",
        classicModeHelp: "Wer zuerst eine Reihe, Spalte oder Diagonale voll hat, ruft „Bingo!“ und gewinnt.",
        multihitModeHelp: "Einige Felder müssen mehrfach gesichtet werden, bevor sie als abgehakt gelten.",
        scoringModeHelp: "Spieler sammeln Punkte für Reihen, Spalten, Diagonalen und die volle Karte — die meisten Punkte gewinnen.",
        includeRulesPage: "Regelseite ins PDF aufnehmen",
        // PDF rules page
        rulesTitle: "Auto Bingo — Spielregeln",
        rulesObjectiveTitle: "Ziel des Spiels",
        rulesObjective1: "Entdecke Objekte am Straßenrand und vervollständige Reihen auf deiner Bingo-Karte.",
        rulesObjective2: "Wer zuerst eine Reihe voll hat, ruft „Bingo!“ — und gewinnt.",
        rulesStandardTitle: "Standardregeln",
        rulesStandard1: "Wer ein Objekt von seiner Karte in der echten Welt entdeckt, hakt das Feld ab.",
        rulesStandard2: "Jede Sichtung zählt nur für ein Feld; sehen zwei Spieler dasselbe Objekt, dürfen beide abhaken.",
        rulesStandard3: "Wer zuerst eine komplette Reihe, Spalte oder Diagonale voll hat, gewinnt die Runde.",
        rulesStandard4: "Bei strittigen Sichtungen entscheidet der Beifahrer (oder die Mehrheit).",
        rulesFreeSquareTitle: "Freifeld",
        rulesFreeSquare1: "Das mittlere Feld ist durchgekreuzt — es ist ein Freifeld.",
        rulesFreeSquare2: "Es gilt für alle Spieler als bereits abgehakt.",
        rulesMultiHitTitle: "Multi-Hit-Modus",
        rulesMultiHit1: "Felder mit kleinem Zähler (z. B. „3x“) müssen entsprechend oft gesichtet werden.",
        rulesMultiHit2: "Pro Sichtung einen Strich machen; das Feld zählt erst, wenn alle Treffer gesammelt sind.",
        rulesMultiHitDifficulty: "Gewählte Stufe: {difficulty}",
        rulesScoringTitle: "Punktemodus",
        rulesScoring1: "Nach dem ersten Bingo weiterspielen und für jede vollständige Linie Punkte sammeln.",
        rulesScoring2: "Reihe: {row} Punkte, Spalte: {column} Punkte, Diagonale: {diagonal} Punkte.",
        rulesScoring3: "Full House (alle Felder abgehakt): {fullHouse} Punkte.",
        rulesScoring4: "Wer am Ende der Fahrt die meisten Punkte hat, gewinnt.",
        // Score sheet
        scoreSheetTitle: "Punktetabelle",
        scoreAchievement: "Erfolg",
        scorePoints: "Punkte",
        scorePlayer: "Spieler",
        scoreRow: "Reihe",
        scoreColumn: "Spalte",
        scoreDiagonal: "Diagonale",
        scoreFullHouse: "Full House (alle Felder)",
        scoreTotal: "Summe"
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

    // Translate placeholder attributes
    document.querySelectorAll('[data-translate-placeholder]').forEach(el => {
        const key = el.getAttribute('data-translate-placeholder');
        const translation = languages[lang][key];
        if (translation) {
            el.placeholder = translation;
        } else {
            console.warn(`⚠️ Placeholder translation missing for key: ${key} in language: ${lang}`);
        }
    });

    // Translate title attributes
    document.querySelectorAll('[data-translate-title]').forEach(el => {
        const key = el.getAttribute('data-translate-title');
        const translation = languages[lang][key];
        if (translation) {
            el.title = translation;
        } else {
            console.warn(`⚠️ Title translation missing for key: ${key} in language: ${lang}`);
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