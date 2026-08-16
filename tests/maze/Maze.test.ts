import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Maze, loadMaze, MAZE_WIDTH, MAZE_HEIGHT } from '../../src/maze/Maze';
import type { Tile } from '../../src/types/shared';

/**
 * Creates a fake CanvasRenderingContext2D that records every draw call so
 * tests can assert on rendering behavior without depending on jsdom's
 * (unimplemented) 2D canvas support.
 */
function createFakeContext() {
  const calls: { type: string; fillStyle: string; args: number[] }[] = [];
  const ctx = {
    fillStyle: '#000000',
    fillRect: vi.fn(function (this: any, x: number, y: number, w: number, h: number) {
      calls.push({ type: 'fillRect', fillStyle: ctx.fillStyle, args: [x, y, w, h] });
    }),
    beginPath: vi.fn(() => {
      calls.push({ type: 'beginPath', fillStyle: ctx.fillStyle, args: [] });
    }),
    arc: vi.fn((x: number, y: number, r: number, start: number, end: number) => {
      calls.push({ type: 'arc', fillStyle: ctx.fillStyle, args: [x, y, r, start, end] });
    }),
    fill: vi.fn(() => {
      calls.push({ type: 'fill', fillStyle: ctx.fillStyle, args: [] });
    }),
  };
  return { ctx: ctx as unknown as CanvasRenderingContext2D, calls };
}

function buildGridWithTile(row: number, col: number, tile: Tile): Tile[][] {
  const grid: Tile[][] = [];
  for (let r = 0; r < MAZE_HEIGHT; r++) {
    const line: Tile[] = [];
    for (let c = 0; c < MAZE_WIDTH; c++) {
      line.push('corridor');
    }
    grid.push(line);
  }
  grid[row][col] = tile;
  return grid;
}

