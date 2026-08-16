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
  queuedDirection: Direction = 'up';
  frightened = false;
  
  // Frightened state properties
  frightenedTimer = 0; // seconds
  frightenedFlashStart = 0; // seconds
  isFlashing = false;
  
  // Eyes/respawn properties
  ghostHouseX = 0;
  ghostHouseY = 0;

  constructor(name: GhostName) {
    this.name = name;
  }
}
