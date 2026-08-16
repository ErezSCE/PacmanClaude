/**
 * Fruit configuration per level. Levels beyond the highest defined key
 * repeat the hardest (highest-value) fruit, matching classic arcade rules.
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

/** Dot-eaten counts (per level) that trigger a fruit spawn. */
export const FRUIT_SPAWN_DOT_THRESHOLDS: readonly number[] = [70, 170];

/** How long a spawned fruit remains on screen before it despawns, in ms. */
export const FRUIT_DESPAWN_MS = 9000;

/** Tile coordinate where the bonus fruit appears, just below the ghost house. */
export const FRUIT_SPAWN_POSITION: { readonly x: number; readonly y: number } = {
  x: 13.5,
  y: 17,
};

/**
 * Resolves the fruit definition (name + points) for the given level.
 * Levels beyond the highest defined key fall back to the highest entry (key, 5000 pts).
 */
export function getFruitForLevel(level: number): { name: string; points: number } {
  const definedLevels = Object.keys(FRUIT_TABLE)
    .map(Number)
    .sort((a, b) => a - b);
  const highestDefined = definedLevels[definedLevels.length - 1];
  const clampedLevel = Math.min(Math.max(level, 1), highestDefined);
  return FRUIT_TABLE[clampedLevel];
}

/**
 * Manages bonus fruit spawning, despawn timing, and level-scaled scoring.
 *
 * Consumers drive this class each frame via {@link BonusFruit.update}, passing
 * the number of dots eaten so far in the current level and the elapsed frame
 * time. When a spawn threshold is crossed the fruit becomes active; if it is
 * not collected via {@link BonusFruit.collect} within {@link FRUIT_DESPAWN_MS}
 * it despawns automatically.
 */
export class BonusFruit {
  private level: number;
  private isVisible = false;
  private elapsedSinceSpawnMs = 0;
  private triggeredThresholds = new Set<number>();
  private name = '';
  private points = 0;

  constructor(level = 1) {
    this.level = level;
  }

  /** Resolves the fruit definition (name + points) for the given level. */
  static getFruitForLevel(level: number): { name: string; points: number } {
    const definedLevels = Object.keys(FRUIT_TABLE)
      .map(Number)
      .sort((a, b) => a - b);
    const highestDefined = definedLevels[definedLevels.length - 1];
    const clampedLevel = Math.min(Math.max(level, 1), highestDefined);
    return FRUIT_TABLE[clampedLevel];
  }

  /** Sets the current level, used to look up the correct fruit definition. */
  setLevel(level: number): void {
    this.level = level;
  }

  /** Resets all spawn/despawn state, e.g. at the start of a new level. */
  reset(): void {
    this.isVisible = false;
    this.elapsedSinceSpawnMs = 0;
    this.triggeredThresholds.clear();
    this.name = '';
    this.points = 0;
  }

  /**
   * Advances fruit state by one frame.
   *
   * @param dotsEaten - total dots eaten so far in the current level.
   * @param deltaMs - elapsed time since the previous frame, in milliseconds.
   */
  update(dotsEaten: number, deltaMs: number): void {
    if (!this.isVisible) {
      for (const threshold of FRUIT_SPAWN_DOT_THRESHOLDS) {
        if (dotsEaten >= threshold && !this.triggeredThresholds.has(threshold)) {
          this.spawn(threshold);
          break;
        }
      }
      return;
    }

    this.elapsedSinceSpawnMs += deltaMs;
    if (this.elapsedSinceSpawnMs >= FRUIT_DESPAWN_MS) {
      this.despawn();
    }
  }

  private spawn(threshold: number): void {
    const definition = BonusFruit.getFruitForLevel(this.level);
    this.name = definition.name;
    this.points = definition.points;
    this.isVisible = true;
    this.elapsedSinceSpawnMs = 0;
    this.triggeredThresholds.add(threshold);
  }

  /** Immediately despawns the fruit without awarding points. */
  despawn(): void {
    this.isVisible = false;
    this.elapsedSinceSpawnMs = 0;
  }

  /** Whether a fruit is currently visible/collectible. */
  isActive(): boolean {
    return this.isVisible;
  }

  /** The fruit's fixed on-screen tile position. */
  getPosition(): { x: number; y: number } {
    return FRUIT_SPAWN_POSITION;
  }

  /** The active fruit's name, or an empty string when none is active. */
  getName(): string {
    return this.name;
  }

  /**
   * Collects the currently active fruit, awarding its points and despawning it.
   *
   * @returns the points awarded, or `null` if no fruit was active to collect.
   */
  collect(): number | null {
    if (!this.isVisible) {
      return null;
    }
    const awardedPoints = this.points;
    this.despawn();
    return awardedPoints;
  }
}
