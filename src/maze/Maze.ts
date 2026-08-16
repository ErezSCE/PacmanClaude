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
 * Minimal drawing surface `renderTile` needs. Both `CanvasRenderingContext2D`
 * and `OffscreenCanvasRenderingContext2D` satisfy this structurally, which
 * lets the same tile-drawing code run against the visible canvas context
 * (fallback path) or an offscreen cache context (fast path).
 */
type TileRenderContext = Pick<
  CanvasRenderingContext2D,
  'fillStyle' | 'fillRect' | 'beginPath' | 'arc' | 'fill'
>;

function colorsEqual(a: MazeColors, b: MazeColors): boolean {
  return (
    a.wall === b.wall &&
    a.dot === b.dot &&
    a.powerPellet === b.powerPellet &&
    a.ghostHouse === b.ghostHouse &&
    a.tunnel === b.tunnel &&
    a.background === b.background
  );
}

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

  // Offscreen render cache: the static parts of the maze (walls, corridors,
  // dots, pellets, ghost house, tunnel) rarely change frame-to-frame, so we
  // draw them once into an offscreen canvas and blit that with a single
  // `drawImage()` call per frame instead of repeating ~400+ `fillRect`/`arc`
  // calls every frame. The cache is invalidated whenever a dot/pellet is
  // eaten (its tile changes) or the caller renders at a different tile size
  // / palette. If offscreen canvases aren't available in the current
  // environment (e.g. a test runtime without Canvas support), we fall back
  // to direct per-tile rendering onto the provided context every frame.
  private offscreenSource: OffscreenCanvas | HTMLCanvasElement | null = null;
  private offscreenContext: TileRenderContext | null = null;
  private cacheValid = false;
  private cachedTileSize = 0;
  private cachedColors: MazeColors | null = null;

  constructor(grid: Tile[][]) {
    // Defensive copy so external mutation of the source array (or its rows)
    // can't reach into this instance's internal state. A shallow per-row
    // spread is intentionally sufficient here (not a deep clone): `Tile` is
    // a string union of primitives, so copying each row's array copies
    // every cell value by value — there is no nested object/array to worry
    // about aliasing.
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

  /**
   * Whether this tile is one of the two wraparound edge cells of the
   * tunnel row (i.e. where an entity actually teleports from one side of
   * the maze to the other). The interior of the tunnel row is plain,
   * dot-free `corridor` track and is NOT reported by this method — use
   * {@link isTunnelPassage} to detect the full row (edges + interior).
   */
  isTunnel(row: number, col: number): boolean {
    return this.getTile(row, col) === 'tunnel';
  }

  /**
   * Whether [row, col] lies anywhere within the tunnel passage row,
   * including its dot-free `corridor` interior — not just the two
   * teleporting edge cells reported by {@link isTunnel}. Useful for
   * gameplay logic that needs to detect "is this entity currently
   * traversing the tunnel" (e.g. to slow ghosts down while inside it).
   */
  isTunnelPassage(row: number, col: number): boolean {
    return row === TUNNEL_ROW;
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
    // Clamp defensively: even if the grid were ever corrupted (e.g. a tile
    // manually set to 'dot' without going through this method), the
    // remaining count should never be allowed to go negative.
    this.dotsRemaining = Math.max(0, this.dotsRemaining - 1);
    this.cacheValid = false;
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
    // Same defensive clamp as `eatDot` — never let the count go negative.
    this.pelletsRemaining = Math.max(0, this.pelletsRemaining - 1);
    this.cacheValid = false;
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
    const paletteChanged = !this.cachedColors || !colorsEqual(this.cachedColors, colors);
    if (!this.cacheValid || this.cachedTileSize !== tileSize || paletteChanged) {
      this.rebuildCache(tileSize, colors);
    }

    if (this.offscreenSource && this.offscreenContext) {
      ctx.drawImage(this.offscreenSource, 0, 0);
      return;
    }

    // Offscreen caching unavailable in this environment (no Canvas support,
    // e.g. some test runtimes) — fall back to direct per-tile rendering
    // onto the provided context every frame.
    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        this.renderTile(ctx, this.grid[row][col], row, col, tileSize, colors);
      }
    }
  }

  /** (Re)draws every tile into the offscreen cache canvas, if available. */
  private rebuildCache(tileSize: number, colors: MazeColors): void {
    this.cacheValid = true;
    this.cachedTileSize = tileSize;
    this.cachedColors = { ...colors };

    const context = this.ensureOffscreenContext(tileSize);
    if (!context) return;

    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        this.renderTile(context, this.grid[row][col], row, col, tileSize, colors);
      }
    }
  }

  /**
   * Lazily creates (or resizes) the offscreen cache canvas and returns its
   * 2D context, or `null` if this environment has no usable Canvas support.
   */
  private ensureOffscreenContext(tileSize: number): TileRenderContext | null {
    const width = this.width * tileSize;
    const height = this.height * tileSize;
    if (width <= 0 || height <= 0) return null;

    if (typeof OffscreenCanvas !== 'undefined') {
      const canvas = new OffscreenCanvas(width, height);
      const context = canvas.getContext('2d');
      if (!context) return null;
      this.offscreenSource = canvas;
      this.offscreenContext = context as unknown as TileRenderContext;
      return this.offscreenContext;
    }

    if (typeof document !== 'undefined' && typeof document.createElement === 'function') {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');
      if (!context) return null;
      this.offscreenSource = canvas;
      this.offscreenContext = context;
      return this.offscreenContext;
    }

    return null;
  }

  private renderTile(
    ctx: TileRenderContext,
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
