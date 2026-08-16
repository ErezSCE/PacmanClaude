import { describe, it, expect, beforeEach } from 'vitest';
import { ScreenManager } from '../../src/ui/ScreenManager';

describe('ScreenManager level-complete overlay', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="overlay"></div>';
  });

  it('[US-008#3] showLevelComplete renders an accessible overlay element into the DOM', () => {
    const manager = new ScreenManager();

    manager.showLevelComplete(3);

    const overlay = document.getElementById('overlay')!;
    const panel = overlay.querySelector('.screen-level-complete');

    expect(panel).not.toBeNull();
    expect(panel!.getAttribute('role')).toBe('status');
    expect(panel!.getAttribute('aria-live')).toBe('polite');
    expect(panel!.textContent).toContain('3');
    expect(manager.currentScreen).toBe('levelComplete');
  });

  it('[US-008#3] dismissLevelComplete switches back to playing and clears the overlay', () => {
    const manager = new ScreenManager();
    manager.showLevelComplete(1);

    const dismissed = manager.dismissLevelComplete();

    expect(dismissed).toBe(true);
    expect(manager.currentScreen).toBe('playing');
    const overlay = document.getElementById('overlay')!;
    expect(overlay.querySelector('.screen-level-complete')).toBeNull();
  });

  it('[US-008#3] dismissLevelComplete is a guarded no-op once the screen has changed externally', () => {
    const manager = new ScreenManager();
    manager.showLevelComplete(1);
    manager.show('gameOver');

    const dismissed = manager.dismissLevelComplete();

    expect(dismissed).toBe(false);
    expect(manager.currentScreen).toBe('gameOver');
  });

  it('[US-008#3] show() clears the level-complete overlay when navigating to another screen', () => {
    const manager = new ScreenManager();
    manager.showLevelComplete(1);

    manager.show('pause');

    const overlay = document.getElementById('overlay')!;
    expect(overlay.querySelector('.screen-level-complete')).toBeNull();
    expect(manager.currentScreen).toBe('pause');
  });
});
