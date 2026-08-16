import { describe, it, expect } from 'vitest';
import { PacMan } from '../src/entities/PacMan';
import { Ghost } from '../src/entities/Ghost';
import {
  blinkyTarget,
  pinkyTarget,
  inkyTarget,
  clydeTarget,
  frightenedTarget,
  chooseTarget,
  GhostModeTimer,
  SCATTER_TARGETS,
  GHOST_HOUSE_TARGET,
  MODE_SCHEDULE,
} from '../src/entities/ghostAI';

function makePacMan(x: number, y: number, direction: PacMan['direction']): PacMan {
  const pacman = new PacMan();
  pacman.x = x;
  pacman.y = y;
  pacman.direction = direction;
  return pacman;
}

describe('ghostAI targeting strategies', () => {
  it('[US-003#1] blinky targets Pac-Man current tile directly', () => {
    const pacman = makePacMan(5.4, 10.9, 'right');
    const target = blinkyTarget(pacman);
    expect(target).toEqual({ row: 10, col: 5 });
  });

  it('[US-003#1] pinky targets 4 tiles ahead of Pac-Man when facing right', () => {
    const pacman = makePacMan(5, 10, 'right');
    const target = pinkyTarget(pacman);
    expect(target).toEqual({ row: 10, col: 9 });
  });

  it('[US-003#1] pinky reproduces the classic overflow-up-and-left bug when facing up', () => {
    const pacman = makePacMan(5, 10, 'up');
    const target = pinkyTarget(pacman);
    // 4 tiles up AND 4 tiles left due to the classic Z80 overflow bug.
    expect(target).toEqual({ row: 6, col: 1 });
  });

  it('[US-003#1] pinky does not apply the overflow bug for other directions', () => {
    const pacman = makePacMan(5, 10, 'down');
    const target = pinkyTarget(pacman);
    expect(target).toEqual({ row: 14, col: 5 });
  });

  it('[US-003#1] inky flanks using a vector cast through blinky', () => {
    const pacman = makePacMan(5, 10, 'right');
    const blinky = new Ghost('blinky', 3, 10);
    const target = inkyTarget(pacman, blinky);
    // ahead = (row 10, col 7); doubled vector from blinky (3,10) -> (7*2-3, 10*2-10) = (11, 10)
    expect(target).toEqual({ row: 10, col: 11 });
  });

  it('[US-003#1] inky falls back to the tile ahead of Pac-Man without blinky', () => {
    const pacman = makePacMan(5, 10, 'right');
    const target = inkyTarget(pacman, undefined);
    expect(target).toEqual({ row: 10, col: 7 });
  });

  it('[US-003#1] clyde chases directly when farther than 8 tiles away', () => {
    const pacman = makePacMan(0, 0, 'right');
    const clyde = new Ghost('clyde', 20, 20);
    const target = clydeTarget(clyde, pacman);
    expect(target).toEqual(blinkyTarget(pacman));
  });

  it('[US-003#1] clyde retreats to his scatter corner when within 8 tiles', () => {
    const pacman = makePacMan(0, 0, 'right');
    const clyde = new Ghost('clyde', 1, 1);
    const target = clydeTarget(clyde, pacman);
    expect(target).toEqual(SCATTER_TARGETS.clyde);
  });

  it('[US-003#5] frightened target only changes when the ghost enters a new tile', () => {
    const ghost = new Ghost('inky', 5.1, 5.1);
    const firstTarget = frightenedTarget(ghost);
    ghost.x = 5.9;
    ghost.y = 5.9;
    const secondTarget = frightenedTarget(ghost);
    expect(secondTarget).toEqual(firstTarget);

    ghost.x = 6.1;
    const thirdTarget = frightenedTarget(ghost);
    expect(thirdTarget).not.toEqual(firstTarget);
  });

  it('[US-003#2] chooseTarget dispatches to scatter corner in scatter mode', () => {
    const ghost = new Ghost('blinky', 0, 0);
    ghost.mode = 'scatter';
    const pacman = makePacMan(10, 10, 'right');
    expect(chooseTarget(ghost, pacman)).toEqual(SCATTER_TARGETS.blinky);
  });

  it('[US-003#4] chooseTarget dispatches to the ghost house entrance when eaten', () => {
    const ghost = new Ghost('pinky', 0, 0);
    ghost.mode = 'eaten';
    const pacman = makePacMan(10, 10, 'right');
    expect(chooseTarget(ghost, pacman)).toEqual(GHOST_HOUSE_TARGET);
  });
});

describe('GhostModeTimer chase/scatter phase transitions', () => {
  it('[US-003#2] starts in the first scheduled scatter phase', () => {
    const timer = new GhostModeTimer();
    expect(timer.getCurrentMode()).toBe('scatter');
  });

  it('[US-003#2] transitions to chase after the first scatter duration elapses', () => {
    const timer = new GhostModeTimer();
    timer.update(MODE_SCHEDULE[0].duration);
    expect(timer.getCurrentMode()).toBe('chase');
  });

  it('[US-003#2] steps through multiple phases across several updates', () => {
    const timer = new GhostModeTimer();
    timer.update(MODE_SCHEDULE[0].duration);
    timer.update(MODE_SCHEDULE[1].duration);
    expect(timer.getCurrentMode()).toBe('scatter');
  });

  it('[US-003#2] remains on the final infinite chase phase forever', () => {
    const timer = new GhostModeTimer();
    for (let i = 0; i < MODE_SCHEDULE.length; i += 1) {
      timer.update(1_000_000);
    }
    expect(timer.getCurrentMode()).toBe('chase');
  });

  it('[US-003#2] reset returns the timer to the initial scatter phase', () => {
    const timer = new GhostModeTimer();
    timer.update(MODE_SCHEDULE[0].duration);
    expect(timer.getCurrentMode()).toBe('chase');
    timer.reset();
    expect(timer.getCurrentMode()).toBe('scatter');
  });
});
