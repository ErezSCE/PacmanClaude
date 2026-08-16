import type { Direction } from '../types/shared';

/**
 * Normalizes keyboard (arrows/WASD), touch swipe, and on-screen directional
 * buttons into a single directional-intent API.
 * Also handles pause (P/Escape) and mute (M) key bindings for full keyboard accessibility.
 */
export class InputManager {
  private _direction: Direction | null = null;
  private _pauseRequested = false;
  private _muteRequested = false;
  private _boundKeyDown: ((e: KeyboardEvent) => void) | null = null;
  private _boundKeyUp: ((e: KeyboardEvent) => void) | null = null;
  private _activeKeys = new Set<string>();

  constructor() {
    this._boundKeyDown = this._handleKeyDown.bind(this);
    this._boundKeyUp = this._handleKeyUp.bind(this);
    document.addEventListener('keydown', this._boundKeyDown);
    document.addEventListener('keyup', this._boundKeyUp);
  }

  private _handleKeyDown(e: KeyboardEvent): void {
    const key = e.key;

    // Prevent default for game keys to avoid scrolling
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
      e.preventDefault();
    }

    // Avoid repeat events from held keys
    if (this._activeKeys.has(key)) {
      return;
    }
    this._activeKeys.add(key);

    // Direction mapping: Arrow keys + WASD
    switch (key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        this._direction = 'up';
        return;
      case 'ArrowDown':
      case 's':
      case 'S':
        this._direction = 'down';
        return;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        this._direction = 'left';
        return;
      case 'ArrowRight':
      case 'd':
      case 'D':
        this._direction = 'right';
        return;
    }

    // Pause: P or Escape (edge-triggered)
    if (key === 'p' || key === 'P' || key === 'Escape') {
      this._pauseRequested = true;
      return;
    }

    // Mute: M (edge-triggered)
    if (key === 'm' || key === 'M') {
      this._muteRequested = true;
      return;
    }
  }

  private _handleKeyUp(e: KeyboardEvent): void {
    this._activeKeys.delete(e.key);
  }

  get direction(): Direction | null {
    return this._direction;
  }

  get pauseRequested(): boolean {
    return this._pauseRequested;
  }

  get muteRequested(): boolean {
    return this._muteRequested;
  }

  /**
   * Consumes the pause request flag (returns true once, then resets).
   * Use this in the game loop to poll for pause toggle.
   */
  consumePause(): boolean {
    if (this._pauseRequested) {
      this._pauseRequested = false;
      return true;
    }
    return false;
  }

  /**
   * Consumes the mute request flag (returns true once, then resets).
   * Use this in the game loop to poll for mute toggle.
   */
  consumeMute(): boolean {
    if (this._muteRequested) {
      this._muteRequested = false;
      return true;
    }
    return false;
  }

  /**
   * Sets direction programmatically (e.g., from touch/swipe or on-screen buttons).
   */
  setDirection(dir: Direction): void {
    this._direction = dir;
  }

  /**
   * Removes all event listeners. Call when tearing down the game.
   */
  destroy(): void {
    if (this._boundKeyDown) {
      document.removeEventListener('keydown', this._boundKeyDown);
    }
    if (this._boundKeyUp) {
      document.removeEventListener('keyup', this._boundKeyUp);
    }
    this._boundKeyDown = null;
    this._boundKeyUp = null;
    this._direction = null;
    this._pauseRequested = false;
    this._muteRequested = false;
    this._activeKeys.clear();
  }
}
