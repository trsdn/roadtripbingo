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
                if (estimatedSizeMB > 3.0) {
                    console.warn('Warning: Data size approaching localStorage limits');
                }
                
                if (estimatedSizeMB > 4.5) {
                    console.error('Warning: Data size too large for localStorage');
                    throw new Error('Data size exceeds safe localStorage limits');
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
        }).catch(error => {
            if (error.name === 'QuotaExceededError' || error.message.includes('quota')) {
                console.warn('Storage quota exceeded, attempting to reduce icon data size');
                return this.optimizeIconsAndRetry(icons);
            }
            throw error;
        });
    }
    
    // Optimize icons by reducing their count or size
    optimizeIconsAndRetry(icons) {
        return new Promise((resolve, reject) => {
            // First try: keep only the first 30 icons
            const reducedIcons = icons.slice(0, 30);
            this.data.icons = reducedIcons;
            
            this.save().then(() => {
                console.warn(`Storage optimized: Reduced icons from ${icons.length} to ${reducedIcons.length}`);
                alert(`Storage space was full. Only the first ${reducedIcons.length} icons were saved. Please use smaller images or fewer icons.`);
                resolve(reducedIcons);
            }).catch(stillError => {
                // If that still fails, try with even fewer icons
                const veryReducedIcons = icons.slice(0, 15);
                this.data.icons = veryReducedIcons;
                
                this.save().then(() => {
                    console.warn(`Storage heavily optimized: Reduced icons from ${icons.length} to ${veryReducedIcons.length}`);
                    alert(`Storage space was severely limited. Only ${veryReducedIcons.length} icons could be saved. Please use much smaller images.`);
                    resolve(veryReducedIcons);
                }).catch(finalError => {
                    console.error('Unable to save any icons due to storage constraints');
                    alert('Unable to save icons due to storage limitations. Please use smaller images or clear existing data.');
                    reject(finalError);
                });
            });
        });
    }
    
    loadIcons() {
        return Promise.resolve(this.data.icons || []);
    }
    
    // Get storage usage information
    getStorageInfo() {
        try {
            const dataString = JSON.stringify(this.data);
            const sizeMB = (dataString.length * 2) / (1024 * 1024);
            const iconCount = this.data.icons?.length || 0;
            
            return {
                totalSizeMB: sizeMB,
                iconCount: iconCount,
                isNearLimit: sizeMB > 3.0,
                isOverLimit: sizeMB > 4.5
            };
        } catch (error) {
            return {
                totalSizeMB: 0,
                iconCount: 0,
                isNearLimit: false,
                isOverLimit: false,
                error: error.message
            };
        }
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