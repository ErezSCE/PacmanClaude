import type { Direction, GhostName } from '../types/shared';
import type { PacMan } from '../entities/PacMan';
import type { Ghost } from '../entities/Ghost';
import type { Maze } from '../maze/Maze';
import type { BonusFruit } from '../fruit/BonusFruit';
import type { ScoreManager } from '../scoring/ScoreManager';
import type { GamePhase } from '../game/GameState';

/** Default ghost colors. */
const GHOST_COLORS: Record<GhostName, string> = {
  blinky: '#FF0000',
  pinky: '#FFB8FF',
  inky: '#00FFFF',
  clyde: '#FFB847',
};

/** Colorblind-friendly ghost colors. */
const GHOST_COLORS_CB: Record<GhostName, string> = {
  blinky: '#0072B2',
  pinky: '#F0E442',
  inky: '#CC79A7',
  clyde: '#009E73',
};

/** Fruit display colors. */
const FRUIT_COLORS: Record<string, string> = {
  cherry: '#FF0000',
  strawberry: '#FF3366',
  orange: '#FFA500',
  apple: '#00FF00',
  melon: '#00CC00',
  galaxian: '#FFFF00',
  bell: '#FFD700',
  key: '#CCCCCC',
};

/** Direction-to-angle mapping for Pac-Man mouth orientation. */
const DIR_ANGLES: Record<Direction, number> = {
  right: 0,
  down: Math.PI / 2,
  left: Math.PI,
  up: -Math.PI / 2,
};

/**
 * Renders all game entities and HUD onto a canvas context.
 */
export class Renderer {
  private tileSize: number;
  private colorblind = false;
  private powerPelletBlink = true;
  private blinkTimer = 0;

  constructor(tileSize: number) {
    this.tileSize = tileSize;
  }

  setColorblind(enabled: boolean): void {
    this.colorblind = enabled;
  }

  setTileSize(size: number): void {
    this.tileSize = size;
  }

