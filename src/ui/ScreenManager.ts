import { qualifiesForHighScore, saveHighScore } from '../persistence/HighScoreStore';

/**
 * Screen types for the DOM overlay state machine.
 */
export type ScreenType =
  | 'start'
  | 'countdown'
  | 'playing'
  | 'pause'
  | 'levelComplete'
  | 'gameOver';

/**
 * Manages DOM overlay screens rendered over the Canvas.
 * Handles screen transitions and integrates the initials-entry flow
 * for qualifying high scores.
 */
export class ScreenManager {
  private _currentScreen: ScreenType = 'start';
  private gameOverScore: number = 0;
  private initialsInput: string = '';

  constructor() {
    this.setupEventListeners();
  }

  get currentScreen(): ScreenType {
    return this._currentScreen;
  }

  /**
   * Setup event listeners for initials input and screen interactions.
   */
  private setupEventListeners(): void {
    const initialsInputEl = document.getElementById('initials-input') as HTMLInputElement;
    const submitInitialsBtn = document.getElementById('submit-initials-btn');

    if (initialsInputEl) {
      initialsInputEl.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        // Limit to 3 uppercase letters
        this.initialsInput = target.value.toUpperCase().slice(0, 3);
        target.value = this.initialsInput;
      });

      initialsInputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && this.initialsInput.length === 3) {
          this.submitInitials();
        }
      });
    }

    if (submitInitialsBtn) {
      submitInitialsBtn.addEventListener('click', () => {
        if (this.initialsInput.length === 3) {
          this.submitInitials();
        }
      });
    }
  }

  /**
   * Submit initials and save the high score.
   */
  private submitInitials(): void {
    if (this.initialsInput.length === 3) {
      saveHighScore({
        initials: this.initialsInput,
        score: this.gameOverScore,
      });
      this.hide();
      this.show('start');
    }
  }

  /**
   * Show a screen overlay.
   * For game-over screen, pass the final score to check if it qualifies for high scores.
   */
  show(screen: ScreenType, score?: number): void {
    this._currentScreen = screen;

    // Hide all screens first
    const screens = document.querySelectorAll('[data-screen]');
    screens.forEach((el) => el.classList.add('hidden'));

    const screenEl = document.querySelector(`[data-screen="${screen}"]`);
    if (screenEl) {
      screenEl.classList.remove('hidden');
    }

    // Handle game-over screen with initials entry
    if (screen === 'gameOver' && score !== undefined) {
      this.gameOverScore = score;
      const qualifies = qualifiesForHighScore(score);

      const initialsForm = document.getElementById('initials-form');
      const gameOverMessage = document.getElementById('game-over-message');

      if (initialsForm) {
        if (qualifies) {
          // Show initials entry form for qualifying scores
          initialsForm.classList.remove('hidden');
          const initialsInputEl = document.getElementById('initials-input') as HTMLInputElement;
          if (initialsInputEl) {
            this.initialsInput = '';
            initialsInputEl.value = '';
            initialsInputEl.focus();
          }
          if (gameOverMessage) {
            gameOverMessage.textContent = `Game Over! Score: ${score} - Enter your initials:`;
          }
        } else {
          // Hide initials entry form for non-qualifying scores
          initialsForm.classList.add('hidden');
          if (gameOverMessage) {
            gameOverMessage.textContent = `Game Over! Score: ${score}`;
          }
        }
      }
    }
  }

  /**
   * Hide the current screen overlay.
   */
  hide(): void {
    const screens = document.querySelectorAll('[data-screen]');
    screens.forEach((el) => el.classList.add('hidden'));
    this._currentScreen = 'start';
  }
}
