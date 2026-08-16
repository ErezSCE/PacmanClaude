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
 * Gets the current ghost palette based on settings.
 * Returns the appropriate palette (default or colorblind) based on the colorblindPaletteEnabled setting.
 */
export function getCurrentPalette(): GhostPalette {
  const settings = getSettings();
  return settings.colorblindPaletteEnabled ? COLORBLIND_PALETTE : DEFAULT_PALETTE;
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
