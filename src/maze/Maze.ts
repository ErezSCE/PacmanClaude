import type { Tile } from '../types/shared';

/**
 * Holds the tile grid and tracks remaining-dot count.
 * Renders the maze, dots, and power pellets each frame to Canvas.
 */
export class Maze {
  private grid: Tile[][] = [];
  private remainingDots = 0;

  getGrid(): Tile[][] {
    return this.grid;
  }

  getRemainingDots(): number {
    return this.remainingDots;
  }

  getTile(row: number, col: number): Tile {
    return this.grid[row]?.[col] ?? 'wall';
  }

  setGrid(grid: Tile[][]): void {
    this.grid = grid;
    this.remainingDots = grid
      .flat()
      .filter((t) => t === 'dot' || t === 'power-pellet').length;
  }
}

/**
 * Loads and returns a Maze instance with the default level layout.
 */
export function loadMaze(): Maze {
  const maze = new Maze();
  // Set a minimal default grid so pathfinding can work
  // This is a simple 5x5 grid with corridors and walls
  const defaultGrid: Tile[][] = [
    ['wall', 'wall', 'wall', 'wall', 'wall'],
    ['wall', 'corridor', 'corridor', 'corridor', 'wall'],
    ['wall', 'corridor', 'wall', 'corridor', 'wall'],
    ['wall', 'corridor', 'corridor', 'corridor', 'wall'],
    ['wall', 'wall', 'wall', 'wall', 'wall']
  ];
  maze.setGrid(defaultGrid);
  return maze;
}
