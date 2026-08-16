import { beforeEach, describe, expect, it } from 'vitest';
import { AudioManager, computeSirenFrequency, SOUND_EFFECTS } from '../../src/audio/AudioManager';
import { getSettings, saveSettings } from '../../src/persistence/SettingsStore';
import { createMockContextFactory, MockAudioContext } from './mockAudioContext';

function makeManager(): { manager: AudioManager; context: MockAudioContext } {
  const { factory, context } = createMockContextFactory();
  const manager = new AudioManager(factory as unknown as () => AudioContext);
  return { manager, context };
}

describe('AudioManager', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('[US-009#1] plays a distinct sound for each required game event', () => {
    const { manager, context } = makeManager();
    const names = ['startup', 'dot', 'powerPellet', 'ghostEaten', 'death', 'fruit', 'extraLife'] as const;

    names.forEach((name) => manager.playSound(name));

    expect(context.createdOscillators).toHaveLength(names.length);
    names.forEach((name, index) => {
      const oscillator = context.createdOscillators[index];
      expect(oscillator.type).toBe(SOUND_EFFECTS[name].type);
      expect(oscillator.frequency.value).toBe(SOUND_EFFECTS[name].frequency);
      expect(oscillator.start).toHaveBeenCalled();
      expect(oscillator.stop).toHaveBeenCalled();
    });
  });

  it('[US-009#1] overlapping sounds each get their own oscillator so none cut off another', () => {
    const { manager, context } = makeManager();

    manager.playSound('dot');
    manager.playSound('dot');
    manager.playSound('powerPellet');

    expect(context.createdOscillators).toHaveLength(3);
    // Each call produced an independent, still-playing node (none disconnected up-front).
    context.createdOscillators.forEach((osc) => {
      expect(osc.disconnect).not.toHaveBeenCalled();
    });
  });

  it('[US-009#2] the siren loops (starts once, stays active) and stops on demand', () => {
    const { manager, context } = makeManager();

    manager.startSiren();
    manager.startSiren(); // second call should be a no-op while active
    expect(manager.isSirenActive()).toBe(true);
    expect(context.createdOscillators).toHaveLength(1);
    expect(context.createdOscillators[0].start).toHaveBeenCalledTimes(1);

    manager.stopSiren();
    expect(manager.isSirenActive()).toBe(false);
    expect(context.createdOscillators[0].stop).toHaveBeenCalledTimes(1);
  });

  it('[US-009#2] siren frequency increases as dots deplete', () => {
    const highDots = computeSirenFrequency(200, 240, 1);
    const lowDots = computeSirenFrequency(20, 240, 1);
    expect(lowDots).toBeGreaterThan(highDots);
  });

  it('[US-009#2] siren frequency increases as the level increases', () => {
    const level1 = computeSirenFrequency(100, 240, 1);
    const level10 = computeSirenFrequency(100, 240, 10);
    expect(level10).toBeGreaterThan(level1);
  });

  it('[US-009#2] updateSirenRate applies the computed frequency to the active oscillator', () => {
    const { manager, context } = makeManager();
    manager.startSiren();

    manager.updateSirenRate(50, 240, 5);

    const expected = computeSirenFrequency(50, 240, 5);
    expect(context.createdOscillators[0].frequency.value).toBe(expected);
  });

  it('[US-009#2] updateSirenRate is a no-op when the siren is not active', () => {
    const { manager, context } = makeManager();

    manager.updateSirenRate(50, 240, 5);

    expect(context.createdOscillators).toHaveLength(0);
  });

  it('[US-009#3] mute toggle silences all audio immediately', () => {
    const { manager, context } = makeManager();
    manager.startSiren();

    manager.setMuted(true);

    expect(context.createdGains[context.createdGains.length - 1]).toBeDefined();
    // master gain is the first gain node created (in getContext)
    expect(context.createdGains[0].gain.value).toBe(0);
    expect(manager.isMuted()).toBe(true);

    manager.setMuted(false);
    expect(context.createdGains[0].gain.value).toBe(1);
  });

  it('[US-009#3] toggleMute flips and returns the new mute state', () => {
    const { manager } = makeManager();
    expect(manager.isMuted()).toBe(false);

    const first = manager.toggleMute();
    expect(first).toBe(true);
    expect(manager.isMuted()).toBe(true);

    const second = manager.toggleMute();
    expect(second).toBe(false);
  });

  it('[US-009#3] mute state persists across sessions via the settings store', () => {
    const { manager: firstSessionManager } = makeManager();
    firstSessionManager.setMuted(true);

    expect(getSettings().muteEnabled).toBe(true);

    // Simulate a fresh session/page load with a brand new AudioManager instance.
    const { manager: secondSessionManager } = makeManager();
    expect(secondSessionManager.isMuted()).toBe(true);
  });

  it('[US-009#3] persisting mute does not clobber other stored settings', () => {
    saveSettings({ muteEnabled: false, colorblindPaletteEnabled: true });
    const { manager } = makeManager();

    manager.setMuted(true);

    const settings = getSettings();
    expect(settings.muteEnabled).toBe(true);
    expect(settings.colorblindPaletteEnabled).toBe(true);
  });
});
