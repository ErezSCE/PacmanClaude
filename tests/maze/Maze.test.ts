import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Maze, loadMaze } from '../../src/maze/Maze';
import { buildDefaultLayout, GHOST_HOUSE_COLS, GHOST_HOUSE_ROWS, TUNNEL_ROW } from '../../src/maze/mazeLayout';
import type { Tile } from '../../src/types/shared';

function createMockContext() {
  return {
    fillStyle: '',
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
  } as unknown as CanvasRenderingContext2D;
}

describe('Maze', () => {
  let maze: Maze;

  beforeEach(() => {
    maze = loadMaze();
  });

  describe('[US-001#1] maze layout: walls, corridors, ghost house, tunnel', () => {
    it('renders distinct wall tiles on the border', () => {
      expect(maze.getTile(0, 0)).toBe('wall');
      expect(maze.getTile(0, 5)).toBe('wall');
    });

    it('renders distinct corridor tiles (walkable, no dot)', () => {
      const entranceRow = GHOST_HOUSE_ROWS[0] - 1;
      expect(maze.getTile(entranceRow, GHOST_HOUSE_COLS[0])).toBe('corridor');
    });

    it('has a visible center ghost house block', () => {
      const midRow = Math.floor((GHOST_HOUSE_ROWS[0] + GHOST_HOUSE_ROWS[1]) / 2);
      const midCol = Math.floor((GHOST_HOUSE_COLS[0] + GHOST_HOUSE_COLS[1]) / 2);
      expect(maze.getTile(midRow, midCol)).toBe('ghost-house');
      // Roughly centered in the maze width.
      expect(Math.abs(midCol - Math.floor(maze.width / 2))).toBeLessThanOrEqual(1);
    });

    it('has at least one left-right tunnel connection', () => {
      expect(maze.getTile(TUNNEL_ROW, 0)).toBe('tunnel');
      expect(maze.getTile(TUNNEL_ROW, maze.width - 1)).toBe('tunnel');
      expect(maze.isTunnel(TUNNEL_ROW, 0)).toBe(true);
      expect(maze.isTunnel(TUNNEL_ROW, maze.width - 1)).toBe(true);
    });

    it('draws walls, dots, pellets, ghost house, and tunnel tiles to the canvas context', () => {
      const ctx = createMockContext();
      maze.render(ctx, 16);

      expect((ctx.fillRect as ReturnType<typeof vi.fn>).mock.calls.length).toBeGreaterThan(0);
      expect((ctx.arc as ReturnType<typeof vi.fn>).mock.calls.length).toBeGreaterThan(0);
    });

    it('treats out-of-bounds tiles as walls', () => {
      expect(maze.getTile(-1, 0)).toBe('wall');
      expect(maze.getTile(0, -1)).toBe('wall');
      expect(maze.getTile(maze.height, 0)).toBe('wall');
    });
  });

  describe('[US-001#2] dots and power pellets: placement and eating', () => {
    it('places exactly four power pellets in the default layout', () => {
      const grid = buildDefaultLayout();
      let pelletCount = 0;
      for (const row of grid) {
        for (const tile of row) {
          if (tile === 'power-pellet') pelletCount++;
        }
      }
      expect(pelletCount).toBe(4);
    });

    it('places regular dots throughout the walkable corridors', () => {
      expect(maze.getRemainingDots()).toBeGreaterThan(0);
    });

    it('removes a dot visually (tile becomes empty) and decrements the dot count when eaten', () => {
      const before = maze.getRemainingDots();
      // Find a known dot tile.
      let dotRow = -1;
      let dotCol = -1;
      outer: for (let row = 0; row < maze.height; row++) {
        for (let col = 0; col < maze.width; col++) {
          if (maze.getTile(row, col) === 'dot') {
            dotRow = row;
            dotCol = col;
            break outer;
          }
        }
      }
      expect(dotRow).toBeGreaterThanOrEqual(0);

      const eaten = maze.eatDot(dotRow, dotCol);
      expect(eaten).toBe(true);
      expect(maze.getTile(dotRow, dotCol)).toBe('empty');
      expect(maze.getRemainingDots()).toBe(before - 1);
    });

    it('removes a power pellet visually (tile becomes empty) and decrements the pellet count when eaten', () => {
      const before = maze.getRemainingPellets();
      let pelletRow = -1;
      let pelletCol = -1;
      outer: for (let row = 0; row < maze.height; row++) {
        for (let col = 0; col < maze.width; col++) {
          if (maze.getTile(row, col) === 'power-pellet') {
            pelletRow = row;
            pelletCol = col;
            break outer;
          }
        }
      }
      expect(pelletRow).toBeGreaterThanOrEqual(0);

      const eaten = maze.eatPowerPellet(pelletRow, pelletCol);
      expect(eaten).toBe(true);
      expect(maze.getTile(pelletRow, pelletCol)).toBe('empty');
      expect(maze.getRemainingPellets()).toBe(before - 1);
    });

    it('does not eat a dot from a non-dot tile', () => {
      expect(maze.eatDot(0, 0)).toBe(false);
      expect(maze.eatPowerPellet(0, 0)).toBe(false);
    });

    it('stops drawing a consumable once it has been eaten', () => {
      let dotRow = -1;
      let dotCol = -1;
      outer: for (let row = 0; row < maze.height; row++) {
        for (let col = 0; col < maze.width; col++) {
          if (maze.getTile(row, col) === 'dot') {
            dotRow = row;
            dotCol = col;
            break outer;
          }
        }
      }

      const ctxBefore = createMockContext();
      maze.render(ctxBefore, 16);
      const arcCallsBefore = (ctxBefore.arc as ReturnType<typeof vi.fn>).mock.calls.length;

      maze.eatDot(dotRow, dotCol);

      const ctxAfter = createMockContext();
      maze.render(ctxAfter, 16);
      const arcCallsAfter = (ctxAfter.arc as ReturnType<typeof vi.fn>).mock.calls.length;

      expect(arcCallsAfter).toBe(arcCallsBefore - 1);
    });
  });

  describe('[US-001#3] maze completion tracking', () => {
    it('exposes remaining dot and pellet counts', () => {
      expect(maze.getRemainingDots()).toBeGreaterThan(0);
      expect(maze.getRemainingPellets()).toBe(4);
    });

    it('is not complete while consumables remain', () => {
      expect(maze.isComplete()).toBe(false);
    });

    it('reports completion once every dot and pellet has been eaten', () => {
      for (let row = 0; row < maze.height; row++) {
        for (let col = 0; col < maze.width; col++) {
          const tile: Tile = maze.getTile(row, col);
          if (tile === 'dot') maze.eatDot(row, col);
          if (tile === 'power-pellet') maze.eatPowerPellet(row, col);
        }
      }

      expect(maze.getRemainingDots()).toBe(0);
      expect(maze.getRemainingPellets()).toBe(0);
      expect(maze.isComplete()).toBe(true);
    });

    it('tracks the total number of consumables eaten so far', () => {
      const initialEaten = maze.getTotalEaten();
      expect(initialEaten).toBe(0);

      let dotRow = -1;
      let dotCol = -1;
      outer: for (let row = 0; row < maze.height; row++) {
        for (let col = 0; col < maze.width; col++) {
          if (maze.getTile(row, col) === 'dot') {
            dotRow = row;
            dotCol = col;
            break outer;
          }
        }
      }
      maze.eatDot(dotRow, dotCol);

      expect(maze.getTotalEaten()).toBe(1);
    });
  });

  describe('Maze construction', () => {
    it('creates independent instances that do not share mutable grid state', () => {
      const grid = buildDefaultLayout();
      const mazeA = new Maze(grid);
      const mazeB = new Maze(grid);

      let dotRow = -1;
      let dotCol = -1;
      outer: for (let row = 0; row < mazeA.height; row++) {
        for (let col = 0; col < mazeA.width; col++) {
          if (mazeA.getTile(row, col) === 'dot') {
            dotRow = row;
            dotCol = col;
            break outer;
          }
        }
      }

      mazeA.eatDot(dotRow, dotCol);

      expect(mazeA.getTile(dotRow, dotCol)).toBe('empty');
      expect(mazeB.getTile(dotRow, dotCol)).toBe('dot');
    });
  });
});
