import { getHighScores, saveHighScore, qualifiesForHighScore, type HighScoreEntry } from '../persistence/HighScoreStore';

export type ScreenType =
  | 'start'
  | 'countdown'
  | 'playing'
  | 'pause'
  | 'levelComplete'
  | 'gameOver';

export interface ScreenCallbacks {
  onStart?: () => void;
  onResume?: () => void;
  onRestart?: () => void;
  onMuteToggle?: () => void;
  onColorblindToggle?: () => void;
}

/**
 * Manages DOM overlay screens rendered over the Canvas.
 */
export class ScreenManager {
  private _currentScreen: ScreenType = 'start';
  private overlayEl: HTMLElement | null;
  private callbacks: ScreenCallbacks = {};
  private countdownValue = 3;

  constructor(overlayEl?: HTMLElement | null, callbacks?: ScreenCallbacks) {
    this.overlayEl = overlayEl ?? document.getElementById('overlay');
    this.callbacks = callbacks ?? {};
    this.render();
  }

  get currentScreen(): ScreenType {
    return this._currentScreen;
  }

  setCallbacks(callbacks: ScreenCallbacks): void {
    this.callbacks = callbacks;
  }

  show(screen: ScreenType): void {
    this._currentScreen = screen;
    this.render();
  }

  /** Show countdown with animated numbers. */
  showCountdown(onComplete: () => void): void {
    this._currentScreen = 'countdown';
    this.countdownValue = 3;
    this.renderCountdown();

    const interval = setInterval(() => {
      this.countdownValue--;
      if (this.countdownValue <= 0) {
        clearInterval(interval);
        this.renderCountdownGo();
        setTimeout(() => {
          this._currentScreen = 'playing';
          this.render();
          onComplete();
        }, 500);
      } else {
        this.renderCountdown();
      }
    }, 1000);
  }

  /** Show game over with optional initials entry. */
  showGameOver(finalScore: number): void {
    this._currentScreen = 'gameOver';
    this.renderGameOver(finalScore);
  }

  /** Show level complete briefly. */
  showLevelComplete(level: number): void {
    this._currentScreen = 'levelComplete';
    this.renderLevelComplete(level);
  }

  private render(): void {
    const overlay = this.overlayEl;
    if (!overlay) return;
    overlay.innerHTML = '';

    switch (this._currentScreen) {
      case 'start': this.renderStart(overlay); break;
      case 'pause': this.renderPause(overlay); break;
      case 'playing': break; // No overlay during gameplay
      case 'countdown': this.renderCountdown(); break;
      case 'gameOver': break; // Handled by showGameOver
      case 'levelComplete': break; // Handled by showLevelComplete
    }
  }

  private renderStart(overlay: HTMLElement): void {
    const container = this.createOverlayBox();

    const title = document.createElement('h1');
    title.textContent = 'PAC-MAN';
    title.style.cssText = 'color: #FFFF00; font-size: 2em; margin-bottom: 20px; text-align: center;';
    container.appendChild(title);

    // High score display
    const scores = getHighScores();
    if (scores.length > 0) {
      const hsLabel = document.createElement('p');
      hsLabel.textContent = `HIGH SCORE: ${scores[0].score}`;
      hsLabel.style.cssText = 'color: #FFF; font-size: 0.8em; margin-bottom: 16px; text-align: center;';
      container.appendChild(hsLabel);
    }

    // Start button
    const startBtn = this.createButton('START GAME', () => {
      this.callbacks.onStart?.();
    });
    container.appendChild(startBtn);

    // Settings
    const settingsRow = document.createElement('div');
    settingsRow.style.cssText = 'margin-top: 16px; display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;';

    const muteBtn = this.createButton('MUTE: OFF', () => {
      this.callbacks.onMuteToggle?.();
    }, true);
    muteBtn.id = 'mute-btn';
    settingsRow.appendChild(muteBtn);

    const cbBtn = this.createButton('COLORBLIND', () => {
      this.callbacks.onColorblindToggle?.();
    }, true);
    settingsRow.appendChild(cbBtn);
    container.appendChild(settingsRow);

    // High score list
    if (scores.length > 0) {
      const listTitle = document.createElement('h3');
      listTitle.textContent = 'HIGH SCORES';
      listTitle.style.cssText = 'color: #FFFF00; font-size: 0.7em; margin-top: 20px; text-align: center;';
      container.appendChild(listTitle);

      const list = document.createElement('ol');
      list.style.cssText = 'color: #FFF; font-size: 0.6em; list-style-position: inside; padding: 0; text-align: center;';
      for (const entry of scores.slice(0, 10)) {
        const li = document.createElement('li');
        li.textContent = `${entry.initials} - ${entry.score}`;
        list.appendChild(li);
      }
      container.appendChild(list);
    }

    overlay.appendChild(container);
    startBtn.focus();
  }

  private renderPause(overlay: HTMLElement): void {
    const container = this.createOverlayBox();

    const title = document.createElement('h2');
    title.textContent = 'PAUSED';
    title.style.cssText = 'color: #FFFF00; font-size: 1.5em; margin-bottom: 20px; text-align: center;';
    container.appendChild(title);

    const resumeBtn = this.createButton('RESUME', () => {
      this.callbacks.onResume?.();
    });
    container.appendChild(resumeBtn);

    overlay.appendChild(container);
    resumeBtn.focus();
  }

