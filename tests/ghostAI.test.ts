import { describe, it, expect, beforeEach } from 'vitest';
import {
  chooseTarget,
  blinkyTarget,
  pinkyTarget,
  inkyTarget,
  clydeTarget,
  GhostModeTimer,
  SCATTER_TARGETS,
  MODE_SCHEDULE,
} from '../src/entities/ghostAI';
import { Ghost } from '../src/entities/Ghost';
import { PacMan } from '../src/entities/PacMan';

function makePacMan(x: number, y: number, direction: PacMan['direction'] = 'right'): PacMan {
  const pacman = new PacMan();
  pacman.x = x;
  pacman.y = y;
  pacman.direction = direction;
  return pacman;
}

describe('ghostAI targeting personalities', () => {
  it('[US-003#1] blinky targets Pac-Mans current tile directly', () => {
    const pacman = makePacMan(10, 5, 'up');
    const target = blinkyTarget(pacman);
    expect(target).toEqual({ row: 5, col: 10 });
  });

  it('[US-003#1] pinky targets 4 tiles ahead of Pac-Man in his current direction', () => {
    const pacman = makePacMan(10, 5, 'right');
    const target = pinkyTarget(pacman);
    expect(target).toEqual({ row: 5, col: 14 });
  });

  it('[US-003#1] inky flanks using a vector doubled from blinkys position', () => {
    const pacman = makePacMan(10, 5, 'up');
    const blinky = new Ghost('blinky');
    blinky.x = 8;
    blinky.y = 5;
    const target = inkyTarget(pacman, blinky);
    // ahead = (row 3, col 10); doubled from blinky (8,5): row = 3*2-5=1, col = 10*2-8=12
    expect(target).toEqual({ row: 1, col: 12 });
  });

  it('[US-003#1] inky falls back to the ahead tile when blinky is unavailable', () => {
    const pacman = makePacMan(10, 5, 'up');
    const target = inkyTarget(pacman);
    expect(target).toEqual({ row: 3, col: 10 });
  });

  it('[US-003#1] clyde chases directly when far from Pac-Man', () => {
    const ghost = new Ghost('clyde');
    ghost.x = 0;
    ghost.y = 0;
    const pacman = makePacMan(20, 20, 'left');
    const target = clydeTarget(ghost, pacman);
    expect(target).toEqual(blinkyTarget(pacman));
  });

  it('[US-003#1] clyde retreats to its scatter corner when close to Pac-Man', () => {
    const ghost = new Ghost('clyde');
    ghost.x = 5;
    ghost.y = 5;
    const pacman = makePacMan(6, 5, 'left');
    const target = clydeTarget(ghost, pacman);
    expect(target).toEqual(SCATTER_TARGETS.clyde);
  });

  it('[US-003#1] each ghost personality uses a distinct targeting strategy for the same scenario', () => {
    const pacman = makePacMan(10, 10, 'right');
    const blinky = new Ghost('blinky');
    blinky.x = 2;
    blinky.y = 2;
    blinky.mode = 'chase';

    const pinky = new Ghost('pinky');
    pinky.mode = 'chase';
    const inky = new Ghost('inky');
    inky.mode = 'chase';
    const clyde = new Ghost('clyde');
    clyde.mode = 'chase';
    clyde.x = 9;
    clyde.y = 9;

    const targets = [
      chooseTarget(blinky, pacman, blinky),
      chooseTarget(pinky, pacman, blinky),
      chooseTarget(inky, pacman, blinky),
      chooseTarget(clyde, pacman, blinky),
    ];

    const unique = new Set(targets.map((t) => `${t.row},${t.col}`));
    expect(unique.size).toBe(targets.length);
  });

  it('[US-003#2] chooseTarget returns the ghosts scatter corner when in scatter mode', () => {
    const pacman = makePacMan(10, 10, 'right');
    const pinky = new Ghost('pinky');
    pinky.mode = 'scatter';
    const target = chooseTarget(pinky, pacman);
    expect(target).toEqual(SCATTER_TARGETS.pinky);
  });

  it('[US-003#2] GhostModeTimer starts in scatter mode per MODE_SCHEDULE', () => {
    const timer = new GhostModeTimer();
    expect(timer.getCurrentMode()).toBe(MODE_SCHEDULE[0].mode);
    expect(timer.getCurrentMode()).toBe('scatter');
  });

  it('[US-003#2] GhostModeTimer alternates from scatter to chase after the scheduled duration elapses', () => {
    const timer = new GhostModeTimer();
    const scatterDuration = MODE_SCHEDULE[0].duration;
    timer.update(scatterDuration - 1);
    expect(timer.getCurrentMode()).toBe('scatter');
    timer.update(2);
    expect(timer.getCurrentMode()).toBe('chase');
  });

  it('[US-003#2] GhostModeTimer resets back to the initial scatter phase', () => {
    const timer = new GhostModeTimer();
    timer.update(MODE_SCHEDULE[0].duration + 100);
    expect(timer.getCurrentMode()).toBe('chase');
    timer.reset();
    expect(timer.getCurrentMode()).toBe('scatter');
  });

  it('[US-003#2] applyModeTimer updates a ghosts mode to match the shared timer, affecting its target', () => {
    const timer = new GhostModeTimer();
    const pinky = new Ghost('pinky');
    pinky.applyModeTimer(timer);
    expect(pinky.mode).toBe('scatter');

    const pacman = makePacMan(10, 10, 'right');
    expect(pinky.getTarget(pacman)).toEqual(SCATTER_TARGETS.pinky);

    timer.update(MODE_SCHEDULE[0].duration + 1);
    pinky.applyModeTimer(timer);
    expect(pinky.mode).toBe('chase');
    expect(pinky.getTarget(pacman)).toEqual(pinkyTarget(pacman));
  });

  it('[US-003#2] applyModeTimer does not override a frightened ghosts mode', () => {
    const timer = new GhostModeTimer();
    const ghost = new Ghost('inky');
    ghost.mode = 'frightened';
    ghost.applyModeTimer(timer);
    expect(ghost.mode).toBe('frightened');
  });
});

