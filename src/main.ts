import { registerServiceWorker } from './sw-register';
import { getCurrentPalette, applyPaletteToCss, toggleColorblindPalette } from './rendering/ghostPalette';

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

  // Expose toggleColorblindPalette globally so the UI layer can call it
  (window as any).toggleColorblindPalette = toggleColorblindPalette;

  // Future: initialise ScreenManager, InputManager, GameState, GameLoop here.
}

boot();

export default boot;
