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
 * Callback map for screen actions.
 */
export interface ScreenCallbacks {
  onStart?: () => void;
  onResume?: () => void;
  onRestart?: () => void;
  onMuteToggle?: () => void;
}

/**
 * Manages DOM overlay screens rendered over the Canvas.
 * Creates accessible HTML elements with focusable buttons,
 * manages focus when screens change, and traps focus within
 * modal overlays for full keyboard accessibility.
 */
export class ScreenManager {
  private _currentScreen: ScreenType = 'start';
  private _overlayEl: HTMLElement | null = null;
  private _callbacks: ScreenCallbacks = {};

  constructor(overlayEl?: HTMLElement | null, callbacks?: ScreenCallbacks) {
    this._overlayEl = overlayEl ?? document.getElementById('overlay');
    this._callbacks = callbacks ?? {};
    this._render();
  }

  get currentScreen(): ScreenType {
    return this._currentScreen;
  }

  setCallbacks(callbacks: ScreenCallbacks): void {
    this._callbacks = callbacks;
  }

  show(screen: ScreenType): void {
    this._currentScreen = screen;
    this._render();
  }

  private _render(): void {
    const overlay = this._overlayEl;
    if (!overlay) return;

    // Clear existing content
    overlay.innerHTML = '';

    switch (this._currentScreen) {
      case 'start':
        this._renderStartScreen(overlay);
        break;
      case 'countdown':
        this._renderCountdownScreen(overlay);
        break;
      case 'playing':
        // No overlay during gameplay
        break;
      case 'pause':
        this._renderPauseScreen(overlay);
        break;
      case 'levelComplete':
        this._renderLevelCompleteScreen(overlay);
        break;
      case 'gameOver':
        this._renderGameOverScreen(overlay);
        break;
    }
  }

  private _createPanel(ariaLabel: string): HTMLDivElement {
    const panel = document.createElement('div');
    panel.className = 'screen-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', ariaLabel);
    panel.setAttribute('aria-modal', 'true');
    return panel;
  }

  private _createTitle(text: string): HTMLHeadingElement {
    const title = document.createElement('h1');
    title.className = 'screen-title';
    title.textContent = text;
    return title;
  }

  private _createButton(text: string, onClick: () => void): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.className = 'screen-button';
    btn.textContent = text;
    btn.type = 'button';
    btn.addEventListener('click', onClick);
    return btn;
  }

  private _focusFirst(container: HTMLElement): void {
    // Use requestAnimationFrame to ensure DOM is painted before focusing
    requestAnimationFrame(() => {
      const focusable = container.querySelector<HTMLElement>(
        'button, [tabindex="0"], a[href], input, select, textarea',
      );
      focusable?.focus();
    });
  }

  private _setupFocusTrap(panel: HTMLElement): void {
    panel.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableEls = panel.querySelectorAll<HTMLElement>(
        'button, [tabindex="0"], a[href], input, select, textarea',
      );
      if (focusableEls.length === 0) return;

      const first = focusableEls[0];
      const last = focusableEls[focusableEls.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }

  private _renderStartScreen(overlay: HTMLElement): void {
    const panel = this._createPanel('Start Screen');
    panel.appendChild(this._createTitle('PAC-MAN'));

    const subtitle = document.createElement('p');
    subtitle.className = 'screen-subtitle';
    subtitle.textContent = 'Press Start to Play';
    panel.appendChild(subtitle);

    const startBtn = this._createButton('START', () => {
      this._callbacks.onStart?.();
    });
    panel.appendChild(startBtn);

    const hint = document.createElement('p');
    hint.className = 'screen-hint';
    hint.textContent = 'P/Esc: Pause | M: Mute';
    hint.setAttribute('aria-label', 'Keyboard shortcuts: P or Escape to pause, M to mute');
    panel.appendChild(hint);

    this._setupFocusTrap(panel);
    overlay.appendChild(panel);
    this._focusFirst(panel);
  }

  private _renderCountdownScreen(overlay: HTMLElement): void {
    const panel = this._createPanel('Get Ready');
    panel.appendChild(this._createTitle('READY!'));
    overlay.appendChild(panel);
  }

  private _renderPauseScreen(overlay: HTMLElement): void {
    const panel = this._createPanel('Pause Menu');
    panel.appendChild(this._createTitle('PAUSED'));

    const resumeBtn = this._createButton('RESUME', () => {
      this._callbacks.onResume?.();
    });
    panel.appendChild(resumeBtn);

    const muteBtn = this._createButton('TOGGLE MUTE', () => {
      this._callbacks.onMuteToggle?.();
    });
    panel.appendChild(muteBtn);

    this._setupFocusTrap(panel);
    overlay.appendChild(panel);
    this._focusFirst(panel);
  }

  private _renderLevelCompleteScreen(overlay: HTMLElement): void {
    const panel = this._createPanel('Level Complete');
    panel.appendChild(this._createTitle('LEVEL COMPLETE!'));

    const continueBtn = this._createButton('CONTINUE', () => {
      this._callbacks.onStart?.();
    });
    panel.appendChild(continueBtn);

    this._setupFocusTrap(panel);
    overlay.appendChild(panel);
    this._focusFirst(panel);
  }

  private _renderGameOverScreen(overlay: HTMLElement): void {
    const panel = this._createPanel('Game Over');
    panel.appendChild(this._createTitle('GAME OVER'));

    const restartBtn = this._createButton('PLAY AGAIN', () => {
      this._callbacks.onRestart?.();
    });
    panel.appendChild(restartBtn);

    this._setupFocusTrap(panel);
    overlay.appendChild(panel);
    this._focusFirst(panel);
  }
}