  private renderCountdown(): void {
    const overlay = this.overlayEl;
    if (!overlay) return;
    overlay.innerHTML = '';

    const num = document.createElement('div');
    num.textContent = String(this.countdownValue);
    num.style.cssText = 'color: #FFFF00; font-size: 4em; text-align: center; animation: pulse 0.3s;';
    num.setAttribute('role', 'status');
    num.setAttribute('aria-live', 'polite');
    overlay.appendChild(num);
  }

  private renderCountdownGo(): void {
    const overlay = this.overlayEl;
    if (!overlay) return;
    overlay.innerHTML = '';

    const go = document.createElement('div');
    go.textContent = 'GO!';
    go.style.cssText = 'color: #FFFF00; font-size: 3em; text-align: center;';
    go.setAttribute('role', 'status');
    overlay.appendChild(go);
  }

  private renderGameOver(finalScore: number): void {
    const overlay = this.overlayEl;
    if (!overlay) return;
    overlay.innerHTML = '';

    const container = this.createOverlayBox();

    const title = document.createElement('h2');
    title.textContent = 'GAME OVER';
    title.style.cssText = 'color: #FF0000; font-size: 1.5em; margin-bottom: 16px; text-align: center;';
    container.appendChild(title);

    const scoreEl = document.createElement('p');
    scoreEl.textContent = `FINAL SCORE: ${finalScore}`;
    scoreEl.style.cssText = 'color: #FFF; font-size: 0.9em; margin-bottom: 16px; text-align: center;';
    container.appendChild(scoreEl);

    // Check if score qualifies for high score list
    if (qualifiesForHighScore(finalScore)) {
      const prompt = document.createElement('p');
      prompt.textContent = 'NEW HIGH SCORE! Enter initials:';
      prompt.style.cssText = 'color: #FFFF00; font-size: 0.7em; margin-bottom: 8px; text-align: center;';
      container.appendChild(prompt);

      const input = document.createElement('input');
      input.type = 'text';
      input.maxLength = 3;
      input.placeholder = 'AAA';
      input.style.cssText = `
        background: #000; color: #FFF; border: 2px solid #FFFF00;
        font-family: inherit; font-size: 1.2em; text-align: center;
        padding: 4px 8px; width: 80px; text-transform: uppercase;
      `;
      input.addEventListener('input', () => {
        input.value = input.value.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 3);
      });
      container.appendChild(input);

      const submitBtn = this.createButton('SUBMIT', () => {
        const initials = input.value.toUpperCase();
        if (initials.length === 3) {
          saveHighScore({ initials, score: finalScore });
          // Re-render game over without input
          this.renderGameOverDone(finalScore);
        }
      });
      submitBtn.style.marginTop = '8px';
      container.appendChild(submitBtn);

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && input.value.length === 3) {
          submitBtn.click();
        }
      });

      overlay.appendChild(container);
      input.focus();
    } else {
      this.appendRestartButton(container);
      overlay.appendChild(container);
    }
  }

  private renderGameOverDone(finalScore: number): void {
    const overlay = this.overlayEl;
    if (!overlay) return;
    overlay.innerHTML = '';

    const container = this.createOverlayBox();

    const title = document.createElement('h2');
    title.textContent = 'GAME OVER';
    title.style.cssText = 'color: #FF0000; font-size: 1.5em; margin-bottom: 16px; text-align: center;';
    container.appendChild(title);

    const scoreEl = document.createElement('p');
    scoreEl.textContent = `SCORE: ${finalScore}`;
    scoreEl.style.cssText = 'color: #FFF; font-size: 0.9em; margin-bottom: 8px; text-align: center;';
    container.appendChild(scoreEl);

    const saved = document.createElement('p');
    saved.textContent = 'Score saved!';
    saved.style.cssText = 'color: #FFFF00; font-size: 0.7em; margin-bottom: 16px; text-align: center;';
    container.appendChild(saved);

    this.appendRestartButton(container);
    overlay.appendChild(container);
  }

  private renderLevelComplete(level: number): void {
    const overlay = this.overlayEl;
    if (!overlay) return;
    overlay.innerHTML = '';

    const msg = document.createElement('div');
    msg.textContent = `LEVEL ${level} COMPLETE!`;
    msg.style.cssText = 'color: #FFFF00; font-size: 1.5em; text-align: center;';
    msg.setAttribute('role', 'status');
    overlay.appendChild(msg);
  }

  private appendRestartButton(container: HTMLElement): void {
    const btn = this.createButton('PLAY AGAIN', () => {
      this.callbacks.onRestart?.();
    });
    btn.style.marginTop = '16px';
    container.appendChild(btn);
    setTimeout(() => btn.focus(), 50);
  }

  private createOverlayBox(): HTMLDivElement {
    const box = document.createElement('div');
    box.style.cssText = `
      background: rgba(0,0,0,0.85); padding: 24px 32px;
      border: 2px solid #FFFF00; border-radius: 8px;
      display: flex; flex-direction: column; align-items: center;
      font-family: 'Press Start 2P', monospace;
    `;
    return box;
  }

  private createButton(text: string, onClick: () => void, small = false): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.type = 'button';
    const fontSize = small ? '0.6em' : '0.8em';
    const pad = small ? '6px 12px' : '10px 20px';
    btn.style.cssText = `
      background: #000; color: #FFF; border: 2px solid #FFFF00;
      font-family: inherit; font-size: ${fontSize}; padding: ${pad};
      cursor: pointer;
    `;
    btn.addEventListener('click', onClick);
    btn.addEventListener('mouseenter', () => { btn.style.background = '#333'; });
    btn.addEventListener('mouseleave', () => { btn.style.background = '#000'; });
    return btn;
  }
}
