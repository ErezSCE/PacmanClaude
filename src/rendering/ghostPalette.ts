import type { GhostName } from '../types/shared';
import { getSettings, saveSettings } from '../persistence/SettingsStore';

export type GhostPalette = Record<GhostName, string>;

export const DEFAULT_PALETTE: GhostPalette = Object.freeze({
  blinky: '#FF0000',
  pinky: '#FFB8FF',
  inky: '#00FFFF',
  clyde: '#FFB847',
});

export const COLORBLIND_PALETTE: GhostPalette = Object.freeze({
  blinky: '#0072B2',
  pinky: '#F0E442',
  inky: '#CC79A7',
  clyde: '#009E73',
});

export function getCurrentPalette(): GhostPalette {
  return getSettings().colorblindPaletteEnabled ? COLORBLIND_PALETTE : DEFAULT_PALETTE;
}

export function toggleColorblindPalette(): boolean {
  const settings = getSettings();
  settings.colorblindPaletteEnabled = !settings.colorblindPaletteEnabled;
  saveSettings(settings);
  return settings.colorblindPaletteEnabled;
}
