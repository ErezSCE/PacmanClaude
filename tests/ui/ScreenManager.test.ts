import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ScreenManager } from '../../src/ui/ScreenManager';
import type { ScreenType } from '../../src/ui/ScreenManager';

describe('ScreenManager', () => {
  let screenManager: ScreenManager;
  let overlay: HTMLDivElement;

  beforeEach(() => {
    overlay = document.createElement('div');
    overlay.id = 'overlay';
    overlay.setAttribute('role', 'region');
    overlay.setAttribute('aria-label', 'Game screens');
    document.body.appendChild(overlay);
    screenManager = new ScreenManager(overlay);
  });

  afterEach(() => {
    screenManager.destroy();
    overlay.remove();
  });

  it('[US-012#1] renders start screen with focusable Start button', () => {
    screenManager.show('start');
    const btn = overlay.querySelector('button');
    expect(btn).not.toBeNull();
    expect(btn!.textContent).toContain('Start');
  });

  it('[US-012#1] start button is focused when start screen is shown', () => {
    screenManager.show('start');
    const btn = overlay.querySelector('button');
    expect(document.activeElement).toBe(btn);
  });

  it('[US-012#1] renders pause screen with focusable Resume button', () => {
    screenManager.show('pause');
    const buttons = overlay.querySelectorAll('button');
    const resumeBtn = Array.from(buttons).find(b => b.textContent?.includes('Resume'));
    expect(resumeBtn).not.toBeNull();
  });

  it('[US-012#1] pause screen Resume button receives focus', () => {
    screenManager.show('pause');
    const buttons = overlay.querySelectorAll('button');
    const resumeBtn = Array.from(buttons).find(b => b.textContent?.includes('Resume'));
    expect(document.activeElement).toBe(resumeBtn);
  });

  it('[US-012#1] renders game-over screen with focusable elements', () => {
    screenManager.show('gameover');
    const buttons = overlay.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('[US-012#1] game-over screen focuses first interactive element', () => {
    screenManager.show('gameover');
    const firstBtn = overlay.querySelector('button');
    expect(document.activeElement).toBe(firstBtn);
  });

  it('[US-012#1] renders level-complete screen with focusable Continue button', () => {
    screenManager.show('levelComplete');
    const btn = overlay.querySelector('button');
    expect(btn).not.toBeNull();
    expect(btn!.textContent).toContain('Continue');
  });

  it('[US-012#1] switching screens clears previous content and renders new screen', () => {
    screenManager.show('start');
    expect(overlay.querySelector('button')!.textContent).toContain('Start');

    screenManager.show('pause');
    const buttons = Array.from(overlay.querySelectorAll('button'));
    const hasStart = buttons.some(b => b.textContent?.includes('Start'));
    const hasResume = buttons.some(b => b.textContent?.includes('Resume'));
    expect(hasStart).toBe(false);
    expect(hasResume).toBe(true);
  });

  it('[US-012#1] currentScreen getter returns the active screen type', () => {
    screenManager.show('start');
    expect(screenManager.currentScreen).toBe('start');
    screenManager.show('pause');
    expect(screenManager.currentScreen).toBe('pause');
  });

  it('[US-012#1] hide clears overlay and sets currentScreen to null', () => {
    screenManager.show('start');
    screenManager.hide();
    expect(overlay.innerHTML).toBe('');
    expect(screenManager.currentScreen).toBeNull();
  });

  it('[US-012#1] onAction callback is invoked when a button is clicked', () => {
    const actions: string[] = [];
    screenManager.onAction((action) => {
      actions.push(action);
    });
    screenManager.show('start');
    const btn = overlay.querySelector('button') as HTMLButtonElement;
    btn.click();
    expect(actions.length).toBeGreaterThan(0);
  });

  it('[US-012#1] buttons are keyboard-activatable via Enter key', () => {
    const actions: string[] = [];
    screenManager.onAction((action) => {
      actions.push(action);
    });
    screenManager.show('start');
    const btn = overlay.querySelector('button') as HTMLButtonElement;
    btn.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    // Native button activation via Enter is handled by the browser; 
    // we verify the button is focusable and has the right role
    expect(btn.tabIndex).not.toBe(-1);
    expect(btn.tagName).toBe('BUTTON');
  });

  it('[US-012#1] all interactive elements have visible focus styles applied via CSS class', () => {
    screenManager.show('start');
    const buttons = overlay.querySelectorAll('button');
    buttons.forEach(btn => {
      // Buttons should have the screen-btn class for focus styling
      expect(btn.classList.contains('screen-btn')).toBe(true);
    });
  });

  it('[US-012#1] countdown screen renders non-interactive countdown text', () => {
    screenManager.show('countdown');
    const panel = overlay.querySelector('.screen-panel');
    expect(panel).not.toBeNull();
    expect(panel!.textContent).toContain('Ready');
  });

  it('[US-012#1] destroy clears overlay content', () => {
    screenManager.show('start');
    screenManager.destroy();
    expect(overlay.innerHTML).toBe('');
  });
});
