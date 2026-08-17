import type { Direction, GhostName, GhostMode } from '../types/shared';
import type { Maze } from '../maze/Maze';
import type { PacMan } from './PacMan';
import { chooseTarget, chooseDirection, SCATTER_TARGETS, GHOST_HOUSE_TARGET } from './ghostAI';

const DIRECTION_VECTORS: Record<Direction, { dx: number; dy: number }> = {
  up: { dx: 0, dy: -1 },
  down: { dx: 0, dy: 1 },
  left: { dx: -1, dy: 0 },
  right: { dx: 1, dy: 0 },
};

/** Alignment threshold. */
const ALIGN_EPS = 0.05;

/** Ghost speeds in tiles per second. */
export const GHOST_SPEED_NORMAL = 6;
export const GHOST_SPEED_FRIGHTENED = 3.5;
export const GHOST_SPEED_EYES = 12;
export const GHOST_SPEED_TUNNEL = 4;

/** Ghost house staggered release delays (ms). */
export const RELEASE_DELAYS: Record<GhostName, number> = {
  blinky: 0,
  pinky: 2000,
  inky: 6000,
  clyde: 10000,
};

/** Default frightened duration (ms). */
export const BASE_FRIGHTENED_DURATION = 6000;

/** Flash warning time before frightened ends (ms). */
export const FLASH_WARNING_TIME = 2000;

/**
 * Represents a single ghost entity with full movement, AI, and state.
 */
export class Ghost {
  x: number;
  y: number;
  readonly name: GhostName;
  mode: GhostMode = 'scatter';
  direction: Direction = 'up';
  speed = GHOST_SPEED_NORMAL;
  flashing = false;

  /** Whether the ghost is inside the ghost house waiting to be released. */
  inGhostHouse: boolean;

  private readonly startX: number;
  private readonly startY: number;
  private houseTimer = 0;
  private frightenedTimer = 0;
  private frightenedDuration = BASE_FRIGHTENED_DURATION;
  private preFrightenedMode: 'chase' | 'scatter' = 'scatter';

  constructor(name: GhostName, startX: number, startY: number) {
    this.name = name;
    this.startX = startX;
    this.startY = startY;
    this.x = startX;
    this.y = startY;
    this.inGhostHouse = RELEASE_DELAYS[name] > 0;
  }

  /** Advance the ghost's position and state by dtMs milliseconds. */
  update(dtMs: number, maze: Maze, pacman: PacMan, blinky?: Ghost): void {
    const dt = Math.min(dtMs, 100) / 1000;

    if (this.inGhostHouse) {
      this.houseTimer += dtMs;
      if (this.houseTimer >= RELEASE_DELAYS[this.name]) {
        this.inGhostHouse = false;
        // Move to ghost house door
        this.x = maze.width / 2;
        this.y = 10; // Just outside ghost house
        this.direction = 'left';
      }
      return;
    }

    // Update frightened timer
    if (this.mode === 'frightened') {
      this.frightenedTimer -= dtMs;
      this.flashing = this.frightenedTimer <= FLASH_WARNING_TIME && this.frightenedTimer > 0;
      if (this.frightenedTimer <= 0) {
        this.exitFrightened();
      }
    }

    // Choose movement speed
    this.speed = this.getSpeed(maze);

    // Move
    const { dx, dy } = DIRECTION_VECTORS[this.direction];
    const prevX = this.x;
    const prevY = this.y;
    this.x += dx * this.speed * dt;
    this.y += dy * this.speed * dt;

    // Clamp to grid line if crossed
    this.x = this.clampToGridLine(this.x, prevX, dx);
    this.y = this.clampToGridLine(this.y, prevY, dy);

    // Tunnel wrap
    if (maze.width > 0) {
      if (this.x < 0) this.x += maze.width;
      if (this.x >= maze.width) this.x -= maze.width;
    }

    // At grid-aligned positions, choose next direction
    if (this.isAligned()) {
      this.chooseNextDirection(maze, pacman, blinky);
    }
  }

