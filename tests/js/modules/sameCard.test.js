import { generateBingoCards } from '../../../src/js/modules/cardGenerator.js';

describe('Same Card Feature', () => {
    const mockIcons = Array.from({ length: 25 }, (_, i) => ({
        id: `icon${i + 1}`,
        label: `Icon ${i + 1}`,
        src: `icon${i + 1}.png`
    }));

    describe('generateBingoCards with sameCard option', () => {
        it('should generate identical cards when sameCard is true', () => {
            const result = generateBingoCards({
                icons: mockIcons,
                gridSize: 3,
                setCount: 1,
                cardsPerSet: 3,
                title: 'Test',
                leaveCenterBlank: false,
                sameCard: true,
                multiHitMode: false,
                iconDistribution: 'same-icons'
            });

            expect(result.cardSets).toHaveLength(1);
            expect(result.cardSets[0].cards).toHaveLength(3);

            // All cards should have the same grid content
            const firstCardGrid = result.cardSets[0].cards[0].grid;
            const secondCardGrid = result.cardSets[0].cards[1].grid;
            const thirdCardGrid = result.cardSets[0].cards[2].grid;

            // Compare grids cell by cell
            for (let row = 0; row < 3; row++) {
                for (let col = 0; col < 3; col++) {
                    expect(firstCardGrid[row][col].id).toBe(secondCardGrid[row][col].id);
                    expect(firstCardGrid[row][col].id).toBe(thirdCardGrid[row][col].id);
                    expect(firstCardGrid[row][col].label).toBe(secondCardGrid[row][col].label);
                    expect(firstCardGrid[row][col].label).toBe(thirdCardGrid[row][col].label);
                }
            }
        });

        it('should generate different cards when sameCard is false', () => {
            const result = generateBingoCards({
                icons: mockIcons,
                gridSize: 3,
                setCount: 1,
                cardsPerSet: 3,
                title: 'Test',
                leaveCenterBlank: false,
                sameCard: false,
                multiHitMode: false,
                iconDistribution: 'same-icons'
            });

            expect(result.cardSets).toHaveLength(1);
            expect(result.cardSets[0].cards).toHaveLength(3);

            // Cards should have different arrangements (at least some cells should be different)
            const firstCardGrid = result.cardSets[0].cards[0].grid;
            const secondCardGrid = result.cardSets[0].cards[1].grid;

            let foundDifference = false;
            for (let row = 0; row < 3; row++) {
                for (let col = 0; col < 3; col++) {
                    if (firstCardGrid[row][col].id !== secondCardGrid[row][col].id) {
                        foundDifference = true;
                        break;
                    }
                }
                if (foundDifference) break;
            }

            expect(foundDifference).toBe(true);
        });

        it('should work with center blank when sameCard is true', () => {
            const result = generateBingoCards({
                icons: mockIcons,
                gridSize: 5,
                setCount: 1,
                cardsPerSet: 2,
                title: 'Test',
                leaveCenterBlank: true,
                sameCard: true,
                multiHitMode: false,
                iconDistribution: 'same-icons'
            });

            expect(result.cardSets).toHaveLength(1);
            expect(result.cardSets[0].cards).toHaveLength(2);

            // Both cards should have center cell as free space
            const firstCardGrid = result.cardSets[0].cards[0].grid;
            const secondCardGrid = result.cardSets[0].cards[1].grid;
            
            expect(firstCardGrid[2][2].isFreeSpace).toBe(true);
            expect(secondCardGrid[2][2].isFreeSpace).toBe(true);

            // All other cells should be identical
            for (let row = 0; row < 5; row++) {
                for (let col = 0; col < 5; col++) {
                    if (row === 2 && col === 2) continue; // Skip center cell
                    expect(firstCardGrid[row][col].id).toBe(secondCardGrid[row][col].id);
                }
            }
        });

        it('should use minimum icons when sameCard is true', () => {
            // For a 3x3 grid with sameCard, we should only need 9 icons
            const limitedIcons = mockIcons.slice(0, 9);
            
            const result = generateBingoCards({
                icons: limitedIcons,
                gridSize: 3,
                setCount: 2,
                cardsPerSet: 3,
                title: 'Test',
                leaveCenterBlank: false,
                sameCard: true,
                multiHitMode: false,
                iconDistribution: 'same-icons'
            });

            expect(result.cardSets).toHaveLength(2);
            expect(result.cardSets[0].cards).toHaveLength(3);
            expect(result.cardSets[1].cards).toHaveLength(3);

            // Should succeed with only 9 icons because sameCard only needs icons for one card
        });

        it('should fail with insufficient icons when sameCard is false but succeed when true', () => {
            // For a 3x3 grid with 3 cards per set, we'd need 27 icons normally
            const limitedIcons = mockIcons.slice(0, 9);
            
            // Should fail with sameCard false and different-icons mode
            expect(() => {
                generateBingoCards({
                    icons: limitedIcons,
                    gridSize: 3,
                    setCount: 1,
                    cardsPerSet: 3,
                    title: 'Test',
                    leaveCenterBlank: false,
                    sameCard: false,
                    multiHitMode: false,
                    iconDistribution: 'different-icons'
                });
            }).toThrow('Not enough icons');

            // Should succeed with sameCard true
            expect(() => {
                generateBingoCards({
                    icons: limitedIcons,
                    gridSize: 3,
                    setCount: 1,
                    cardsPerSet: 3,
                    title: 'Test',
                    leaveCenterBlank: false,
                    sameCard: true,
                    multiHitMode: false,
                    iconDistribution: 'different-icons'
                });
            }).not.toThrow();
        });

        it('should work with multi-hit mode when sameCard is true', () => {
            const result = generateBingoCards({
                icons: mockIcons,
                gridSize: 3,
                setCount: 1,
                cardsPerSet: 2,
                title: 'Test',
                leaveCenterBlank: false,
                sameCard: true,
                multiHitMode: true,
                difficulty: 'MEDIUM',
                iconDistribution: 'same-icons'
            });

            expect(result.cardSets).toHaveLength(1);
            expect(result.cardSets[0].cards).toHaveLength(2);

            // Both cards should have identical multi-hit properties
            const firstCardGrid = result.cardSets[0].cards[0].grid;
            const secondCardGrid = result.cardSets[0].cards[1].grid;

            for (let row = 0; row < 3; row++) {
                for (let col = 0; col < 3; col++) {
                    expect(firstCardGrid[row][col].isMultiHit).toBe(secondCardGrid[row][col].isMultiHit);
                    expect(firstCardGrid[row][col].hitCount).toBe(secondCardGrid[row][col].hitCount);
                    expect(firstCardGrid[row][col].hitCountDisplay).toBe(secondCardGrid[row][col].hitCountDisplay);
                }
            }
        });
    });
});
