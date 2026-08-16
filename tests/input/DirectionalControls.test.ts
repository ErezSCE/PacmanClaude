import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { InputManager } from '../../src/input/InputManager';
import { DirectionalControls } from '../../src/input/DirectionalControls';

describe('DirectionalControls', () => {
  let inputManager: InputManager;
  let controls: DirectionalControls;
  let mountPoint: HTMLElement;

  beforeEach(() => {
    mountPoint = document.createElement('div');
    document.body.appendChild(mountPoint);
    inputManager = new InputManager(document);
    controls = new DirectionalControls(inputManager, mountPoint);
  });

  afterEach(() => {
    controls.destroy();
    inputManager.destroy();
    mountPoint.remove();
  });

  it('[US-002#1] mounts an accessible group of four directional buttons', () => {
    const element = controls.getElement();
    expect(element.getAttribute('role')).toBe('group');

    const buttons = element.querySelectorAll('button');
    expect(buttons.length).toBe(4);

    buttons.forEach((button) => {
      expect(button.getAttribute('aria-label')).toBeTruthy();
    });
  });

  it('[US-002#1] clicking an on-screen button feeds the shared direction API', () => {
    const upButton = controls
      .getElement()
      .querySelector<HTMLButtonElement>('.onscreen-controls__button--up');

    expect(upButton).not.toBeNull();
    upButton!.click();

    expect(inputManager.direction).toBe('up');
  });

  it('[US-002#1] each direction button maps to the correct direction', () => {
    const directions: Array<[string, string]> = [
      ['up', 'up'],
      ['down', 'down'],
      ['left', 'left'],
      ['right', 'right'],
    ];

    directions.forEach(([className, expected]) => {
      const button = controls
        .getElement()
        .querySelector<HTMLButtonElement>(`.onscreen-controls__button--${className}`);
      button!.click();
      expect(inputManager.direction).toBe(expected);
    });
  });

  it('unmounts the controls from the DOM on destroy()', () => {
    expect(mountPoint.contains(controls.getElement())).toBe(true);
    controls.destroy();
    expect(mountPoint.contains(controls.getElement())).toBe(false);
  });
});
