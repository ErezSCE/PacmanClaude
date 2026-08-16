import { beforeEach, describe, expect, it } from 'vitest';
import { getSettings, saveSettings } from '../../src/persistence/SettingsStore';

describe('SettingsStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('[US-009#3] returns default settings (unmuted) when nothing is stored', () => {
    expect(getSettings()).toEqual({ muteEnabled: false, colorblindPaletteEnabled: false });
  });

  it('[US-009#3] persists and reloads settings across calls (simulating sessions)', () => {
    saveSettings({ muteEnabled: true, colorblindPaletteEnabled: true });

    expect(getSettings()).toEqual({ muteEnabled: true, colorblindPaletteEnabled: true });
  });

  it('[US-009#3] tolerates corrupted storage by falling back to defaults', () => {
    localStorage.setItem('pacman.settings', '{not valid json');

    expect(getSettings()).toEqual({ muteEnabled: false, colorblindPaletteEnabled: false });
  });
});
