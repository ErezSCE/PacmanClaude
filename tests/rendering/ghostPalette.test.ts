import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  DEFAULT_PALETTE,
  COLORBLIND_PALETTE,
  getCurrentPalette,
  applyPaletteToCss,
  clearPaletteCache,
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
});