  /** Render a complete frame. */
  renderFrame(
    ctx: CanvasRenderingContext2D,
    maze: Maze,
    pacman: PacMan,
    ghosts: Ghost[],
    fruit: BonusFruit,
    scoreManager: ScoreManager,
    phase: GamePhase,
    dtMs: number,
  ): void {
    const ts = this.tileSize;

    // Update power pellet blink
    this.blinkTimer += dtMs;
    if (this.blinkTimer > 200) {
      this.blinkTimer = 0;
      this.powerPelletBlink = !this.powerPelletBlink;
    }

    // Clear
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Maze
    maze.render(ctx, ts);

    // Power pellet blink: overdraw with black when off
    if (!this.powerPelletBlink) {
      const grid = maze.getGrid();
      for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[row].length; col++) {
          if (grid[row][col] === 'power-pellet') {
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(col * ts + ts / 2, row * ts + ts / 2, ts * 0.3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }

    // Fruit
    if (fruit.active) {
      this.renderFruit(ctx, fruit);
    }

    // Ghosts
    for (const ghost of ghosts) {
      if (!ghost.inGhostHouse || phase === 'playing') {
        this.renderGhost(ctx, ghost);
      }
    }

    // Pac-Man (not during death animation end)
    if (pacman.alive || phase === 'dying') {
      this.renderPacMan(ctx, pacman, phase);
    }

    // HUD
    this.renderHUD(ctx, scoreManager, maze);
  }

  private renderPacMan(ctx: CanvasRenderingContext2D, pacman: PacMan, phase: GamePhase): void {
    const ts = this.tileSize;
    const cx = pacman.x * ts + ts / 2;
    const cy = pacman.y * ts + ts / 2;
    const radius = ts * 0.45;

    ctx.fillStyle = '#FFFF00';

    if (phase === 'dying') {
      // Death animation: shrinking circle
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.3, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    const angle = DIR_ANGLES[pacman.direction];
    const mouthAngle = pacman.mouthOpen ? 0.25 : 0.02;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, mouthAngle * Math.PI, -mouthAngle * Math.PI);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  private renderGhost(ctx: CanvasRenderingContext2D, ghost: Ghost): void {
    const ts = this.tileSize;
    const cx = ghost.x * ts + ts / 2;
    const cy = ghost.y * ts + ts / 2;
    const radius = ts * 0.45;

    let color: string;
    if (ghost.mode === 'eaten') {
      // Eyes only
      this.renderGhostEyes(ctx, cx, cy, radius, ghost.direction);
      return;
    } else if (ghost.mode === 'frightened') {
      if (ghost.flashing) {
        color = this.blinkTimer > 100 ? '#2121DE' : '#FFFFFF';
      } else {
        color = '#2121DE';
      }
    } else {
      const palette = this.colorblind ? GHOST_COLORS_CB : GHOST_COLORS;
      color = palette[ghost.name];
    }

    // Ghost body (rounded top + wavy bottom)
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cy - radius * 0.2, radius, Math.PI, 0);
    ctx.lineTo(cx + radius, cy + radius * 0.8);
    // Wavy bottom
    const wavePts = 3;
    const waveW = (radius * 2) / wavePts;
    for (let i = 0; i < wavePts; i++) {
      const wx = cx + radius - (i + 0.5) * waveW;
      const wy = cy + radius * 0.4;
      ctx.lineTo(cx + radius - i * waveW, cy + radius * 0.8);
      ctx.lineTo(wx, wy);
    }
    ctx.lineTo(cx - radius, cy + radius * 0.8);
    ctx.closePath();
    ctx.fill();

    // Eyes
    this.renderGhostEyes(ctx, cx, cy - radius * 0.1, radius * 0.7, ghost.direction);
  }

  private renderGhostEyes(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    size: number,
    direction: Direction,
  ): void {
    const eyeOffsetX = size * 0.3;
    const eyeR = size * 0.2;
    const pupilR = eyeR * 0.5;

    // Pupil direction offset
    let pdx = 0, pdy = 0;
    switch (direction) {
      case 'left': pdx = -pupilR * 0.5; break;
      case 'right': pdx = pupilR * 0.5; break;
      case 'up': pdy = -pupilR * 0.5; break;
      case 'down': pdy = pupilR * 0.5; break;
    }

    for (const sign of [-1, 1]) {
      // White of eye
      ctx.fillStyle = '#FFF';
      ctx.beginPath();
      ctx.arc(cx + sign * eyeOffsetX, cy, eyeR, 0, Math.PI * 2);
      ctx.fill();
      // Pupil
      ctx.fillStyle = '#00F';
      ctx.beginPath();
      ctx.arc(cx + sign * eyeOffsetX + pdx, cy + pdy, pupilR, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private renderFruit(ctx: CanvasRenderingContext2D, fruit: BonusFruit): void {
    const ts = this.tileSize;
    const cx = fruit.x * ts + ts / 2;
    const cy = fruit.y * ts + ts / 2;
    const color = FRUIT_COLORS[fruit.name] || '#FF0000';

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cy, ts * 0.35, 0, Math.PI * 2);
    ctx.fill();

    // Stem
    ctx.fillStyle = '#008000';
    ctx.fillRect(cx - 1, cy - ts * 0.4, 2, ts * 0.15);
  }

  private renderHUD(ctx: CanvasRenderingContext2D, scoreManager: ScoreManager, maze: Maze): void {
    const ts = this.tileSize;
    const canvasW = ctx.canvas.width;
    const hudY = maze.height * ts + 4;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, maze.height * ts, canvasW, 40);

    const fontSize = Math.max(10, Math.min(ts * 0.6, 16));
    ctx.font = `${fontSize}px "Press Start 2P", monospace`;
    ctx.textBaseline = 'top';

    // Score
    ctx.fillStyle = '#FFF';
    ctx.textAlign = 'left';
    ctx.fillText(`SCORE: ${scoreManager.score}`, 4, hudY);

    // High score
    ctx.textAlign = 'center';
    ctx.fillText(`HI: ${scoreManager.highScore}`, canvasW / 2, hudY);

    // Lives
    ctx.textAlign = 'right';
    const livesText = 'LIVES: ';
    ctx.fillText(livesText, canvasW - 4 - scoreManager.lives * (fontSize + 2), hudY);
    // Draw Pac-Man icons for lives
    ctx.fillStyle = '#FFFF00';
    for (let i = 0; i < scoreManager.lives; i++) {
      const lx = canvasW - 4 - (scoreManager.lives - i) * (fontSize + 2) + fontSize / 2;
      ctx.beginPath();
      ctx.arc(lx, hudY + fontSize / 2, fontSize * 0.4, 0.2 * Math.PI, 1.8 * Math.PI);
      ctx.lineTo(lx, hudY + fontSize / 2);
      ctx.closePath();
      ctx.fill();
    }
  }
}
