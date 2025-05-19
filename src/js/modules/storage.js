// Road Trip Bingo - Storage System
// Using JSON import/export for data persistence

class Storage {
    constructor() {
        this.data = {
            icons: [],
            settings: {
                language: 'en',
                theme: 'light',
                gridSize: 5,
                cardsPerSet: 1
            },
            gameStates: []
        };
    }

    // Initialize storage
    init() {
        return new Promise((resolve, reject) => {
            try {
                // Try to load existing data from localStorage
                const savedData = localStorage.getItem('roadtripbingo-data');
                if (savedData) {
                    this.data = { ...this.data, ...JSON.parse(savedData) };
                }
                console.log('Storage initialized successfully');
                resolve(this.data);
            } catch (error) {
                console.error('Error initializing storage:', error);
                reject(error);
            }
        });
    }

    // Save all data
    save() {
        return new Promise((resolve, reject) => {
            try {
                // Check if the data is too large for localStorage
                const dataString = JSON.stringify(this.data);
                // Get estimated size in MB
                const estimatedSizeMB = (dataString.length * 2) / (1024 * 1024);
                
                // Log size for debugging
                console.log(`Data size: ~${estimatedSizeMB.toFixed(2)} MB`);
                
                // Check if approaching localStorage limits (typically 5-10MB)
                if (estimatedSizeMB > 4.5) {
                    console.warn('Warning: Data size approaching localStorage limits');
                }
                
                localStorage.setItem('roadtripbingo-data', dataString);
                console.log('Data saved successfully');
                resolve(true);
            } catch (error) {
                console.error('Error saving data:', error);
                
                // Check if it's a storage quota error
                if (error.name === 'QuotaExceededError' || 
                    error.toString().includes('quota') || 
                    error.toString().includes('storage')) {
                    console.error('Storage quota exceeded. Data not saved.');
                    // Create a custom error with more information
                    const storageError = new Error('Storage quota exceeded');
                    storageError.name = 'QuotaExceededError';
                    reject(storageError);
                } else {
                    reject(error);
                }
            }
        });
    }

    // Icon operations
    saveIcons(icons) {
        this.data.icons = icons;
        return this.save().then(() => {
            console.log(`Saved ${icons.length} icons to storage`);
            return icons;
        });
    }

    loadIcons() {
        return Promise.resolve(this.data.icons || []);
    }

    deleteIcon(id) {
        this.data.icons = (this.data.icons || []).filter(icon => icon.id !== id);
        return this.save();
    }

    clearIcons() {
        this.data.icons = [];
        return this.save();
    }

    // Settings operations
    saveSettings(settings) {
        this.data.settings = { ...this.data.settings, ...settings };
        return this.save();
    }

    loadSettings() {
        return Promise.resolve(this.data.settings || {});
    }

    // Game state operations
    saveGameState(gameState) {
        this.data.gameStates.push(gameState);
        return this.save();
    }

    loadGameStates() {
        return Promise.resolve(this.data.gameStates || []);
    }

    // Export data for backup
    exportData() {
        const dataStr = JSON.stringify(this.data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'roadtripbingo-backup.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Import data from backup
    importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    this.data = data;
                    this.save()
                        .then(() => resolve(true))
                        .catch(reject);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }
}

// Create the storage instance
const storage = new Storage();

// Export the storage instance as the default export
export default storage; 