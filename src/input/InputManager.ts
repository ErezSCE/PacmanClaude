import type { Direction } from '../types/shared';

/**
 * Normalizes keyboard, touch, and on-screen button input
 * into a single directional-intent API.
 */
export class InputManager {
  private _direction: Direction | null = null;
  private _pauseRequested = false;
  private _muteRequested = false;

  get direction(): Direction | null {
    return this._direction;
  }

  get pauseRequested(): boolean {
    return this._pauseRequested;
  }

  get muteRequested(): boolean {
    return this._muteRequested;
  }

  destroy(): void {
    this._direction = null;
  }
}
