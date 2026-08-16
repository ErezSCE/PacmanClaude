import type { Tile } from '../types/shared';
import { buildDefaultLayout, MAZE_HEIGHT, MAZE_WIDTH, TUNNEL_ROW } from './mazeLayout';

/** Colors used to render each tile type on the Canvas. */
export interface MazeColors {
  wall: string;
  dot: string;
  powerPellet: string;
  ghostHouse: string;
  tunnel: string;
  background: string;
}

const DEFAULT_COLORS: MazeColors = {
  wall: '#2121de',
  dot: '#ffb8ae',
  powerPellet: '#ffb8ae',
  ghostHouse: '#0b0b2a',
  tunnel: '#050514',
  background: '#000000',
};

/**
 * Holds the tile grid (walls, corridors, dots, power pellets, tunnel,
 * ghost house), tracks remaining consumables, and draws the maze to a
 * Canvas 2D rendering context each frame.
 */
export class Maze {
  private readonly grid: Tile[][];
  private dotsRemaining: number;
  private pelletsRemaining: number;
  private readonly initialDotCount: number;
  private readonly initialPelletCount: number;

  constructor(grid: Tile[][]) {
    this.grid = grid.map((row) => [...row]);

    let dots = 0;
    let pellets = 0;
    for (const row of this.grid) {
      for (const tile of row) {
        if (tile === 'dot') dots++;
        if (tile === 'power-pellet') pellets++;
      }
    }

    this.dotsRemaining = dots;
    this.pelletsRemaining = pellets;
    this.initialDotCount = dots;
    this.initialPelletCount = pellets;
  }

  /** Number of tile columns in the maze grid. */
  get width(): number {
    return this.grid[0]?.length ?? 0;
  }

  /** Number of tile rows in the maze grid. */
  get height(): number {
    return this.grid.length;
  }

  /** Returns the tile at [row, col], treating out-of-bounds as a wall. */
  getTile(row: number, col: number): Tile {
    if (row < 0 || row >= this.height || col < 0 || col >= this.width) {
      return 'wall';
    }
    return this.grid[row][col];
  }

  /** Whether an entity may occupy this tile (anything but a wall). */
  isWalkable(row: number, col: number): boolean {
    return this.getTile(row, col) !== 'wall';
  }

  /** Whether this tile is part of the left-right tunnel wraparound. */
  isTunnel(row: number, col: number): boolean {
    return this.getTile(row, col) === 'tunnel';
  }

  /** Row index of the tunnel wraparound corridor. */
  getTunnelRow(): number {
    return TUNNEL_ROW;
  }

  /**
   * Removes the dot at [row, col] if present. Returns true if a dot was
   * eaten.
   *
   * Assumes single-threaded, sequential invocation (as is the case in the
   * browser's per-frame game loop). Calling this concurrently for the same
   * tile is not supported and could decrement `dotsRemaining` incorrectly.
   */
  eatDot(row: number, col: number): boolean {
    if (this.getTile(row, col) !== 'dot') return false;
    this.grid[row][col] = 'empty';
    this.dotsRemaining--;
    return true;
  }

  /**
   * Removes the power pellet at [row, col] if present. Returns true if a
   * pellet was eaten.
   *
   * Assumes single-threaded, sequential invocation (as is the case in the
   * browser's per-frame game loop). Calling this concurrently for the same
   * tile is not supported and could decrement `pelletsRemaining` incorrectly.
   */
  eatPowerPellet(row: number, col: number): boolean {
    if (this.getTile(row, col) !== 'power-pellet') return false;
    this.grid[row][col] = 'empty';
    this.pelletsRemaining--;
    return true;
  }

  /** Count of dots still on the board. */
  getRemainingDots(): number {
    return this.dotsRemaining;
  }

  /** Count of power pellets still on the board. */
  getRemainingPellets(): number {
    return this.pelletsRemaining;
  }

  /** Total consumables (dots + pellets) eaten so far this level. */
  getTotalEaten(): number {
    return (
      this.initialDotCount -
      this.dotsRemaining +
      (this.initialPelletCount - this.pelletsRemaining)
    );
  }

  /** True once every dot and power pellet has been eaten. */
  isComplete(): boolean {
    return this.dotsRemaining === 0 && this.pelletsRemaining === 0;
  }

  /** Draws the maze (walls, corridors, dots, pellets, ghost house, tunnel). */
  render(
    ctx: CanvasRenderingContext2D,
    tileSize: number,
    colors: MazeColors = DEFAULT_COLORS,
  ): void {
    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        this.renderTile(ctx, this.grid[row][col], row, col, tileSize, colors);
      }
    }
  }

  private renderTile(
    ctx: CanvasRenderingContext2D,
    tile: Tile,
    row: number,
    col: number,
    tileSize: number,
    colors: MazeColors,
  ): void {
    const x = col * tileSize;
    const y = row * tileSize;

    // Only paint a background for tiles that don't fully cover their own
    // cell (corridor/empty/dot/pellet). Wall/ghost-house/tunnel tiles draw
    // an opaque fillRect over the whole cell themselves, so painting the
    // background underneath them first would just be a wasted fill call
    // repeated ~400 times per frame across the grid.
    switch (tile) {
      case 'wall':
        ctx.fillStyle = colors.wall;
        ctx.fillRect(x, y, tileSize, tileSize);
        break;
      case 'ghost-house':
        ctx.fillStyle = colors.ghostHouse;
        ctx.fillRect(x, y, tileSize, tileSize);
        break;
      case 'tunnel':
        ctx.fillStyle = colors.tunnel;
        ctx.fillRect(x, y, tileSize, tileSize);
        break;
      case 'dot':
        ctx.fillStyle = colors.background;
        ctx.fillRect(x, y, tileSize, tileSize);
        ctx.fillStyle = colors.dot;
        ctx.beginPath();
        ctx.arc(x + tileSize / 2, y + tileSize / 2, Math.max(1, tileSize * 0.08), 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'power-pellet':
        ctx.fillStyle = colors.background;
        ctx.fillRect(x, y, tileSize, tileSize);
        ctx.fillStyle = colors.powerPellet;
        ctx.beginPath();
        ctx.arc(x + tileSize / 2, y + tileSize / 2, Math.max(2, tileSize * 0.25), 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'corridor':
      case 'empty':
      default:
        ctx.fillStyle = colors.background;
        ctx.fillRect(x, y, tileSize, tileSize);
        break;
    }
  }
}

/** Loads the default level maze, ready to render and play. */
export function loadMaze(): Maze {
  return new Maze(buildDefaultLayout());
}

export { MAZE_WIDTH, MAZE_HEIGHT };
