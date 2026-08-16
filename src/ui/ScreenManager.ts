/**
 * DOM overlay state machine for the game's non-canvas screens: Start,
 * Countdown, Pause, Level Complete, and Game Over. Rendered as accessible
 * HTML layered over the Canvas.
 */
export type ScreenType = 'start' | 'countdown' | 'playing' | 'pause' | 'levelComplete' | 'gameOver';

/** Default duration the level-complete overlay is shown before auto-dismissing. */
export const LEVEL_COMPLETE_DISPLAY_MS = 3000;

export class ScreenManager {
  private _currentScreen: ScreenType = 'start';
  private levelCompleteTimeoutId: ReturnType<typeof setTimeout> | null = null;

  get currentScreen(): ScreenType {
    return this._currentScreen;
  }

  /** Switches to the given screen immediately, cancelling any pending auto-dismiss timer. */
  show(screen: ScreenType): void {
    this.clearLevelCompleteTimer();
    this._currentScreen = screen;
  }

  /**
   * Shows the Level Complete overlay and automatically dismisses it back to
   * the `playing` screen after `durationMs`, invoking `onDismiss` so the
   * caller can start the next level. Returns a function that cancels the
   * pending auto-dismiss (e.g. if the screen changes early).
   */
  showLevelComplete(onDismiss: () => void, durationMs: number = LEVEL_COMPLETE_DISPLAY_MS): () => void {
    this.clearLevelCompleteTimer();
    this._currentScreen = 'levelComplete';
    this.levelCompleteTimeoutId = setTimeout(() => {
      this.levelCompleteTimeoutId = null;
      this._currentScreen = 'playing';
      onDismiss();
    }, durationMs);
    return () => this.clearLevelCompleteTimer();
  }

  private clearLevelCompleteTimer(): void {
    if (this.levelCompleteTimeoutId !== null) {
      clearTimeout(this.levelCompleteTimeoutId);
      this.levelCompleteTimeoutId = null;
    }
  }
}
