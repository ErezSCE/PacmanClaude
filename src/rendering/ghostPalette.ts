/**
 * Ghost color palettes for default and colorblind-friendly modes.
 * Provides functions to get and apply the current palette.
 */

import { getSettings } from '../persistence/SettingsStore';

/**
 * Default ghost colors (classic Pac-Man palette).
 */
export const DEFAULT_PALETTE = {
  blinky: '#FF0000', // Red
  pinky: '#FFB8FF', // Pink
  inky: '#00FFFF', // Cyan
  clyde: '#FFB847', // Orange
};

/**
 * Colorblind-friendly ghost colors (designed for deuteranopia/protanopia).
 * Uses blue, yellow, purple, and green for better distinction.
 */
export const COLORBLIND_PALETTE = {
  blinky: '#0072B2', // Blue
  pinky: '#F0E442', // Yellow
  inky: '#CC79A7', // Purple
  clyde: '#009E73', // Green
};

/**
 * Gets the current ghost palette based on settings.
 */
export function getCurrentPalette(): typeof DEFAULT_PALETTE {
  const settings = getSettings();
  return settings.colorblindPaletteEnabled ? COLORBLIND_PALETTE : DEFAULT_PALETTE;
}

/**
 * Applies the current palette to CSS variables.
 * Call this on app startup and when the palette setting changes.
 */
export function applyPaletteToCss(): void {
  const palette = getCurrentPalette();
  const root = document.documentElement;
  root.style.setProperty('--ghost-blinky-color', palette.blinky);
  root.style.setProperty('--ghost-pinky-color', palette.pinky);
  root.style.setProperty('--ghost-inky-color', palette.inky);
  root.style.setProperty('--ghost-clyde-color', palette.clyde);
}
