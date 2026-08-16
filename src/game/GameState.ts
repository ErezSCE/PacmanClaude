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

/** Decimal precision applied to ghostSpeedMultiplier to avoid float noise (e.g. 0.7710526315789473). */
const GHOST_SPEED_MULTIPLIER_PRECISION = 4;

export interface DifficultySettings {
  ghostSpeedMultiplier: number;
  frightenedDurationMs: number;
  scatterDurationMs: number;
}

/**
 * Options accepted by `GameState.completeLevel` / `GameState.checkLevelComplete`.
 * An options object (rather than positional params) avoids the
 * required-after-optional smell when callers only want to override one field.
 */
export interface LevelTransitionOptions {
  /** Invoked once the transition timer elapses and the next level is ready to play. */
  onNextLevel?: () => void;
  /** Overrides the default transition duration (ms). */
  transitionMs?: number;
}

/**
 * Computes the difficulty settings for a given level. Levels are clamped to
 * [1, MAX_DIFFICULTY_LEVEL] so that level 21+ repeats the hardest settings.
 */
export function getDifficultySettings(level: number): DifficultySettings {
  const cappedLevel = Math.min(Math.max(Math.floor(level), 1), MAX_DIFFICULTY_LEVEL);
  const progress =
    MAX_DIFFICULTY_LEVEL > 1 ? (cappedLevel - 1) / (MAX_DIFFICULTY_LEVEL - 1) : 1;

  const rawGhostSpeedMultiplier =
    BASE_GHOST_SPEED_MULTIPLIER +
    (MAX_GHOST_SPEED_MULTIPLIER - BASE_GHOST_SPEED_MULTIPLIER) * progress;
  const ghostSpeedMultiplier = Number(
    rawGhostSpeedMultiplier.toFixed(GHOST_SPEED_MULTIPLIER_PRECISION),
  );

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
 *
 * Timer ownership: `GameState` is the single authoritative timer for the
 * level-complete transition. Consumers that also show a "Level Complete"
 * overlay (e.g. `ScreenManager.showLevelComplete`) must NOT run their own
 * competing dismiss timer — they should display the overlay immediately
 * when `checkLevelComplete`/`completeLevel` returns `true`, and dismiss it
 * from the `onNextLevel` callback passed here, e.g.:
 *
 * ```ts
 * if (gameState.checkLevelComplete(remainingDots, { onNextLevel: () => screenManager.dismissLevelComplete() })) {
 *   screenManager.showLevelComplete(gameState.level);
 * }
 * ```
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
   * advances to the next level after `options.transitionMs`, invoking
   * `options.onNextLevel` once the next level is ready to play. Safe to
   * call only once per level; subsequent calls while a transition is
   * pending are ignored.
   */
  completeLevel(options: LevelTransitionOptions = {}): void {
    const { onNextLevel, transitionMs = LEVEL_COMPLETE_TRANSITION_MS } = options;
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
  checkLevelComplete(remainingDots: number, options?: LevelTransitionOptions): boolean {
    if (remainingDots <= 0 && !this.levelComplete) {
      this.completeLevel(options);
      return true;
    }
    return false;
  }

  /**
   * Cancels any pending level-transition timer and restores `levelComplete`
   * and `paused` to their default (non-transitioning) values, e.g. on
   * reset/teardown. Without this, a `dispose()` called mid-transition would
   * leave the instance stuck with `levelComplete === true` (making a future
   * `completeLevel()` call a silent no-op) and `paused === true`.
   */
  dispose(): void {
    this.clearLevelTransitionTimer();
    this.levelComplete = false;
    this.paused = false;
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
