/**
 * Persists and retrieves user settings (mute state, colorblind palette preference)
 * across sessions using localStorage.
 */

const STORAGE_KEY = 'pacman_settings';

export type Settings = {
  muteEnabled: boolean;
  colorblindPaletteEnabled: boolean;
};

/**
 * Default settings.
 */
const DEFAULT_SETTINGS: Settings = {
  muteEnabled: false,
  colorblindPaletteEnabled: false,
};

/**
 * Retrieves the settings object from localStorage.
 * Returns defaults if not found or on parse error.
 */
export function getSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed: Settings = JSON.parse(raw);
    // Ensure all required fields exist (backward compatibility)
    return {
      muteEnabled: parsed.muteEnabled ?? DEFAULT_SETTINGS.muteEnabled,
      colorblindPaletteEnabled:
        parsed.colorblindPaletteEnabled ?? DEFAULT_SETTINGS.colorblindPaletteEnabled,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

/**
 * Saves the settings object to localStorage.
 */
export function saveSettings(settings: Settings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
