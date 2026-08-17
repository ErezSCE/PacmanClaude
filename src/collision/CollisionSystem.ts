import type { PacMan } from '../entities/PacMan';
import type { Ghost } from '../entities/Ghost';
import type { Maze } from '../maze/Maze';
import type { BonusFruit } from '../fruit/BonusFruit';

export type CollisionResult = {
  dotEaten: boolean;
  powerPelletEaten: boolean;
  fruitEaten: boolean;
  ghostEaten: Ghost | null;
  pacmanKilled: boolean;
};

/** Distance threshold for entity overlap (tile units). */
const OVERLAP_DIST = 0.8;

/**
 * Checks collisions between Pac-Man, the maze tiles, ghosts, and fruit.
 */
export function checkCollisions(
  pacman: PacMan,
  ghosts: Ghost[],
  maze: Maze,
  fruit?: BonusFruit,
): CollisionResult {
  const result: CollisionResult = {
    dotEaten: false,
    powerPelletEaten: false,
    fruitEaten: false,
    ghostEaten: null,
    pacmanKilled: false,
  };

  // Check dot/pellet consumption at Pac-Man's current tile
  const row = Math.round(pacman.y);
  const col = Math.round(pacman.x);
  const consumed = maze.consumeTile(row, col);
  if (consumed === 'dot') {
    result.dotEaten = true;
  } else if (consumed === 'power-pellet') {
    result.powerPelletEaten = true;
  }

  // Check fruit collision
  if (fruit && fruit.active) {
    const fruitDist = Math.hypot(pacman.x - fruit.x, pacman.y - fruit.y);
    if (fruitDist < OVERLAP_DIST) {
      result.fruitEaten = true;
    }
  }

  // Check ghost collisions
  for (const ghost of ghosts) {
    if (ghost.inGhostHouse) continue;
    const dist = Math.hypot(pacman.x - ghost.x, pacman.y - ghost.y);
    if (dist >= OVERLAP_DIST) continue;

    if (ghost.mode === 'frightened') {
      result.ghostEaten = ghost;
      break; // Only one ghost eaten per frame
    } else if (ghost.mode !== 'eaten') {
      result.pacmanKilled = true;
      break;
    }
  }

  return result;
}
