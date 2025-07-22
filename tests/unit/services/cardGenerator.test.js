import { describe, it, expect } from 'vitest';
import { generateBingoCards } from '../../../src/services/cardGenerator';

const mockIcons = [
  { id: '1', name: 'Car', category: 'transport', difficulty: 3 },
  { id: '2', name: 'Tree', category: 'nature', difficulty: 2 },
  { id: '3', name: 'House', category: 'buildings', difficulty: 1 },
  { id: '4', name: 'Dog', category: 'animals', difficulty: 2 },
  { id: '5', name: 'Mountain', category: 'nature', difficulty: 4 },
  { id: '6', name: 'Bus', category: 'transport', difficulty: 3 },
  { id: '7', name: 'Church', category: 'buildings', difficulty: 2 },
  { id: '8', name: 'Cat', category: 'animals', difficulty: 2 },
  { id: '9', name: 'River', category: 'nature', difficulty: 3 },
  { id: '10', name: 'Truck', category: 'transport', difficulty: 2 },
  { id: '11', name: 'School', category: 'buildings', difficulty: 1 },
  { id: '12', name: 'Bird', category: 'animals', difficulty: 3 },
  { id: '13', name: 'Forest', category: 'nature', difficulty: 4 },
  { id: '14', name: 'Bike', category: 'transport', difficulty: 2 },
  { id: '15', name: 'Hospital', category: 'buildings', difficulty: 1 },
  { id: '16', name: 'Horse', category: 'animals', difficulty: 3 },
  { id: '17', name: 'Lake', category: 'nature', difficulty: 3 },
  { id: '18', name: 'Train', category: 'transport', difficulty: 2 },
  { id: '19', name: 'Tower', category: 'buildings', difficulty: 4 },
  { id: '20', name: 'Deer', category: 'animals', difficulty: 4 },
  { id: '21', name: 'Field', category: 'nature', difficulty: 1 },
  { id: '22', name: 'Plane', category: 'transport', difficulty: 3 },
  { id: '23', name: 'Mall', category: 'buildings', difficulty: 2 },
  { id: '24', name: 'Cow', category: 'animals', difficulty: 2 },
  { id: '25', name: 'Hill', category: 'nature', difficulty: 2 }
];

describe('cardGenerator', () => {
  describe('generateBingoCards', () => {
    it('generates cards with correct grid size', async () => {
      const settings = {
        gridSize: 5,
        cardCount: 1,
        centerBlank: false,
        multiHitMode: false
      };

      const cards = await generateBingoCards(mockIcons, settings);

      expect(cards).toHaveLength(1);
      expect(cards[0].cells).toHaveLength(25);
    });

    it('generates multiple cards when requested', async () => {
      const settings = {
        gridSize: 3,
        cardCount: 3,
        centerBlank: false,
        multiHitMode: false
      };

      const cards = await generateBingoCards(mockIcons, settings);

      expect(cards).toHaveLength(3);
      expect(cards[0].cells).toHaveLength(9);
    });

    it('handles center blank for odd grid sizes', async () => {
      const settings = {
        gridSize: 5,
        cardCount: 1,
        centerBlank: true,
        multiHitMode: false
      };

      const cards = await generateBingoCards(mockIcons, settings);
      const centerIndex = Math.floor(25 / 2);

      expect(cards[0].cells[centerIndex]).toBe(null);
    });

    it('generates cards with sufficient icons', async () => {
      const settings = {
        gridSize: 3,
        cardCount: 1,
        centerBlank: false,
        multiHitMode: false
      };

      const cards = await generateBingoCards(mockIcons, settings);
      const validCells = cards[0].cells.filter(cell => cell !== null);

      expect(validCells.length).toBe(9);
      validCells.forEach(cell => {
        expect(cell).toHaveProperty('id');
        expect(cell).toHaveProperty('name');
      });
    });

    it('handles multi-hit mode', async () => {
      const settings = {
        gridSize: 3,
        cardCount: 1,
        centerBlank: false,
        multiHitMode: true
      };

      const cards = await generateBingoCards(mockIcons, settings);

      expect(cards).toHaveLength(1);
      expect(cards[0].cells).toHaveLength(9);
    });

    it('works with limited icons by reusing them', async () => {
      const limitedIcons = mockIcons.slice(0, 5);
      const settings = {
        gridSize: 4,
        cardCount: 1,
        centerBlank: false,
        multiHitMode: false
      };

      const cards = await generateBingoCards(limitedIcons, settings);
      const validCells = cards[0].cells.filter(cell => cell !== null);

      expect(validCells.length).toBe(16);
    });
  });
});