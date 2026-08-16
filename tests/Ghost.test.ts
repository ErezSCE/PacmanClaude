import { describe, it, expect } from 'vitest';
import { Ghost, RELEASE_DELAYS } from '../src/entities/Ghost';
import {
  GhostModeTimer,
  MODE_SCHEDULE,
  GHOST_SPEED_NORMAL,
  GHOST_SPEED_FRIGHTENED,
  GHOST_SPEED_EYES,
  FLASH_WARNING_TIME,
  REVERSE_DIRECTION,
  GHOST_HOUSE_TARGET,
} from '../src/entities/ghostAI';

describe('Ghost frightened property', () => {
  it('[US-003#3] frightened getter reflects mode without a separate flag', () => {
    const ghost = new Ghost('blinky', 0, 0);
    ghost.inGhostHouse = false;
    expect(ghost.frightened).toBe(false);
    ghost.enterFrightened(6000);
    expect(ghost.frightened).toBe(true);
    ghost.enterEaten();
    expect(ghost.frightened).toBe(false);
  });
});

describe('Ghost house release sequencing', () => {
  it('[US-003#6] blinky starts released, others start waiting inside the house', () => {
    expect(new Ghost('blinky', 0, 0).inGhostHouse).toBe(false);
    expect(new Ghost('pinky', 0, 0).inGhostHouse).toBe(true);
    expect(new Ghost('inky', 0, 0).inGhostHouse).toBe(true);
    expect(new Ghost('clyde', 0, 0).inGhostHouse).toBe(true);
  });

  it('[US-003#6] a ghost is released once its stagger delay elapses', () => {
    const pinky = new Ghost('pinky', 0, 0);
    pinky.updateHouseTimer(RELEASE_DELAYS.pinky - 1);
    expect(pinky.inGhostHouse).toBe(true);
    pinky.updateHouseTimer(1);
    expect(pinky.inGhostHouse).toBe(false);
  });

  it('[US-003#6] resetForRelease restores staggered starting state and position', () => {
    const clyde = new Ghost('clyde', 13, 14);
    clyde.x = 99;
    clyde.y = 99;
    clyde.inGhostHouse = false;
    clyde.mode = 'chase';
    clyde.speed = GHOST_SPEED_EYES;

    clyde.resetForRelease();

    expect(clyde.x).toBe(13);
    expect(clyde.y).toBe(14);
    expect(clyde.inGhostHouse).toBe(true);
    expect(clyde.mode).toBe('scatter');
    expect(clyde.speed).toBe(GHOST_SPEED_NORMAL);
  });
});

describe('Ghost mode timer application and direction reversal', () => {
  it('[US-003#2] applyModeTimer adopts the timer current mode', () => {
    const ghost = new Ghost('blinky', 0, 0);
    ghost.mode = 'scatter';
    const timer = new GhostModeTimer();
    timer.update(MODE_SCHEDULE[0].duration); // now chase
    ghost.applyModeTimer(timer);
    expect(ghost.mode).toBe('chase');
  });

  it('[US-003#6] applyModeTimer reverses direction whenever chase/scatter flips', () => {
    const ghost = new Ghost('blinky', 0, 0);
    ghost.mode = 'scatter';
    ghost.direction = 'up';
    const timer = new GhostModeTimer();
    timer.update(MODE_SCHEDULE[0].duration); // scatter -> chase
    ghost.applyModeTimer(timer);
    expect(ghost.direction).toBe(REVERSE_DIRECTION.up);
  });

  it('[US-003#6] applyModeTimer does not reverse direction when the mode is unchanged', () => {
    const ghost = new Ghost('blinky', 0, 0);
    ghost.mode = 'scatter';
    ghost.direction = 'left';
    const timer = new GhostModeTimer();
    ghost.applyModeTimer(timer);
    expect(ghost.direction).toBe('left');
  });

  it('[US-003#6] applyModeTimer is a no-op while frightened or eaten', () => {
    const ghost = new Ghost('blinky', 0, 0);
    ghost.inGhostHouse = false;
    ghost.enterFrightened(6000);
    const timer = new GhostModeTimer();
    timer.update(MODE_SCHEDULE[0].duration);
    ghost.applyModeTimer(timer);
    expect(ghost.mode).toBe('frightened');
  });
});

