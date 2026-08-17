/**
 * Difficulty scaling rules. Ghost speed ramps up, frightened/scatter
 * durations ramp down from level 1 to MAX_DIFFICULTY_LEVEL.
 */
export const MAX_DIFFICULTY_LEVEL = 20;

const BASE_GHOST_SPEED_MULT = 0.75;
const MAX_GHOST_SPEED_MULT = 1.15;
const BASE_FRIGHTENED_MS = 8000;
const MIN_FRIGHTENED_MS = 1000;

export interface DifficultySettings {
  ghostSpeedMultiplier: number;
  frightenedDurationMs: number;
}

/**
 * Computes difficulty settings for a given level (clamped to MAX_DIFFICULTY_LEVEL).
 */
export function getDifficultySettings(level: number): DifficultySettings {
  const capped = Math.min(Math.max(Math.floor(level), 1), MAX_DIFFICULTY_LEVEL);
  const progress = MAX_DIFFICULTY_LEVEL > 1 ? (capped - 1) / (MAX_DIFFICULTY_LEVEL - 1) : 1;

  const ghostSpeedMultiplier = Number(
    (BASE_GHOST_SPEED_MULT + (MAX_GHOST_SPEED_MULT - BASE_GHOST_SPEED_MULT) * progress).toFixed(4),
  );
  const frightenedDurationMs = Math.round(
    BASE_FRIGHTENED_MS - (BASE_FRIGHTENED_MS - MIN_FRIGHTENED_MS) * progress,
  );

  return { ghostSpeedMultiplier, frightenedDurationMs };
}

/**
 * Central game state container.
 */
export type GamePhase =
  | 'start'
  | 'countdown'
  | 'playing'
  | 'paused'
  | 'dying'
  | 'levelComplete'
  | 'gameOver';

export class GameState {
  phase: GamePhase = 'start';
  score = 0;
  lives = 3;
  level = 1;
  paused = false;
  gameOver = false;
  extraLifeAwarded = false;

  /** Countdown timer (ms remaining). */
  countdownTimer = 0;

  /** Level-complete transition timer (ms). */
  levelCompleteTimer = 0;

  /** Death animation timer (ms). */
  deathTimer = 0;

  /** Whether colorblind mode is active. */
  colorblindMode = false;
}
