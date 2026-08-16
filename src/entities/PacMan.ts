import type { Direction } from '../types/shared';

/**
 * Owns Pac-Man's position, current/queued direction, movement logic,
 * chomp animation state, and tunnel wraparound.
 */
export class PacMan {
  x = 0;
  y = 0;
  direction: Direction = 'left';
  queuedDirection: Direction | null = null;
  alive = true;
}
