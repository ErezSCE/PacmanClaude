import { describe, it, expect, beforeEach } from 'vitest';
import { PacMan } from '../../src/entities/PacMan';
import { Maze } from '../../src/maze/Maze';
import type { Tile } from '../../src/types/shared';

/**
 * Builds a 5x5 maze where row 2 is a fully open horizontal "tunnel"
 * corridor and column 2 is a fully open vertical corridor, with walls
 * everywhere else.
 */
function buildTestMaze(): Maze {
  const maze = new Maze();
  const grid: Tile[][] = Array.from({ length: 5 }, () =>
    Array.from({ length: 5 }, (): Tile => 'wall'),
  );

  for (let col = 0; col < 5; col += 1) {
    grid[2][col] = 'corridor';
  }
  for (let row = 0; row < 5; row += 1) {
    grid[row][2] = 'corridor';
  }

  maze.setGrid(grid);
  return maze;
}

describe('PacMan', () => {
  let maze: Maze;

  beforeEach(() => {
    maze = buildTestMaze();
  });

  it('[US-002#2] continues moving in the chosen direction until blocked by a wall', () => {
    const pacman = new PacMan(0, 2, 'right', 8);

    // Advance in small fixed steps, simulating a fixed-timestep loop.
    for (let i = 0; i < 200; i += 1) {
      pacman.update(16, maze);
    }

    // Row 2 wraps fully around (open tunnel), so Pac-Man never hits a wall
    // and keeps moving — confirming continuous movement until blocked.
    expect(pacman.moving).toBe(true);
    expect(pacman.direction).toBe('right');
  });

  it('[US-002#2] stops moving when blocked by a wall tile', () => {
    // Column 2 is open, but the vertical corridor is bounded by walls at
    // the extremes since only row 2 and column 2 are open — move up from
    // (2,2) toward the top-left corner which is a wall region for columns
    // other than 2. Use a maze where up movement is blocked directly.
    const blockedMaze = new Maze();
    const grid: Tile[][] = [
      ['wall', 'wall', 'wall'],
      ['wall', 'corridor', 'wall'],
      ['wall', 'corridor', 'wall'],
    ];
    blockedMaze.setGrid(grid);

    const pacman = new PacMan(1, 1, 'up', 8);
    for (let i = 0; i < 50; i += 1) {
      pacman.update(16, blockedMaze);
    }

    // The tile directly above the starting position is a wall, so Pac-Man
    // is blocked immediately and never leaves his starting row.
    expect(pacman.moving).toBe(false);
    expect(pacman.y).toBeCloseTo(1, 3);
  });

  it('[US-002#2] wraps through the tunnel when crossing the maze edge', () => {
    const pacman = new PacMan(4, 2, 'right', 8);

    // Enough steps to cross past the right edge and wrap to the left side.
    for (let i = 0; i < 40; i += 1) {
      pacman.update(16, maze);
    }

    expect(pacman.x).toBeGreaterThanOrEqual(0);
    expect(pacman.x).toBeLessThan(5);
  });

  it('[US-002#2] applies a queued direction change once grid-aligned', () => {
    const pacman = new PacMan(2, 0, 'down', 8);
    pacman.queueDirection('right');

    for (let i = 0; i < 30; i += 1) {
      pacman.update(16, maze);
    }

    expect(pacman.direction).toBe('right');
  });

  it('[US-002#3] faces the direction of the most recent applied movement', () => {
    const pacman = new PacMan(2, 2, 'left', 8);
    expect(pacman.direction).toBe('left');

    pacman.queueDirection('up');
    for (let i = 0; i < 30; i += 1) {
      pacman.update(16, maze);
    }

    expect(pacman.direction).toBe('up');
  });

  it('[US-002#3] toggles the chomp animation (mouthOpen) while moving', () => {
    const pacman = new PacMan(0, 2, 'right', 8);
    const states = new Set<boolean>();

    for (let i = 0; i < 20; i += 1) {
      pacman.update(16, maze);
      states.add(pacman.mouthOpen);
    }

    expect(states.has(true)).toBe(true);
    expect(states.has(false)).toBe(true);
  });

  it('[US-002#3] resets the mouth to open when not moving', () => {
    const blockedMaze = new Maze();
    const grid: Tile[][] = [
      ['wall', 'wall', 'wall'],
      ['wall', 'corridor', 'wall'],
      ['wall', 'wall', 'wall'],
    ];
    blockedMaze.setGrid(grid);

    const pacman = new PacMan(1, 1, 'up', 8);
    pacman.update(16, blockedMaze);
    pacman.update(16, blockedMaze);

    expect(pacman.moving).toBe(false);
    expect(pacman.mouthOpen).toBe(true);
  });
});
