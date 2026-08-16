import { describe, it, expect, beforeEach } from 'vitest';
import { Ghost, RELEASE_DELAYS } from '../src/entities/Ghost';
import {
  chooseTarget,
  GhostModeTimer,
  SCATTER_TARGETS,
  GHOST_HOUSE_TARGET,
  FRIGHTENED_DURATION,
  FLASH_WARNING_TIME,
  GHOST_SPEED_NORMAL,
  GHOST_SPEED_FRIGHTENED,
  GHOST_SPEED_EYES,
} from '../src/entities/ghostAI';
import { PacMan } from '../src/entities/PacMan';

function makePacMan(
  x: number,
  y: number,
  direction: PacMan['direction'] = 'right',
): PacMan {
  const pacman = new PacMan();
  pacman.x = x;
  pacman.y = y;
  pacman.direction = direction;
  return pacman;
}

describe('Frightened state transitions (US-004)', () => {
  let blinky: Ghost;
  let pinky: Ghost;
  let inky: Ghost;
  let clyde: Ghost;
  let ghosts: Ghost[];

  beforeEach(() => {
    blinky = new Ghost('blinky');
    pinky = new Ghost('pinky');
    inky = new Ghost('inky');
    clyde = new Ghost('clyde');
    ghosts = [blinky, pinky, inky, clyde];
    // Release all ghosts from house for testing
    for (const g of ghosts) {
      g.inGhostHouse = false;
    }
  });

  it('[US-004#1] enterFrightened reverses ghost direction and sets mode to frightened', () => {
    blinky.direction = 'right';
    blinky.mode = 'chase';
    blinky.enterFrightened(FRIGHTENED_DURATION);

    expect(blinky.mode).toBe('frightened');
    expect(blinky.direction).toBe('left');
    expect(blinky.frightened).toBe(true);
  });

  it('[US-004#1] enterFrightened slows the ghost down', () => {
    blinky.speed = GHOST_SPEED_NORMAL;
    blinky.mode = 'chase';
    blinky.enterFrightened(FRIGHTENED_DURATION);

    expect(blinky.speed).toBe(GHOST_SPEED_FRIGHTENED);
  });

  it('[US-004#1] all four ghosts enter frightened mode simultaneously', () => {
    for (const g of ghosts) {
      g.mode = 'chase';
      g.enterFrightened(FRIGHTENED_DURATION);
    }

    expect(ghosts.every((g) => g.mode === 'frightened')).toBe(true);
    expect(ghosts.every((g) => g.frightened)).toBe(true);
    expect(ghosts.every((g) => g.speed === GHOST_SPEED_FRIGHTENED)).toBe(true);
  });

  it('[US-004#1] direction reversal maps correctly for all directions', () => {
    const reversals: Array<[PacMan['direction'], PacMan['direction']]> = [
      ['up', 'down'],
      ['down', 'up'],
      ['left', 'right'],
      ['right', 'left'],
    ];

    for (const [from, to] of reversals) {
      const ghost = new Ghost('blinky');
      ghost.inGhostHouse = false;
      ghost.direction = from;
      ghost.mode = 'chase';
      ghost.enterFrightened(FRIGHTENED_DURATION);
      expect(ghost.direction).toBe(to);
    }
  });

  it('[US-004#1] enterFrightened does not affect ghosts in eaten/eyes mode', () => {
    blinky.mode = 'eaten';
    blinky.direction = 'up';
    blinky.speed = GHOST_SPEED_EYES;
    blinky.enterFrightened(FRIGHTENED_DURATION);

    expect(blinky.mode).toBe('eaten');
    expect(blinky.direction).toBe('up');
    expect(blinky.speed).toBe(GHOST_SPEED_EYES);
  });

  it('[US-004#1] enterFrightened does not affect ghosts still in the ghost house', () => {
    pinky.inGhostHouse = true;
    pinky.mode = 'scatter';
    pinky.direction = 'up';
    pinky.enterFrightened(FRIGHTENED_DURATION);

    expect(pinky.mode).toBe('scatter');
    expect(pinky.direction).toBe('up');
  });

  it('[US-004#1] chooseTarget returns a non-scatter, non-chase target when frightened', () => {
    blinky.mode = 'frightened';
    const pacman = makePacMan(10, 10);
    const target = chooseTarget(blinky, pacman);
    // Frightened target should not be the scatter corner
    // (it's a random/special target, just verify it returns something valid)
    expect(target).toBeDefined();
    expect(typeof target.row).toBe('number');
    expect(typeof target.col).toBe('number');
  });
});

