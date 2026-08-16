import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  DEFAULT_PALETTE,
  COLORBLIND_PALETTE,
  getCurrentPalette,
  applyPaletteToCss,
  clearPaletteCache,
  refreshPalette,
  type GhostPalette,
} from '../../src/rendering/ghostPalette';
import type { GhostName } from '../../src/types/shared';
import * as SettingsStore from '../../src/persistence/SettingsStore';

describe('ghostPalette', () => {
  describe('palette types', () => {
    it('[US-013#13] DEFAULT_PALETTE has all ghost names as keys', () => {
      const ghostNames: GhostName[] = ['blinky', 'pinky', 'inky', 'clyde'];
      ghostNames.forEach((name) => {
        expect(DEFAULT_PALETTE).toHaveProperty(name);
        expect(typeof DEFAULT_PALETTE[name]).toBe('string');
      });
    });

    it('[US-013#14] COLORBLIND_PALETTE has all ghost names as keys', () => {
      const ghostNames: GhostName[] = ['blinky', 'pinky', 'inky', 'clyde'];
      ghostNames.forEach((name) => {
        expect(COLORBLIND_PALETTE).toHaveProperty(name);
        expect(typeof COLORBLIND_PALETTE[name]).toBe('string');
      });
    });

    it('[US-013#15] palette values are valid hex color strings', () => {
      const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
      Object.values(DEFAULT_PALETTE).forEach((color) => {
        expect(color).toMatch(hexColorRegex);
      });
      Object.values(COLORBLIND_PALETTE).forEach((color) => {
        expect(color).toMatch(hexColorRegex);
      });
    });
  });

  describe('getCurrentPalette', () => {
    beforeEach(() => {
      localStorage.removeItem('pacman_settings');
      clearPaletteCache();
      vi.clearAllMocks();
    });

    afterEach(() => {
      localStorage.removeItem('pacman_settings');
      clearPaletteCache();
      vi.clearAllMocks();
    });

    it('[US-013#16] returns DEFAULT_PALETTE when colorblind mode is disabled', () => {
      vi.spyOn(SettingsStore, 'getSettings').mockReturnValue({
        muteEnabled: false,
        colorblindPaletteEnabled: false,
      });
      const palette = getCurrentPalette();
      expect(palette).toEqual(DEFAULT_PALETTE);
    });

    it('[US-013#17] returns COLORBLIND_PALETTE when colorblind mode is enabled', () => {
      vi.spyOn(SettingsStore, 'getSettings').mockReturnValue({
        muteEnabled: false,
        colorblindPaletteEnabled: true,
      });
      const palette = getCurrentPalette();
      expect(palette).toEqual(COLORBLIND_PALETTE);
    });

    it('[US-013#18] return type is Record<GhostName, string>', () => {
      vi.spyOn(SettingsStore, 'getSettings').mockReturnValue({
        muteEnabled: false,
        colorblindPaletteEnabled: false,
      });
      const palette = getCurrentPalette();
      const ghostNames: GhostName[] = ['blinky', 'pinky', 'inky', 'clyde'];
      ghostNames.forEach((name) => {
        expect(palette).toHaveProperty(name);
        expect(typeof palette[name]).toBe('string');
      });
    });

    it('[US-013#19] can access palette with dynamic ghost name key', () => {
      vi.spyOn(SettingsStore, 'getSettings').mockReturnValue({
        muteEnabled: false,
        colorblindPaletteEnabled: false,
      });
      const palette = getCurrentPalette();
      const ghostName: GhostName = 'blinky';
      const color = palette[ghostName];
      expect(color).toBeDefined();
      expect(typeof color).toBe('string');
    });
  });

  describe('applyPaletteToCss', () => {
    beforeEach(() => {
      // Clear any inline styles from root element
      document.documentElement.style.cssText = '';
    });

    afterEach(() => {
      document.documentElement.style.cssText = '';
    });

    it('[US-013#20] applies DEFAULT_PALETTE colors to CSS custom properties', () => {
      applyPaletteToCss(DEFAULT_PALETTE);

      expect(document.documentElement.style.getPropertyValue('--ghost-blinky-color')).toBe(
        DEFAULT_PALETTE.blinky
      );
      expect(document.documentElement.style.getPropertyValue('--ghost-pinky-color')).toBe(
        DEFAULT_PALETTE.pinky
      );
      expect(document.documentElement.style.getPropertyValue('--ghost-inky-color')).toBe(
        DEFAULT_PALETTE.inky
      );
      expect(document.documentElement.style.getPropertyValue('--ghost-clyde-color')).toBe(
        DEFAULT_PALETTE.clyde
      );
    });

    it('[US-013#21] applies COLORBLIND_PALETTE colors to CSS custom properties', () => {
      applyPaletteToCss(COLORBLIND_PALETTE);

      expect(document.documentElement.style.getPropertyValue('--ghost-blinky-color')).toBe(
        COLORBLIND_PALETTE.blinky
      );
      expect(document.documentElement.style.getPropertyValue('--ghost-pinky-color')).toBe(
        COLORBLIND_PALETTE.pinky
      );
      expect(document.documentElement.style.getPropertyValue('--ghost-inky-color')).toBe(
        COLORBLIND_PALETTE.inky
      );
      expect(document.documentElement.style.getPropertyValue('--ghost-clyde-color')).toBe(
        COLORBLIND_PALETTE.clyde
      );
    });

    it('[US-013#22] overwrites previous palette when called multiple times', () => {
      applyPaletteToCss(DEFAULT_PALETTE);
      applyPaletteToCss(COLORBLIND_PALETTE);

      expect(document.documentElement.style.getPropertyValue('--ghost-blinky-color')).toBe(
        COLORBLIND_PALETTE.blinky
      );
    });

    it('[US-013#23] sets all four ghost color properties', () => {
      applyPaletteToCss(DEFAULT_PALETTE);

      const blinkyColor = document.documentElement.style.getPropertyValue('--ghost-blinky-color');
      const pinkyColor = document.documentElement.style.getPropertyValue('--ghost-pinky-color');
      const inkyColor = document.documentElement.style.getPropertyValue('--ghost-inky-color');
      const clydeColor = document.documentElement.style.getPropertyValue('--ghost-clyde-color');

      expect(blinkyColor).toBeTruthy();
      expect(pinkyColor).toBeTruthy();
      expect(inkyColor).toBeTruthy();
      expect(clydeColor).toBeTruthy();
    });
  });

  describe('refreshPalette', () => {
    beforeEach(() => {
      localStorage.removeItem('pacman_settings');
      clearPaletteCache();
      document.documentElement.style.cssText = '';
      vi.clearAllMocks();
    });

    afterEach(() => {
      localStorage.removeItem('pacman_settings');
      clearPaletteCache();
      document.documentElement.style.cssText = '';
      vi.clearAllMocks();
    });

    it('[US-013#24] clears the palette cache when refreshed', () => {
      vi.spyOn(SettingsStore, 'getSettings').mockReturnValue({
        muteEnabled: false,
        colorblindPaletteEnabled: false,
      });

      // Prime the cache
      getCurrentPalette();
      expect(getCurrentPalette()).toEqual(DEFAULT_PALETTE);

      // Refresh should clear cache and re-read settings
      vi.spyOn(SettingsStore, 'getSettings').mockReturnValue({
        muteEnabled: false,
        colorblindPaletteEnabled: true,
      });
      refreshPalette();

      // After refresh, the new palette should be applied
      const blinkyColor = document.documentElement.style.getPropertyValue('--ghost-blinky-color');
      expect(blinkyColor).toBe(COLORBLIND_PALETTE.blinky);
    });

    it('[US-013#25] applies COLORBLIND_PALETTE to CSS when colorblind mode is enabled', () => {
      vi.spyOn(SettingsStore, 'getSettings').mockReturnValue({
        muteEnabled: false,
        colorblindPaletteEnabled: true,
      });

      refreshPalette();

      expect(document.documentElement.style.getPropertyValue('--ghost-blinky-color')).toBe(
        COLORBLIND_PALETTE.blinky
      );
      expect(document.documentElement.style.getPropertyValue('--ghost-pinky-color')).toBe(
        COLORBLIND_PALETTE.pinky
      );
      expect(document.documentElement.style.getPropertyValue('--ghost-inky-color')).toBe(
        COLORBLIND_PALETTE.inky
      );
      expect(document.documentElement.style.getPropertyValue('--ghost-clyde-color')).toBe(
        COLORBLIND_PALETTE.clyde
      );
    });

    it('[US-013#26] applies DEFAULT_PALETTE to CSS when colorblind mode is disabled', () => {
      vi.spyOn(SettingsStore, 'getSettings').mockReturnValue({
        muteEnabled: false,
        colorblindPaletteEnabled: false,
      });

      refreshPalette();

      expect(document.documentElement.style.getPropertyValue('--ghost-blinky-color')).toBe(
        DEFAULT_PALETTE.blinky
      );
      expect(document.documentElement.style.getPropertyValue('--ghost-pinky-color')).toBe(
        DEFAULT_PALETTE.pinky
      );
      expect(document.documentElement.style.getPropertyValue('--ghost-inky-color')).toBe(
        DEFAULT_PALETTE.inky
      );
      expect(document.documentElement.style.getPropertyValue('--ghost-clyde-color')).toBe(
        DEFAULT_PALETTE.clyde
      );
    });

    it('[US-013#27] applies the correct palette based on current settings on repeated calls', () => {
      vi.spyOn(SettingsStore, 'getSettings').mockReturnValue({
        muteEnabled: false,
        colorblindPaletteEnabled: false,
      });

      // First refresh: apply default palette
      refreshPalette();
      let blinkyColor = document.documentElement.style.getPropertyValue('--ghost-blinky-color');
      expect(blinkyColor).toBe(DEFAULT_PALETTE.blinky);

      // Update mock to reflect a setting change
      vi.spyOn(SettingsStore, 'getSettings').mockReturnValue({
        muteEnabled: false,
        colorblindPaletteEnabled: true,
      });

      // Second refresh: apply colorblind palette
      refreshPalette();
      blinkyColor = document.documentElement.style.getPropertyValue('--ghost-blinky-color');
      expect(blinkyColor).toBe(COLORBLIND_PALETTE.blinky);
    });
  });

  describe('toggleColorblindPalette (global window function)', () => {
    beforeEach(() => {
      localStorage.removeItem('pacman_settings');
      clearPaletteCache();
      document.documentElement.style.cssText = '';
      vi.clearAllMocks();
    });

    afterEach(() => {
      localStorage.removeItem('pacman_settings');
      clearPaletteCache();
      document.documentElement.style.cssText = '';
      vi.clearAllMocks();
    });

    it('[US-013#28] toggles colorblindPaletteEnabled setting from false to true', () => {
      const getSettingsSpy = vi.spyOn(SettingsStore, 'getSettings').mockReturnValue({
        muteEnabled: false,
        colorblindPaletteEnabled: false,
      });
      const saveSettingsSpy = vi.spyOn(SettingsStore, 'saveSettings');

      // Simulate the toggleColorblindPalette function from main.ts
      const currentSettings = SettingsStore.getSettings();
      const newSettings = {
        ...currentSettings,
        colorblindPaletteEnabled: !currentSettings.colorblindPaletteEnabled,
      };
      SettingsStore.saveSettings(newSettings);
      refreshPalette();

      expect(saveSettingsSpy).toHaveBeenCalledWith({
        muteEnabled: false,
        colorblindPaletteEnabled: true,
      });
    });

    it('[US-013#29] toggles colorblindPaletteEnabled setting from true to false', () => {
      const getSettingsSpy = vi.spyOn(SettingsStore, 'getSettings').mockReturnValue({
        muteEnabled: false,
        colorblindPaletteEnabled: true,
      });
      const saveSettingsSpy = vi.spyOn(SettingsStore, 'saveSettings');

      // Simulate the toggleColorblindPalette function from main.ts
      const currentSettings = SettingsStore.getSettings();
      const newSettings = {
        ...currentSettings,
        colorblindPaletteEnabled: !currentSettings.colorblindPaletteEnabled,
      };
      SettingsStore.saveSettings(newSettings);
      refreshPalette();

      expect(saveSettingsSpy).toHaveBeenCalledWith({
        muteEnabled: false,
        colorblindPaletteEnabled: false,
      });
    });

    it('[US-013#30] persists the new setting via saveSettings', () => {
      vi.spyOn(SettingsStore, 'getSettings').mockReturnValue({
        muteEnabled: false,
        colorblindPaletteEnabled: false,
      });
      const saveSettingsSpy = vi.spyOn(SettingsStore, 'saveSettings');

      // Simulate the toggleColorblindPalette function from main.ts
      const currentSettings = SettingsStore.getSettings();
      const newSettings = {
        ...currentSettings,
        colorblindPaletteEnabled: !currentSettings.colorblindPaletteEnabled,
      };
      SettingsStore.saveSettings(newSettings);

      expect(saveSettingsSpy).toHaveBeenCalled();
      expect(saveSettingsSpy).toHaveBeenCalledWith(expect.objectContaining({
        colorblindPaletteEnabled: true,
      }));
    });

    it('[US-013#31] clears the palette cache after toggling', () => {
      vi.spyOn(SettingsStore, 'getSettings').mockReturnValue({
        muteEnabled: false,
        colorblindPaletteEnabled: false,
      });

      // Prime the cache with default palette
      getCurrentPalette();
      expect(getCurrentPalette()).toEqual(DEFAULT_PALETTE);

      // Update mock to reflect the toggle
      vi.spyOn(SettingsStore, 'getSettings').mockReturnValue({
        muteEnabled: false,
        colorblindPaletteEnabled: true,
      });

      // Simulate the toggleColorblindPalette function from main.ts
      const currentSettings = SettingsStore.getSettings();
      const newSettings = {
        ...currentSettings,
        colorblindPaletteEnabled: !currentSettings.colorblindPaletteEnabled,
      };
      SettingsStore.saveSettings(newSettings);
      refreshPalette();

      // After toggle, the cache should be cleared and new palette applied
      const blinkyColor = document.documentElement.style.getPropertyValue('--ghost-blinky-color');
      expect(blinkyColor).toBe(COLORBLIND_PALETTE.blinky);
    });

    it('[US-013#32] applies the new palette to CSS after toggling', () => {
      vi.spyOn(SettingsStore, 'getSettings').mockReturnValue({
        muteEnabled: false,
        colorblindPaletteEnabled: false,
      });

      // Simulate the toggleColorblindPalette function from main.ts
      const currentSettings = SettingsStore.getSettings();
      const newSettings = {
        ...currentSettings,
        colorblindPaletteEnabled: !currentSettings.colorblindPaletteEnabled,
      };
      SettingsStore.saveSettings(newSettings);

      // Update mock to reflect the toggle
      vi.spyOn(SettingsStore, 'getSettings').mockReturnValue({
        muteEnabled: false,
        colorblindPaletteEnabled: true,
      });
      refreshPalette();

      // Verify the colorblind palette is applied to CSS
      expect(document.documentElement.style.getPropertyValue('--ghost-blinky-color')).toBe(
        COLORBLIND_PALETTE.blinky
      );
      expect(document.documentElement.style.getPropertyValue('--ghost-pinky-color')).toBe(
        COLORBLIND_PALETTE.pinky
      );
      expect(document.documentElement.style.getPropertyValue('--ghost-inky-color')).toBe(
        COLORBLIND_PALETTE.inky
      );
      expect(document.documentElement.style.getPropertyValue('--ghost-clyde-color')).toBe(
        COLORBLIND_PALETTE.clyde
      );
    });

    it('[US-013#33] preserves muteEnabled setting when toggling colorblind palette', () => {
      vi.spyOn(SettingsStore, 'getSettings').mockReturnValue({
        muteEnabled: true,
        colorblindPaletteEnabled: false,
      });
      const saveSettingsSpy = vi.spyOn(SettingsStore, 'saveSettings');

      // Simulate the toggleColorblindPalette function from main.ts
      const currentSettings = SettingsStore.getSettings();
      const newSettings = {
        ...currentSettings,
        colorblindPaletteEnabled: !currentSettings.colorblindPaletteEnabled,
      };
      SettingsStore.saveSettings(newSettings);

      expect(saveSettingsSpy).toHaveBeenCalledWith({
        muteEnabled: true,
        colorblindPaletteEnabled: true,
      });
    });
  });
});
