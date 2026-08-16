import type { Direction, GhostName, GhostMode } from '../types/shared';
import type { PacMan } from './PacMan';
import { chooseTarget, GhostModeTimer, type TargetTile } from './ghostAI';

/**
 * Staggered ghost-house release delays (milliseconds) applied at level
 * start and after Pac-Man loses a life. Blinky starts outside the house;
 * the remaining ghosts leave in a deterministic order.
 */
export const RELEASE_DELAYS: Record<GhostName, number> = {
  blinky: 0,
  pinky: 1000,
  inky: 5000,
  clyde: 10000,
};

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

  /** Whether the ghost is still waiting inside the ghost house. */
  inGhostHouse: boolean;
  /** Elapsed time (ms) spent waiting inside the ghost house. */
  private houseTimer = 0;

  constructor(name: GhostName) {
    this.name = name;
    this.inGhostHouse = RELEASE_DELAYS[name] > 0;
  }

  /**
   * Advances the ghost-house release timer. Once the ghost's configured
   * stagger delay has elapsed, it is released into the maze.
   */
  updateHouseTimer(dt: number): void {
    if (!this.inGhostHouse) {
      return;
    }
    this.houseTimer += dt;
    if (this.houseTimer >= RELEASE_DELAYS[this.name]) {
      this.inGhostHouse = false;
    }
  }

  /**
   * Resets the ghost to its staggered starting state — called at level
   * start and again after Pac-Man loses a life — restoring the
   * deterministic release order.
   */
  resetForRelease(): void {
    this.inGhostHouse = RELEASE_DELAYS[this.name] > 0;
    this.houseTimer = 0;
    this.mode = 'scatter';
    this.frightened = false;
  }

  /**
   * Applies the shared chase/scatter timer's current phase to this ghost,
   * unless it is currently frightened or has been eaten (those states are
   * managed independently and must not be overridden by the timer).
   */
  applyModeTimer(timer: GhostModeTimer): void {
    if (this.mode === 'frightened' || this.mode === 'eaten') {
      return;
    }
    this.mode = timer.getCurrentMode();
  }

  /**
   * Computes this ghost's current movement target tile, dispatching to its
   * distinct personality strategy (or its scatter corner) based on mode.
   */
  getTarget(pacman: PacMan, blinky?: Ghost): TargetTile {
    return chooseTarget(this, pacman, blinky);
  }
}
