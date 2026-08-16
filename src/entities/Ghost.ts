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
  
  // Frightened state properties
  frightenedTimer = 0; // milliseconds
  frightenedFlashStart = 0; // milliseconds
  isFlashing = false;
  previousMode: GhostMode | null = null; // Stores mode before entering frightened state
  
  // Eyes/respawn properties
  ghostHouseX = 0;
  ghostHouseY = 0;

  constructor(name: GhostName, x = 0, y = 0, direction: Direction = 'up') {
    this.name = name;
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.queuedDirection = direction;
  }
}
