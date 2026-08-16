import { getSettings, saveSettings } from '../persistence/SettingsStore';

/** Identifiers for the game's one-shot sound effects. */
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

/** Per-effect synthesis parameters (waveform, pitch, length, loudness). */
export const SOUND_EFFECTS: Record<SoundEffectName, SoundEffectConfig> = {
  startup: { type: 'square', frequency: 440, duration: 0.6, gain: 0.3 },
  dot: { type: 'square', frequency: 220, duration: 0.05, gain: 0.2 },
  powerPellet: { type: 'sawtooth', frequency: 150, duration: 0.3, gain: 0.25 },
  ghostEaten: { type: 'square', frequency: 880, duration: 0.2, gain: 0.25 },
  death: { type: 'sawtooth', frequency: 100, duration: 1.0, gain: 0.3 },
  fruit: { type: 'triangle', frequency: 660, duration: 0.25, gain: 0.25 },
  extraLife: { type: 'square', frequency: 990, duration: 0.4, gain: 0.3 },
};

const SIREN_BASE_FREQUENCY = 220;
const SIREN_GAIN = 0.12;

/**
 * Computes the siren oscillator frequency given how many dots remain and
 * the current level. The siren speeds up (higher pitch) as dots deplete
 * and as levels increase, matching classic arcade behavior.
 */
export function computeSirenFrequency(dotsRemaining: number, totalDots: number, level: number): number {
  const safeTotalDots = totalDots > 0 ? totalDots : 1;
  const clampedRemaining = Math.max(0, Math.min(safeTotalDots, dotsRemaining));
  const depletionRatio = 1 - clampedRemaining / safeTotalDots;
  const levelFactor = 1 + Math.max(0, level - 1) * 0.05;
  const depletionFactor = 1 + depletionRatio * 0.5;
  return SIREN_BASE_FREQUENCY * levelFactor * depletionFactor;
}

type AudioContextFactory = () => AudioContext;

/**
 * Plays all sound effects and the looping siren via the Web Audio API.
 * Supports overlapping low-latency one-shot sounds, a dynamically-scaled
 * siren loop, and a global mute toggle that persists across sessions.
 */
export class AudioManager {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sirenOscillator: OscillatorNode | null = null;
  private sirenGain: GainNode | null = null;
  private sirenActive = false;
  private muted: boolean;
  private readonly contextFactory: AudioContextFactory;

  constructor(contextFactory: AudioContextFactory = () => new AudioContext()) {
    this.contextFactory = contextFactory;
    this.muted = getSettings().muteEnabled;
  }

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = this.contextFactory();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = this.muted ? 0 : 1;
      this.masterGain.connect(this.audioContext.destination);
    }
    return this.audioContext;
  }

  private getMasterGain(): GainNode {
    this.getContext();
    return this.masterGain as GainNode;
  }

  /** Plays a one-shot sound effect. Overlapping calls never cut each other off. */
  playSound(name: SoundEffectName): void {
    const config = SOUND_EFFECTS[name];
    const ctx = this.getContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = config.type;
    oscillator.frequency.value = config.frequency;
    gainNode.gain.value = config.gain;

    oscillator.connect(gainNode);
    gainNode.connect(this.getMasterGain());

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + config.duration);
    oscillator.onended = () => {
      oscillator.disconnect();
      gainNode.disconnect();
    };
  }

  /** Starts the looping background siren. No-op if already playing. */
  startSiren(): void {
    if (this.sirenActive) {
      return;
    }
    const ctx = this.getContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = SIREN_BASE_FREQUENCY;
    gainNode.gain.value = SIREN_GAIN;

    oscillator.connect(gainNode);
    gainNode.connect(this.getMasterGain());
    oscillator.start(ctx.currentTime);

    this.sirenOscillator = oscillator;
    this.sirenGain = gainNode;
    this.sirenActive = true;
  }

  /** Stops the looping background siren. No-op if not currently playing. */
  stopSiren(): void {
    if (!this.sirenActive) {
      return;
    }
    this.sirenOscillator?.stop();
    this.sirenOscillator?.disconnect();
    this.sirenGain?.disconnect();
    this.sirenOscillator = null;
    this.sirenGain = null;
    this.sirenActive = false;
  }

  /** Adjusts the siren's pitch/rate to reflect remaining dots and current level. */
  updateSirenRate(dotsRemaining: number, totalDots: number, level: number): void {
    if (!this.sirenActive || !this.sirenOscillator) {
      return;
    }
    this.sirenOscillator.frequency.value = computeSirenFrequency(dotsRemaining, totalDots, level);
  }

  isSirenActive(): boolean {
    return this.sirenActive;
  }

  /** Immediately silences (or restores) all audio and persists the choice. */
  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.masterGain) {
      this.masterGain.gain.value = muted ? 0 : 1;
    }
    saveSettings({ ...getSettings(), muteEnabled: muted });
  }

  /** Flips the mute state and returns the new value. */
  toggleMute(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  isMuted(): boolean {
    return this.muted;
  }
}
