import type { Direction } from '../types/shared';
import type { InputManager } from './InputManager';

interface DirectionButtonSpec {
  direction: Direction;
  label: string;
  symbol: string;
}

const BUTTON_SPECS: DirectionButtonSpec[] = [
  { direction: 'up', label: 'Move up', symbol: '\u25B2' },
  { direction: 'left', label: 'Move left', symbol: '\u25C0' },
  { direction: 'right', label: 'Move right', symbol: '\u25B6' },
  { direction: 'down', label: 'Move down', symbol: '\u25BC' },
];

/**
 * Mounts an accessible, touch-friendly D-pad of four directional buttons as
 * a DOM overlay and feeds every press into the shared InputManager
 * directional-intent API, so on-screen taps behave identically to keyboard
 * and swipe input.
 */
export class DirectionalControls {
  private readonly element: HTMLElement;
  private readonly cleanupFns: Array<() => void> = [];

  constructor(
    private readonly inputManager: InputManager,
    private readonly mountPoint: HTMLElement,
  ) {
    this.element = this.buildElement();
    this.mountPoint.appendChild(this.element);
  }

  /** Returns the root DOM element for the directional control group. */
  getElement(): HTMLElement {
    return this.element;
  }

  /** Removes all listeners and unmounts the controls from the DOM. */
  destroy(): void {
    this.cleanupFns.forEach((cleanup) => cleanup());
    this.cleanupFns.length = 0;
    this.element.remove();
  }

  private buildElement(): HTMLElement {
    const group = document.createElement('div');
    group.classList.add('onscreen-controls');
    group.setAttribute('role', 'group');
    group.setAttribute('aria-label', 'On-screen directional controls');

    BUTTON_SPECS.forEach((spec) => {
      group.appendChild(this.buildButton(spec));
    });

    return group;
  }

  private buildButton({ direction, label, symbol }: DirectionButtonSpec): HTMLButtonElement {
    const button = document.createElement('button');
    button.type = 'button';
    button.classList.add('onscreen-controls__button', `onscreen-controls__button--${direction}`);
    button.setAttribute('aria-label', label);
    button.textContent = symbol;

    const activate = (event: Event): void => {
      event.preventDefault();
      this.inputManager.setDirection(direction);
    };

    button.addEventListener('click', activate);
    button.addEventListener('touchstart', activate, { passive: false });

    this.cleanupFns.push(() => {
      button.removeEventListener('click', activate);
      button.removeEventListener('touchstart', activate);
    });

    return button;
  }
}
