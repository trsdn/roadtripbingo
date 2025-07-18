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
        difficultyHard: "Hard (60-70% tiles, 3-5 hits)"
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
        centerBlankToggle: "Mittlere Zelle leer lassen (nur ungerade Raster)",
        multiHitToggle: "Multi-Hit-Modus aktivieren",
        difficulty: "Schwierigkeit:",
        difficultyLight: "Leicht (20-30% Felder, 2-3 Treffer)",
        difficultyMedium: "Mittel (40-50% Felder, 2-4 Treffer)",
        difficultyHard: "Schwer (60-70% Felder, 3-5 Treffer)"
    }
};

// Expose languages to window for access in script.js
window.languages = languages;

function setLanguage(lang) {
    const elements = document.querySelectorAll('[data-translate]');
    elements.forEach(el => {
        const key = el.getAttribute('data-translate');
        el.textContent = languages[lang][key];
    });
}

// Set default language to English and add language selector event listener
document.addEventListener('DOMContentLoaded', () => {
    const languageSelect = document.getElementById('languageSelect');
    
    // Set initial language
    const initialLang = 'en';
    setLanguage(initialLang);
    
    // Set the dropdown to match the initial language
    languageSelect.value = initialLang;
    
    // Add change event listener
    languageSelect.addEventListener('change', () => {
        const selectedLang = languageSelect.value;
        setLanguage(selectedLang);
    });
});