import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  GameState,
  getDifficultySettings,
  MAX_DIFFICULTY_LEVEL,
  LEVEL_COMPLETE_TRANSITION_MS,
} from '../../src/game/GameState';

describe('getDifficultySettings', () => {
  it('[US-008#1] scales ghost speed up and frightened/scatter durations down as level increases', () => {
    const level1 = getDifficultySettings(1);
    const level10 = getDifficultySettings(10);
    const level20 = getDifficultySettings(MAX_DIFFICULTY_LEVEL);

    expect(level10.ghostSpeedMultiplier).toBeGreaterThan(level1.ghostSpeedMultiplier);
    expect(level20.ghostSpeedMultiplier).toBeGreaterThan(level10.ghostSpeedMultiplier);
    expect(level10.frightenedDurationMs).toBeLessThan(level1.frightenedDurationMs);
    expect(level10.scatterDurationMs).toBeLessThan(level1.scatterDurationMs);
  });

  it('[US-008#1] caps difficulty at MAX_DIFFICULTY_LEVEL and repeats the hardest settings beyond it', () => {
    const atCap = getDifficultySettings(MAX_DIFFICULTY_LEVEL);
    const beyondCap = getDifficultySettings(MAX_DIFFICULTY_LEVEL + 5);

    expect(beyondCap).toEqual(atCap);
  });

  it('[US-008#1] rounds ghostSpeedMultiplier to a fixed number of decimal places', () => {
    const { ghostSpeedMultiplier } = getDifficultySettings(7);
    const decimalPlaces = ghostSpeedMultiplier.toString().split('.')[1]?.length ?? 0;

    expect(decimalPlaces).toBeLessThanOrEqual(4);
  });
});

describe('GameState level progression', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('[US-008#2] checkLevelComplete triggers a transition once all dots are cleared, then advances the level', () => {
    const state = new GameState();
    const onNextLevel = vi.fn();

    const triggered = state.checkLevelComplete(0, { onNextLevel });

    expect(triggered).toBe(true);
    expect(state.levelComplete).toBe(true);
    expect(state.paused).toBe(true);
    expect(state.level).toBe(1);

    vi.advanceTimersByTime(LEVEL_COMPLETE_TRANSITION_MS);

    expect(onNextLevel).toHaveBeenCalledTimes(1);
    expect(state.level).toBe(2);
    expect(state.levelComplete).toBe(false);
    expect(state.paused).toBe(false);
  });

  it('[US-008#2] checkLevelComplete does nothing while dots remain', () => {
    const state = new GameState();

    const triggered = state.checkLevelComplete(5);

    expect(triggered).toBe(false);
    expect(state.levelComplete).toBe(false);
    expect(state.paused).toBe(false);
  });

  it('[US-008#2] checkLevelComplete forwards a custom transitionMs through to completeLevel', () => {
    const state = new GameState();
    const onNextLevel = vi.fn();

    state.checkLevelComplete(0, { onNextLevel, transitionMs: 500 });

    vi.advanceTimersByTime(499);
    expect(onNextLevel).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(onNextLevel).toHaveBeenCalledTimes(1);
    expect(state.level).toBe(2);
  });

  it('[US-008#2] completeLevel is a no-op while a transition is already pending for the current level', () => {
    const state = new GameState();
    const onNextLevel = vi.fn();

    state.completeLevel({ onNextLevel });
    state.completeLevel({ onNextLevel });

    vi.advanceTimersByTime(LEVEL_COMPLETE_TRANSITION_MS);

    expect(onNextLevel).toHaveBeenCalledTimes(1);
    expect(state.level).toBe(2);
  });

  it('[US-008#4] dispose cancels a pending transition and resets levelComplete/paused flags', () => {
    const state = new GameState();
    const onNextLevel = vi.fn();

    state.completeLevel({ onNextLevel });
    state.dispose();

    vi.advanceTimersByTime(LEVEL_COMPLETE_TRANSITION_MS);

    expect(onNextLevel).not.toHaveBeenCalled();
    expect(state.levelComplete).toBe(false);
    expect(state.paused).toBe(false);
    expect(state.level).toBe(1);
  });

  it('[US-008#4] after dispose, the GameState instance can complete another level normally', () => {
    const state = new GameState();
    state.completeLevel();
    state.dispose();

    const onNextLevel = vi.fn();
    const triggered = state.checkLevelComplete(0, { onNextLevel });

    expect(triggered).toBe(true);

    vi.advanceTimersByTime(LEVEL_COMPLETE_TRANSITION_MS);

    expect(onNextLevel).toHaveBeenCalledTimes(1);
    expect(state.level).toBe(2);
  });
});
