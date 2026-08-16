import type { PacMan } from '../entities/PacMan';
import type { Ghost } from '../entities/Ghost';
import type { BonusFruit } from '../fruit/BonusFruit';

/**
 * Result of a collision check frame.
 */
export type CollisionResult = {
  dotEaten: boolean;
  powerPelletEaten: boolean;
  fruitEaten: boolean;
  fruitPoints: number;
  ghostEaten: Ghost | null;
  pacmanKilled: boolean;
};

/**
 * Detects tile-level overlaps between Pac-Man and game entities.
 * Checks Pac-Man vs dots, power pellets, fruit, and ghosts.
 */
export function checkCollisions(
  pacman: PacMan,
  ghosts: Ghost[],
  bonusFruit?: BonusFruit,
): CollisionResult {
  let fruitEaten = false;
  let fruitPoints = 0;

  if (bonusFruit && bonusFruit.isActive()) {
    const fruitPos = bonusFruit.getPosition();
    const dx = Math.abs(pacman.x - fruitPos.x);
    const dy = Math.abs(pacman.y - fruitPos.y);
    if (dx < 1 && dy < 1) {
      const points = bonusFruit.collect();
      if (points !== null) {
        fruitEaten = true;
        fruitPoints = points;
      }
    }
  }

  let ghostEaten: Ghost | null = null;
  let pacmanKilled = false;

  for (const ghost of ghosts) {
    const dx = Math.abs(pacman.x - ghost.x);
    const dy = Math.abs(pacman.y - ghost.y);
    if (dx < 1 && dy < 1) {
      if (ghost.frightened) {
        ghostEaten = ghost;
      } else {
        pacmanKilled = true;
      }
      break;
    }
  }

  return {
    dotEaten: false,
    powerPelletEaten: false,
    fruitEaten,
    fruitPoints,
    ghostEaten,
    pacmanKilled,
  };
}
