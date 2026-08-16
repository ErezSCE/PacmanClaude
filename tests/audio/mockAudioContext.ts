import { vi } from 'vitest';

/** Minimal Web Audio API mock sufficient to unit-test AudioManager. */
export class MockGainNode {
  gain = { value: 1 };
  connect = vi.fn();
  disconnect = vi.fn();
}

export class MockOscillatorNode {
  type = 'sine';
  frequency = { value: 0 };
  onended: (() => void) | null = null;
  connect = vi.fn();
  disconnect = vi.fn();
  start = vi.fn();
  stop = vi.fn();
}

export class MockAudioContext {
  currentTime = 0;
  destination = {};
  state = 'running';
  createdOscillators: MockOscillatorNode[] = [];
  createdGains: MockGainNode[] = [];

  createOscillator(): MockOscillatorNode {
    const osc = new MockOscillatorNode();
    this.createdOscillators.push(osc);
    return osc;
  }

  createGain(): MockGainNode {
    const gain = new MockGainNode();
    this.createdGains.push(gain);
    return gain;
  }
}

export function createMockContextFactory(): { factory: () => MockAudioContext; context: MockAudioContext } {
  const context = new MockAudioContext();
  return { factory: () => context, context };
}
