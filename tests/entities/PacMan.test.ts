import { describe, it, expect } from 'vitest';
import { PacMan } from '../../src/entities/PacMan';
import type { Maze } from '../../src/maze/Maze';
import type { Tile } from '../../src/types/shared';

/**
 * Builds a fake Maze backed by a plain grid of tiles. Only the two methods
 * PacMan actually calls (`getGrid`/`getTile`) are implemented — the object
 * is cast to `Maze` so tests stay decoupled from the real maze data layout.
 */
function makeMaze(rows: Tile[][]): Maze {
  return {
    getGrid: () => rows,
    getTile: (row: number, col: number): Tile | undefined => {
      if (row < 0 || row >= rows.length) return undefined;
      const line = rows[row];
      if (col < 0 || col >= line.length) return undefined;
      return line[col];
    },
  } as unknown as Maze;
}

const OPEN: Tile = 'empty';
const WALL: Tile = 'wall';

describe('PacMan', () => {
  it('[US-002#5] moves continuously in the current direction through open corridors', () => {
    const maze = makeMaze([
      [OPEN, OPEN, OPEN, OPEN, OPEN],
      [OPEN, OPEN, OPEN, OPEN, OPEN],
      [OPEN, OPEN, OPEN, OPEN, OPEN],
    ]);
    const pacman = new PacMan(1, 1, 'right', 8);

    pacman.update(1000 / 60, maze);

    expect(pacman.x).toBeGreaterThan(1);
    expect(pacman.moving).toBe(true);
  });

  it('[US-002#5] stops (does not pass through) when the next tile is a wall', () => {
    const maze = makeMaze([
      [OPEN, OPEN, WALL],
      [OPEN, OPEN, WALL],
      [OPEN, OPEN, WALL],
    ]);
    const pacman = new PacMan(1, 1, 'right', 8);

    for (let i = 0; i < 120; i += 1) {
      pacman.update(1000 / 60, maze);
    }

    expect(pacman.x).toBeLessThanOrEqual(2);
    expect(pacman.moving).toBe(false);
  });

  it('[US-002#5] queues a direction and applies it once grid-aligned', () => {
    const maze = makeMaze([
      [OPEN, OPEN, OPEN],
      [OPEN, OPEN, OPEN],
      [OPEN, OPEN, OPEN],
    ]);
    const pacman = new PacMan(1, 1, 'right', 8);

    pacman.queueDirection('down');
    // Already aligned to the grid, so the queued turn should apply on the
    // very next update instead of continuing right.
    pacman.update(16, maze);

    expect(pacman.direction).toBe('down');
  });

  it('[US-002#5] treats out-of-range/undefined tiles as impassable walls', () => {
    const maze = makeMaze([[OPEN]]);
    const pacman = new PacMan(0, 0, 'down', 8);

    for (let i = 0; i < 60; i += 1) {
      pacman.update(1000 / 60, maze);
    }

    expect(pacman.y).toBe(0);
    expect(pacman.moving).toBe(false);
  });

  it('[US-002#5] wraps around through open tunnel edges', () => {
    const maze = makeMaze([[OPEN, OPEN, OPEN]]);
    const pacman = new PacMan(2, 0, 'right', 8);

    for (let i = 0; i < 60; i += 1) {
      pacman.update(1000 / 60, maze);
    }

    expect(pacman.x).toBeGreaterThanOrEqual(0);
    expect(pacman.x).toBeLessThan(3);
  });

  it('[US-002#5] clamps abnormally large frame deltas so it cannot tunnel through a wall in one step', () => {
    const maze = makeMaze([[OPEN, OPEN, WALL, OPEN, OPEN]]);
    const pacman = new PacMan(0, 0, 'right', 8);

    // A single enormous dt (e.g. tab was backgrounded) must not skip over
    // the wall at column 2 in one frame.
    pacman.update(5000, maze);

    expect(pacman.x).toBeLessThanOrEqual(1);
  });

  it('[US-002#5] setSpeed updates the effective movement speed', () => {
    const maze = makeMaze([[OPEN, OPEN, OPEN, OPEN, OPEN]]);
    const pacman = new PacMan(0, 0, 'right', 1);

    pacman.setSpeed(20);
    pacman.update(1000 / 60, maze);

    expect(pacman.x).toBeGreaterThan(0.2);
  });
});
