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
 */
export class ScoreManager {
  score = 0;
  lives = 3;
  level = 1;
  extraLifeAwarded = false;
}
