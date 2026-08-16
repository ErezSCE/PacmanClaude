/**
 * Registers the Workbox-generated service worker for offline asset caching.
 * Called from the app entry point to enable PWA offline support.
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | undefined> {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service workers are not supported in this browser.');
    return undefined;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'activated') {
            console.info('Service worker activated — app is available offline.');
          }
        });
      }
    });

    console.info('Service worker registered successfully.');
    return registration;
  } catch (error) {
    console.error('Service worker registration failed:', error);
    return undefined;
  }
}
