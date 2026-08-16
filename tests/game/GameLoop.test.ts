import { describe, it, expect, vi, beforeEach, afterEach, type MockInstance } from 'vitest';
import { startGameLoop, stopGameLoop } from '../../src/game/GameLoop';

describe('GameLoop', () => {
  let rafSpy: MockInstance<typeof globalThis.requestAnimationFrame>;
  let cafSpy: MockInstance<typeof globalThis.cancelAnimationFrame>;
  let rafCallbacks: Array<(t: number) => void>;
  let nextId: number;

  beforeEach(() => {
    rafCallbacks = [];
    nextId = 1;
    rafSpy = vi
      .spyOn(globalThis, 'requestAnimationFrame')
      .mockImplementation((cb: FrameRequestCallback) => {
        rafCallbacks.push(cb as (t: number) => void);
        return nextId++;
      });
    cafSpy = vi.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(() => {});
  });

  afterEach(() => {
    rafSpy.mockRestore();
    cafSpy.mockRestore();
  });

  it('[US-008#2] each call to startGameLoop returns an independent handle so loops do not share module state', () => {
    const render1 = vi.fn();
    const render2 = vi.fn();

    const handleA = startGameLoop(vi.fn(), render1);
    const handleB = startGameLoop(vi.fn(), render2);

    expect(handleA).not.toBe(handleB);

    rafCallbacks[0](16.7);
    rafCallbacks[1](16.7);

    expect(render1).toHaveBeenCalled();
    expect(render2).toHaveBeenCalled();

    stopGameLoop(handleA);
    stopGameLoop(handleB);
  });

  it('[US-008#2] stopGameLoop cancels only the animation frame owned by its handle', () => {
    const handle = startGameLoop(vi.fn(), vi.fn());

    stopGameLoop(handle);

    expect(cafSpy).toHaveBeenCalledTimes(1);
  });
});