describe('Maze', () => {
  let maze: Maze;

  beforeEach(() => {
    maze = loadMaze();
  });

  describe('grid dimensions and tile access', () => {
    it('exposes the configured maze width and height', () => {
      expect(maze.width).toBe(MAZE_WIDTH);
      expect(maze.height).toBe(MAZE_HEIGHT);
    });

    it('treats out-of-bounds tiles as walls', () => {
      expect(maze.getTile(-1, 0)).toBe('wall');
      expect(maze.getTile(0, -1)).toBe('wall');
      expect(maze.getTile(MAZE_HEIGHT, 0)).toBe('wall');
      expect(maze.getTile(0, MAZE_WIDTH)).toBe('wall');
    });
  });

  describe('[US-001#1] wall rendering', () => {
    it('renders the maze border as walls', () => {
      expect(maze.getTile(0, 0)).toBe('wall');
      expect(maze.getTile(0, MAZE_WIDTH - 1)).toBe('wall');
      expect(maze.getTile(MAZE_HEIGHT - 1, 0)).toBe('wall');
      expect(maze.isWalkable(0, 0)).toBe(false);
    });

    it('paints a wall tile with the wall color on render', () => {
      const grid = buildGridWithTile(5, 5, 'wall');
      const wallMaze = new Maze(grid);
      const { ctx, calls } = createFakeContext();

      wallMaze.render(ctx, 16, {
        wall: '#2121de',
        dot: '#fff',
        powerPellet: '#fff',
        ghostHouse: '#111',
        tunnel: '#222',
        background: '#000',
      });

      const wallFill = calls.find(
        (c) => c.type === 'fillRect' && c.fillStyle === '#2121de' && c.args[0] === 80 && c.args[1] === 80,
      );
      expect(wallFill).toBeDefined();
    });
  });

  describe('[US-001#2] corridor/empty tile background rendering', () => {
    it('fills a background color under every tile, including corridors', () => {
      const grid = buildGridWithTile(3, 3, 'corridor');
      const corridorMaze = new Maze(grid);
      const { ctx, calls } = createFakeContext();

      corridorMaze.render(ctx, 16, {
        wall: '#2121de',
        dot: '#fff',
        powerPellet: '#fff',
        ghostHouse: '#111',
        tunnel: '#222',
        background: '#000000',
      });

      const backgroundFillAtOrigin = calls.find(
        (c) => c.type === 'fillRect' && c.fillStyle === '#000000' && c.args[0] === 0 && c.args[1] === 0,
      );
      expect(backgroundFillAtOrigin).toBeDefined();

      // A corridor tile must not draw a dot/pellet arc.
      const arcsAtCorridorCenter = calls.filter(
        (c) => c.type === 'arc' && c.args[0] === 3 * 16 + 8 && c.args[1] === 3 * 16 + 8,
      );
      expect(arcsAtCorridorCenter.length).toBe(0);
    });

    it('paints the background before drawing an empty (eaten) tile', () => {
      const grid = buildGridWithTile(4, 4, 'empty');
      const emptyMaze = new Maze(grid);
      const { ctx, calls } = createFakeContext();

      emptyMaze.render(ctx, 16, {
        wall: '#2121de',
        dot: '#fff',
        powerPellet: '#fff',
        ghostHouse: '#111',
        tunnel: '#222',
        background: '#050505',
      });

      const backgroundFill = calls.find(
        (c) => c.type === 'fillRect' && c.fillStyle === '#050505' && c.args[0] === 4 * 16 && c.args[1] === 4 * 16,
      );
      expect(backgroundFill).toBeDefined();
    });
  });

  describe('[US-001#3] dot rendering and consumption', () => {
    it('counts every dot tile in the default layout', () => {
      expect(maze.getRemainingDots()).toBeGreaterThan(0);
    });

    it('renders a dot as an arc filled with the dot color', () => {
      const grid = buildGridWithTile(6, 6, 'dot');
      const dotMaze = new Maze(grid);
      const { ctx, calls } = createFakeContext();

      dotMaze.render(ctx, 16, {
        wall: '#2121de',
        dot: '#ffb8ae',
        powerPellet: '#fff',
        ghostHouse: '#111',
        tunnel: '#222',
        background: '#000',
      });

      const dotArc = calls.find((c) => c.type === 'arc' && c.fillStyle === '#ffb8ae');
      expect(dotArc).toBeDefined();
    });

    it('removes a dot and decrements the remaining count when eaten', () => {
      // Find a known dot tile in the default layout.
      let dotRow = -1;
      let dotCol = -1;
      outer: for (let r = 0; r < maze.height; r++) {
        for (let c = 0; c < maze.width; c++) {
          if (maze.getTile(r, c) === 'dot') {
            dotRow = r;
            dotCol = c;
            break outer;
          }
        }
      }
      expect(dotRow).toBeGreaterThanOrEqual(0);

      const before = maze.getRemainingDots();
      const ate = maze.eatDot(dotRow, dotCol);

      expect(ate).toBe(true);
      expect(maze.getTile(dotRow, dotCol)).toBe('empty');
      expect(maze.getRemainingDots()).toBe(before - 1);
    });

    it('returns false when eating a dot at a tile with no dot', () => {
      expect(maze.eatDot(0, 0)).toBe(false);
    });
  });

  describe('[US-001#4] power pellet rendering and consumption', () => {
    it('counts every power pellet in the default layout', () => {
      expect(maze.getRemainingPellets()).toBe(4);
    });

    it('renders a power pellet as a larger arc filled with the pellet color', () => {
      const grid = buildGridWithTile(6, 6, 'power-pellet');
      const pelletMaze = new Maze(grid);
      const { ctx, calls } = createFakeContext();

      pelletMaze.render(ctx, 16, {
        wall: '#2121de',
        dot: '#fff',
        powerPellet: '#ffb8ae',
        ghostHouse: '#111',
        tunnel: '#222',
        background: '#000',
      });

      const pelletArc = calls.find((c) => c.type === 'arc' && c.fillStyle === '#ffb8ae');
      expect(pelletArc).toBeDefined();
      expect(pelletArc!.args[2]).toBeGreaterThan(2);
    });

    it('removes a power pellet and decrements the remaining count when eaten', () => {
      let row = -1;
      let col = -1;
      outer: for (let r = 0; r < maze.height; r++) {
        for (let c = 0; c < maze.width; c++) {
          if (maze.getTile(r, c) === 'power-pellet') {
            row = r;
            col = c;
            break outer;
          }
        }
      }
      expect(row).toBeGreaterThanOrEqual(0);

      const before = maze.getRemainingPellets();
      const ate = maze.eatPowerPellet(row, col);

      expect(ate).toBe(true);
      expect(maze.getTile(row, col)).toBe('empty');
      expect(maze.getRemainingPellets()).toBe(before - 1);
    });
  });

  describe('[US-001#5] tunnel wraparound', () => {
    it('marks the tunnel row edges as tunnel tiles', () => {
      const tunnelRow = maze.getTunnelRow();
      expect(maze.isTunnel(tunnelRow, 0)).toBe(true);
      expect(maze.isTunnel(tunnelRow, maze.width - 1)).toBe(true);
    });

    it('treats tunnel tiles as walkable so Pac-Man/ghosts can wrap through', () => {
      const tunnelRow = maze.getTunnelRow();
      expect(maze.isWalkable(tunnelRow, 0)).toBe(true);
    });

    it('renders a tunnel tile with the tunnel color', () => {
      const grid = buildGridWithTile(7, 7, 'tunnel');
      const tunnelMaze = new Maze(grid);
      const { ctx, calls } = createFakeContext();

      tunnelMaze.render(ctx, 16, {
        wall: '#2121de',
        dot: '#fff',
        powerPellet: '#fff',
        ghostHouse: '#111',
        tunnel: '#0a0a2a',
        background: '#000',
      });

      const tunnelFill = calls.find((c) => c.type === 'fillRect' && c.fillStyle === '#0a0a2a');
      expect(tunnelFill).toBeDefined();
    });
  });

  describe('[US-001#6] ghost house rendering', () => {
    it('places a ghost-house block at the center of the default layout', () => {
      const centerRow = Math.floor(maze.height / 2);
      const centerCol = Math.floor(maze.width / 2);
      expect(maze.getTile(centerRow, centerCol)).toBe('ghost-house');
    });

    it('renders a ghost-house tile with the ghost house color', () => {
      const grid = buildGridWithTile(9, 9, 'ghost-house');
      const houseMaze = new Maze(grid);
      const { ctx, calls } = createFakeContext();

      houseMaze.render(ctx, 16, {
        wall: '#2121de',
        dot: '#fff',
        powerPellet: '#fff',
        ghostHouse: '#0b0b2a',
        tunnel: '#222',
        background: '#000',
      });

      const houseFill = calls.find((c) => c.type === 'fillRect' && c.fillStyle === '#0b0b2a');
      expect(houseFill).toBeDefined();
    });
  });

  describe('getTotalEaten', () => {
    it('starts at zero when nothing has been eaten', () => {
      const grid: Tile[][] = [
        ['wall', 'wall', 'wall', 'wall'],
        ['wall', 'dot', 'power-pellet', 'wall'],
        ['wall', 'dot', 'wall', 'wall'],
        ['wall', 'wall', 'wall', 'wall'],
      ];
      const tinyMaze = new Maze(grid);
      expect(tinyMaze.getTotalEaten()).toBe(0);
    });

    it('accumulates eaten dots and power pellets across the level', () => {
      const grid: Tile[][] = [
        ['wall', 'wall', 'wall', 'wall'],
        ['wall', 'dot', 'power-pellet', 'wall'],
        ['wall', 'dot', 'wall', 'wall'],
        ['wall', 'wall', 'wall', 'wall'],
      ];
      const tinyMaze = new Maze(grid);

      tinyMaze.eatDot(1, 1);
      expect(tinyMaze.getTotalEaten()).toBe(1);

      tinyMaze.eatPowerPellet(1, 2);
      expect(tinyMaze.getTotalEaten()).toBe(2);

      tinyMaze.eatDot(2, 1);
      expect(tinyMaze.getTotalEaten()).toBe(3);

      // Re-eating an already-eaten tile is a no-op and must not inflate the count.
      expect(tinyMaze.eatDot(1, 1)).toBe(false);
      expect(tinyMaze.getTotalEaten()).toBe(3);
    });
  });

  describe('level completion', () => {
    it('is not complete while dots or pellets remain', () => {
      expect(maze.isComplete()).toBe(false);
    });

    it('reports complete once every dot and pellet has been eaten', () => {
      const grid: Tile[][] = [
        ['wall', 'wall', 'wall'],
        ['wall', 'dot', 'wall'],
        ['wall', 'wall', 'wall'],
      ];
      const tinyMaze = new Maze(grid);
      expect(tinyMaze.isComplete()).toBe(false);
      tinyMaze.eatDot(1, 1);
      expect(tinyMaze.isComplete()).toBe(true);
    });
  });

  describe('defensive copying', () => {
    it('does not mutate the source grid passed into the constructor', () => {
      const source: Tile[][] = [
        ['wall', 'wall', 'wall'],
        ['wall', 'dot', 'wall'],
        ['wall', 'wall', 'wall'],
      ];
      const copyMaze = new Maze(source);
      copyMaze.eatDot(1, 1);

      expect(source[1][1]).toBe('dot');
      expect(copyMaze.getTile(1, 1)).toBe('empty');
    });
  });
});
