import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { InputManager } from '../../src/input/InputManager';

function dispatchKeydown(target: EventTarget, key: string): void {
  target.dispatchEvent(new KeyboardEvent('keydown', { key }));
}

function dispatchTouch(
  target: EventTarget,
  type: 'touchstart' | 'touchend',
  x: number,
  y: number,
): void {
  const touch = { clientX: x, clientY: y } as Touch;
  const event = new Event(type) as unknown as {
    touches: Touch[];
    changedTouches: Touch[];
  };
  event.touches = type === 'touchstart' ? [touch] : [];
  event.changedTouches = type === 'touchend' ? [touch] : [];
  target.dispatchEvent(event as unknown as Event);
}

describe('InputManager', () => {
  let inputManager: InputManager;

  beforeEach(() => {
    inputManager = new InputManager(document);
  });

  afterEach(() => {
    inputManager.destroy();
  });

  it('[US-002#1] arrow keys update the directional intent', () => {
    dispatchKeydown(document, 'ArrowUp');
    expect(inputManager.direction).toBe('up');

    dispatchKeydown(document, 'ArrowRight');
    expect(inputManager.direction).toBe('right');
  });

  it('[US-002#1] WASD keys update the same directional intent', () => {
    dispatchKeydown(document, 'a');
    expect(inputManager.direction).toBe('left');

    dispatchKeydown(document, 'S');
    expect(inputManager.direction).toBe('down');
  });

  it('[US-002#1] a touch swipe gesture maps to the direction API', () => {
    dispatchTouch(document, 'touchstart', 100, 100);
    dispatchTouch(document, 'touchend', 200, 100);

    expect(inputManager.direction).toBe('right');
  });

  it('[US-002#1] a vertical swipe maps to up/down direction', () => {
    dispatchTouch(document, 'touchstart', 100, 200);
    dispatchTouch(document, 'touchend', 100, 90);

    expect(inputManager.direction).toBe('up');
  });

  it('[US-002#1] short swipes below the threshold are ignored', () => {
    dispatchKeydown(document, 'ArrowLeft');
    dispatchTouch(document, 'touchstart', 100, 100);
    dispatchTouch(document, 'touchend', 105, 100);

    expect(inputManager.direction).toBe('left');
  });

  it('[US-002#1] setDirection() shares the same API used by on-screen buttons', () => {
    inputManager.setDirection('down');
    expect(inputManager.direction).toBe('down');
  });

  it('recognizes pause and mute key bindings as one-shot flags', () => {
    dispatchKeydown(document, 'p');
    expect(inputManager.consumePauseRequest()).toBe(true);
    expect(inputManager.consumePauseRequest()).toBe(false);

    dispatchKeydown(document, 'm');
    expect(inputManager.consumeMuteRequest()).toBe(true);
    expect(inputManager.consumeMuteRequest()).toBe(false);
  });
});
