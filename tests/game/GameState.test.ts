import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GameState, getDifficultySettings, MAX_DIFFICULTY_LEVEL, LEVEL_COMPLETE_TRANSITION_MS } from '../../src/game/GameState';

describe('GameState level progression (US-008)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('[US-008#1] difficulty settings ramp up ghost speed and shrink frightened/scatter durations as level increases', () => {
    const level1 = getDifficultySettings(1);
    const level10 = getDifficultySettings(10);
    const level20 = getDifficultySettings(MAX_DIFFICULTY_LEVEL);

    expect(level10.ghostSpeedMultiplier).toBeGreaterThan(level1.ghostSpeedMultiplier);
    expect(level20.ghostSpeedMultiplier).toBeGreaterThan(level10.ghostSpeedMultiplier);

    expect(level10.frightenedDurationMs).toBeLessThan(level1.frightenedDurationMs);
    expect(level20.frightenedDurationMs).toBeLessThan(level10.frightenedDurationMs);

    expect(level10.scatterDurationMs).toBeLessThan(level1.scatterDurationMs);
    expect(level20.scatterDurationMs).toBeLessThan(level10.scatterDurationMs);
  });

  it('[US-008#2] levels beyond the max difficulty cap repeat the hardest (level-20) settings', () => {
    const level20 = getDifficultySettings(MAX_DIFFICULTY_LEVEL);
    const level21 = getDifficultySettings(21);
    const level100 = getDifficultySettings(100);

    expect(level21).toEqual(level20);
    expect(level100).toEqual(level20);
  });

  it('[US-008#3] completing a level pauses gameplay and marks levelComplete, then transitions to the next level after the delay', () => {
    const state = new GameState();
    const onNextLevel = vi.fn();

    state.completeLevel(onNextLevel);

    expect(state.levelComplete).toBe(true);
    expect(state.paused).toBe(true);
    expect(state.level).toBe(1);
    expect(onNextLevel).not.toHaveBeenCalled();

    vi.advanceTimersByTime(LEVEL_COMPLETE_TRANSITION_MS);

    expect(state.level).toBe(2);
    expect(state.levelComplete).toBe(false);
    expect(state.paused).toBe(false);
    expect(onNextLevel).toHaveBeenCalledTimes(1);
  });

  it('[US-008#4] checkLevelComplete triggers the level-complete transition once remaining dots reach zero', () => {
    const state = new GameState();
    const onNextLevel = vi.fn();

    expect(state.checkLevelComplete(5, onNextLevel)).toBe(false);
    expect(state.levelComplete).toBe(false);

    expect(state.checkLevelComplete(0, onNextLevel)).toBe(true);
    expect(state.levelComplete).toBe(true);

    // A second call while the transition is already pending must be a no-op.
    expect(state.checkLevelComplete(0, onNextLevel)).toBe(false);

    vi.advanceTimersByTime(LEVEL_COMPLETE_TRANSITION_MS);
    expect(onNextLevel).toHaveBeenCalledTimes(1);
    expect(state.level).toBe(2);
  });

  it('[US-008#5] dispose cancels a pending level transition so it never fires', () => {
    const state = new GameState();
    const onNextLevel = vi.fn();

    state.completeLevel(onNextLevel);
    state.dispose();

    vi.advanceTimersByTime(LEVEL_COMPLETE_TRANSITION_MS + 1000);

    expect(onNextLevel).not.toHaveBeenCalled();
    expect(state.level).toBe(1);
    // levelComplete/paused flags remain as set prior to disposal since teardown
    // simply cancels the pending timer rather than reverting state.
    expect(state.levelComplete).toBe(true);
  });
});
