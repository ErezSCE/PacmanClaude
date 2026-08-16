import { describe, it, expect } from 'vitest';
import {
  buildDefaultLayout,
  MAZE_WIDTH,
  MAZE_HEIGHT,
  TUNNEL_ROW,
  GHOST_HOUSE_ROWS,
  GHOST_HOUSE_COLS,
} from '../../src/maze/mazeLayout';
import type { Tile } from '../../src/types/shared';

function isWalkableTile(tile: Tile): boolean {
  return tile !== 'wall';
}

/** Flood-fills from a starting walkable tile, returning every reachable cell. */
function floodFillReachable(grid: Tile[][], start: [number, number]): Set<string> {
  const visited = new Set<string>();
  const queue: [number, number][] = [start];
  const height = grid.length;
  const width = grid[0].length;

  while (queue.length > 0) {
    const [row, col] = queue.pop()!;
    const key = `${row},${col}`;
    if (visited.has(key)) continue;
    if (row < 0 || row >= height || col < 0 || col >= width) continue;
    if (!isWalkableTile(grid[row][col])) continue;

    visited.add(key);

    queue.push([row - 1, col]);
    queue.push([row + 1, col]);
    queue.push([row, col - 1]);
    queue.push([row, col + 1]);

    // Tunnel wraparound: the tunnel row connects the left and right edges.
    if (row === TUNNEL_ROW && col === 0) {
      queue.push([row, width - 1]);
    }
    if (row === TUNNEL_ROW && col === width - 1) {
      queue.push([row, 0]);
    }
  }

  return visited;
}

describe('mazeLayout', () => {
  describe('buildDefaultLayout', () => {
    it('produces a grid with the configured width and height', () => {
      const grid = buildDefaultLayout();
      expect(grid.length).toBe(MAZE_HEIGHT);
      for (const row of grid) {
        expect(row.length).toBe(MAZE_WIDTH);
      }
    });

    it('surrounds the maze with walls except at the tunnel row', () => {
      const grid = buildDefaultLayout();
      for (let col = 0; col < MAZE_WIDTH; col++) {
        expect(grid[0][col]).toBe('wall');
        expect(grid[MAZE_HEIGHT - 1][col]).toBe('wall');
      }
      expect(grid[TUNNEL_ROW][0]).toBe('tunnel');
      expect(grid[TUNNEL_ROW][MAZE_WIDTH - 1]).toBe('tunnel');
    });

    it('places a ghost house block within the configured center bounds', () => {
      const grid = buildDefaultLayout();
      for (let row = GHOST_HOUSE_ROWS[0]; row <= GHOST_HOUSE_ROWS[1]; row++) {
        for (let col = GHOST_HOUSE_COLS[0]; col <= GHOST_HOUSE_COLS[1]; col++) {
          expect(grid[row][col]).toBe('ghost-house');
        }
      }
    });

    it('places exactly four power pellets near the interior corners', () => {
      const grid = buildDefaultLayout();
      let pellets = 0;
      for (const row of grid) {
        for (const tile of row) {
          if (tile === 'power-pellet') pellets++;
        }
      }
      expect(pellets).toBe(4);
    });

    it('[US-001#6] keeps the entrance corridor above the ghost house dot-free', () => {
      const grid = buildDefaultLayout();
      const entranceRow = GHOST_HOUSE_ROWS[0] - 1;
      for (let col = GHOST_HOUSE_COLS[0]; col <= GHOST_HOUSE_COLS[1]; col++) {
        expect(grid[entranceRow][col]).toBe('corridor');
      }
    });

    it('[US-001#5] every dot and power pellet tile is reachable via the tunnel-connected corridor network', () => {
      const grid = buildDefaultLayout();

      // Find a walkable starting tile.
      let start: [number, number] | null = null;
      outer: for (let row = 0; row < MAZE_HEIGHT; row++) {
        for (let col = 0; col < MAZE_WIDTH; col++) {
          if (isWalkableTile(grid[row][col]) && grid[row][col] !== 'ghost-house') {
            start = [row, col];
            break outer;
          }
        }
      }
      expect(start).not.toBeNull();

      const reachable = floodFillReachable(grid, start as [number, number]);

      for (let row = 0; row < MAZE_HEIGHT; row++) {
        for (let col = 0; col < MAZE_WIDTH; col++) {
          const tile = grid[row][col];
          if (tile === 'dot' || tile === 'power-pellet') {
            expect(reachable.has(`${row},${col}`)).toBe(true);
          }
        }
      }
    });
  });
});
