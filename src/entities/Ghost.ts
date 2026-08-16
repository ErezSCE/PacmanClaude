import type { Direction, GhostName, GhostMode } from '../types/shared';

/**
 * Represents a single ghost entity with position, mode, and AI state.
 */
export class Ghost {
  x = 0;
  y = 0;
  name: GhostName;
  mode: GhostMode = 'scatter';
  direction: Direction = 'up';
  frightened = false;

  constructor(name: GhostName) {
    this.name = name;
  }
}
