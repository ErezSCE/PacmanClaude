import { registerServiceWorker } from './sw-register';
import { getCurrentPalette, applyPaletteToCss, refreshPalette } from './rendering/ghostPalette';
import { getSettings, saveSettings } from './persistence/SettingsStore';

declare global {
  interface Window {
    toggleColorblindPalette: () => void;
  }
}

/**
 * Application entry point.
 * Boots the Pac-Man SPA shell: registers the service worker for offline
 * support, then initialises the game engine and screen manager.
 */
async function boot(): Promise<void> {
  // Register service worker for offline caching (PWA)
  await registerServiceWorker();

  // Apply the current ghost palette (default or colorblind) from settings
  applyPaletteToCss(getCurrentPalette());

  // Expose toggleColorblindPalette globally for UI controls
  // Wraps the palette toggle with persistence logic
  window.toggleColorblindPalette = (): void => {
    const currentSettings = getSettings();
    const newSettings = {
      ...currentSettings,
      colorblindPaletteEnabled: !currentSettings.colorblindPaletteEnabled,
    };
    saveSettings(newSettings);
    refreshPalette();
  };

  // Future: initialise ScreenManager, InputManager, GameState, GameLoop here.
}

boot();

export default boot;
