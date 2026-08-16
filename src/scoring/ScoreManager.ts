import { FRUIT_TABLE } from '../fruit/BonusFruit';

/**
 * Point values for game events.
 */
export const POINTS = {
  DOT: 10,
  POWER_PELLET: 50,
  GHOST_1: 200,
  GHOST_2: 400,
  GHOST_3: 800,
  GHOST_4: 1600,
  EXTRA_LIFE_THRESHOLD: 10_000,
} as const;

/**
 * Tracks current score, lives, level, and extra-life threshold.
 * Provides methods to add score and handle fruit scoring integration.
 */
export class ScoreManager {
  score = 0;
  lives = 3;
  level = 1;
  extraLifeAwarded = false;

  /**
   * Adds points to the current score and checks for extra-life threshold.
   * @returns true if an extra life was awarded on this call.
   */
  addScore(points: number): boolean {
    const previousScore = this.score;
    this.score += points;

    if (
      !this.extraLifeAwarded &&
      previousScore < POINTS.EXTRA_LIFE_THRESHOLD &&
      this.score >= POINTS.EXTRA_LIFE_THRESHOLD
    ) {
      this.extraLifeAwarded = true;
      this.lives += 1;
      return true;
    }
    return false;
  }

  /**
   * Awards points for eating a fruit, using the FRUIT_TABLE for the current level.
   * @param fruitPoints - the points value from the collected fruit.
   * @returns true if an extra life was awarded as a result.
   */
  awardFruitPoints(fruitPoints: number): boolean {
    return this.addScore(fruitPoints);
  }

  /**
   * Returns the fruit definition for the current level from FRUIT_TABLE.
   */
  getFruitForCurrentLevel(): { name: string; points: number } {
    const definedLevels = Object.keys(FRUIT_TABLE)
      .map(Number)
      .sort((a, b) => a - b);
    const highestDefined = definedLevels[definedLevels.length - 1];
    const clampedLevel = Math.min(Math.max(this.level, 1), highestDefined);
    return FRUIT_TABLE[clampedLevel];
  }

  /** Resets score state for a new game. */
  reset(): void {
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.extraLifeAwarded = false;
  }
}
