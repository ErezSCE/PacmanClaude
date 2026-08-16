/**
 * Level progression and difficulty-scaling rules for the game session.
 *
 * The difficulty curve ramps ghost speed up, and frightened/scatter
 * durations down, linearly from level 1 to MAX_DIFFICULTY_LEVEL. Levels
 * beyond the cap repeat the hardest (level-20) settings rather than
 * continuing to escalate.
 */
export const MAX_DIFFICULTY_LEVEL = 20;

/** Milliseconds the level-complete transition pauses gameplay before the next level begins. */
export const LEVEL_COMPLETE_TRANSITION_MS = 3000;

const BASE_GHOST_SPEED_MULTIPLIER = 0.75;
const MAX_GHOST_SPEED_MULTIPLIER = 1.15;
const BASE_FRIGHTENED_DURATION_MS = 8000;
const MIN_FRIGHTENED_DURATION_MS = 1000;
const BASE_SCATTER_DURATION_MS = 7000;
const MIN_SCATTER_DURATION_MS = 2000;

export interface DifficultySettings {
  ghostSpeedMultiplier: number;
  frightenedDurationMs: number;
  scatterDurationMs: number;
}

/**
 * Computes the difficulty settings for a given level. Levels are clamped to
 * [1, MAX_DIFFICULTY_LEVEL] so that level 21+ repeats the hardest settings.
 */
export function getDifficultySettings(level: number): DifficultySettings {
  const cappedLevel = Math.min(Math.max(Math.floor(level), 1), MAX_DIFFICULTY_LEVEL);
  const progress =
    MAX_DIFFICULTY_LEVEL > 1 ? (cappedLevel - 1) / (MAX_DIFFICULTY_LEVEL - 1) : 1;

  const ghostSpeedMultiplier =
    BASE_GHOST_SPEED_MULTIPLIER +
    (MAX_GHOST_SPEED_MULTIPLIER - BASE_GHOST_SPEED_MULTIPLIER) * progress;

  const frightenedDurationMs = Math.round(
    BASE_FRIGHTENED_DURATION_MS -
      (BASE_FRIGHTENED_DURATION_MS - MIN_FRIGHTENED_DURATION_MS) * progress,
  );

  const scatterDurationMs = Math.round(
    BASE_SCATTER_DURATION_MS -
      (BASE_SCATTER_DURATION_MS - MIN_SCATTER_DURATION_MS) * progress,
  );

  return { ghostSpeedMultiplier, frightenedDurationMs, scatterDurationMs };
}

/**
 * Tracks the current game session's mutable state: score, lives, level
 * number, pause/game-over flags, and level-complete/transition timing.
 */
export class GameState {
  score = 0;
  lives = 3;
  level = 1;
  paused = false;
  gameOver = false;
  extraLifeAwarded = false;
  levelComplete = false;

  private levelTransitionTimeoutId: ReturnType<typeof setTimeout> | null = null;

  /** The difficulty settings that apply to the current level. */
  get difficulty(): DifficultySettings {
    return getDifficultySettings(this.level);
  }

  /**
   * Marks the level complete and pauses gameplay, then automatically
   * advances to the next level after `transitionMs`, invoking `onNextLevel`
   * once the next level is ready to play. Safe to call only once per level;
   * subsequent calls while a transition is pending are ignored.
   */
  completeLevel(onNextLevel?: () => void, transitionMs: number = LEVEL_COMPLETE_TRANSITION_MS): void {
    if (this.levelComplete) {
      return;
    }
    this.levelComplete = true;
    this.paused = true;
    this.clearLevelTransitionTimer();
    this.levelTransitionTimeoutId = setTimeout(() => {
      this.levelTransitionTimeoutId = null;
      this.advanceToNextLevel();
      onNextLevel?.();
    }, transitionMs);
  }

  /**
   * Checks the remaining dot/pellet count reported by the maze and, once it
   * reaches zero, triggers the level-complete transition. Returns true if
   * the level was just completed by this call.
   */
  checkLevelComplete(remainingDots: number, onNextLevel?: () => void): boolean {
    if (remainingDots <= 0 && !this.levelComplete) {
      this.completeLevel(onNextLevel);
      return true;
    }
    return false;
  }

  /** Cancels any pending level-transition timer, e.g. on reset/teardown. */
  dispose(): void {
    this.clearLevelTransitionTimer();
  }

  private advanceToNextLevel(): void {
    this.level += 1;
    this.levelComplete = false;
    this.paused = false;
  }

  private clearLevelTransitionTimer(): void {
    if (this.levelTransitionTimeoutId !== null) {
      clearTimeout(this.levelTransitionTimeoutId);
      this.levelTransitionTimeoutId = null;
    }
  }
}