describe('Ghost frightened lifecycle', () => {
  it('[US-003#3] enterFrightened reverses direction, slows the ghost, and sets mode', () => {
    const ghost = new Ghost('inky', 0, 0);
    ghost.inGhostHouse = false;
    ghost.mode = 'chase';
    ghost.direction = 'right';

    ghost.enterFrightened(6000);

    expect(ghost.mode).toBe('frightened');
    expect(ghost.direction).toBe('left');
    expect(ghost.speed).toBe(GHOST_SPEED_FRIGHTENED);
  });

  it('[US-003#3] enterFrightened is ignored for ghosts still inside the house', () => {
    const ghost = new Ghost('pinky', 0, 0);
    expect(ghost.inGhostHouse).toBe(true);
    ghost.enterFrightened(6000);
    expect(ghost.mode).not.toBe('frightened');
  });

  it('[US-003#3] enterFrightened is ignored for eaten ghosts', () => {
    const ghost = new Ghost('inky', 0, 0);
    ghost.inGhostHouse = false;
    ghost.enterEaten();
    ghost.enterFrightened(6000);
    expect(ghost.mode).toBe('eaten');
  });

  it('[US-003#3] stacking a power pellet while already frightened resets the timer without a second reversal', () => {
    const ghost = new Ghost('inky', 0, 0);
    ghost.inGhostHouse = false;
    ghost.mode = 'chase';
    ghost.direction = 'right';

    ghost.enterFrightened(6000);
    expect(ghost.direction).toBe('left');

    ghost.updateFrightened(3000);
    ghost.enterFrightened(6000); // stack a second pellet
    expect(ghost.direction).toBe('left'); // no additional reversal
    ghost.updateFrightened(5999);
    expect(ghost.mode).toBe('frightened'); // timer was reset, not expired
  });

  it('[US-003#3] flashing turns on during the warning window before frightened expires', () => {
    const ghost = new Ghost('inky', 0, 0);
    ghost.inGhostHouse = false;
    ghost.enterFrightened(6000);
    ghost.updateFrightened(6000 - FLASH_WARNING_TIME - 1);
    expect(ghost.flashing).toBe(false);
    ghost.updateFrightened(2);
    expect(ghost.flashing).toBe(true);
  });

  it('[US-003#3] frightened mode expires back to the pre-frightened mode at normal speed', () => {
    const ghost = new Ghost('inky', 0, 0);
    ghost.inGhostHouse = false;
    ghost.mode = 'chase';
    ghost.enterFrightened(6000);
    ghost.updateFrightened(6000);
    expect(ghost.mode).toBe('chase');
    expect(ghost.speed).toBe(GHOST_SPEED_NORMAL);
    expect(ghost.flashing).toBe(false);
  });
});

describe('Ghost eaten -> eyes -> respawn lifecycle', () => {
  it('[US-003#4] enterEaten sets eaten mode and eyes speed', () => {
    const ghost = new Ghost('clyde', 5, 5);
    ghost.inGhostHouse = false;
    ghost.enterFrightened(6000);
    ghost.enterEaten();
    expect(ghost.mode).toBe('eaten');
    expect(ghost.speed).toBe(GHOST_SPEED_EYES);
    expect(ghost.flashing).toBe(false);
  });

  it('[US-003#4] hasReachedHouse detects arrival at the ghost house entrance', () => {
    const ghost = new Ghost('clyde', 5, 5);
    ghost.enterEaten();
    expect(ghost.hasReachedHouse()).toBe(false);
    ghost.x = GHOST_HOUSE_TARGET.col;
    ghost.y = GHOST_HOUSE_TARGET.row;
    expect(ghost.hasReachedHouse()).toBe(true);
  });

  it('[US-003#4] respawnFromHouse restores scatter mode, normal speed, and released state', () => {
    const ghost = new Ghost('clyde', 5, 5);
    ghost.enterEaten();
    ghost.respawnFromHouse();
    expect(ghost.mode).toBe('scatter');
    expect(ghost.speed).toBe(GHOST_SPEED_NORMAL);
    expect(ghost.inGhostHouse).toBe(false);
  });
});
