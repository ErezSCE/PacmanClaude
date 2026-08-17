import { registerServiceWorker } from './sw-register';
import { Maze } from './maze/Maze';
import { PACMAN_START, GHOST_STARTS, MAZE_WIDTH, MAZE_HEIGHT } from './maze/mazeLayout';
import { PacMan } from './entities/PacMan';
import { Ghost, GHOST_SPEED_NORMAL } from './entities/Ghost';
import { GhostModeTimer } from './entities/ghostAI';
import { BonusFruit } from './fruit/BonusFruit';
import { ScoreManager } from './scoring/ScoreManager';
import { AudioManager } from './audio/AudioManager';
import { InputManager } from './input/InputManager';
import { DirectionalControls } from './input/DirectionalControls';
import { ScreenManager } from './ui/ScreenManager';
import { Renderer } from './rendering/Renderer';
import { GameState, getDifficultySettings, type GamePhase } from './game/GameState';
import { checkCollisions } from './collision/CollisionSystem';
import { startGameLoop, stopGameLoop } from './game/GameLoop';
import { getHighScores } from './persistence/HighScoreStore';
import { getSettings } from './persistence/SettingsStore';
import { toggleColorblindPalette } from './rendering/ghostPalette';
import type { GhostName } from './types/shared';
import './style.css';

const DEATH_ANIM_MS = 1500;
const LEVEL_COMPLETE_MS = 2500;
const COUNTDOWN_TOTAL_MS = 3500;

/** Compute tile size to fit the maze in the viewport. */
function computeTileSize(): number {
  const maxW = window.innerWidth;
  const maxH = window.innerHeight - 40; // Leave room for HUD
  const tileW = Math.floor(maxW / MAZE_WIDTH);
  const tileH = Math.floor(maxH / MAZE_HEIGHT);
  return Math.max(8, Math.min(tileW, tileH, 32));
}

