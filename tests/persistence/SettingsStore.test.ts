import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getSettings,
  saveSettings,
  type Settings,
} from '../../src/persistence/SettingsStore';

describe('SettingsStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('getSettings', () => {
    it('[US-011#10] returns default settings when none exist', () => {
      const settings = getSettings();
      expect(settings).toHaveProperty('muteEnabled');
      expect(settings).toHaveProperty('colorblindPaletteEnabled');
      expect(typeof settings.muteEnabled).toBe('boolean');
      expect(typeof settings.colorblindPaletteEnabled).toBe('boolean');
    });

    it('[US-011#11] returns saved settings from localStorage', () => {
      const customSettings: Settings = {
        muteEnabled: true,
        colorblindPaletteEnabled: true,
      };
      saveSettings(customSettings);

      const retrieved = getSettings();
      expect(retrieved.muteEnabled).toBe(true);
      expect(retrieved.colorblindPaletteEnabled).toBe(true);
    });
  });

  describe('saveSettings', () => {
    it('[US-011#12] saves settings to localStorage', () => {
      const settings: Settings = {
        muteEnabled: true,
        colorblindPaletteEnabled: false,
      };
      saveSettings(settings);

      const retrieved = getSettings();
      expect(retrieved.muteEnabled).toBe(true);
      expect(retrieved.colorblindPaletteEnabled).toBe(false);
    });

    it('[US-011#13] persists mute setting across calls', () => {
      const settings1: Settings = { muteEnabled: true, colorblindPaletteEnabled: false };
      saveSettings(settings1);

      let retrieved = getSettings();
      expect(retrieved.muteEnabled).toBe(true);

      const settings2: Settings = { muteEnabled: false, colorblindPaletteEnabled: false };
      saveSettings(settings2);

      retrieved = getSettings();
      expect(retrieved.muteEnabled).toBe(false);
    });

    it('[US-011#14] persists colorblind palette setting across calls', () => {
      const settings1: Settings = { muteEnabled: false, colorblindPaletteEnabled: false };
      saveSettings(settings1);

      let retrieved = getSettings();
      expect(retrieved.colorblindPaletteEnabled).toBe(false);

      const settings2: Settings = { muteEnabled: false, colorblindPaletteEnabled: true };
      saveSettings(settings2);

      retrieved = getSettings();
      expect(retrieved.colorblindPaletteEnabled).toBe(true);
    });

    it('[US-011#15] updates both settings independently', () => {
      const settings: Settings = { muteEnabled: true, colorblindPaletteEnabled: true };
      saveSettings(settings);

      let retrieved = getSettings();
      expect(retrieved.muteEnabled).toBe(true);
      expect(retrieved.colorblindPaletteEnabled).toBe(true);

      const updated: Settings = { muteEnabled: false, colorblindPaletteEnabled: true };
      saveSettings(updated);

      retrieved = getSettings();
      expect(retrieved.muteEnabled).toBe(false);
      expect(retrieved.colorblindPaletteEnabled).toBe(true);
    });
  });
});
