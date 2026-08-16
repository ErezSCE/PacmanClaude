import { beforeEach, afterEach } from 'vitest';

// Helper function to clear localStorage
function clearLocalStorage() {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    localStorage.removeItem(key);
  });
}

// Patch localStorage.clear() for jsdom compatibility
// jsdom's localStorage doesn't have a clear() method by default
// We need to add it to the Storage prototype
if (typeof localStorage !== 'undefined' && typeof (localStorage as any).clear !== 'function') {
  // Get the Storage prototype
  const StorageProto = Object.getPrototypeOf(localStorage);
  
  // Add the clear method to the prototype
  if (StorageProto) {
    try {
      // Use Object.defineProperty to add the clear method
      Object.defineProperty(StorageProto, 'clear', {
        value: clearLocalStorage,
        writable: true,
        enumerable: false,
        configurable: true,
      });
    } catch (e) {
      // If that doesn't work, try adding it directly to the instance
      try {
        (localStorage as any).clear = clearLocalStorage;
      } catch (e2) {
        // If that doesn't work either, we'll handle it in the tests
        console.warn('Could not patch localStorage.clear()');
      }
    }
  }
}

// Ensure localStorage is properly initialized for tests
beforeEach(() => {
  clearLocalStorage();
});

afterEach(() => {
  clearLocalStorage();
});