async function boot(): Promise<void> {
  registerServiceWorker();

  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  const overlay = document.getElementById('overlay');
  if (!canvas || !overlay) return;

  const ctx = canvas.getContext('2d')!;
  if (!ctx) return;

  // Sizing
  let tileSize = computeTileSize();

  // Core systems
  const gameState = new GameState();
  const scoreManager = new ScoreManager();
  const audioManager = new AudioManager();
  const inputManager = new InputManager(document);
  const renderer = new Renderer(tileSize);
  const ghostModeTimer = new GhostModeTimer();

  function resize(): void {
    tileSize = computeTileSize();
    canvas.width = MAZE_WIDTH * tileSize;
    canvas.height = MAZE_HEIGHT * tileSize + 40;
    renderer.setTileSize(tileSize);
  }
  resize();
  window.addEventListener('resize', resize);

  // Load initial high score
  const scores = getHighScores();
  if (scores.length > 0) {
    scoreManager.highScore = scores[0].score;
  }

  // Settings
  const settings = getSettings();
  renderer.setColorblind(settings.colorblindPaletteEnabled);

  // Game entities
  let maze = new Maze();
  let pacman = new PacMan(PACMAN_START.col, PACMAN_START.row, 'left');
  let ghosts = createGhosts();
  let fruit = new BonusFruit();

  // On-screen controls (for mobile)
  const controlsMount = document.getElementById('app')!;
  const directionalControls = new DirectionalControls(inputManager, controlsMount);

  // Screen manager
  const screenManager = new ScreenManager(overlay, {
    onStart: startGame,
    onResume: resumeGame,
    onRestart: restartGame,
    onMuteToggle: () => {
      audioManager.toggleMute();
    },
    onColorblindToggle: () => {
      const enabled = toggleColorblindPalette();
      renderer.setColorblind(enabled);
      gameState.colorblindMode = enabled;
    },
  });

  function createGhosts(): Ghost[] {
    const names: GhostName[] = ['blinky', 'pinky', 'inky', 'clyde'];
    return names.map((name) => {
      const start = GHOST_STARTS[name];
      return new Ghost(name, start.col, start.row);
    });
  }

  function startGame(): void {
    audioManager.resume();
    audioManager.play('startup');
    screenManager.showCountdown(() => {
      gameState.phase = 'playing';
      audioManager.startSiren(maze.getRemainingDots(), maze.getTotalDots(), scoreManager.level);
    });
    gameState.phase = 'countdown';
  }

  function resumeGame(): void {
    gameState.phase = 'playing';
    screenManager.show('playing');
    audioManager.startSiren(maze.getRemainingDots(), maze.getTotalDots(), scoreManager.level);
  }

  function restartGame(): void {
    // Full reset
    scoreManager.reset();
    gameState.phase = 'start';
    gameState.gameOver = false;
    ghostModeTimer.reset();
    maze = new Maze();
    pacman = new PacMan(PACMAN_START.col, PACMAN_START.row, 'left');
    ghosts = createGhosts();
    fruit = new BonusFruit();
    audioManager.stopSiren();
    screenManager.show('start');
  }

  function resetAfterDeath(): void {
    pacman = new PacMan(PACMAN_START.col, PACMAN_START.row, 'left');
    ghosts = createGhosts();
    ghostModeTimer.reset();
    fruit = new BonusFruit();
    fruit.setLevel(scoreManager.level);
    gameState.phase = 'countdown';
    audioManager.stopSiren();
    audioManager.play('startup');
    screenManager.showCountdown(() => {
      gameState.phase = 'playing';
      audioManager.startSiren(maze.getRemainingDots(), maze.getTotalDots(), scoreManager.level);
    });
  }

  function advanceLevel(): void {
    scoreManager.nextLevel();
    ghostModeTimer.reset();
    maze = new Maze();
    pacman = new PacMan(PACMAN_START.col, PACMAN_START.row, 'left');
    ghosts = createGhosts();
    fruit = new BonusFruit();
    fruit.setLevel(scoreManager.level);
    audioManager.stopSiren();

    // Apply difficulty
    const diff = getDifficultySettings(scoreManager.level);
    for (const g of ghosts) {
      g.speed = GHOST_SPEED_NORMAL * diff.ghostSpeedMultiplier;
    }

    screenManager.showCountdown(() => {
      gameState.phase = 'playing';
      audioManager.startSiren(maze.getRemainingDots(), maze.getTotalDots(), scoreManager.level);
    });
    gameState.phase = 'countdown';
  }

  /** Main update tick (called at fixed 60fps timestep). */
  function update(dtMs: number): void {
    // Handle pause/mute input
    if (inputManager.consumePauseRequest()) {
      if (gameState.phase === 'playing') {
        gameState.phase = 'paused';
        audioManager.stopSiren();
        screenManager.show('pause');
        return;
      } else if (gameState.phase === 'paused') {
        resumeGame();
        return;
      }
    }
    if (inputManager.consumeMuteRequest()) {
      audioManager.toggleMute();
    }

    if (gameState.phase !== 'playing') {
      // Handle death animation timer
      if (gameState.phase === 'dying') {
        gameState.deathTimer -= dtMs;
        if (gameState.deathTimer <= 0) {
          const isGameOver = scoreManager.loseLife();
          if (isGameOver) {
            gameState.phase = 'gameOver';
            gameState.gameOver = true;
            scoreManager.updateHighScore();
            audioManager.stopSiren();
            screenManager.showGameOver(scoreManager.score);
          } else {
            resetAfterDeath();
          }
        }
      }
      // Handle level complete timer
      if (gameState.phase === 'levelComplete') {
        gameState.levelCompleteTimer -= dtMs;
        if (gameState.levelCompleteTimer <= 0) {
          advanceLevel();
        }
      }
      return;
    }

    // Update direction from input
    const dir = inputManager.direction;
    if (dir) {
      pacman.queueDirection(dir);
    }

    // Update ghost mode timer
    const mode = ghostModeTimer.update(dtMs);
    for (const g of ghosts) {
      g.setMode(mode);
    }

    // Update entities
    pacman.update(dtMs, maze);
    const blinky = ghosts.find((g) => g.name === 'blinky');
    for (const g of ghosts) {
      g.update(dtMs, maze, pacman, blinky);
    }

    // Update fruit
    fruit.update(dtMs, maze.getDotsEaten());

    // Check collisions
    const collision = checkCollisions(pacman, ghosts, maze, fruit);

    if (collision.dotEaten) {
      scoreManager.addDotPoints();
      audioManager.play('dot');
    }

    if (collision.powerPelletEaten) {
      scoreManager.addPelletPoints();
      audioManager.play('powerPellet');
      const diff = getDifficultySettings(scoreManager.level);
      ghostModeTimer.freeze();
      for (const g of ghosts) {
        g.enterFrightened(diff.frightenedDurationMs);
      }
      // Unfreeze mode timer when frightened ends (after the duration)
      setTimeout(() => ghostModeTimer.resume(), diff.frightenedDurationMs);
    }

    if (collision.ghostEaten) {
      const pts = scoreManager.addGhostPoints();
      collision.ghostEaten.becomeEaten();
      audioManager.play('ghostEaten');
    }

    if (collision.fruitEaten) {
      const pts = fruit.collect();
      scoreManager.addFruitPoints(pts);
      audioManager.play('fruit');
    }

    // Check extra life
    if (scoreManager.extraLifeAwarded && scoreManager.lives > 3) {
      // Extra life was just awarded
      audioManager.play('extraLife');
    }

    if (collision.pacmanKilled) {
      pacman.alive = false;
      gameState.phase = 'dying';
      gameState.deathTimer = DEATH_ANIM_MS;
      audioManager.stopSiren();
      audioManager.play('death');
      return;
    }

    // Check level complete
    if (maze.isComplete()) {
      gameState.phase = 'levelComplete';
      gameState.levelCompleteTimer = LEVEL_COMPLETE_MS;
      audioManager.stopSiren();
      screenManager.showLevelComplete(scoreManager.level);
      return;
    }

    // Update siren pitch
    audioManager.startSiren(maze.getRemainingDots(), maze.getTotalDots(), scoreManager.level);
  }

  /** Render callback. */
  function render(dtMs: number): void {
    renderer.renderFrame(ctx, maze, pacman, ghosts, fruit, scoreManager, gameState.phase, dtMs);
  }

  // Start the game loop (always running - screens are overlays)
  startGameLoop(update, render);
}

boot();

export default boot;
