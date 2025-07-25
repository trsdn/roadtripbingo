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
 * @param {boolean} options.leaveCenterBlank - Leave center cell blank for odd-sized grids
 * @param {boolean} options.sameCard - Generate identical cards for each set
 * @param {boolean} options.multiHitMode - Enable multi-hit mode for increased difficulty
 * @param {string} options.difficulty - Multi-hit difficulty level (LIGHT, MEDIUM, HARD)
 * @returns {Object} - Generated card sets and identifier
 */
function generateBingoCards(options) {
    const { 
        icons, 
        gridSize, 
        setCount, 
        cardsPerSet, 
        title, 
        leaveCenterBlank, 
        sameCard = false,
        multiHitMode = false, 
        difficulty = 'MEDIUM',
        iconDistribution = 'same-icons',
        gameDifficulty = 'MEDIUM'
    } = options;
    
    // Validation
    if (!icons || icons.length === 0) {
        throw new Error('No icons available');
    }
    
    let cellsPerCard = gridSize * gridSize;
    if (leaveCenterBlank && (gridSize === 5 || gridSize === 7 || gridSize === 9)) {
        cellsPerCard -= 1;
    }
    
    // Calculate needed icons based on sameCard option and distribution mode
    let iconsNeededPerSet;
    if (sameCard) {
        // If using identical cards, we only need icons for one card
        iconsNeededPerSet = cellsPerCard;
    } else if (iconDistribution === 'different-icons') {
        // For different-icons mode, we need unique icons for each card
        iconsNeededPerSet = cellsPerCard * cardsPerSet;
    } else {
        // For same-icons mode, we reuse the same icons on each card
        iconsNeededPerSet = cellsPerCard;
    }
    
    // Validate we have enough icons
    if (icons.length < iconsNeededPerSet) {
        let modeInfo;
        if (sameCard) {
            modeInfo = 'for identical cards mode';
        } else {
            modeInfo = iconDistribution === 'different-icons' ? 'for different-icons mode' : 'for same-icons mode';
        }
        throw new Error(`Not enough icons. Need at least ${iconsNeededPerSet} ${modeInfo}`);
    }
    
    // Generate an overall identifier for this batch
    const identifier = generateIdentifier();

    // Generate the sets
    const cardSets = [];
    for (let setIndex = 0; setIndex < setCount; setIndex++) {
        const set = {
            id: `set-${setIndex + 1}`,
            identifier: generateIdentifier(),
            cards: []
        };
        
        // Handle icon selection and card generation based on sameCard option
        let selectedIcons;
        if (sameCard) {
            // For identical cards, select icons once and reuse for all cards in the set
            selectedIcons = selectBalancedIcons(icons, cellsPerCard, gameDifficulty);
        } else if (iconDistribution === 'different-icons') {
            // For different-icons, select enough icons for all cards with no overlaps
            selectedIcons = selectBalancedIcons(icons, iconsNeededPerSet, gameDifficulty);
        } else {
            // For same-icons, select just enough for one card (they will be reused)
            selectedIcons = selectBalancedIcons(icons, cellsPerCard, gameDifficulty);
        }
        
        // Generate cards for this set
        let baseGrid = null;
        for (let cardIndex = 0; cardIndex < cardsPerSet; cardIndex++) {
            let grid;
            
            if (sameCard) {
                // Generate identical cards
                if (!baseGrid) {
                    baseGrid = buildGrid(selectedIcons, gridSize, leaveCenterBlank);
                    if (multiHitMode) {
                        applyMultiHitMode(baseGrid, gridSize, difficulty);
                    }
                }
                grid = cloneGrid(baseGrid);
            } else {
                // Generate different cards based on icon distribution
                let cardIcons;
                if (iconDistribution === 'different-icons') {
                    // Get unique icons for this card
                    cardIcons = selectedIcons.slice(cardIndex * cellsPerCard, (cardIndex + 1) * cellsPerCard);
                } else {
                    // Reuse the same icons for each card (with different arrangements)
                    cardIcons = [...selectedIcons];
                }
                
                grid = buildGrid(cardIcons, gridSize, leaveCenterBlank);
                
                // Apply multi-hit mode if enabled
                if (multiHitMode) {
                    applyMultiHitMode(grid, gridSize, difficulty);
                }
            }
            
            set.cards.push({
                id: `card-${cardIndex + 1}`,
                title: title || 'Road Trip Bingo',
                grid
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
 * Apply multi-hit mode to a bingo card grid
 * @param {Array} grid - The card grid to modify
 * @param {number} gridSize - Size of the grid
 * @param {string} difficulty - Difficulty level (LIGHT, MEDIUM, HARD)
 */
function applyMultiHitMode(grid, gridSize, difficulty) {
    const difficultySettings = getDifficultySettings(difficulty);
    const totalCells = gridSize * gridSize;
    
    // Get all non-free space positions with their icon difficulty
    // Exclude icons that are marked as excluded from multi-hit mode
    const availablePositions = [];
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const cell = grid[row][col];
            if (!cell.isFreeSpace && !cell.excludeFromMultiHit) {
                availablePositions.push({ 
                    row, 
                    col, 
                    iconDifficulty: cell.difficulty || 3 
                });
            }
        }
    }
    
    // Calculate how many tiles should be multi-hit
    const targetPercentage = Math.random() * (difficultySettings.maxPercentage - difficultySettings.minPercentage) + difficultySettings.minPercentage;
    const multiHitCount = Math.floor(availablePositions.length * targetPercentage / 100);
    
    // Select positions prioritizing easier icons for multi-hit
    const selectedPositions = selectMultiHitPositionsWithDifficulty(availablePositions, multiHitCount, gridSize);
    
    // Apply multi-hit to selected positions
    selectedPositions.forEach(pos => {
        const cell = grid[pos.row][pos.col];
        cell.isMultiHit = true;
        cell.hitCount = getRandomHitCount(difficultySettings.minHits, difficultySettings.maxHits);
        cell.hitCountDisplay = cell.hitCount;
    });
}

/**
 * Get difficulty settings for multi-hit mode
 * @param {string} difficulty - Difficulty level
 * @returns {Object} - Settings object with percentages and hit counts
 */
function getDifficultySettings(difficulty) {
    switch (difficulty) {
        case 'LIGHT':
            return {
                minPercentage: 20,
                maxPercentage: 30,
                minHits: 2,
                maxHits: 3
            };
        case 'MEDIUM':
            return {
                minPercentage: 40,
                maxPercentage: 50,
                minHits: 2,
                maxHits: 4
            };
        case 'HARD':
            return {
                minPercentage: 60,
                maxPercentage: 70,
                minHits: 3,
                maxHits: 5
            };
        default:
            return getDifficultySettings('MEDIUM');
    }
}

/**
 * Select positions for multi-hit tiles, avoiding clustering
 * @param {Array} availablePositions - All available positions
 * @param {number} count - Number of positions to select
 * @param {number} gridSize - Size of the grid
 * @returns {Array} - Selected positions
 */
function selectMultiHitPositions(availablePositions, count, gridSize) {
    if (count >= availablePositions.length) {
        return [...availablePositions];
    }
    
    const selected = [];
    const shuffled = shuffleArray([...availablePositions]);
    
    for (const position of shuffled) {
        if (selected.length >= count) break;
        
        // Check if position is too close to already selected positions
        const isTooClose = selected.some(selectedPos => {
            const distance = Math.abs(position.row - selectedPos.row) + Math.abs(position.col - selectedPos.col);
            return distance <= 1 && gridSize >= 5; // Only apply anti-clustering for larger grids
        });
        
        if (!isTooClose) {
            selected.push(position);
        }
    }
    
    // If we don't have enough positions due to anti-clustering, fill the rest randomly
    while (selected.length < count && selected.length < availablePositions.length) {
        for (const position of shuffled) {
            if (selected.length >= count) break;
            if (!selected.some(p => p.row === position.row && p.col === position.col)) {
                selected.push(position);
            }
        }
    }
    
    return selected;
}

/**
 * Select positions for multi-hit tiles, prioritizing easier icons
 * @param {Array} availablePositions - All available positions with icon difficulty
 * @param {number} count - Number of positions to select
 * @param {number} gridSize - Size of the grid
 * @returns {Array} - Selected positions
 */
function selectMultiHitPositionsWithDifficulty(availablePositions, count, gridSize) {
    if (count >= availablePositions.length) {
        return [...availablePositions];
    }
    
    // Sort positions by icon difficulty (easier icons first)
    // Icons with difficulty 1-2 are prioritized, then 3, then 4-5
    const sortedPositions = [...availablePositions].sort((a, b) => {
        const diffA = a.iconDifficulty;
        const diffB = b.iconDifficulty;
        
        // Priority: 1-2 (easy) > 3 (medium) > 4-5 (hard)
        const getPriority = (diff) => {
            if (diff <= 2) return 1; // Easy icons get highest priority
            if (diff === 3) return 2; // Medium icons get second priority
            return 3; // Hard icons get lowest priority
        };
        
        const priorityA = getPriority(diffA);
        const priorityB = getPriority(diffB);
        
        if (priorityA !== priorityB) {
            return priorityA - priorityB; // Lower priority number = higher priority
        }
        
        // Within same priority group, prefer easier icons
        return diffA - diffB;
    });
    
    const selected = [];
    
    // First pass: select easier icons while avoiding clustering
    for (const position of sortedPositions) {
        if (selected.length >= count) break;
        
        // Check if position is too close to already selected positions
        const isTooClose = selected.some(selectedPos => {
            const distance = Math.abs(position.row - selectedPos.row) + Math.abs(position.col - selectedPos.col);
            return distance <= 1 && gridSize >= 5; // Only apply anti-clustering for larger grids
        });
        
        if (!isTooClose) {
            selected.push(position);
        }
    }
    
    // Second pass: if we still need more positions, fill with remaining easier icons
    if (selected.length < count) {
        for (const position of sortedPositions) {
            if (selected.length >= count) break;
            if (!selected.some(p => p.row === position.row && p.col === position.col)) {
                selected.push(position);
            }
        }
    }
    
    return selected;
}

/**
 * Get a random hit count within the specified range
 * @param {number} min - Minimum hit count
 * @param {number} max - Maximum hit count
 * @returns {number} - Random hit count
 */
function getRandomHitCount(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Calculate expected multi-hit tile count for preview
 * @param {number} gridSize - Size of the grid
 * @param {boolean} leaveCenterBlank - Whether center is blank
 * @param {string} difficulty - Difficulty level
 * @returns {number} - Expected number of multi-hit tiles
 */
function calculateExpectedMultiHitCount(gridSize, leaveCenterBlank, difficulty) {
    const difficultySettings = getDifficultySettings(difficulty);
    let totalCells = gridSize * gridSize;
    
    // Subtract center cell if it's blank
    if (leaveCenterBlank && (gridSize === 5 || gridSize === 7 || gridSize === 9)) {
        totalCells -= 1;
    }
    
    // Use average percentage for estimation
    const avgPercentage = (difficultySettings.minPercentage + difficultySettings.maxPercentage) / 2;
    return Math.round(totalCells * avgPercentage / 100);
}

/**
 * Generate a unique identifier for a set of cards
 * @returns {string} - The generated identifier
 */
function generateIdentifier() {
    // Generate a short 3-character alphanumeric identifier
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = '';
    for (let i = 0; i < 3; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `ID:${id}`;
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

/**
 * Build a bingo grid from a list of icons
 * @param {Array} icons - Icons for the grid
 * @param {number} gridSize - Grid size
 * @param {boolean} leaveCenterBlank - Whether center cell should be blank
 * @returns {Array} grid - 2D array of cells
 */
function buildGrid(icons, gridSize, leaveCenterBlank) {
    const shuffledCardIcons = shuffleArray([...icons]);
    const grid = [];
    let iconIdx = 0;
    for (let row = 0; row < gridSize; row++) {
        const gridRow = [];
        for (let col = 0; col < gridSize; col++) {
            if (
                leaveCenterBlank &&
                (gridSize === 5 || gridSize === 7 || gridSize === 9) &&
                row === Math.floor(gridSize / 2) &&
                col === Math.floor(gridSize / 2)
            ) {
                gridRow.push({ isFreeSpace: true });
            } else {
                const cell = { ...shuffledCardIcons[iconIdx++] };
                cell.isMultiHit = false;
                cell.hitCount = 1;
                cell.hitCountDisplay = 1;
                gridRow.push(cell);
            }
        }
        grid.push(gridRow);
    }
    return grid;
}

/**
 * Deep clone grid object
 * @param {Array} grid - 2D array to clone
 * @returns {Array} cloned grid
 */
function cloneGrid(grid) {
    return grid.map(row => row.map(cell => ({ ...cell })));
}

/**
 * Select icons with balanced difficulty levels for better gameplay
 * @param {Array} icons - Available icons with difficulty ratings
 * @param {number} count - Number of icons to select
 * @param {string} gameDifficulty - Overall game difficulty (EASY, MEDIUM, HARD, EXPERT)
 * @returns {Array} - Selected icons with balanced difficulty
 */
function selectBalancedIcons(icons, count, gameDifficulty = 'MEDIUM') {
    if (!icons || icons.length === 0) return [];
    if (count <= 0) return [];
    if (count >= icons.length) return shuffleArray([...icons]);
    
    // Group icons by difficulty level (1-5)
    const iconsByDifficulty = {
        1: icons.filter(icon => (icon.difficulty || 3) === 1),
        2: icons.filter(icon => (icon.difficulty || 3) === 2),
        3: icons.filter(icon => (icon.difficulty || 3) === 3),
        4: icons.filter(icon => (icon.difficulty || 3) === 4),
        5: icons.filter(icon => (icon.difficulty || 3) === 5)
    };
    
    // Target distribution based on game difficulty
    const getTargetDistribution = (difficulty) => {
        switch (difficulty) {
            case 'EASY':
                return {
                    easy: Math.floor(count * 0.50),    // 50% easy icons
                    medium: Math.floor(count * 0.35),  // 35% medium icons
                    hard: Math.floor(count * 0.15)     // 15% hard icons
                };
            case 'HARD':
                return {
                    easy: Math.floor(count * 0.15),    // 15% easy icons
                    medium: Math.floor(count * 0.35),  // 35% medium icons
                    hard: Math.floor(count * 0.50)     // 50% hard icons
                };
            case 'EXPERT':
                return {
                    easy: Math.floor(count * 0.10),    // 10% easy icons
                    medium: Math.floor(count * 0.20),  // 20% medium icons
                    hard: Math.floor(count * 0.70)     // 70% hard icons
                };
            default: // MEDIUM
                return {
                    easy: Math.floor(count * 0.25),    // 25% easy icons
                    medium: Math.floor(count * 0.50),  // 50% medium icons
                    hard: Math.floor(count * 0.25)     // 25% hard icons
                };
        }
    };
    
    const targetDistribution = getTargetDistribution(gameDifficulty);
    
    // Adjust for remainder
    const remainder = count - (targetDistribution.easy + targetDistribution.medium + targetDistribution.hard);
    if (remainder > 0) {
        targetDistribution.medium += remainder; // Add remainder to medium
    }
    
    const selectedIcons = [];
    
    // Select easy icons (difficulty 1-2)
    const easyIcons = [...iconsByDifficulty[1], ...iconsByDifficulty[2]];
    const selectedEasy = shuffleArray(easyIcons).slice(0, Math.min(targetDistribution.easy, easyIcons.length));
    selectedIcons.push(...selectedEasy);
    
    // Select medium icons (difficulty 3)
    const mediumIcons = iconsByDifficulty[3];
    const selectedMedium = shuffleArray([...mediumIcons]).slice(0, Math.min(targetDistribution.medium, mediumIcons.length));
    selectedIcons.push(...selectedMedium);
    
    // Select hard icons (difficulty 4-5)
    const hardIcons = [...iconsByDifficulty[4], ...iconsByDifficulty[5]];
    const selectedHard = shuffleArray(hardIcons).slice(0, Math.min(targetDistribution.hard, hardIcons.length));
    selectedIcons.push(...selectedHard);
    
    // If we don't have enough icons in the desired distribution,
    // fill the remainder randomly from available icons
    if (selectedIcons.length < count) {
        const usedIds = new Set(selectedIcons.map(icon => icon.id));
        const remainingIcons = icons.filter(icon => !usedIds.has(icon.id));
        const additionalNeeded = count - selectedIcons.length;
        const additional = shuffleArray(remainingIcons).slice(0, additionalNeeded);
        selectedIcons.push(...additional);
    }
    
    // Final shuffle to randomize order while maintaining balance
    return shuffleArray(selectedIcons).slice(0, count);
}

// Export functions
export {
    generateBingoCards,
    generateIdentifier,
    shuffleArray,
    selectBalancedIcons,
    calculateExpectedMultiHitCount,
    getDifficultySettings
};