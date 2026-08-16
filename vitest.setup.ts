import { beforeEach } from 'vitest';

// Create a simple in-memory storage object
const store: Record<string, string> = {};

// Mock localStorage for jsdom environment
const localStorageMock = {
  getItem: (key: string) => store[key] || null,
  setItem: (key: string, value: string) => {
    store[key] = value;
  },
  removeItem: (key: string) => {
    delete store[key];
  },
  clear: () => {
    Object.keys(store).forEach(key => delete store[key]);
  },
  key: (index: number) => {
    const keys = Object.keys(store);
    return keys[index] || null;
  },
  get length() {
    return Object.keys(store).length;
  },
} as Storage;

// Assign the mock to global.localStorage
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
  configurable: true,
});

// Clear localStorage before each test
beforeEach(() => {
  localStorage.clear();
});
