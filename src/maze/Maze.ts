import type { Tile } from '../types/shared';
import { buildDefaultLayout, MAZE_WIDTH, MAZE_HEIGHT, TUNNEL_ROW } from './mazeLayout';

/**
 * Holds the tile grid and tracks remaining consumables.
 * Provides tile queries and dot/pellet consumption.
 */
export class Maze {
  private grid: Tile[][];
  private dotsRemaining: number;
  private pelletsRemaining: number;
  private readonly totalDots: number;

  constructor(grid?: Tile[][]) {
    this.grid = grid
      ? grid.map((row) => [...row])
      : buildDefaultLayout();

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
    this.totalDots = dots + pellets;
  }

  get width(): number {
    return this.grid[0]?.length ?? 0;
  }

  get height(): number {
    return this.grid.length;
  }

  getGrid(): Tile[][] {
    return this.grid;
  }

  getRemainingDots(): number {
    return this.dotsRemaining + this.pelletsRemaining;
  }

  getTotalDots(): number {
    return this.totalDots;
  }

  getDotsEaten(): number {
    return this.totalDots - this.dotsRemaining - this.pelletsRemaining;
  }

  getTile(row: number, col: number): Tile {
    return this.grid[row]?.[col] ?? 'wall';
  }

  getTunnelRow(): number {
    return TUNNEL_ROW;
  }

  isComplete(): boolean {
    return this.dotsRemaining === 0 && this.pelletsRemaining === 0;
  }

  /** Returns true if the tile at (row, col) is walkable. */
  isWalkable(row: number, col: number): boolean {
    const tile = this.getTile(row, col);
    return tile !== 'wall';
  }

  /**
   * Consumes the dot or pellet at the given position.
   * Returns the tile type that was consumed, or null if nothing to consume.
   */
  consumeTile(row: number, col: number): 'dot' | 'power-pellet' | null {
    const tile = this.grid[row]?.[col];
    if (tile === 'dot') {
      this.grid[row][col] = 'empty';
      this.dotsRemaining--;
      return 'dot';
    }
    if (tile === 'power-pellet') {
      this.grid[row][col] = 'empty';
      this.pelletsRemaining--;
      return 'power-pellet';
    }
    return null;
  }

  /** Resets the maze to a fresh default layout. */
  reset(): void {
    this.grid = buildDefaultLayout();
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
  }

  /** Renders the maze to a canvas context. */
  render(ctx: CanvasRenderingContext2D, tileSize: number): void {
    for (let row = 0; row < this.grid.length; row++) {
      for (let col = 0; col < this.grid[row].length; col++) {
        const tile = this.grid[row][col];
        const x = col * tileSize;
        const y = row * tileSize;

        switch (tile) {
          case 'wall':
            ctx.fillStyle = '#2121de';
            ctx.fillRect(x, y, tileSize, tileSize);
            // Draw slightly darker inner to give depth
            ctx.fillStyle = '#1919b0';
            ctx.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 2);
            break;
          case 'dot':
            ctx.fillStyle = '#000';
            ctx.fillRect(x, y, tileSize, tileSize);
            ctx.fillStyle = '#ffb8ae';
            ctx.beginPath();
            ctx.arc(x + tileSize / 2, y + tileSize / 2, tileSize * 0.1, 0, Math.PI * 2);
            ctx.fill();
            break;
          case 'power-pellet':
            ctx.fillStyle = '#000';
            ctx.fillRect(x, y, tileSize, tileSize);
            ctx.fillStyle = '#ffb8ae';
            ctx.beginPath();
            ctx.arc(x + tileSize / 2, y + tileSize / 2, tileSize * 0.3, 0, Math.PI * 2);
            ctx.fill();
            break;
          case 'ghost-house':
            ctx.fillStyle = '#0b0b2a';
            ctx.fillRect(x, y, tileSize, tileSize);
            break;
          case 'tunnel':
          case 'empty':
          case 'corridor':
            ctx.fillStyle = '#000';
            ctx.fillRect(x, y, tileSize, tileSize);
            break;
        }
      }
    }
  }
}

/**
 * Creates and returns a Maze instance with the default level layout.
 */
export function loadMaze(): Maze {
  return new Maze();
}
