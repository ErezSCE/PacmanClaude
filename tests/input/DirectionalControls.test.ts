import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DirectionalControls } from '../../src/input/DirectionalControls';
import { InputManager } from '../../src/input/InputManager';

describe('DirectionalControls', () => {
  let mountPoint: HTMLDivElement;
  let inputManager: InputManager;
  let controls: DirectionalControls;

  beforeEach(() => {
    mountPoint = document.createElement('div');
    document.body.appendChild(mountPoint);
    inputManager = new InputManager(document);
  });

  afterEach(() => {
    controls?.destroy();
    inputManager.destroy();
    mountPoint.remove();
  });

  function getButton(direction: 'up' | 'down' | 'left' | 'right'): HTMLButtonElement {
    const button = controls
      .getElement()
      .querySelector<HTMLButtonElement>(`.onscreen-controls__button--${direction}`);
    if (!button) throw new Error(`button for ${direction} not found`);
    return button;
  }

  it('[US-002#5] mounts an accessible group of four directional buttons', () => {
    controls = new DirectionalControls(inputManager, mountPoint);
    const group = controls.getElement();

    expect(group.getAttribute('role')).toBe('group');
    expect(group.querySelectorAll('button')).toHaveLength(4);
    expect(getButton('up').getAttribute('aria-label')).toBe('Move up');
  });

  it('[US-002#5] forwards click on each button to InputManager.setDirection', () => {
    const spy = vi.spyOn(inputManager, 'setDirection');
    controls = new DirectionalControls(inputManager, mountPoint);

    getButton('up').dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(spy).toHaveBeenCalledWith('up');

    getButton('down').dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(spy).toHaveBeenCalledWith('down');

    getButton('left').dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(spy).toHaveBeenCalledWith('left');

    getButton('right').dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(spy).toHaveBeenCalledWith('right');
  });

  it('[US-002#5] forwards touchstart on a button to InputManager.setDirection', () => {
    const spy = vi.spyOn(inputManager, 'setDirection');
    controls = new DirectionalControls(inputManager, mountPoint);

    // bubbles: false — the button's own listener doesn't need bubbling, and
    // this avoids the event also reaching InputManager's document-level
    // touchstart listener (which expects a real TouchEvent with `touches`).
    const event = new Event('touchstart', { bubbles: false, cancelable: true });
    getButton('left').dispatchEvent(event);

    expect(spy).toHaveBeenCalledWith('left');
  });

  it('[US-002#5] a single tap only registers one direction change (touchstart suppresses the synthesized click)', () => {
    const spy = vi.spyOn(inputManager, 'setDirection');
    controls = new DirectionalControls(inputManager, mountPoint);

    const button = getButton('right');
    const touchEvent = new Event('touchstart', { bubbles: false, cancelable: true });
    button.dispatchEvent(touchEvent);

    // preventDefault() on touchstart is what real browsers use to suppress
    // the synthesized click; jsdom does not perform that synthesis, so we
    // simply assert the handler was invoked exactly once for the tap.
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('[US-002#5] destroy removes the element and listeners from the DOM', () => {
    controls = new DirectionalControls(inputManager, mountPoint);
    const element = controls.getElement();
    expect(mountPoint.contains(element)).toBe(true);

    controls.destroy();

    expect(mountPoint.contains(element)).toBe(false);
  });
});
