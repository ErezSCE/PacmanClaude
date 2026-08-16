/**
 * Fruit configuration per level.
 */
export const FRUIT_TABLE: Record<number, { name: string; points: number }> = {
  1: { name: 'cherry', points: 100 },
  2: { name: 'strawberry', points: 300 },
  3: { name: 'orange', points: 500 },
  4: { name: 'orange', points: 500 },
  5: { name: 'apple', points: 700 },
  6: { name: 'apple', points: 700 },
  7: { name: 'melon', points: 1000 },
  8: { name: 'melon', points: 1000 },
  9: { name: 'galaxian', points: 2000 },
  10: { name: 'galaxian', points: 2000 },
  11: { name: 'bell', points: 3000 },
  12: { name: 'bell', points: 3000 },
  13: { name: 'key', points: 5000 },
};

/**
 * Manages bonus fruit spawning, timing, and scoring.
 */
export class BonusFruit {
  active = false;
  x = 0;
  y = 0;
  points = 0;
  name = '';
}
