import type { Direction, GhostName } from '../types/shared';
import type { PacMan } from './PacMan';
import type { Ghost } from './Ghost';

/** A single tile coordinate used as a ghost's movement target. */
export interface TargetTile {
  row: number;
  col: number;
}

/** Row/column deltas for each cardinal direction. */
const DIRECTION_OFFSETS: Record<Direction, TargetTile> = {
  up: { row: -1, col: 0 },
  down: { row: 1, col: 0 },
  left: { row: 0, col: -1 },
  right: { row: 0, col: 1 },
};

/** Map from a direction to its reverse. */
export const REVERSE_DIRECTION: Record<Direction, Direction> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
};

/**
 * Fixed scatter-mode corner targets, one per ghost personality, matching
 * the classic arcade behavior of each ghost retreating to its own corner.
 */
export const SCATTER_TARGETS: Record<GhostName, TargetTile> = {
  blinky: { row: 0, col: 27 },
  pinky: { row: 0, col: 0 },
  inky: { row: 34, col: 27 },
  clyde: { row: 34, col: 0 },
};

/**
 * The tile coordinate of the ghost house entrance, used as the target
 * for eaten ghosts returning as eyes.
 */
export const GHOST_HOUSE_TARGET: TargetTile = { row: 14, col: 13 };

/**
 * Default frightened-mode duration in milliseconds (classic: ~6 seconds,
 * varies by level — this is the base value).
 */
export const FRIGHTENED_DURATION = 6000;

/**
 * Duration in milliseconds before frightened mode ends during which
 * ghosts flash/blink as a warning to the player.
 */
export const FLASH_WARNING_TIME = 2000;

/** Normal ghost movement speed (tiles per second). */
export const GHOST_SPEED_NORMAL = 7.5;

/** Frightened ghost movement speed — slower than normal. */
export const GHOST_SPEED_FRIGHTENED = 5.0;

/** Eyes (eaten) ghost movement speed — faster than normal for quick return. */
export const GHOST_SPEED_EYES = 15.0;

/**
 * Classic chase/scatter alternation schedule. Durations are in milliseconds;
 * the final chase phase lasts indefinitely (Infinity).
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
 * Drives the alternating chase/scatter timer shared by all non-frightened
 * ghosts, following MODE_SCHEDULE deterministically.
 */
export class GhostModeTimer {
  private elapsed = 0;
  private index = 0;

  /** Returns the current phase's mode ('chase' or 'scatter'). */
  getCurrentMode(): 'chase' | 'scatter' {
    return MODE_SCHEDULE[this.index].mode;
  }

  /** Advances the timer by dt milliseconds, switching phases as needed. */
  update(dt: number): void {
    const current = MODE_SCHEDULE[this.index];
    if (current.duration === Infinity) {
      return;
    }

    this.elapsed += dt;
    while (
      this.index < MODE_SCHEDULE.length - 1 &&
      this.elapsed >= MODE_SCHEDULE[this.index].duration
    ) {
      this.elapsed -= MODE_SCHEDULE[this.index].duration;
      this.index += 1;
    }
  }

  /** Resets the timer to the start of the schedule (level start / new life). */
  reset(): void {
    this.elapsed = 0;
    this.index = 0;
  }
}

/**
 * Chooses the target tile for a ghost based on its current mode and, when
 * chasing, its distinct personality (direct chase, ambush, flank, or
 * chase/random hybrid).
 *
 * Handles all ghost modes:
 * - scatter → fixed corner target
 * - chase → personality-specific target
 * - frightened → pseudo-random wandering target
 * - eaten → ghost house entrance for eyes return
 */
export function chooseTarget(
  ghost: Ghost,
  pacman: PacMan,
  blinky?: Ghost,
): TargetTile {
  if (ghost.mode === 'eaten') {
    return GHOST_HOUSE_TARGET;
  }

  if (ghost.mode === 'frightened') {
    return frightenedTarget(ghost);
  }

  if (ghost.mode === 'scatter') {
    return SCATTER_TARGETS[ghost.name];
  }

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

/**
 * Frightened target: produces a pseudo-random target tile based on the
 * ghost's current position to create erratic wandering behavior.
 * The target changes based on position so the ghost doesn't just stand still.
 */
export function frightenedTarget(ghost: Ghost): TargetTile {
  // Use a simple hash of position to produce pseudo-random but deterministic targets
  const posHash = Math.floor(ghost.x * 31 + ghost.y * 17);
  const row = Math.abs(posHash % 31) + 1;
  const col = Math.abs((posHash * 7 + 13) % 28);
  return { row, col };
}

/** Blinky: direct chase — always targets Pac-Man's current tile. */
export function blinkyTarget(pacman: PacMan): TargetTile {
  return { row: Math.floor(pacman.y), col: Math.floor(pacman.x) };
}

/** Pinky: ambush — targets 4 tiles ahead of Pac-Man in his current direction. */
export function pinkyTarget(pacman: PacMan): TargetTile {
  const offset = DIRECTION_OFFSETS[pacman.direction];
  return {
    row: Math.floor(pacman.y) + offset.row * 4,
    col: Math.floor(pacman.x) + offset.col * 4,
  };
}

/**
 * Inky: flank — targets the tile obtained by casting a vector from Blinky's
 * position through the tile 2 ahead of Pac-Man and doubling its length.
 * Falls back to Pac-Man's tile if Blinky is unavailable.
 */
export function inkyTarget(pacman: PacMan, blinky?: Ghost): TargetTile {
  const offset = DIRECTION_OFFSETS[pacman.direction];
  const aheadRow = Math.floor(pacman.y) + offset.row * 2;
  const aheadCol = Math.floor(pacman.x) + offset.col * 2;

  if (!blinky) {
    return { row: aheadRow, col: aheadCol };
  }

  return {
    row: aheadRow * 2 - Math.floor(blinky.y),
    col: aheadCol * 2 - Math.floor(blinky.x),
  };
}

/**
 * Clyde: chase/random hybrid — chases directly while farther than 8 tiles
 * from Pac-Man, then retreats to his scatter corner once within range.
 */
export function clydeTarget(ghost: Ghost, pacman: PacMan): TargetTile {
  const dist = Math.hypot(ghost.x - pacman.x, ghost.y - pacman.y);
  if (dist > 8) {
    return blinkyTarget(pacman);
  }
  return SCATTER_TARGETS.clyde;
}
