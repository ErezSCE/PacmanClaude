import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ScreenManager } from '../../src/ui/ScreenManager';
import * as HighScoreStore from '../../src/persistence/HighScoreStore';

// Mock the HighScoreStore module
vi.mock('../../src/persistence/HighScoreStore', () => ({
  qualifiesForHighScore: vi.fn(),
  saveHighScore: vi.fn(),
}));

describe('ScreenManager', () => {
  let screenManager: ScreenManager;

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();

    // Reset DOM to a clean state
    document.body.innerHTML = `
      <div data-screen="start" class="screen">Start Screen</div>
      <div data-screen="gameOver" class="screen hidden">
        <div id="game-over-message">Game Over!</div>
        <div id="initials-form" class="hidden">
          <input id="initials-input" type="text" maxlength="3" />
          <button id="submit-initials-btn">Submit</button>
        </div>
      </div>
    `;

    screenManager = new ScreenManager();
  });

  describe('[US-011#11] ScreenManager shows initials form for qualifying scores', () => {
    it('should display the initials form when score qualifies for high scores', () => {
      // Mock qualifiesForHighScore to return true
      vi.mocked(HighScoreStore.qualifiesForHighScore).mockReturnValue(true);

      const initialsForm = document.getElementById('initials-form');
      expect(initialsForm?.classList.contains('hidden')).toBe(true);

      // Show game-over screen with a qualifying score
      screenManager.show('gameOver', 5000);

      // Initials form should now be visible
      expect(initialsForm?.classList.contains('hidden')).toBe(false);
    });

    it('should update game-over message for qualifying score', () => {
      vi.mocked(HighScoreStore.qualifiesForHighScore).mockReturnValue(true);

      const gameOverMessage = document.getElementById('game-over-message');
      screenManager.show('gameOver', 5000);

      expect(gameOverMessage?.textContent).toBe('Game Over! Score: 5000 - Enter your initials:');
    });

    it('should focus the initials input when showing qualifying score', () => {
      vi.mocked(HighScoreStore.qualifiesForHighScore).mockReturnValue(true);

      const initialsInput = document.getElementById('initials-input') as HTMLInputElement;
      screenManager.show('gameOver', 5000);

      expect(document.activeElement).toBe(initialsInput);
    });

    it('should clear the initials input when showing qualifying score', () => {
      vi.mocked(HighScoreStore.qualifiesForHighScore).mockReturnValue(true);

      const initialsInput = document.getElementById('initials-input') as HTMLInputElement;
      initialsInput.value = 'OLD';

      screenManager.show('gameOver', 5000);

      expect(initialsInput.value).toBe('');
    });
  });

  describe('[US-011#12] ScreenManager hides initials form for non-qualifying scores', () => {
    it('should hide the initials form when score does not qualify', () => {
      vi.mocked(HighScoreStore.qualifiesForHighScore).mockReturnValue(false);

      const initialsForm = document.getElementById('initials-form');
      initialsForm?.classList.remove('hidden'); // Start visible

      screenManager.show('gameOver', 100);

      expect(initialsForm?.classList.contains('hidden')).toBe(true);
    });

    it('should update game-over message for non-qualifying score', () => {
      vi.mocked(HighScoreStore.qualifiesForHighScore).mockReturnValue(false);

      const gameOverMessage = document.getElementById('game-over-message');
      screenManager.show('gameOver', 100);

      expect(gameOverMessage?.textContent).toBe('Game Over! Score: 100');
    });
  });

  describe('[US-011#13] ScreenManager input filtering restricts to 3 uppercase alpha characters', () => {
    it('should filter out non-alphabetic characters', () => {
      vi.mocked(HighScoreStore.qualifiesForHighScore).mockReturnValue(true);
      screenManager.show('gameOver', 5000);

      const initialsInput = document.getElementById('initials-input') as HTMLInputElement;
      initialsInput.value = 'A1B2C3';
      initialsInput.dispatchEvent(new Event('input'));

      expect(initialsInput.value).toBe('ABC');
    });

    it('should convert lowercase to uppercase', () => {
      vi.mocked(HighScoreStore.qualifiesForHighScore).mockReturnValue(true);
      screenManager.show('gameOver', 5000);

      const initialsInput = document.getElementById('initials-input') as HTMLInputElement;
      initialsInput.value = 'abc';
      initialsInput.dispatchEvent(new Event('input'));

      expect(initialsInput.value).toBe('ABC');
    });

    it('should limit input to 3 characters', () => {
      vi.mocked(HighScoreStore.qualifiesForHighScore).mockReturnValue(true);
      screenManager.show('gameOver', 5000);

      const initialsInput = document.getElementById('initials-input') as HTMLInputElement;
      initialsInput.value = 'ABCDEF';
      initialsInput.dispatchEvent(new Event('input'));

      expect(initialsInput.value).toBe('ABC');
    });

    it('should handle mixed case and special characters', () => {
      vi.mocked(HighScoreStore.qualifiesForHighScore).mockReturnValue(true);
      screenManager.show('gameOver', 5000);

      const initialsInput = document.getElementById('initials-input') as HTMLInputElement;
      initialsInput.value = 'a@b#c!';
      initialsInput.dispatchEvent(new Event('input'));

      expect(initialsInput.value).toBe('ABC');
    });

    it('should allow spaces to be filtered out', () => {
      vi.mocked(HighScoreStore.qualifiesForHighScore).mockReturnValue(true);
      screenManager.show('gameOver', 5000);

      const initialsInput = document.getElementById('initials-input') as HTMLInputElement;
      initialsInput.value = 'A B C';
      initialsInput.dispatchEvent(new Event('input'));

      expect(initialsInput.value).toBe('ABC');
    });
  });

  describe('[US-011#14] ScreenManager submitInitials calls saveHighScore with correct data', () => {
    it('should call saveHighScore with initials and score when form is submitted', () => {
      vi.mocked(HighScoreStore.qualifiesForHighScore).mockReturnValue(true);
      screenManager.show('gameOver', 5000);

      const initialsInput = document.getElementById('initials-input') as HTMLInputElement;
      initialsInput.value = 'ABC';
      initialsInput.dispatchEvent(new Event('input'));

      const submitBtn = document.getElementById('submit-initials-btn');
      submitBtn?.click();

      expect(HighScoreStore.saveHighScore).toHaveBeenCalledWith({
        initials: 'ABC',
        score: 5000,
      });
    });

    it('should transition to start screen after submitting initials', () => {
      vi.mocked(HighScoreStore.qualifiesForHighScore).mockReturnValue(true);
      screenManager.show('gameOver', 5000);

      const initialsInput = document.getElementById('initials-input') as HTMLInputElement;
      initialsInput.value = 'ABC';
      initialsInput.dispatchEvent(new Event('input'));

      const submitBtn = document.getElementById('submit-initials-btn');
      submitBtn?.click();

      expect(screenManager.currentScreen).toBe('start');
    });

    it('should not submit if initials are incomplete', () => {
      vi.mocked(HighScoreStore.qualifiesForHighScore).mockReturnValue(true);
      screenManager.show('gameOver', 5000);

      const initialsInput = document.getElementById('initials-input') as HTMLInputElement;
      initialsInput.value = 'AB'; // Only 2 characters
      initialsInput.dispatchEvent(new Event('input'));

      const submitBtn = document.getElementById('submit-initials-btn');
      submitBtn?.click();

      expect(HighScoreStore.saveHighScore).not.toHaveBeenCalled();
    });

    it('should submit on Enter key when initials are complete', () => {
      vi.mocked(HighScoreStore.qualifiesForHighScore).mockReturnValue(true);
      screenManager.show('gameOver', 5000);

      const initialsInput = document.getElementById('initials-input') as HTMLInputElement;
      initialsInput.value = 'ABC';
      initialsInput.dispatchEvent(new Event('input'));

      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      initialsInput.dispatchEvent(enterEvent);

      expect(HighScoreStore.saveHighScore).toHaveBeenCalledWith({
        initials: 'ABC',
        score: 5000,
      });
    });

    it('should not submit on Enter key if initials are incomplete', () => {
      vi.mocked(HighScoreStore.qualifiesForHighScore).mockReturnValue(true);
      screenManager.show('gameOver', 5000);

      const initialsInput = document.getElementById('initials-input') as HTMLInputElement;
      initialsInput.value = 'AB'; // Only 2 characters
      initialsInput.dispatchEvent(new Event('input'));

      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      initialsInput.dispatchEvent(enterEvent);

      expect(HighScoreStore.saveHighScore).not.toHaveBeenCalled();
    });
  });

  describe('[US-011#15] ScreenManager screen transitions work correctly', () => {
    it('should set currentScreen to the requested screen', () => {
      screenManager.show('start');
      expect(screenManager.currentScreen).toBe('start');

      screenManager.show('gameOver', 0);
      expect(screenManager.currentScreen).toBe('gameOver');
    });

    it('should hide all screens before showing the requested one', () => {
      const startScreen = document.querySelector('[data-screen="start"]');
      const gameOverScreen = document.querySelector('[data-screen="gameOver"]');

      screenManager.show('gameOver', 0);

      expect(startScreen?.classList.contains('hidden')).toBe(true);
      expect(gameOverScreen?.classList.contains('hidden')).toBe(false);
    });

    it('should hide all screens when hide() is called', () => {
      screenManager.show('gameOver', 0);
      screenManager.hide();

      const screens = document.querySelectorAll('[data-screen]');
      screens.forEach((screen) => {
        expect(screen.classList.contains('hidden')).toBe(true);
      });
    });

    it('should set currentScreen to start when hide() is called', () => {
      screenManager.show('gameOver', 0);
      screenManager.hide();

      expect(screenManager.currentScreen).toBe('start');
    });
  });

  describe('[US-011#16] ScreenManager event listeners are set up lazily', () => {
    it('should set up event listeners on first show() call', () => {
      const initialsInput = document.getElementById('initials-input') as HTMLInputElement;
      vi.mocked(HighScoreStore.qualifiesForHighScore).mockReturnValue(true);

      // Before show(), input event should not be handled
      screenManager.show('gameOver', 5000);

      // After show(), input event should be handled
      initialsInput.value = 'abc';
      initialsInput.dispatchEvent(new Event('input'));

      expect(initialsInput.value).toBe('ABC');
    });

    it('should not set up event listeners twice', () => {
      vi.mocked(HighScoreStore.qualifiesForHighScore).mockReturnValue(true);

      screenManager.show('gameOver', 5000);
      const initialsInput = document.getElementById('initials-input') as HTMLInputElement;
      const initialListenerCount = initialsInput.onchange ? 1 : 0;

      screenManager.show('start');
      screenManager.show('gameOver', 5000);

      // Listeners should still work, but not be duplicated
      initialsInput.value = 'xyz';
      initialsInput.dispatchEvent(new Event('input'));
      expect(initialsInput.value).toBe('XYZ');
    });
  });
});
