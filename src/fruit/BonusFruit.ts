import { FRUIT_SPAWN } from '../maze/mazeLayout';

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

/** Dot-eaten counts that trigger a fruit spawn. */
const SPAWN_THRESHOLDS = [70, 170];

/** How long a spawned fruit remains on screen (ms). */
const DESPAWN_MS = 9000;

/**
 * Resolves the fruit definition for the given level.
 */
export function getFruitForLevel(level: number): { name: string; points: number } {
  const keys = Object.keys(FRUIT_TABLE).map(Number).sort((a, b) => a - b);
  const max = keys[keys.length - 1];
  const clamped = Math.min(Math.max(level, 1), max);
  return FRUIT_TABLE[clamped];
}

/**
 * Manages bonus fruit spawning, despawn timing, and scoring.
 */
export class BonusFruit {
  active = false;
  x = FRUIT_SPAWN.col;
  y = FRUIT_SPAWN.row;
  points = 0;
  name = '';

  private level = 1;
  private elapsedMs = 0;
  private triggeredThresholds = new Set<number>();

  /** Set the current level for fruit lookup. */
  setLevel(level: number): void {
    this.level = level;
    this.triggeredThresholds.clear();
    this.deactivate();
  }

  /** Update fruit state each frame. */
  update(dtMs: number, dotsEaten: number): void {
    // Check spawn thresholds
    for (const threshold of SPAWN_THRESHOLDS) {
      if (dotsEaten >= threshold && !this.triggeredThresholds.has(threshold) && !this.active) {
        this.triggeredThresholds.add(threshold);
        this.spawn();
      }
    }

    // Countdown despawn timer
    if (this.active) {
      this.elapsedMs += dtMs;
      if (this.elapsedMs >= DESPAWN_MS) {
        this.deactivate();
      }
    }
  }

  /** Collect the fruit (called on collision). Returns points. */
  collect(): number {
    const pts = this.points;
    this.deactivate();
    return pts;
  }

  private spawn(): void {
    const fruitDef = getFruitForLevel(this.level);
    this.name = fruitDef.name;
    this.points = fruitDef.points;
    this.x = FRUIT_SPAWN.col;
    this.y = FRUIT_SPAWN.row;
    this.active = true;
    this.elapsedMs = 0;
  }

  private deactivate(): void {
    this.active = false;
    this.points = 0;
    this.name = '';
    this.elapsedMs = 0;
  }
}