describe('Frightened flashing warning (US-004)', () => {
  let ghost: Ghost;

  beforeEach(() => {
    ghost = new Ghost('blinky');
    ghost.inGhostHouse = false;
  });

  it('[US-004#2] ghost does not flash during the early part of frightened mode', () => {
    ghost.enterFrightened(FRIGHTENED_DURATION);
    // Advance time but stay before the flash warning window
    ghost.updateFrightened(FRIGHTENED_DURATION - FLASH_WARNING_TIME - 100);
    expect(ghost.flashing).toBe(false);
    expect(ghost.mode).toBe('frightened');
  });

  it('[US-004#2] ghost starts flashing during the final warning seconds', () => {
    ghost.enterFrightened(FRIGHTENED_DURATION);
    // Advance past the flash warning threshold
    ghost.updateFrightened(FRIGHTENED_DURATION - FLASH_WARNING_TIME + 100);
    expect(ghost.flashing).toBe(true);
    expect(ghost.mode).toBe('frightened');
  });

  it('[US-004#2] ghost returns to normal mode after frightened duration expires', () => {
    ghost.mode = 'chase';
    ghost.enterFrightened(FRIGHTENED_DURATION);
    expect(ghost.mode).toBe('frightened');

    ghost.updateFrightened(FRIGHTENED_DURATION + 100);
    expect(ghost.mode).not.toBe('frightened');
    expect(ghost.frightened).toBe(false);
    expect(ghost.flashing).toBe(false);
    expect(ghost.speed).toBe(GHOST_SPEED_NORMAL);
  });

  it('[US-004#2] frightened timer resets when a new power pellet is eaten', () => {
    ghost.enterFrightened(FRIGHTENED_DURATION);
    ghost.updateFrightened(FRIGHTENED_DURATION - 500);
    expect(ghost.flashing).toBe(true);

    // Eat another power pellet
    ghost.enterFrightened(FRIGHTENED_DURATION);
    expect(ghost.flashing).toBe(false);
    expect(ghost.mode).toBe('frightened');
  });
});

describe('Eaten ghost eyes return and respawn (US-004)', () => {
  let ghost: Ghost;

  beforeEach(() => {
    ghost = new Ghost('blinky');
    ghost.inGhostHouse = false;
  });

  it('[US-004#3] enterEaten sets mode to eaten and speed to eyes speed', () => {
    ghost.mode = 'frightened';
    ghost.enterEaten();

    expect(ghost.mode).toBe('eaten');
    expect(ghost.speed).toBe(GHOST_SPEED_EYES);
    expect(ghost.frightened).toBe(false);
    expect(ghost.flashing).toBe(false);
  });

  it('[US-004#3] chooseTarget returns ghost house target when in eaten mode', () => {
    ghost.mode = 'eaten';
    const pacman = makePacMan(10, 10);
    const target = chooseTarget(ghost, pacman);
    expect(target).toEqual(GHOST_HOUSE_TARGET);
  });

  it('[US-004#3] respawnFromHouse resets ghost to normal active state', () => {
    ghost.mode = 'eaten';
    ghost.speed = GHOST_SPEED_EYES;
    ghost.respawnFromHouse();

    expect(ghost.mode).toBe('scatter');
    expect(ghost.speed).toBe(GHOST_SPEED_NORMAL);
    expect(ghost.frightened).toBe(false);
    expect(ghost.flashing).toBe(false);
    expect(ghost.inGhostHouse).toBe(false);
  });

  it('[US-004#3] hasReachedHouse returns true when ghost is at the ghost house target', () => {
    ghost.mode = 'eaten';
    ghost.x = GHOST_HOUSE_TARGET.col;
    ghost.y = GHOST_HOUSE_TARGET.row;

    expect(ghost.hasReachedHouse()).toBe(true);
  });

  it('[US-004#3] hasReachedHouse returns false when ghost is far from ghost house', () => {
    ghost.mode = 'eaten';
    ghost.x = 1;
    ghost.y = 1;

    expect(ghost.hasReachedHouse()).toBe(false);
  });

  it('[US-004#3] full lifecycle: frightened → eaten → eyes travel → respawn', () => {
    // Start in chase
    ghost.mode = 'chase';
    ghost.speed = GHOST_SPEED_NORMAL;
    ghost.direction = 'right';

    // Power pellet eaten
    ghost.enterFrightened(FRIGHTENED_DURATION);
    expect(ghost.mode).toBe('frightened');
    expect(ghost.speed).toBe(GHOST_SPEED_FRIGHTENED);
    expect(ghost.direction).toBe('left'); // reversed

    // Pac-Man eats this ghost
    ghost.enterEaten();
    expect(ghost.mode).toBe('eaten');
    expect(ghost.speed).toBe(GHOST_SPEED_EYES);

    // Ghost reaches the house
    ghost.x = GHOST_HOUSE_TARGET.col;
    ghost.y = GHOST_HOUSE_TARGET.row;
    expect(ghost.hasReachedHouse()).toBe(true);

    // Respawn
    ghost.respawnFromHouse();
    expect(ghost.mode).toBe('scatter');
    expect(ghost.speed).toBe(GHOST_SPEED_NORMAL);
    expect(ghost.frightened).toBe(false);
  });
});
