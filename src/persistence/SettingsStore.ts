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
    const parsed = JSON.parse(raw);
    // Guard against non-object values (e.g., null, primitives, arrays)
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return { ...DEFAULT_SETTINGS };
    }
    // Ensure all required fields exist with explicit type validation.
    // NOTE: Each field is validated individually with typeof checks.
    // If new fields are added to Settings, add corresponding validation here.
    return {
      muteEnabled:
        typeof parsed.muteEnabled === 'boolean'
          ? parsed.muteEnabled
          : DEFAULT_SETTINGS.muteEnabled,
      colorblindPaletteEnabled:
        typeof parsed.colorblindPaletteEnabled === 'boolean'
          ? parsed.colorblindPaletteEnabled
          : DEFAULT_SETTINGS.colorblindPaletteEnabled,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

/**
 * Saves the settings object to localStorage.
 * Silently fails if storage quota is exceeded.
 */
export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Storage full or unavailable — settings will not persist
  }
}
