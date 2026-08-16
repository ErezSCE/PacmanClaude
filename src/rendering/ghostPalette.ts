/**
 * Ghost color palettes for default and colorblind-friendly modes.
 * Provides functions to get and apply the current palette.
 */

import type { GhostName } from '../types/shared';
import { getSettings } from '../persistence/SettingsStore';

/**
 * Type for ghost color palettes, keyed by ghost name.
 */
export type GhostPalette = Record<GhostName, string>;

/**
 * Default ghost colors (classic Pac-Man palette).
 */
export const DEFAULT_PALETTE: GhostPalette = {
  blinky: '#FF0000', // Red
  pinky: '#FFB8FF', // Pink
  inky: '#00FFFF', // Cyan
  clyde: '#FFB847', // Orange
};

/**
 * Colorblind-friendly ghost colors (designed for deuteranopia/protanopia).
 * Uses blue, yellow, purple, and green for better distinction.
 */
export const COLORBLIND_PALETTE: GhostPalette = {
  blinky: '#0072B2', // Blue
  pinky: '#F0E442', // Yellow
  inky: '#CC79A7', // Purple
  clyde: '#009E73', // Green
};

/**
 * Cached palette to avoid repeated localStorage reads.
 * IMPORTANT: This cache must be cleared whenever settings change.
 * Always call clearPaletteCache() after saveSettings() to ensure the palette stays in sync.
 */
let cachedPalette: GhostPalette | null = null;

/**
 * Gets the current ghost palette based on settings.
 * Returns the appropriate palette (default or colorblind) based on the colorblindPaletteEnabled setting.
 * Results are cached to avoid repeated localStorage reads.
 */
export function getCurrentPalette(): GhostPalette {
  if (cachedPalette === null) {
    const settings = getSettings();
    cachedPalette = settings.colorblindPaletteEnabled ? COLORBLIND_PALETTE : DEFAULT_PALETTE;
  }
  return cachedPalette;
}

/**
 * Clears the cached palette. Call this when settings change.
 */
export function clearPaletteCache(): void {
  cachedPalette = null;
}

/**
 * Refreshes and applies the current palette based on the latest settings.
 * Clears the palette cache and applies the appropriate palette (default or colorblind)
 * based on the current colorblindPaletteEnabled setting.
 * The caller is responsible for persisting any setting changes via saveSettings().
 */
export function refreshPalette(): void {
  clearPaletteCache();
  const palette = getCurrentPalette();
  applyPaletteToCss(palette);
}

/**
 * Applies a palette to CSS variables.
 * Call this on app startup and when the palette setting changes.
 * @param palette - The palette to apply (DEFAULT_PALETTE or COLORBLIND_PALETTE)
 */
export function applyPaletteToCss(palette: GhostPalette): void {
  const root = document.documentElement;
  root.style.setProperty('--ghost-blinky-color', palette.blinky);
  root.style.setProperty('--ghost-pinky-color', palette.pinky);
  root.style.setProperty('--ghost-inky-color', palette.inky);
  root.style.setProperty('--ghost-clyde-color', palette.clyde);
}
