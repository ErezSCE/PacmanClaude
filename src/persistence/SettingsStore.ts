/**
 * Persists mute state and colorblind-friendly ghost palette preference
 * across sessions using localStorage.
 */

const STORAGE_KEY = 'pacman_settings';

export type Settings = {
  muteEnabled: boolean;
  colorblindPaletteEnabled: boolean;
};

const DEFAULT_SETTINGS: Settings = {
  muteEnabled: false,
  colorblindPaletteEnabled: false,
};

/**
 * Retrieves settings from localStorage, falling back to defaults.
 */
export function getSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return {
      muteEnabled: typeof parsed.muteEnabled === 'boolean' ? parsed.muteEnabled : DEFAULT_SETTINGS.muteEnabled,
      colorblindPaletteEnabled: typeof parsed.colorblindPaletteEnabled === 'boolean'
        ? parsed.colorblindPaletteEnabled
        : DEFAULT_SETTINGS.colorblindPaletteEnabled,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

/**
 * Saves settings to localStorage.
 */
export function saveSettings(settings: Settings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