describe('Ghost house release sequencing', () => {
  let blinky: Ghost;
  let pinky: Ghost;
  let inky: Ghost;
  let clyde: Ghost;

  beforeEach(() => {
    blinky = new Ghost('blinky');
    pinky = new Ghost('pinky');
    inky = new Ghost('inky');
    clyde = new Ghost('clyde');
  });

  it('[US-003#3] blinky starts outside the ghost house while the others start inside', () => {
    expect(blinky.inGhostHouse).toBe(false);
    expect(pinky.inGhostHouse).toBe(true);
    expect(inky.inGhostHouse).toBe(true);
    expect(clyde.inGhostHouse).toBe(true);
  });

  it('[US-003#3] ghosts release from the house in a staggered, deterministic order over time', () => {
    const ghosts = [blinky, pinky, inky, clyde];
    const releaseOrder: string[] = [];
    if (!blinky.inGhostHouse) releaseOrder.push(blinky.name);

    for (let t = 0; t < 12000; t += 500) {
      for (const ghost of ghosts) {
        const wasInHouse = ghost.inGhostHouse;
        ghost.updateHouseTimer(500);
        if (wasInHouse && !ghost.inGhostHouse) {
          releaseOrder.push(ghost.name);
        }
      }
    }

    expect(releaseOrder).toEqual(['blinky', 'pinky', 'inky', 'clyde']);
    expect(ghosts.every((g) => !g.inGhostHouse)).toBe(true);
  });

  it('[US-003#3] resetForRelease restores the staggered starting state after a life loss', () => {
    for (let t = 0; t < 12000; t += 500) {
      blinky.updateHouseTimer(500);
      pinky.updateHouseTimer(500);
      inky.updateHouseTimer(500);
      clyde.updateHouseTimer(500);
    }
    expect(pinky.inGhostHouse).toBe(false);
    expect(inky.inGhostHouse).toBe(false);
    expect(clyde.inGhostHouse).toBe(false);

    pinky.resetForRelease();
    inky.resetForRelease();
    clyde.resetForRelease();
    blinky.resetForRelease();

    expect(blinky.inGhostHouse).toBe(false);
    expect(pinky.inGhostHouse).toBe(true);
    expect(inky.inGhostHouse).toBe(true);
    expect(clyde.inGhostHouse).toBe(true);
    expect(pinky.mode).toBe('scatter');
    expect(pinky.frightened).toBe(false);
  });
});
