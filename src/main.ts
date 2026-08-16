import { registerServiceWorker } from './sw-register';

/**
 * Application entry point.
 * Boots the Pac-Man SPA shell: registers the service worker for offline
 * support, then initialises the game engine and screen manager.
 */
async function boot(): Promise<void> {
  // Register service worker for offline caching (PWA)
  await registerServiceWorker();

  // Future: initialise ScreenManager, InputManager, GameState, GameLoop here.
}

boot();

export default boot;
