import { getSettings, saveSettings } from '../persistence/SettingsStore';

/** Sound effect identifiers. */
export type SoundEffectName =
  | 'startup'
  | 'dot'
  | 'powerPellet'
  | 'ghostEaten'
  | 'death'
  | 'fruit'
  | 'extraLife';

interface SoundEffectConfig {
  type: OscillatorType;
  frequency: number;
  duration: number;
  gain: number;
}

const SOUND_EFFECTS: Record<SoundEffectName, SoundEffectConfig> = {
  startup: { type: 'square', frequency: 440, duration: 0.6, gain: 0.3 },
  dot: { type: 'square', frequency: 220, duration: 0.05, gain: 0.15 },
  powerPellet: { type: 'sawtooth', frequency: 150, duration: 0.3, gain: 0.25 },
  ghostEaten: { type: 'square', frequency: 880, duration: 0.2, gain: 0.25 },
  death: { type: 'sawtooth', frequency: 100, duration: 1.0, gain: 0.3 },
  fruit: { type: 'triangle', frequency: 660, duration: 0.25, gain: 0.25 },
  extraLife: { type: 'square', frequency: 990, duration: 0.4, gain: 0.3 },
};

const SIREN_BASE_FREQ = 220;
const SIREN_GAIN = 0.1;

/**
 * Plays sound effects and looping siren via Web Audio API.
 * Supports a global mute toggle that persists across sessions.
 */
export class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sirenOsc: OscillatorNode | null = null;
  private sirenGainNode: GainNode | null = null;
  private sirenActive = false;
  private _muted: boolean;

  constructor() {
    this._muted = getSettings().muteEnabled;
  }

  get muted(): boolean {
    return this._muted;
  }

  toggleMute(): void {
    this._muted = !this._muted;
    if (this.masterGain) {
      this.masterGain.gain.value = this._muted ? 0 : 1;
    }
    const settings = getSettings();
    settings.muteEnabled = this._muted;
    saveSettings(settings);
  }

  /** Play a one-shot sound effect. */
  play(name: SoundEffectName): void {
    if (this._muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const config = SOUND_EFFECTS[name];
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = config.type;
    osc.frequency.value = config.frequency;
    gain.gain.value = config.gain;

    osc.connect(gain);
    gain.connect(this.getMasterGain());

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + config.duration);

    // Descending tone for death
    if (name === 'death') {
      osc.frequency.linearRampToValueAtTime(40, ctx.currentTime + config.duration);
    }
    // Rising tone for extra life
    if (name === 'extraLife') {
      osc.frequency.linearRampToValueAtTime(1200, ctx.currentTime + config.duration * 0.5);
    }
  }

  /** Start or update the background siren. */
  startSiren(dotsRemaining: number, totalDots: number, level: number): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const freq = this.computeSirenFreq(dotsRemaining, totalDots, level);

    if (!this.sirenActive) {
      this.sirenOsc = ctx.createOscillator();
      this.sirenGainNode = ctx.createGain();
      this.sirenOsc.type = 'sawtooth';
      this.sirenOsc.frequency.value = freq;
      this.sirenGainNode.gain.value = SIREN_GAIN;
      this.sirenOsc.connect(this.sirenGainNode);
      this.sirenGainNode.connect(this.getMasterGain());
      this.sirenOsc.start();
      this.sirenActive = true;
    } else if (this.sirenOsc) {
      this.sirenOsc.frequency.value = freq;
    }
  }

  /** Stop the background siren. */
  stopSiren(): void {
    if (this.sirenOsc) {
      try { this.sirenOsc.stop(); } catch { /* already stopped */ }
      this.sirenOsc = null;
    }
    this.sirenActive = false;
  }

  /** Resume audio context (required after user gesture). */
  resume(): void {
    if (this.ctx?.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private getContext(): AudioContext | null {
    try {
      if (!this.ctx) {
        this.ctx = new AudioContext();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = this._muted ? 0 : 1;
        this.masterGain.connect(this.ctx.destination);
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  private getMasterGain(): GainNode {
    this.getContext();
    return this.masterGain!;
  }

  private computeSirenFreq(dotsRemaining: number, totalDots: number, level: number): number {
    const safeTotalDots = totalDots > 0 ? totalDots : 1;
    const ratio = 1 - Math.max(0, Math.min(safeTotalDots, dotsRemaining)) / safeTotalDots;
    const levelFactor = 1 + Math.max(0, level - 1) * 0.05;
    return SIREN_BASE_FREQ * levelFactor * (1 + ratio * 0.5);
  }
}
