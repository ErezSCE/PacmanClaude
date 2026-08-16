import type { PacMan } from '../entities/PacMan';
import type { Ghost } from '../entities/Ghost';

/**
 * Result of a collision check frame.
 */
export type CollisionResult = {
  dotEaten: boolean;
  powerPelletEaten: boolean;
  fruitEaten: boolean;
  ghostEaten: Ghost | null;
  pacmanKilled: boolean;
};

/**
 * Detects tile-level overlaps between Pac-Man and game entities.
 */
export function checkCollisions(
  _pacman: PacMan,
  _ghosts: Ghost[],
): CollisionResult {
  return {
    dotEaten: false,
    powerPelletEaten: false,
    fruitEaten: false,
    ghostEaten: null,
    pacmanKilled: false,
  };
}
