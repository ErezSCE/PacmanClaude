import type { Tile } from '../types/shared';

/** Maze grid width in tiles. */
export const MAZE_WIDTH = 21;

/** Maze grid height in tiles. */
export const MAZE_HEIGHT = 25;

/** Row index of the left-right tunnel wraparound corridor. */
export const TUNNEL_ROW = 12;

/** Pac-Man's starting position (tile coords). */
export const PACMAN_START = { col: 10, row: 20 };

/** Ghost starting positions inside the ghost house. */
export const GHOST_STARTS: Record<string, { col: number; row: number }> = {
  blinky: { col: 10, row: 9 },
  pinky: { col: 10, row: 12 },
  inky: { col: 8, row: 12 },
  clyde: { col: 12, row: 12 },
};

/** Ghost house door tile position. */
export const GHOST_HOUSE_DOOR = { col: 10, row: 10 };

/** Fruit spawn position near center of maze. */
export const FRUIT_SPAWN = { col: 10, row: 15 };

/** Ghost house row range (inclusive). */
const GH_ROW_MIN = 11;
const GH_ROW_MAX = 13;
/** Ghost house column range (inclusive). */
const GH_COL_MIN = 8;
const GH_COL_MAX = 12;

/** Power pellet positions (row, col). */
const POWER_PELLET_POSITIONS: Array<[number, number]> = [
  [2, 1],
  [2, MAZE_WIDTH - 2],
  [MAZE_HEIGHT - 3, 1],
  [MAZE_HEIGHT - 3, MAZE_WIDTH - 2],
];

/** Inner wall pillar definitions: [rowMin, rowMax, colMin, colMax]. */
const INNER_WALLS: Array<[number, number, number, number]> = [
  // Top section pillars
  [2, 3, 3, 5],
  [2, 3, MAZE_WIDTH - 6, MAZE_WIDTH - 4],
  [2, 3, 8, 12],
  // Row 5 horizontal walls
  [5, 5, 1, 2],
  [5, 5, MAZE_WIDTH - 3, MAZE_WIDTH - 2],
  [5, 6, 4, 5],
  [5, 6, MAZE_WIDTH - 6, MAZE_WIDTH - 5],
  [5, 5, 7, 13],
  // Upper maze walls near ghost house
  [7, 8, 1, 2],
  [7, 8, MAZE_WIDTH - 3, MAZE_WIDTH - 2],
  [7, 7, 4, 5],
  [7, 7, MAZE_WIDTH - 6, MAZE_WIDTH - 5],
  [7, 8, 7, 7],
  [7, 8, MAZE_WIDTH - 8, MAZE_WIDTH - 8],
  // Ghost house walls
  [9, 9, 7, 7],
  [9, 9, MAZE_WIDTH - 8, MAZE_WIDTH - 8],
  // Side walls alongside ghost house
  [10, 14, 1, 2],
  [10, 14, MAZE_WIDTH - 3, MAZE_WIDTH - 2],
  [10, 14, 4, 5],
  [10, 14, MAZE_WIDTH - 6, MAZE_WIDTH - 5],
  // Below ghost house
  [15, 15, 7, 7],
  [15, 15, MAZE_WIDTH - 8, MAZE_WIDTH - 8],
  // Lower maze walls
  [16, 17, 1, 2],
  [16, 17, MAZE_WIDTH - 3, MAZE_WIDTH - 2],
  [16, 16, 4, 5],
  [16, 16, MAZE_WIDTH - 6, MAZE_WIDTH - 5],
  [16, 17, 7, 7],
  [16, 17, MAZE_WIDTH - 8, MAZE_WIDTH - 8],
  // Bottom section
  [18, 18, 4, 5],
  [18, 18, MAZE_WIDTH - 6, MAZE_WIDTH - 5],
  [18, 18, 8, 12],
  [20, 20, 2, 3],
  [20, 20, MAZE_WIDTH - 4, MAZE_WIDTH - 3],
  [20, 21, 5, 5],
  [20, 21, MAZE_WIDTH - 6, MAZE_WIDTH - 6],
  [20, 20, 8, 12],
  [22, 22, 1, 5],
  [22, 22, MAZE_WIDTH - 6, MAZE_WIDTH - 2],
  [22, 22, 7, 13],
];

function isInnerWall(row: number, col: number): boolean {
  return INNER_WALLS.some(
    ([rMin, rMax, cMin, cMax]) =>
      row >= rMin && row <= rMax && col >= cMin && col <= cMax,
  );
}

function isGhostHouseInterior(row: number, col: number): boolean {
  return row >= GH_ROW_MIN && row <= GH_ROW_MAX &&
         col >= GH_COL_MIN && col <= GH_COL_MAX;
}

function isGhostHouseDoor(row: number, col: number): boolean {
  return row === GHOST_HOUSE_DOOR.row && col === GHOST_HOUSE_DOOR.col;
}

function isGhostHouseWall(row: number, col: number): boolean {
  if (!isGhostHouseInterior(row, col) && !isGhostHouseDoor(row, col)) return false;
  if (isGhostHouseDoor(row, col)) return false;
  // The perimeter of the ghost house box
  if (row === GH_ROW_MIN || row === GH_ROW_MAX) return true;
  if (col === GH_COL_MIN || col === GH_COL_MAX) return true;
  return false;
}

function isPowerPellet(row: number, col: number): boolean {
  return POWER_PELLET_POSITIONS.some(([r, c]) => r === row && c === col);
}

function isBorder(row: number, col: number): boolean {
  return row === 0 || row === MAZE_HEIGHT - 1 || col === 0 || col === MAZE_WIDTH - 1;
}

function isTunnel(row: number, col: number): boolean {
  return row === TUNNEL_ROW && (col === 0 || col === MAZE_WIDTH - 1);
}

/** Tiles that should not have dots placed on them. */
function isDotFreeZone(row: number, col: number): boolean {
  // No dots in the ghost house area or its immediate surroundings
  if (row >= GH_ROW_MIN - 1 && row <= GH_ROW_MAX + 1 &&
      col >= GH_COL_MIN - 1 && col <= GH_COL_MAX + 1) return true;
  // No dots on the tunnel row
  if (row === TUNNEL_ROW) return true;
  // No dots in rows 8-16 outside the main corridors (keep sides open)
  if (row >= 8 && row <= 16 && (col === 3 || col === MAZE_WIDTH - 4)) return true;
  return false;
}

function computeTile(row: number, col: number): Tile {
  // Tunnel openings
  if (isTunnel(row, col)) return 'tunnel';

  // Outer border walls
  if (isBorder(row, col)) return 'wall';

  // Ghost house door (walkable empty tile)
  if (isGhostHouseDoor(row, col)) return 'empty';

  // Ghost house walls
  if (isGhostHouseWall(row, col)) return 'wall';

  // Ghost house interior
  if (isGhostHouseInterior(row, col)) return 'ghost-house';

  // Inner walls
  if (isInnerWall(row, col)) return 'wall';

  // Power pellets
  if (isPowerPellet(row, col)) return 'power-pellet';

  // Dot-free empty corridors
  if (isDotFreeZone(row, col)) return 'empty';

  return 'dot';
}

/**
 * Builds a fresh copy of the default maze tile grid.
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
