import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getSettings, saveSettings, type Settings } from '../../src/persistence/SettingsStore';

describe('SettingsStore', () => {
  let store: Record<string, string> = {};

  beforeEach(() => {
    // Mock localStorage
    store = {};
    const localStorageMock = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
      length: 0,
      key: (index: number) => null,
    };
    vi.stubGlobal('localStorage', localStorageMock);
  });

  afterEach(() => {
    // Clean up after each test
    vi.unstubAllGlobals();
  });

  it('should return default settings when localStorage is empty', () => {
    const settings = getSettings();
    expect(settings).toEqual({
      muteEnabled: false,
      colorblindPaletteEnabled: false,
    });
  });

  it('should save and retrieve settings from localStorage', () => {
    const testSettings: Settings = {
      muteEnabled: true,
      colorblindPaletteEnabled: true,
    };

    saveSettings(testSettings);
    const retrieved = getSettings();

    expect(retrieved).toEqual(testSettings);
  });

  it('should handle partial settings with backward compatibility', () => {
    // Simulate old settings format with missing fields
    localStorage.setItem('pacman_settings', JSON.stringify({ muteEnabled: true }));

    const settings = getSettings();
    expect(settings.muteEnabled).toBe(true);
    expect(settings.colorblindPaletteEnabled).toBe(false);
  });

  it('should return defaults on corrupted localStorage data', () => {
    localStorage.setItem('pacman_settings', 'invalid json {');

    const settings = getSettings();
    expect(settings).toEqual({
      muteEnabled: false,
      colorblindPaletteEnabled: false,
    });
  });

  it('should update individual settings fields', () => {
    const initial = getSettings();
    const updated: Settings = {
      ...initial,
      muteEnabled: !initial.muteEnabled,
    };

    saveSettings(updated);
    const retrieved = getSettings();

    expect(retrieved.muteEnabled).toBe(!initial.muteEnabled);
    expect(retrieved.colorblindPaletteEnabled).toBe(initial.colorblindPaletteEnabled);
  });
});