  /** Enter frightened mode. */
  enterFrightened(duration: number = BASE_FRIGHTENED_DURATION): void {
    if (this.mode === 'eaten') return;
    if (this.mode !== 'frightened') {
      this.preFrightenedMode = this.mode as 'chase' | 'scatter';
    }
    this.mode = 'frightened';
    this.frightenedTimer = duration;
    this.frightenedDuration = duration;
    this.speed = GHOST_SPEED_FRIGHTENED;
    this.flashing = false;
    // Reverse direction
    this.reverseDirection();
  }

  /** Exit frightened mode back to previous mode. */
  private exitFrightened(): void {
    this.mode = this.preFrightenedMode;
    this.speed = GHOST_SPEED_NORMAL;
    this.flashing = false;
    this.frightenedTimer = 0;
  }

  /** Ghost was eaten by Pac-Man - become eyes. */
  becomeEaten(): void {
    this.mode = 'eaten';
    this.speed = GHOST_SPEED_EYES;
    this.flashing = false;
    this.frightenedTimer = 0;
  }

  /** Set the global chase/scatter mode (from mode timer). */
  setMode(mode: 'chase' | 'scatter'): void {
    if (this.mode === 'frightened' || this.mode === 'eaten') return;
    if (this.mode !== mode) {
      this.reverseDirection();
    }
    this.mode = mode;
  }

  /** Reset ghost to starting position (for level reset / death). */
  resetToStart(): void {
    this.x = this.startX;
    this.y = this.startY;
    this.mode = 'scatter';
    this.direction = 'up';
    this.speed = GHOST_SPEED_NORMAL;
    this.flashing = false;
    this.frightenedTimer = 0;
    this.houseTimer = 0;
    this.inGhostHouse = RELEASE_DELAYS[this.name] > 0;
  }

  /** Whether the ghost's frightened state is currently active. */
  get frightened(): boolean {
    return this.mode === 'frightened';
  }

  private reverseDirection(): void {
    const opposites: Record<Direction, Direction> = {
      up: 'down', down: 'up', left: 'right', right: 'left',
    };
    this.direction = opposites[this.direction];
  }

  private getSpeed(maze: Maze): number {
    if (this.mode === 'eaten') return GHOST_SPEED_EYES;
    if (this.mode === 'frightened') return GHOST_SPEED_FRIGHTENED;
    const row = Math.round(this.y);
    if (row === maze.getTunnelRow()) return GHOST_SPEED_TUNNEL;
    return GHOST_SPEED_NORMAL;
  }

  private isAligned(): boolean {
    return (
      Math.abs(this.x - Math.round(this.x)) < ALIGN_EPS &&
      Math.abs(this.y - Math.round(this.y)) < ALIGN_EPS
    );
  }

  private clampToGridLine(current: number, prev: number, delta: number): number {
    if (delta === 0) return current;
    const nextLine = delta > 0 ? Math.floor(prev) + 1 : Math.ceil(prev) - 1;
    if (delta > 0 && current >= nextLine) return nextLine;
    if (delta < 0 && current <= nextLine) return nextLine;
    return current;
  }

  private chooseNextDirection(maze: Maze, pacman: PacMan, blinky?: Ghost): void {
    const row = Math.round(this.y);
    const col = Math.round(this.x);

    // If eaten and reached ghost house, respawn
    if (this.mode === 'eaten') {
      if (row === GHOST_HOUSE_TARGET.row && col === GHOST_HOUSE_TARGET.col) {
        this.mode = this.preFrightenedMode;
        this.speed = GHOST_SPEED_NORMAL;
        this.x = this.startX;
        this.y = this.startY;
        this.inGhostHouse = false;
        return;
      }
    }

    // Determine target tile based on mode
    let target: { row: number; col: number };
    if (this.mode === 'eaten') {
      target = GHOST_HOUSE_TARGET;
    } else if (this.mode === 'scatter') {
      target = SCATTER_TARGETS[this.name];
    } else if (this.mode === 'frightened') {
      // Random movement when frightened
      target = {
        row: Math.floor(Math.random() * maze.height),
        col: Math.floor(Math.random() * maze.width),
      };
    } else {
      // Chase mode
      target = chooseTarget(this, pacman, blinky);
    }

    const newDir = chooseDirection(row, col, this.direction, target, maze);
    this.direction = newDir;
    // Snap to grid
    this.x = col;
    this.y = row;
  }
}
