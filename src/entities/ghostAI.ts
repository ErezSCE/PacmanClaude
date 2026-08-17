import type { Direction, GhostName } from '../types/shared';
import type { PacMan } from './PacMan';
import type { Ghost } from './Ghost';
import type { Maze } from '../maze/Maze';

/** A single tile coordinate used as a ghost's movement target. */
export interface TargetTile {
  row: number;
  col: number;
}

const DIRECTION_OFFSETS: Record<Direction, TargetTile> = {
  up: { row: -1, col: 0 },
  down: { row: 1, col: 0 },
  left: { row: 0, col: -1 },
  right: { row: 0, col: 1 },
};

const OPPOSITE: Record<Direction, Direction> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
};

/** Scatter-mode corner targets for each ghost. */
export const SCATTER_TARGETS: Record<GhostName, TargetTile> = {
  blinky: { row: 0, col: 20 },
  pinky: { row: 0, col: 0 },
  inky: { row: 24, col: 20 },
  clyde: { row: 24, col: 0 },
};

/** Ghost house entrance target for eaten ghosts. */
export const GHOST_HOUSE_TARGET: TargetTile = { row: 10, col: 10 };

/**
 * Chase/scatter alternation schedule. Durations in ms.
 */
export const MODE_SCHEDULE: ReadonlyArray<{
  mode: 'chase' | 'scatter';
  duration: number;
}> = [
  { mode: 'scatter', duration: 7000 },
  { mode: 'chase', duration: 20000 },
  { mode: 'scatter', duration: 7000 },
  { mode: 'chase', duration: 20000 },
  { mode: 'scatter', duration: 5000 },
  { mode: 'chase', duration: 20000 },
  { mode: 'scatter', duration: 5000 },
  { mode: 'chase', duration: Infinity },
];

/**
 * Manages the chase/scatter mode alternation timer.
 */
export class GhostModeTimer {
  private scheduleIndex = 0;
  private elapsed = 0;
  private frozen = false;

  getCurrentMode(): 'chase' | 'scatter' {
    return MODE_SCHEDULE[this.scheduleIndex]?.mode ?? 'chase';
  }

  update(dtMs: number): 'chase' | 'scatter' {
    if (this.frozen) return this.getCurrentMode();
    this.elapsed += dtMs;
    const current = MODE_SCHEDULE[this.scheduleIndex];
    if (current && this.elapsed >= current.duration && this.scheduleIndex < MODE_SCHEDULE.length - 1) {
      this.elapsed = 0;
      this.scheduleIndex++;
    }
    return this.getCurrentMode();
  }

  /** Freeze timer during frightened mode. */
  freeze(): void {
    this.frozen = true;
  }

  /** Resume timer after frightened mode. */
  resume(): void {
    this.frozen = false;
  }

  reset(): void {
    this.scheduleIndex = 0;
    this.elapsed = 0;
    this.frozen = false;
  }
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

/** Blinky: targets Pac-Man's current tile directly. */
export function blinkyTarget(pacman: PacMan): TargetTile {
  return { row: Math.round(pacman.y), col: Math.round(pacman.x) };
}

/** Pinky: targets 4 tiles ahead of Pac-Man in his facing direction. */
export function pinkyTarget(pacman: PacMan): TargetTile {
  const offset = DIRECTION_OFFSETS[pacman.direction];
  return {
    row: Math.round(pacman.y) + offset.row * 4,
    col: Math.round(pacman.x) + offset.col * 4,
  };
}

/** Inky: uses Blinky's position to compute a flanking target. */
export function inkyTarget(pacman: PacMan, blinky?: Ghost): TargetTile {
  const offset = DIRECTION_OFFSETS[pacman.direction];
  const pivotRow = Math.round(pacman.y) + offset.row * 2;
  const pivotCol = Math.round(pacman.x) + offset.col * 2;

  if (!blinky) {
    return { row: pivotRow, col: pivotCol };
  }

  // Double the vector from Blinky to the pivot point
  const blinkyRow = Math.round(blinky.y);
  const blinkyCol = Math.round(blinky.x);
  return {
    row: pivotRow + (pivotRow - blinkyRow),
    col: pivotCol + (pivotCol - blinkyCol),
  };
}

/** Clyde: chases when far, scatters to corner when close (< 8 tiles). */
export function clydeTarget(ghost: Ghost, pacman: PacMan): TargetTile {
  const dist = Math.hypot(ghost.x - pacman.x, ghost.y - pacman.y);
  if (dist > 8) {
    return { row: Math.round(pacman.y), col: Math.round(pacman.x) };
  }
  return SCATTER_TARGETS.clyde;
}

/**
 * At an intersection, choose the direction that minimizes distance to
 * the target tile. Ghosts cannot reverse direction (except when frightened).
 * This implements classic Pac-Man's greedy tile-by-tile pathfinding.
 */
export function chooseDirection(
  row: number,
  col: number,
  currentDirection: Direction,
  target: TargetTile,
  maze: Maze,
): Direction {
  const directions: Direction[] = ['up', 'left', 'down', 'right'];
  const opposite = OPPOSITE[currentDirection];

  let bestDir = currentDirection;
  let bestDist = Infinity;

  for (const dir of directions) {
    // Cannot reverse
    if (dir === opposite) continue;

    const offset = DIRECTION_OFFSETS[dir];
    let targetRow = row + offset.row;
    let targetCol = col + offset.col;

    // Handle tunnel wrapping
    if (maze.width > 0) {
      targetCol = ((targetCol % maze.width) + maze.width) % maze.width;
    }

    // Check if the tile is walkable
    if (!maze.isWalkable(targetRow, targetCol)) continue;

    // Don't let ghosts enter the ghost house unless they're eaten
    const tile = maze.getTile(targetRow, targetCol);
    if (tile === 'ghost-house') continue;

    const dist = Math.hypot(targetCol - target.col, targetRow - target.row);
    if (dist < bestDist) {
      bestDist = dist;
      bestDir = dir;
    }
  }

  // If no direction found (stuck), try to continue or reverse
  if (bestDist === Infinity) {
    const offset = DIRECTION_OFFSETS[currentDirection];
    const fwdRow = row + offset.row;
    const fwdCol = col + offset.col;
    if (maze.isWalkable(fwdRow, fwdCol)) return currentDirection;
    return opposite;
  }

  return bestDir;
}
