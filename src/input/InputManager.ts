import type { Direction } from '../types/shared';

/** Minimum swipe distance in pixels to register as a directional gesture. */
const SWIPE_THRESHOLD_PX = 30;

const KEY_DIRECTION_MAP: Record<string, Direction> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  W: 'up',
  s: 'down',
  S: 'down',
  a: 'left',
  A: 'left',
  d: 'right',
  D: 'right',
};

const PAUSE_KEYS = new Set(['p', 'P', 'Escape']);
const MUTE_KEYS = new Set(['m', 'M']);

/**
 * Normalizes keyboard (arrows/WASD), touch swipe, and on-screen directional
 * button input into a single directional-intent API. Also tracks one-shot
 * pause/mute key binding requests for full keyboard accessibility.
 */
export class InputManager {
  private _direction: Direction | null = null;
  private _pauseRequested = false;
  private _muteRequested = false;

  private touchStartX = 0;
  private touchStartY = 0;
  private touchActive = false;

  private readonly target: HTMLElement | Document;

  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    const direction = KEY_DIRECTION_MAP[event.key];
    if (direction) {
      this._direction = direction;
      return;
    }

    if (PAUSE_KEYS.has(event.key)) {
      this._pauseRequested = true;
      return;
    }

    if (MUTE_KEYS.has(event.key)) {
      this._muteRequested = true;
    }
  };

  private readonly handleTouchStart = (event: TouchEvent): void => {
    const touch = event.touches[0];
    if (!touch) return;
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
    this.touchActive = true;
  };

  private readonly handleTouchEnd = (event: TouchEvent): void => {
    if (!this.touchActive) return;
    this.touchActive = false;

    if (!event.changedTouches.length) return;

    const touch = event.changedTouches[0];
    if (!touch) return;

    const deltaX = touch.clientX - this.touchStartX;
    const deltaY = touch.clientY - this.touchStartY;

    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (Math.max(absX, absY) < SWIPE_THRESHOLD_PX) return;

    if (absX > absY) {
      this.setDirection(deltaX > 0 ? 'right' : 'left');
    } else {
      this.setDirection(deltaY > 0 ? 'down' : 'up');
    }
  };

  constructor(target: HTMLElement | Document = document) {
    this.target = target;
    this.target.addEventListener('keydown', this.handleKeyDown as EventListener);
    this.target.addEventListener(
      'touchstart',
      this.handleTouchStart as EventListener,
      { passive: true },
    );
    this.target.addEventListener(
      'touchend',
      this.handleTouchEnd as EventListener,
      { passive: true },
    );
  }

  /** Current directional intent, or null if no direction has been set yet. */
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
   * Sets the directional intent directly. Used by on-screen directional
   * buttons and swipe gestures so all input sources share one API.
   */
  setDirection(direction: Direction): void {
    this._direction = direction;
  }

  /** Reads and clears the pause request flag (one-shot edge trigger). */
  consumePauseRequest(): boolean {
    const requested = this._pauseRequested;
    this._pauseRequested = false;
    return requested;
  }

  /** Reads and clears the mute request flag (one-shot edge trigger). */
  consumeMuteRequest(): boolean {
    const requested = this._muteRequested;
    this._muteRequested = false;
    return requested;
  }

  destroy(): void {
    this.target.removeEventListener('keydown', this.handleKeyDown as EventListener);
    this.target.removeEventListener(
      'touchstart',
      this.handleTouchStart as EventListener,
    );
    this.target.removeEventListener(
      'touchend',
      this.handleTouchEnd as EventListener,
    );
    this._direction = null;
  }
}
