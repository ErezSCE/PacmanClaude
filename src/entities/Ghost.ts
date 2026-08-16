import type { Direction, GhostName, GhostMode } from '../types/shared';
import type { PacMan } from './PacMan';
import {
  chooseTarget,
  GhostModeTimer,
  REVERSE_DIRECTION,
  GHOST_HOUSE_TARGET,
  FLASH_WARNING_TIME,
  GHOST_SPEED_NORMAL,
  GHOST_SPEED_FRIGHTENED,
  GHOST_SPEED_EYES,
  type TargetTile,
} from './ghostAI';

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
  speed: number = GHOST_SPEED_NORMAL;

  /** Whether the ghost is currently flashing (warning before frightened ends). */
  flashing = false;

  /** Whether the ghost is still waiting inside the ghost house. */
  inGhostHouse: boolean;

  /** Elapsed time (ms) spent waiting inside the ghost house. */
  private houseTimer = 0;

  /** Remaining time (ms) in frightened mode. */
  private frightenedTimer = 0;

  /** Total duration (ms) of the current frightened period. */
  private frightenedDuration = 0;

  /** The mode the ghost was in before entering frightened, for restoration. */
  private preFrightenedMode: 'chase' | 'scatter' = 'scatter';

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
    this.flashing = false;
    this.speed = GHOST_SPEED_NORMAL;
    this.frightenedTimer = 0;
    this.frightenedDuration = 0;
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

  /**
   * Transitions the ghost into frightened mode after a power pellet is eaten.
   * Reverses the ghost's direction, slows it down, and starts the frightened
   * timer. Does not affect ghosts that are already eaten (eyes) or still
   * inside the ghost house.
   *
   * If the ghost is already frightened, the timer is reset (stacking pellets
   * extends the frightened window).
   */
  enterFrightened(duration: number): void {
    // Eaten ghosts (eyes) are immune to frightened transitions
    if (this.mode === 'eaten') {
      return;
    }

    // Ghosts still in the house are not affected
    if (this.inGhostHouse) {
      return;
    }

    // Save the pre-frightened mode for restoration (only if not already frightened)
    if (this.mode !== 'frightened') {
      this.preFrightenedMode = this.mode as 'chase' | 'scatter';
      // Reverse direction on initial entry
      this.direction = REVERSE_DIRECTION[this.direction];
    }

    this.mode = 'frightened';
    this.frightened = true;
    this.flashing = false;
    this.speed = GHOST_SPEED_FRIGHTENED;
    this.frightenedTimer = 0;
    this.frightenedDuration = duration;
  }

  /**
   * Updates the frightened timer. When the timer reaches the flash warning
   * threshold, enables flashing. When the full duration expires, returns
   * the ghost to its pre-frightened mode at normal speed.
   *
   * @param dt - Elapsed time in milliseconds since last update.
   */
  updateFrightened(dt: number): void {
    if (this.mode !== 'frightened') {
      return;
    }

    this.frightenedTimer += dt;

    // Check if we've entered the flash warning window
    if (
      this.frightenedTimer >=
      this.frightenedDuration - FLASH_WARNING_TIME
    ) {
      this.flashing = true;
    }

    // Check if frightened mode has expired
    if (this.frightenedTimer >= this.frightenedDuration) {
      this.exitFrightened();
    }
  }

  /**
   * Exits frightened mode, restoring the ghost to its previous chase/scatter
   * mode at normal speed.
   */
  private exitFrightened(): void {
    this.mode = this.preFrightenedMode;
    this.frightened = false;
    this.flashing = false;
    this.speed = GHOST_SPEED_NORMAL;
    this.frightenedTimer = 0;
    this.frightenedDuration = 0;
  }

  /**
   * Transitions the ghost into the eaten (eyes) state after being consumed
   * by Pac-Man while frightened. The ghost moves at high speed back to the
   * ghost house.
   */
  enterEaten(): void {
    this.mode = 'eaten';
    this.speed = GHOST_SPEED_EYES;
    this.frightened = false;
    this.flashing = false;
    this.frightenedTimer = 0;
    this.frightenedDuration = 0;
  }

  /**
   * Checks whether the ghost (in eaten/eyes mode) has reached the ghost
   * house entrance tile, using a proximity threshold for smooth arrival.
   */
  hasReachedHouse(): boolean {
    const dx = Math.abs(this.x - GHOST_HOUSE_TARGET.col);
    const dy = Math.abs(this.y - GHOST_HOUSE_TARGET.row);
    return dx < 0.5 && dy < 0.5;
  }

  /**
   * Respawns the ghost from the ghost house after returning as eyes.
   * Resets to scatter mode at normal speed, ready to re-enter the maze.
   */
  respawnFromHouse(): void {
    this.mode = 'scatter';
    this.speed = GHOST_SPEED_NORMAL;
    this.frightened = false;
    this.flashing = false;
    this.inGhostHouse = false;
    this.frightenedTimer = 0;
    this.frightenedDuration = 0;
  }
}
