import type { Tile } from '../types/shared';

/** Maze grid width in tiles. */
export const MAZE_WIDTH = 19;

/** Maze grid height in tiles. */
export const MAZE_HEIGHT = 21;

/** Row index of the left-right tunnel wraparound corridor. */
export const TUNNEL_ROW = 12;

/** Row range (inclusive) occupied by the center ghost house. */
export const GHOST_HOUSE_ROWS: readonly [number, number] = [9, 11];

/** Column range (inclusive) occupied by the center ghost house. */
export const GHOST_HOUSE_COLS: readonly [number, number] = [7, 11];

function inRange(value: number, [min, max]: readonly [number, number]): boolean {
  return value >= min && value <= max;
}

/**
 * Builds a fresh copy of the default level-1 maze tile grid: bordered walls,
 * a center ghost house, a left-right tunnel row, symmetric inner wall
 * pillars, four power pellets near the corners, and dots filling every
 * other walkable corridor tile.
 */
export function buildDefaultLayout(): Tile[][] {
  const grid: Tile[][] = [];

  for (let row = 0; row < MAZE_HEIGHT; row++) {
    const line: Tile[] = [];
    for (let col = 0; col < MAZE_WIDTH; col++) {
      line.push(computeTile(row, col));
    }
    grid.push(line);
  }

  return grid;
}

function computeTile(row: number, col: number): Tile {
  const isBorderRow = row === 0 || row === MAZE_HEIGHT - 1;
  const isBorderCol = col === 0 || col === MAZE_WIDTH - 1;

  // Left-right tunnel wraparound: the tunnel row has open side "walls".
  if (row === TUNNEL_ROW && isBorderCol) {
    return 'tunnel';
  }

  if (isBorderRow || isBorderCol) {
    return 'wall';
  }

  // Center ghost house block.
  if (inRange(row, GHOST_HOUSE_ROWS) && inRange(col, GHOST_HOUSE_COLS)) {
    return 'ghost-house';
  }

  // Entrance corridor just above the ghost house (kept dot-free).
  if (row === GHOST_HOUSE_ROWS[0] - 1 && inRange(col, GHOST_HOUSE_COLS)) {
    return 'corridor';
  }

  // The tunnel row's interior stays dot-free for a clean wraparound run.
  if (row === TUNNEL_ROW) {
    return 'corridor';
  }

  // Four power pellets, one near each interior corner.
  const isNearCorner =
    (row === 1 && (col === 1 || col === MAZE_WIDTH - 2)) ||
    (row === MAZE_HEIGHT - 2 && (col === 1 || col === MAZE_WIDTH - 2));
  if (isNearCorner) {
    return 'power-pellet';
  }

  // A handful of symmetric internal wall pillars for maze structure.
  if (isInnerWallPillar(row, col)) {
    return 'wall';
  }

  return 'dot';
}

function isInnerWallPillar(row: number, col: number): boolean {
  const mirroredCol = MAZE_WIDTH - 1 - col;
  const pillarRowBands: ReadonlyArray<readonly [number, number]> = [
    [2, 3],
    [17, 18],
  ];
  const pillarColBands: ReadonlyArray<readonly [number, number]> = [
    [2, 3],
    [5, 6],
  ];

  const rowMatches = pillarRowBands.some((band) => inRange(row, band));
  if (!rowMatches) return false;

  return pillarColBands.some(
    (band) => inRange(col, band) || inRange(mirroredCol, band),
  );
}
