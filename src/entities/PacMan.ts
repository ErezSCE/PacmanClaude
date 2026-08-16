import type { Direction, Tile } from '../types/shared';
import type { Maze } from '../maze/Maze';

const DIRECTION_VECTORS: Record<Direction, { dx: number; dy: number }> = {
  up: { dx: 0, dy: -1 },
  down: { dx: 0, dy: 1 },
  left: { dx: -1, dy: 0 },
  right: { dx: 1, dy: 0 },
};

const OPPOSITE_DIRECTION: Record<Direction, Direction> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
};

/** Distance from an integer tile coordinate considered "grid aligned". */
const ALIGNMENT_EPSILON = 0.001;

/** Default movement speed in tiles per second. */
const DEFAULT_SPEED = 8;

/** Seconds between chomp animation frame toggles while moving. */
const CHOMP_INTERVAL = 0.1;

/**
 * Maximum timestep (in milliseconds) applied in a single update. Caps the
 * effective delta when the browser delivers an unusually large frame (e.g.
 * after the tab was backgrounded), preventing Pac-Man from tunneling through
 * multiple tiles — and potentially walls — in one step.
 */
const MAX_DT_MS = 100;

/**
 * Owns Pac-Man's position, current/queued direction, continuous
 * movement-until-wall logic, chomp animation state, and tunnel wraparound.
 */
export class PacMan {
  x: number;
  y: number;
  direction: Direction;
  queuedDirection: Direction | null = null;
  alive = true;
  speed: number;
  mouthOpen = true;
  moving = false;

  private chompTimer = 0;

  constructor(
    startX = 0,
    startY = 0,
    direction: Direction = 'left',
    speed = DEFAULT_SPEED,
  ) {
    this.x = startX;
    this.y = startY;
    this.direction = direction;
    this.speed = speed;
  }

  /** Queues a direction change to be applied as soon as it is possible. */
  queueDirection(direction: Direction): void {
    this.queuedDirection = direction;
  }

  /**
   * Updates Pac-Man's movement speed (tiles per second). Used to vary speed
   * across levels or during transient states such as power-pellet frenzy.
   */
  setSpeed(speed: number): void {
    this.speed = speed;
  }

  /**
   * Advances Pac-Man's position for the given timestep (in milliseconds),
   * applying queued turns, wall-blocked stopping, tunnel wraparound, and
   * chomp animation updates. Deterministic for a fixed-timestep loop.
   */
  update(dtMs: number, maze: Maze): void {
    const dt = Math.min(dtMs, MAX_DT_MS) / 1000;
    const grid = maze.getGrid();
    const rows = grid.length;
    const cols = rows > 0 ? grid[0].length : 0;

    this.tryApplyQueuedDirection(maze);

    if (!this.canMove(this.direction, maze)) {
      this.alignToGrid();
      this.moving = false;
    } else {
      this.moving = true;
      const { dx, dy } = DIRECTION_VECTORS[this.direction];
      const prevX = this.x;
      const prevY = this.y;
      this.x += dx * this.speed * dt;
      this.y += dy * this.speed * dt;
      // Clamp to the grid line if this step crossed (or landed exactly on)
      // the next tile boundary. This keeps alignment-based turning and
      // wall-blocked stopping deterministic regardless of frame timestep
      // size, instead of relying on floating-point values happening to
      // land within a fixed epsilon of an integer.
      this.x = this.clampToGridLine(this.x, prevX, dx);
      this.y = this.clampToGridLine(this.y, prevY, dy);
      this.wrap(cols, rows);
    }

    this.updateChompAnimation(dt);
  }

  /**
   * If moving along an axis with the given delta sign has crossed the next
   * whole-tile boundary since `prevValue`, snaps to that boundary exactly.
   * Otherwise returns `current` unchanged.
   */
  private clampToGridLine(current: number, prevValue: number, delta: number): number {
    if (delta === 0) return current;
    const nextLine = delta > 0 ? Math.floor(prevValue) + 1 : Math.ceil(prevValue) - 1;
    if (delta > 0 && current >= nextLine) return nextLine;
    if (delta < 0 && current <= nextLine) return nextLine;
    return current;
  }

  private tryApplyQueuedDirection(maze: Maze): void {
    if (!this.queuedDirection) return;

    const isReversal = this.queuedDirection === OPPOSITE_DIRECTION[this.direction];
    const canTurnHere = isReversal || this.isAlignedToGrid();

    if (canTurnHere && this.canMove(this.queuedDirection, maze)) {
      this.direction = this.queuedDirection;
      this.queuedDirection = null;
      this.alignToGrid();
    }
  }

  private wrap(cols: number, rows: number): void {
    if (cols > 0) {
      if (this.x < 0) this.x += cols;
      if (this.x >= cols) this.x -= cols;
    }
    if (rows > 0) {
      if (this.y < 0) this.y += rows;
      if (this.y >= rows) this.y -= rows;
    }
  }

  private currentTile(): { row: number; col: number } {
    return { row: Math.round(this.y), col: Math.round(this.x) };
  }

  private isAlignedToGrid(): boolean {
    return (
      Math.abs(this.x - Math.round(this.x)) < ALIGNMENT_EPSILON &&
      Math.abs(this.y - Math.round(this.y)) < ALIGNMENT_EPSILON
    );
  }

  private alignToGrid(): void {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
  }

  /**
   * Checks whether Pac-Man can advance one step in `direction`. Only the
   * horizontal (column) axis wraps modulo the grid width, matching classic
   * Pac-Man's side tunnels — a target column that leaves through the left
   * or right edge reappears on the opposite side. The vertical axis never
   * wraps: a target row outside the grid (or any coordinate `getMaze`
   * doesn't recognize) has no known tile and is always treated as
   * impassable, so Pac-Man cannot walk off the top/bottom of a maze that
   * lacks a full boundary wall.
   */
  private canMove(direction: Direction, maze: Maze): boolean {
    const grid = maze.getGrid();
    const rows = grid.length;
    const cols = rows > 0 ? grid[0].length : 0;
    const { row, col } = this.currentTile();
    const { dx, dy } = DIRECTION_VECTORS[direction];

    const targetRow = row + dy;
    let targetCol = col + dx;
    if (cols > 0) targetCol = ((targetCol % cols) + cols) % cols;

    // `getTile` is typed to always return a `Tile`, but the target tile is
    // treated defensively as possibly `undefined` in case a maze
    // implementation doesn't guarantee boundary walls on all edges — any
    // coordinate without a known tile is treated as impassable.
    const tile: Tile | undefined = maze.getTile(targetRow, targetCol);
    return tile !== undefined && tile !== 'wall';
  }

  private updateChompAnimation(dt: number): void {
    if (!this.moving) {
      this.chompTimer = 0;
      this.mouthOpen = true;
      return;
    }

    this.chompTimer += dt;
    if (this.chompTimer >= CHOMP_INTERVAL) {
      this.chompTimer -= CHOMP_INTERVAL;
      this.mouthOpen = !this.mouthOpen;
    }
  }
}
