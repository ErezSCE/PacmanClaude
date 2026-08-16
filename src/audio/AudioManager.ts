/**
 * Plays sound effects and looping siren via Web Audio API.
 * Exposes a global mute toggle.
 */
export class AudioManager {
  private _muted = false;

  get muted(): boolean {
    return this._muted;
  }

  toggleMute(): void {
    this._muted = !this._muted;
  }
}
