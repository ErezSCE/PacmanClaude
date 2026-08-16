/**
 * Persists small user preference settings (mute state, colorblind-friendly
 * ghost palette) across browser sessions via localStorage.
 */

export interface Settings {
  muteEnabled: boolean;
  colorblindPaletteEnabled: boolean;
}

const STORAGE_KEY = 'pacman.settings';

const DEFAULT_SETTINGS: Settings = {
  muteEnabled: false,
  colorblindPaletteEnabled: false,
};

function readStorage(): Partial<Settings> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as Partial<Settings>;
  } catch {
    return null;
  }
}

/** Returns the persisted settings, merged with defaults for any missing keys. */
export function getSettings(): Settings {
  const stored = readStorage();
  return { ...DEFAULT_SETTINGS, ...stored };
}

/** Persists the given settings, replacing any previously stored value. */
export function saveSettings(settings: Settings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
