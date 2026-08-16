import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { InputManager } from '../../src/input/InputManager';

describe('InputManager', () => {
  let inputManager: InputManager;

  beforeEach(() => {
    inputManager = new InputManager();
  });

  afterEach(() => {
    inputManager.destroy();
  });

  function pressKey(key: string): void {
    document.dispatchEvent(new KeyboardEvent('keydown', { key }));
  }

  function releaseKey(key: string): void {
    document.dispatchEvent(new KeyboardEvent('keyup', { key }));
  }

  describe('directional input', () => {
    it('[US-012#1] maps ArrowUp to up direction', () => {
      pressKey('ArrowUp');
      expect(inputManager.direction).toBe('up');
    });

    it('[US-012#1] maps ArrowDown to down direction', () => {
      pressKey('ArrowDown');
      expect(inputManager.direction).toBe('down');
    });

    it('[US-012#1] maps ArrowLeft to left direction', () => {
      pressKey('ArrowLeft');
      expect(inputManager.direction).toBe('left');
    });

    it('[US-012#1] maps ArrowRight to right direction', () => {
      pressKey('ArrowRight');
      expect(inputManager.direction).toBe('right');
    });

    it('[US-012#1] maps WASD keys to directions', () => {
      pressKey('w');
      expect(inputManager.direction).toBe('up');

      pressKey('a');
      expect(inputManager.direction).toBe('left');

      pressKey('s');
      expect(inputManager.direction).toBe('down');

      pressKey('d');
      expect(inputManager.direction).toBe('right');
    });

    it('[US-012#1] maps uppercase WASD keys to directions', () => {
      pressKey('W');
      expect(inputManager.direction).toBe('up');

      pressKey('A');
      expect(inputManager.direction).toBe('left');

      pressKey('S');
      expect(inputManager.direction).toBe('down');

      pressKey('D');
      expect(inputManager.direction).toBe('right');
    });
  });

  describe('pause shortcut', () => {
    it('[US-012#2] P key triggers pause request', () => {
      expect(inputManager.pauseRequested).toBe(false);
      pressKey('p');
      expect(inputManager.pauseRequested).toBe(true);
    });

    it('[US-012#2] Escape key triggers pause request', () => {
      pressKey('Escape');
      expect(inputManager.pauseRequested).toBe(true);
    });

    it('[US-012#2] consumePause clears the pause flag', () => {
      pressKey('p');
      expect(inputManager.pauseRequested).toBe(true);
      inputManager.consumePause();
      expect(inputManager.pauseRequested).toBe(false);
    });

    it('[US-012#2] pause is edge-triggered — pressing P twice without consuming only fires once', () => {
      pressKey('p');
      expect(inputManager.pauseRequested).toBe(true);
      inputManager.consumePause();
      // Second press without release should not re-trigger (held key)
      pressKey('p');
      expect(inputManager.pauseRequested).toBe(false);
      // Release and press again
      releaseKey('p');
      pressKey('p');
      expect(inputManager.pauseRequested).toBe(true);
    });
  });

  describe('mute shortcut', () => {
    it('[US-012#3] M key triggers mute request', () => {
      expect(inputManager.muteRequested).toBe(false);
      pressKey('m');
      expect(inputManager.muteRequested).toBe(true);
    });

    it('[US-012#3] consumeMute clears the mute flag', () => {
      pressKey('m');
      expect(inputManager.muteRequested).toBe(true);
      inputManager.consumeMute();
      expect(inputManager.muteRequested).toBe(false);
    });

    it('[US-012#3] mute is edge-triggered — requires key release before re-trigger', () => {
      pressKey('m');
      expect(inputManager.muteRequested).toBe(true);
      inputManager.consumeMute();
      // Held key should not re-trigger
      pressKey('m');
      expect(inputManager.muteRequested).toBe(false);
      // Release and press again
      releaseKey('m');
      pressKey('m');
      expect(inputManager.muteRequested).toBe(true);
    });
  });

  describe('destroy', () => {
    it('[US-012#1] destroy removes event listeners so keys no longer register', () => {
      inputManager.destroy();
      pressKey('ArrowUp');
      expect(inputManager.direction).toBeNull();
      pressKey('p');
      expect(inputManager.pauseRequested).toBe(false);
      pressKey('m');
      expect(inputManager.muteRequested).toBe(false);
    });
  });

  describe('non-conflicting shortcuts', () => {
    it('[US-012#2] movement keys do not trigger pause or mute', () => {
      pressKey('ArrowUp');
      expect(inputManager.pauseRequested).toBe(false);
      expect(inputManager.muteRequested).toBe(false);

      pressKey('w');
      expect(inputManager.pauseRequested).toBe(false);
      expect(inputManager.muteRequested).toBe(false);
    });

    it('[US-012#3] pause and mute keys do not change direction', () => {
      pressKey('ArrowRight');
      expect(inputManager.direction).toBe('right');

      pressKey('p');
      expect(inputManager.direction).toBe('right');

      pressKey('m');
      expect(inputManager.direction).toBe('right');
    });
  });
});
