/**
 * DOM overlay state machine for the game's non-canvas screens: Start,
 * Countdown, Pause, Level Complete, and Game Over. Rendered as accessible
 * HTML layered over the Canvas (see the `#overlay` element in index.html).
 *
 * Timer ownership: `ScreenManager` does NOT run its own auto-dismiss timer
 * for the level-complete overlay. `GameState` is the single authoritative
 * timer for that transition (see `GameState.completeLevel`); this class only
 * renders the overlay and exposes a guarded `dismissLevelComplete()` for the
 * caller to invoke once that transition timer elapses. This avoids two
 * independent timers racing to mutate state in an inconsistent order.
 */
export type ScreenType = 'start' | 'countdown' | 'playing' | 'pause' | 'levelComplete' | 'gameOver';

const LEVEL_COMPLETE_PANEL_CLASS = 'screen-level-complete';

export class ScreenManager {
  private _currentScreen: ScreenType = 'start';
  private readonly overlayRoot: HTMLElement | null;

  constructor(overlayRoot?: HTMLElement | null) {
    this.overlayRoot =
      overlayRoot !== undefined
        ? overlayRoot
        : typeof document !== 'undefined'
          ? document.getElementById('overlay')
          : null;
  }

  get currentScreen(): ScreenType {
    return this._currentScreen;
  }

  /** Switches to the given screen immediately and re-renders the overlay. */
  show(screen: ScreenType): void {
    this._currentScreen = screen;
    this.render();
  }

  /**
   * Shows the accessible Level Complete overlay for the given level number.
   * Does not auto-dismiss; the caller (typically the `GameState`
   * `onNextLevel` callback) must call `dismissLevelComplete()` once the
   * authoritative transition timer elapses.
   */
  showLevelComplete(level: number): void {
    this._currentScreen = 'levelComplete';
    this.render(level);
  }

  /**
   * Dismisses the Level Complete overlay back to `nextScreen`, but only if
   * the screen hasn't already been changed externally (e.g. the player
   * navigated to Game Over while the transition was pending). Returns
   * whether the dismiss actually happened.
   */
  dismissLevelComplete(nextScreen: ScreenType = 'playing'): boolean {
    if (this._currentScreen !== 'levelComplete') {
      return false;
    }
    this.show(nextScreen);
    return true;
  }

  private render(level?: number): void {
    if (!this.overlayRoot) {
      return;
    }
    this.overlayRoot.innerHTML = '';

    if (this._currentScreen === 'levelComplete') {
      const panel = document.createElement('div');
      panel.className = LEVEL_COMPLETE_PANEL_CLASS;
      panel.setAttribute('role', 'status');
      panel.setAttribute('aria-live', 'polite');
      panel.tabIndex = -1;
      panel.textContent = level !== undefined ? `Level ${level} Complete!` : 'Level Complete!';
      this.overlayRoot.appendChild(panel);
      panel.focus();
    }
  }
}
