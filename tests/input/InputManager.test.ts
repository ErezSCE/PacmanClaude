import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { InputManager } from '../../src/input/InputManager';

function dispatchKeyDown(target: EventTarget, key: string): void {
  target.dispatchEvent(new KeyboardEvent('keydown', { key }));
}

function makeTouch(clientX: number, clientY: number): Touch {
  return { clientX, clientY, identifier: 0 } as unknown as Touch;
}

function dispatchTouchStart(target: EventTarget, x: number, y: number): void {
  const event = new Event('touchstart', { cancelable: true }) as TouchEvent;
  Object.defineProperty(event, 'touches', { value: [makeTouch(x, y)] });
  target.dispatchEvent(event);
}

function dispatchTouchEnd(
  target: EventTarget,
  changedTouches: Touch[],
): void {
  const event = new Event('touchend', { cancelable: true }) as TouchEvent;
  Object.defineProperty(event, 'changedTouches', { value: changedTouches });
  target.dispatchEvent(event);
}

describe('InputManager', () => {
  let container: HTMLDivElement;
  let inputManager: InputManager;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    inputManager = new InputManager(container);
  });

  afterEach(() => {
    inputManager.destroy();
    container.remove();
  });

  describe('keyboard arrows/WASD mapping', () => {
    it('[US-002#5] maps ArrowUp/ArrowDown/ArrowLeft/ArrowRight to directions', () => {
      dispatchKeyDown(container, 'ArrowUp');
      expect(inputManager.direction).toBe('up');

      dispatchKeyDown(container, 'ArrowDown');
      expect(inputManager.direction).toBe('down');

      dispatchKeyDown(container, 'ArrowLeft');
      expect(inputManager.direction).toBe('left');

      dispatchKeyDown(container, 'ArrowRight');
      expect(inputManager.direction).toBe('right');
    });

    it('[US-002#5] maps WASD (both cases) to directions', () => {
      dispatchKeyDown(container, 'w');
      expect(inputManager.direction).toBe('up');

      dispatchKeyDown(container, 'S');
      expect(inputManager.direction).toBe('down');

      dispatchKeyDown(container, 'a');
      expect(inputManager.direction).toBe('left');

      dispatchKeyDown(container, 'D');
      expect(inputManager.direction).toBe('right');
    });

    it('[US-002#5] ignores unrelated keys without changing direction', () => {
      dispatchKeyDown(container, 'ArrowRight');
      dispatchKeyDown(container, 'q');
      expect(inputManager.direction).toBe('right');
    });
  });

  describe('pause/mute shortcut keys', () => {
    it('[US-002#5] sets a one-shot pause request for p/P/Escape', () => {
      dispatchKeyDown(container, 'p');
      expect(inputManager.consumePauseRequest()).toBe(true);
      // one-shot: consuming clears the flag
      expect(inputManager.consumePauseRequest()).toBe(false);

      dispatchKeyDown(container, 'Escape');
      expect(inputManager.pauseRequested).toBe(true);
    });

    it('[US-002#5] sets a one-shot mute request for m/M', () => {
      dispatchKeyDown(container, 'M');
      expect(inputManager.consumeMuteRequest()).toBe(true);
      expect(inputManager.consumeMuteRequest()).toBe(false);
    });
  });

  describe('touch swipe detection', () => {
    it('[US-002#5] registers a horizontal swipe right past the threshold', () => {
      dispatchTouchStart(container, 0, 0);
      dispatchTouchEnd(container, [makeTouch(50, 0)]);
      expect(inputManager.direction).toBe('right');
    });

    it('[US-002#5] registers a horizontal swipe left past the threshold', () => {
      dispatchTouchStart(container, 100, 0);
      dispatchTouchEnd(container, [makeTouch(40, 5)]);
      expect(inputManager.direction).toBe('left');
    });

    it('[US-002#5] registers a vertical swipe down past the threshold', () => {
      dispatchTouchStart(container, 0, 0);
      dispatchTouchEnd(container, [makeTouch(2, 60)]);
      expect(inputManager.direction).toBe('down');
    });

    it('[US-002#5] registers a vertical swipe up past the threshold', () => {
      dispatchTouchStart(container, 0, 100);
      dispatchTouchEnd(container, [makeTouch(0, 20)]);
      expect(inputManager.direction).toBe('up');
    });

    it('[US-002#5] ignores swipes shorter than the threshold', () => {
      dispatchTouchStart(container, 0, 0);
      dispatchKeyDown(container, 'ArrowRight');
      dispatchTouchStart(container, 0, 0);
      dispatchTouchEnd(container, [makeTouch(5, 5)]);
      // Direction should remain whatever it was before the tiny swipe.
      expect(inputManager.direction).toBe('right');
    });

    it('[US-002#5] does not throw when touchend has an empty changedTouches list', () => {
      dispatchTouchStart(container, 0, 0);
      expect(() => dispatchTouchEnd(container, [])).not.toThrow();
    });

    it('[US-002#5] ignores touchend when no touchstart was recorded', () => {
      expect(() => dispatchTouchEnd(container, [makeTouch(50, 50)])).not.toThrow();
    });
  });

  describe('on-screen directional buttons', () => {
    it('[US-002#5] setDirection forwards on-screen button presses to the shared API', () => {
      inputManager.setDirection('left');
      expect(inputManager.direction).toBe('left');
    });
  });

  describe('destroy', () => {
    it('[US-002#5] stops responding to input after destroy is called', () => {
      inputManager.setDirection('up');
      inputManager.destroy();
      dispatchKeyDown(container, 'ArrowRight');
      expect(inputManager.direction).toBe(null);
    });
  });
});
