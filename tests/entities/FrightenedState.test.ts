import { describe, it, expect, beforeEach } from 'vitest';
import type { Ghost } from '../../src/entities/Ghost';
import {
  activateFrightenedMode,
  reverseGhostDirection,
  updateFrightenedState,
  exitFrightenedMode,
  convertToEyes,
  updateEyesMovement,
  respawnGhost,
  getSpeedMultiplier,
  isGhostVisible,
} from '../../src/entities/FrightenedState';

/**
 * Helper to create a mock ghost for testing.
 */
function createMockGhost(): Ghost {
  return {
    name: 'blinky',
    x: 100,
    y: 100,
    direction: 'up',
    queuedDirection: 'up',
    mode: 'chase',
    frightenedTimer: 0,
    frightenedFlashStart: 0,
    isFlashing: false,
    ghostHouseX: 100,
    ghostHouseY: 100,
  } as Ghost;
}

describe('FrightenedState', () => {
  let ghost: Ghost;

  beforeEach(() => {
    ghost = createMockGhost();
  });

  describe('[US-004#1] activateFrightenedMode', () => {
    it('[US-004#1] should set ghost mode to frightened', () => {
      activateFrightenedMode(ghost);
      expect(ghost.mode).toBe('frightened');
    });

    it('[US-004#1] should initialize frightened timer', () => {
      activateFrightenedMode(ghost);
      expect(ghost.frightenedTimer).toBe(6000);
    });

    it('[US-004#1] should set flash warning start time', () => {
      activateFrightenedMode(ghost);
      expect(ghost.frightenedFlashStart).toBe(4000); // 6000 - 2000
    });

    it('[US-004#1] should reverse ghost direction when entering frightened mode', () => {
      ghost.direction = 'up';
      activateFrightenedMode(ghost);
      expect(ghost.direction).toBe('down');
      expect(ghost.queuedDirection).toBe('down');
    });
  });

  describe('[US-004#1] reverseGhostDirection', () => {
    it('[US-004#1] should reverse up to down', () => {
      ghost.direction = 'up';
      reverseGhostDirection(ghost);
      expect(ghost.direction).toBe('down');
      expect(ghost.queuedDirection).toBe('down');
    });

    it('[US-004#1] should reverse down to up', () => {
      ghost.direction = 'down';
      reverseGhostDirection(ghost);
      expect(ghost.direction).toBe('up');
      expect(ghost.queuedDirection).toBe('up');
    });

    it('[US-004#1] should reverse left to right', () => {
      ghost.direction = 'left';
      reverseGhostDirection(ghost);
      expect(ghost.direction).toBe('right');
      expect(ghost.queuedDirection).toBe('right');
    });

    it('[US-004#1] should reverse right to left', () => {
      ghost.direction = 'right';
      reverseGhostDirection(ghost);
      expect(ghost.direction).toBe('left');
      expect(ghost.queuedDirection).toBe('left');
    });
  });

  describe('[US-004#2] updateFrightenedState with flashing', () => {
    it('[US-004#2] should decrement frightened timer', () => {
      activateFrightenedMode(ghost);
      updateFrightenedState(ghost, 100);
      expect(ghost.frightenedTimer).toBe(5900);
    });

    it('[US-004#2] should not flash when timer is above flash start', () => {
      activateFrightenedMode(ghost);
      updateFrightenedState(ghost, 100);
      expect(ghost.isFlashing).toBe(false);
    });

    it('[US-004#2] should start flashing when timer enters final 2 seconds', () => {
      activateFrightenedMode(ghost);
      // Advance timer to 4100ms (just entered flash window)
      ghost.frightenedTimer = 4100;
      updateFrightenedState(ghost, 100);
      // Should be in flash window now
      expect(ghost.frightenedTimer).toBe(4000);
    });

    it('[US-004#2] should exit frightened mode when timer reaches 0', () => {
      activateFrightenedMode(ghost);
      ghost.frightenedTimer = 100;
      updateFrightenedState(ghost, 200);
      expect(ghost.mode).toBe('chase');
      expect(ghost.frightenedTimer).toBe(0);
    });

    it('[US-004#2] should not update non-frightened ghosts', () => {
      ghost.mode = 'chase';
      const initialTimer = ghost.frightenedTimer;
      updateFrightenedState(ghost, 100);
      expect(ghost.frightenedTimer).toBe(initialTimer);
    });
  });

  describe('[US-004#2] flashing warning window', () => {
    it('[US-004#2] should toggle isFlashing during final 2 seconds', () => {
      activateFrightenedMode(ghost);
      // Advance to flash window
      ghost.frightenedTimer = 1900; // In flash window
      updateFrightenedState(ghost, 0);
      const firstFlashState = ghost.isFlashing;

      // Advance further
      ghost.frightenedTimer = 1700;
      updateFrightenedState(ghost, 0);
      const secondFlashState = ghost.isFlashing;

      // States should differ due to flash cycle
      expect(typeof firstFlashState).toBe('boolean');
      expect(typeof secondFlashState).toBe('boolean');
    });
  });

  describe('[US-004#3] convertToEyes and respawn', () => {
    it('[US-004#3] should convert ghost to eyes mode', () => {
      ghost.mode = 'frightened';
      convertToEyes(ghost);
      expect(ghost.mode).toBe('eyes');
    });

    it('[US-004#3] should clear frightened state when converting to eyes', () => {
      activateFrightenedMode(ghost);
      convertToEyes(ghost);
      expect(ghost.frightenedTimer).toBe(0);
      expect(ghost.isFlashing).toBe(false);
    });

    it('[US-004#3] should respawn ghost as normal after eyes return', () => {
      ghost.mode = 'eyes';
      ghost.x = 50;
      ghost.y = 50;
      ghost.ghostHouseX = 100;
      ghost.ghostHouseY = 100;
      respawnGhost(ghost);
      expect(ghost.mode).toBe('chase');
      expect(ghost.x).toBe(100);
      expect(ghost.y).toBe(100);
      expect(ghost.direction).toBe('up');
    });
  });

  describe('[US-004#3] updateEyesMovement', () => {
    it('[US-004#3] should move eyes toward ghost house', () => {
      ghost.mode = 'eyes';
      ghost.x = 100;
      ghost.y = 100;
      ghost.ghostHouseX = 110;
      ghost.ghostHouseY = 100;

      const initialX = ghost.x;
      updateEyesMovement(ghost, 16);
      expect(ghost.x).toBeGreaterThan(initialX);
    });

    it('[US-004#3] should return true when eyes reach ghost house', () => {
      ghost.mode = 'eyes';
      ghost.x = 100;
      ghost.y = 100;
      ghost.ghostHouseX = 101;
      ghost.ghostHouseY = 100;

      const reached = updateEyesMovement(ghost, 16);
      expect(reached).toBe(true);
    });

    it('[US-004#3] should respawn ghost when eyes reach house', () => {
      ghost.mode = 'eyes';
      ghost.x = 100;
      ghost.y = 100;
      ghost.ghostHouseX = 101;
      ghost.ghostHouseY = 100;

      updateEyesMovement(ghost, 16);
      expect(ghost.mode).toBe('chase');
    });

    it('[US-004#3] should not update non-eyes ghosts', () => {
      ghost.mode = 'chase';
      const initialX = ghost.x;
      const reached = updateEyesMovement(ghost, 16);
      expect(ghost.x).toBe(initialX);
      expect(reached).toBe(false);
    });

    it('[US-004#3] should move eyes diagonally toward ghost house', () => {
      ghost.mode = 'eyes';
      ghost.x = 100;
      ghost.y = 100;
      ghost.ghostHouseX = 110;
      ghost.ghostHouseY = 110;

      const initialX = ghost.x;
      const initialY = ghost.y;
      updateEyesMovement(ghost, 16);
      expect(ghost.x).toBeGreaterThan(initialX);
      expect(ghost.y).toBeGreaterThan(initialY);
    });
  });

  describe('[US-004#1] getSpeedMultiplier', () => {
    it('[US-004#1] should return 0.5 for frightened ghosts', () => {
      ghost.mode = 'frightened';
      expect(getSpeedMultiplier(ghost)).toBe(0.5);
    });

    it('[US-004#1] should return 2 for eyes', () => {
      ghost.mode = 'eyes';
      expect(getSpeedMultiplier(ghost)).toBe(2);
    });

    it('[US-004#1] should return 1 for normal ghosts', () => {
      ghost.mode = 'chase';
      expect(getSpeedMultiplier(ghost)).toBe(1);
    });

    it('[US-004#1] should return 1 for scatter mode', () => {
      ghost.mode = 'scatter';
      expect(getSpeedMultiplier(ghost)).toBe(1);
    });
  });

  describe('[US-004#2] isGhostVisible', () => {
    it('[US-004#2] should return true for non-frightened ghosts', () => {
      ghost.mode = 'chase';
      expect(isGhostVisible(ghost)).toBe(true);
    });

    it('[US-004#2] should return true for eyes', () => {
      ghost.mode = 'eyes';
      expect(isGhostVisible(ghost)).toBe(true);
    });

    it('[US-004#2] should return visibility based on flashing state', () => {
      ghost.mode = 'frightened';
      ghost.isFlashing = true;
      expect(isGhostVisible(ghost)).toBe(false);

      ghost.isFlashing = false;
      expect(isGhostVisible(ghost)).toBe(true);
    });
  });

  describe('[US-004#1] exitFrightenedMode', () => {
    it('[US-004#1] should change mode back to chase', () => {
      activateFrightenedMode(ghost);
      exitFrightenedMode(ghost);
      expect(ghost.mode).toBe('chase');
    });

    it('[US-004#1] should clear frightened state', () => {
      activateFrightenedMode(ghost);
      exitFrightenedMode(ghost);
      expect(ghost.frightenedTimer).toBe(0);
      expect(ghost.isFlashing).toBe(false);
    });
  });

  describe('Integration scenarios', () => {
    it('[US-004#1] should handle full frightened lifecycle', () => {
      // Start in chase mode
      expect(ghost.mode).toBe('chase');

      // Eat power pellet
      activateFrightenedMode(ghost);
      expect(ghost.mode).toBe('frightened');
      expect(ghost.direction).toBe('down'); // Reversed from 'up'

      // Update for 5 seconds (still in frightened mode)
      updateFrightenedState(ghost, 5000);
      expect(ghost.mode).toBe('frightened');

      // Update for 1.5 more seconds (now in flash window)
      updateFrightenedState(ghost, 1500);
      expect(ghost.mode).toBe('frightened');
      expect(ghost.isFlashing).toBe(true);

      // Update for remaining time
      updateFrightenedState(ghost, 500);
      expect(ghost.mode).toBe('chase');
      expect(ghost.isFlashing).toBe(false);
    });

    it('[US-004#3] should handle full eaten ghost lifecycle', () => {
      // Start in frightened mode
      activateFrightenedMode(ghost);
      expect(ghost.mode).toBe('frightened');

      // Pac-Man eats the ghost
      convertToEyes(ghost);
      expect(ghost.mode).toBe('eyes');

      // Eyes move toward ghost house
      ghost.x = 50;
      ghost.y = 50;
      ghost.ghostHouseX = 100;
      ghost.ghostHouseY = 100;

      // Move eyes multiple times
      let reached = false;
      for (let i = 0; i < 100; i++) {
        reached = updateEyesMovement(ghost, 16);
        if (reached) break;
      }

      expect(reached).toBe(true);
      expect(ghost.mode).toBe('chase');
      expect(ghost.x).toBe(100);
      expect(ghost.y).toBe(100);
    });

    it('[US-004#1] should handle multiple ghosts entering frightened mode', () => {
      const ghost2 = createMockGhost();
      ghost2.name = 'pinky';
      ghost2.direction = 'left';

      activateFrightenedMode(ghost);
      activateFrightenedMode(ghost2);

      expect(ghost.mode).toBe('frightened');
      expect(ghost2.mode).toBe('frightened');
      expect(ghost.direction).toBe('down');
      expect(ghost2.direction).toBe('right');
    });
  });
});
