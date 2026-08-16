import type { GhostName } from '../types/shared';
import type { PacMan } from './PacMan';
import type { Ghost } from './Ghost';

interface TargetTile {
  row: number;
  col: number;
}

/**
 * Chooses the target tile for a ghost based on its personality.
 */
export function chooseTarget(
  ghost: Ghost,
  pacman: PacMan,
  blinky?: Ghost,
): TargetTile {
  switch (ghost.name) {
    case 'blinky':
      return blinkyTarget(pacman);
    case 'pinky':
      return pinkyTarget(pacman);
    case 'inky':
      return inkyTarget(pacman, blinky);
    case 'clyde':
      return clydeTarget(ghost, pacman);
  }
}

export function blinkyTarget(pacman: PacMan): TargetTile {
  return { row: Math.floor(pacman.y), col: Math.floor(pacman.x) };
}

export function pinkyTarget(pacman: PacMan): TargetTile {
  return { row: Math.floor(pacman.y), col: Math.floor(pacman.x) + 4 };
}

export function inkyTarget(pacman: PacMan, _blinky?: Ghost): TargetTile {
  return { row: Math.floor(pacman.y), col: Math.floor(pacman.x) + 2 };
}

export function clydeTarget(ghost: Ghost, pacman: PacMan): TargetTile {
  const dist = Math.hypot(ghost.x - pacman.x, ghost.y - pacman.y);
  if (dist > 8) {
    return { row: Math.floor(pacman.y), col: Math.floor(pacman.x) };
  }
  return { row: 35, col: 0 };
}
