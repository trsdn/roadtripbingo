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
                localStorage.setItem('roadtripbingo-data', JSON.stringify(this.data));
                console.log('Data saved successfully');
                resolve(true);
            } catch (error) {
                console.error('Error saving data:', error);
                reject(error);
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

// Create and export the storage instance
const storage = new Storage();
window.iconDB = storage;