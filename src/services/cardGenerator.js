// Card generation service
export function generateBingoCards(icons, settings) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const cards = [];
      const { gridSize, cardCount, centerBlank, multiHitMode } = settings;
      
      for (let cardIndex = 0; cardIndex < cardCount; cardIndex++) {
        const card = generateSingleCard(icons, gridSize, centerBlank, multiHitMode);
        cards.push(card);
      }
      
      resolve(cards);
    }, 500); // Simulate processing time
  });
}

function generateSingleCard(icons, gridSize, centerBlank, multiHitMode) {
  const totalCells = gridSize * gridSize;
  const cells = [];
  
  // Determine if center should be blank
  const centerIndex = Math.floor(totalCells / 2);
  const shouldCenterBeBlank = centerBlank && gridSize % 2 === 1;
  
  // Shuffle icons
  const shuffledIcons = [...icons].sort(() => Math.random() - 0.5);
  
  for (let i = 0; i < totalCells; i++) {
    if (shouldCenterBeBlank && i === centerIndex) {
      cells.push({ 
        isBlank: true, 
        icon: null,
        multiHitTarget: false 
      });
    } else {
      const iconIndex = (i - (shouldCenterBeBlank && i > centerIndex ? 1 : 0)) % shuffledIcons.length;
      const icon = shuffledIcons[iconIndex];
      
      // Check if this icon should be a multi-hit target
      // Only allow multi-hit if mode is enabled, icon doesn't exclude multi-hit, and random chance
      const canBeMultiHit = multiHitMode && !icon.excludeFromMultiHit && Math.random() < 0.3;
      
      cells.push({
        isBlank: false,
        icon: icon,
        multiHitTarget: canBeMultiHit
      });
    }
  }
  
  return { cells };
}

export function calculateExpectedMultiHitCount(settings, icons = []) {
  const { gridSize, multiHitMode } = settings;
  const totalCells = gridSize * gridSize;
  const centerBlank = settings.centerBlank && gridSize % 2 === 1;
  const iconCells = totalCells - (centerBlank ? 1 : 0);
  
  if (!multiHitMode) return 0;
  
  // If no icons provided, use the old calculation
  if (!icons.length) {
    return Math.round(iconCells * 0.3);
  }
  
  // Calculate based on icons that can actually be multi-hit targets
  const eligibleIcons = icons.filter(icon => !icon.excludeFromMultiHit);
  const eligibleRatio = eligibleIcons.length / icons.length;
  
  // Expected multi-hits = 30% chance * eligible icons ratio * total icon cells
  return Math.round(iconCells * 0.3 * eligibleRatio);
}