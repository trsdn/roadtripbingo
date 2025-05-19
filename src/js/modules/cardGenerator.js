// Road Trip Bingo - Card Generator
// Provides functions for generating bingo cards

/**
 * Generate unique sets of bingo cards
 * @param {Object} options - Generation options
 * @param {Array} options.icons - Available icons
 * @param {number} options.gridSize - Size of the grid (e.g., 5 for 5x5)
 * @param {number} options.setCount - Number of sets to generate
 * @param {number} options.cardsPerSet - Number of cards per set
 * @param {string} options.title - Title for the bingo cards
 * @returns {Object} - Generated card sets and identifier
 */
function generateBingoCards(options) {
    const { icons, gridSize, setCount, cardsPerSet, title } = options;
    
    // Validation
    if (!icons || icons.length === 0) {
        throw new Error('No icons available');
    }
    
    const cellsPerCard = gridSize * gridSize;
    const iconsNeededPerSet = cellsPerCard * cardsPerSet;
    
    if (icons.length < iconsNeededPerSet) {
        throw new Error(`Not enough icons. Need at least ${iconsNeededPerSet}`);
    }
    
    // Generate a unique identifier for this set
    const identifier = generateIdentifier();
    
    // Generate the sets
    const cardSets = [];
    for (let setIndex = 0; setIndex < setCount; setIndex++) {
        const set = {
            id: `set-${setIndex + 1}`,
            cards: []
        };
        
        // Select icons for this set - randomly shuffle and pick needed amount
        const selectedIcons = shuffleArray([...icons]).slice(0, iconsNeededPerSet);
        
        // Generate cards for this set
        for (let cardIndex = 0; cardIndex < cardsPerSet; cardIndex++) {
            // For each card, select a subset of icons and arrange them
            const startIdx = cardIndex * cellsPerCard;
            const cardIcons = selectedIcons.slice(startIdx, startIdx + cellsPerCard);
            
            // Shuffle the icons for this specific card
            const shuffledCardIcons = shuffleArray([...cardIcons]);
            
            // Create the grid
            const grid = [];
            for (let row = 0; row < gridSize; row++) {
                const gridRow = [];
                for (let col = 0; col < gridSize; col++) {
                    const index = row * gridSize + col;
                    // For 5x5 grid, make center cell a "FREE" space
                    if (gridSize === 5 && row === 2 && col === 2) {
                        gridRow.push({
                            id: 'free-space',
                            name: 'FREE',
                            isFreeSpace: true
                        });
                    } else {
                        gridRow.push(shuffledCardIcons[index]);
                    }
                }
                grid.push(gridRow);
            }
            
            set.cards.push({
                id: `card-${cardIndex + 1}`,
                title: title || 'Road Trip Bingo',
                grid: grid
            });
        }
        
        cardSets.push(set);
    }
    
    return {
        identifier,
        cardSets
    };
}

/**
 * Generate a unique identifier for a set of cards
 * @returns {string} - The generated identifier
 */
function generateIdentifier() {
    // Generate a unique set identifier (date + random)
    const date = new Date();
    const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    const randomStr = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ID:${dateStr}-${randomStr}`;
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 * @param {Array} array - The array to shuffle
 * @returns {Array} - The shuffled array
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Export functions
export {
    generateBingoCards,
    generateIdentifier,
    shuffleArray
}; 