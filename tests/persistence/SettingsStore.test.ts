import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getSettings, saveSettings, type Settings } from '../../src/persistence/SettingsStore';

describe('SettingsStore', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.removeItem('pacman_settings');
  });

  afterEach(() => {
    // Clean up after each test
    localStorage.clear();
  });

  describe('getSettings', () => {
    it('[US-013#1] returns default settings when localStorage is empty', () => {
      const settings = getSettings();
      expect(settings).toEqual({
        muteEnabled: false,
        colorblindPaletteEnabled: false,
      });
    });

    it('[US-013#2] returns stored settings when valid JSON exists in localStorage', () => {
      const testSettings: Settings = {
        muteEnabled: true,
        colorblindPaletteEnabled: true,
      };
      localStorage.setItem('pacman_settings', JSON.stringify(testSettings));

      const settings = getSettings();
      expect(settings).toEqual(testSettings);
    });

    it('[US-013#3] returns default settings when stored JSON is invalid', () => {
      localStorage.setItem('pacman_settings', 'invalid json {');

      const settings = getSettings();
      expect(settings).toEqual({
        muteEnabled: false,
        colorblindPaletteEnabled: false,
      });
    });

    it('[US-013#4] returns default settings when stored value is not an object', () => {
      localStorage.setItem('pacman_settings', JSON.stringify('string value'));

      const settings = getSettings();
      expect(settings).toEqual({
        muteEnabled: false,
        colorblindPaletteEnabled: false,
      });
    });

    it('[US-013#5] returns default settings when stored value is null', () => {
      localStorage.setItem('pacman_settings', JSON.stringify(null));

      const settings = getSettings();
      expect(settings).toEqual({
        muteEnabled: false,
        colorblindPaletteEnabled: false,
      });
    });

    it('[US-013#6] returns default settings when stored value is an array', () => {
      localStorage.setItem('pacman_settings', JSON.stringify([1, 2, 3]));

      const settings = getSettings();
      expect(settings).toEqual({
        muteEnabled: false,
        colorblindPaletteEnabled: false,
      });
    });

    it('[US-013#7] uses nullish coalescing to provide defaults for missing properties', () => {
      const partialSettings = { muteEnabled: true };
      localStorage.setItem('pacman_settings', JSON.stringify(partialSettings));

      const settings = getSettings();
      expect(settings.muteEnabled).toBe(true);
      expect(settings.colorblindPaletteEnabled).toBe(false);
    });
  });

  describe('saveSettings', () => {
    it('[US-013#8] saves settings to localStorage as JSON', () => {
      const testSettings: Settings = {
        muteEnabled: true,
        colorblindPaletteEnabled: false,
      };

      saveSettings(testSettings);

      const stored = localStorage.getItem('pacman_settings');
      expect(stored).toBe(JSON.stringify(testSettings));
    });

    it('[US-013#9] overwrites existing settings', () => {
      const oldSettings: Settings = {
        muteEnabled: false,
        colorblindPaletteEnabled: false,
      };
      const newSettings: Settings = {
        muteEnabled: true,
        colorblindPaletteEnabled: true,
      };

      saveSettings(oldSettings);
      saveSettings(newSettings);

      const stored = localStorage.getItem('pacman_settings');
      expect(stored).toBe(JSON.stringify(newSettings));
    });

    it('[US-013#10] handles localStorage quota errors gracefully', () => {
      const testSettings: Settings = {
        muteEnabled: true,
        colorblindPaletteEnabled: true,
      };

      // Mock localStorage.setItem to throw QuotaExceededError
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new DOMException('QuotaExceededError', 'QuotaExceededError');
      });

      // Should not throw
      expect(() => saveSettings(testSettings)).not.toThrow();
    });

    it('[US-013#11] handles localStorage unavailable errors gracefully', () => {
      const testSettings: Settings = {
        muteEnabled: true,
        colorblindPaletteEnabled: true,
      };

      // Mock localStorage.setItem to throw a generic error
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage unavailable');
      });

      // Should not throw
      expect(() => saveSettings(testSettings)).not.toThrow();
    });
  });
});
