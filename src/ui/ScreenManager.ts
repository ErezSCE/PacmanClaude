/**
 * Screen types for the DOM overlay state machine.
 */
export type ScreenType =
  | 'start'
  | 'countdown'
  | 'playing'
  | 'pause'
  | 'levelComplete'
  | 'gameOver';

/**
 * Manages DOM overlay screens rendered over the Canvas.
 */
export class ScreenManager {
  private _currentScreen: ScreenType = 'start';

  get currentScreen(): ScreenType {
    return this._currentScreen;
  }

  show(screen: ScreenType): void {
    this._currentScreen = screen;
  }
}
