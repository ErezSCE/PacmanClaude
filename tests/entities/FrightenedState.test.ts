import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Ghost } from '../../src/entities/Ghost';
import {
  activateFrightenedMode,
  reverseGhostDirection,
  updateFrightenedState,
  exitFrightenedMode,
  convertToEyes,
  updateEyesMovement,
  respawnGhost,
  getSpeedMultiplier,
  isGhostVisible
} from '../../src/entities/FrightenedState';
import { Maze, loadMaze } from '../../src/maze/Maze';

describe('FrightenedState', () => {
  let ghost: Ghost;
  let maze: Maze;

  beforeEach(() => {
    // Create a test ghost
    ghost = new Ghost('blinky', 100, 100, 'up');
    ghost.ghostHouseX = 200;
    ghost.ghostHouseY = 200;
    
    // Load maze for pathfinding tests
    maze = loadMaze();
  });

  describe('[US-004#1] activateFrightenedMode', () => {
    it('should set ghost mode to frightened', () => {
      ghost.mode = 'chase';
      activateFrightenedMode(ghost);
      expect(ghost.mode).toBe('frightened');
    });

    it('should set frightened timer to 6000ms', () => {
      activateFrightenedMode(ghost);
      expect(ghost.frightenedTimer).toBe(6000);
    });

    it('should store previous mode for restoration', () => {
      ghost.mode = 'chase';
      activateFrightenedMode(ghost);
      expect((ghost as any).previousMode).toBe('chase');
    });

    it('should reverse ghost direction', () => {
      ghost.direction = 'up';
      activateFrightenedMode(ghost);
      expect(ghost.direction).toBe('down');
    });

    it('should set flashing start time', () => {
      activateFrightenedMode(ghost);
      expect(ghost.frightenedFlashStart).toBe(4000); // 6000 - 2000
    });
  });

  describe('[US-004#2] reverseGhostDirection', () => {
    it('should reverse up to down', () => {
      ghost.direction = 'up';
      reverseGhostDirection(ghost);
      expect(ghost.direction).toBe('down');
    });

    it('should reverse down to up', () => {
      ghost.direction = 'down';
      reverseGhostDirection(ghost);
      expect(ghost.direction).toBe('up');
    });

    it('should reverse left to right', () => {
      ghost.direction = 'left';
      reverseGhostDirection(ghost);
      expect(ghost.direction).toBe('right');
    });

    it('should reverse right to left', () => {
      ghost.direction = 'right';
      reverseGhostDirection(ghost);
      expect(ghost.direction).toBe('left');
    });

    it('should also reverse queued direction', () => {
      ghost.direction = 'up';
      ghost.queuedDirection = 'up';
      reverseGhostDirection(ghost);
      expect(ghost.queuedDirection).toBe('down');
    });
  });

  describe('[US-004#3] updateFrightenedState', () => {
    it('should decrement frightened timer by dt', () => {
      activateFrightenedMode(ghost);
      updateFrightenedState(ghost, 100);
      expect(ghost.frightenedTimer).toBe(5900);
    });

    it('should not update if ghost is not in frightened or eyes mode', () => {
      ghost.mode = 'chase';
      ghost.frightenedTimer = 5000;
      updateFrightenedState(ghost, 100);
      expect(ghost.frightenedTimer).toBe(5000);
    });

    it('should exit frightened mode when timer reaches 0', () => {
      activateFrightenedMode(ghost);
      ghost.frightenedTimer = 100;
      updateFrightenedState(ghost, 200);
      expect(ghost.mode).not.toBe('frightened');
    });

    it('should set isFlashing when entering flash window', () => {
      activateFrightenedMode(ghost);
      ghost.frightenedTimer = 1500; // In flash window (< 2000)
      updateFrightenedState(ghost, 100);
      expect(ghost.isFlashing).toBeDefined();
    });
  });

  describe('[US-004#4] exitFrightenedMode', () => {
    it('should restore previous chase mode', () => {
      ghost.mode = 'chase';
      activateFrightenedMode(ghost);
      exitFrightenedMode(ghost);
      expect(ghost.mode).toBe('chase');
    });

    it('should restore previous scatter mode', () => {
      ghost.mode = 'scatter';
      activateFrightenedMode(ghost);
      exitFrightenedMode(ghost);
      expect(ghost.mode).toBe('scatter');
    });

    it('should default to chase if no previous mode', () => {
      activateFrightenedMode(ghost);
      (ghost as any).previousMode = undefined;
      exitFrightenedMode(ghost);
      expect(ghost.mode).toBe('chase');
    });

    it('should clear frightened timer', () => {
      activateFrightenedMode(ghost);
      exitFrightenedMode(ghost);
      expect(ghost.frightenedTimer).toBe(0);
    });

    it('should stop flashing', () => {
      activateFrightenedMode(ghost);
      ghost.isFlashing = true;
      exitFrightenedMode(ghost);
      expect(ghost.isFlashing).toBe(false);
    });
  });

  describe('[US-004#5] convertToEyes', () => {
    it('should set ghost mode to eyes', () => {
      convertToEyes(ghost);
      expect(ghost.mode).toBe('eyes');
    });

    it('should clear frightened timer', () => {
      ghost.frightenedTimer = 5000;
      convertToEyes(ghost);
      expect(ghost.frightenedTimer).toBe(0);
    });

    it('should stop flashing', () => {
      ghost.isFlashing = true;
      convertToEyes(ghost);
      expect(ghost.isFlashing).toBe(false);
    });
  });

  describe('[US-004#6] updateEyesMovement', () => {
    it('should return false if ghost is not in eyes mode', () => {
      ghost.mode = 'chase';
      const result = updateEyesMovement(ghost, 16, maze);
      expect(result).toBe(false);
    });

    it('should return true when eyes reach ghost house', () => {
      ghost.mode = 'eyes';
      ghost.x = ghost.ghostHouseX;
      ghost.y = ghost.ghostHouseY;
      const result = updateEyesMovement(ghost, 16, maze);
      expect(result).toBe(true);
    });

    it('should move eyes toward ghost house', () => {
      ghost.mode = 'eyes';
      ghost.x = 16;
      ghost.y = 16;
      ghost.ghostHouseX = 48;
      ghost.ghostHouseY = 48;
      
      const initialDistance = Math.sqrt(
        (ghost.ghostHouseX - ghost.x) ** 2 + (ghost.ghostHouseY - ghost.y) ** 2
      );
      
      updateEyesMovement(ghost, 16, maze);
      
      const newDistance = Math.sqrt(
        (ghost.ghostHouseX - ghost.x) ** 2 + (ghost.ghostHouseY - ghost.y) ** 2
      );
      
      expect(newDistance).toBeLessThan(initialDistance);
    });

    it('should respawn ghost when reaching ghost house', () => {
      ghost.mode = 'eyes';
      ghost.x = ghost.ghostHouseX;
      ghost.y = ghost.ghostHouseY;
      ghost.mode = 'chase';
      activateFrightenedMode(ghost);
      convertToEyes(ghost);
      
      const result = updateEyesMovement(ghost, 16, maze);
      expect(result).toBe(true);
      expect(ghost.mode).not.toBe('eyes');
    });
  });

  describe('[US-004#7] respawnGhost', () => {
    it('should restore previous chase mode', () => {
      ghost.mode = 'chase';
      activateFrightenedMode(ghost);
      convertToEyes(ghost);
      respawnGhost(ghost);
      expect(ghost.mode).toBe('chase');
    });

    it('should restore previous scatter mode', () => {
      ghost.mode = 'scatter';
      activateFrightenedMode(ghost);
      convertToEyes(ghost);
      respawnGhost(ghost);
      expect(ghost.mode).toBe('scatter');
    });

    it('should move ghost to ghost house', () => {
      ghost.x = 100;
      ghost.y = 100;
      respawnGhost(ghost);
      expect(ghost.x).toBe(ghost.ghostHouseX);
      expect(ghost.y).toBe(ghost.ghostHouseY);
    });

    it('should reset direction to up', () => {
      ghost.direction = 'left';
      respawnGhost(ghost);
      expect(ghost.direction).toBe('up');
    });

    it('should clear frightened timer', () => {
      ghost.frightenedTimer = 5000;
      respawnGhost(ghost);
      expect(ghost.frightenedTimer).toBe(0);
    });

    it('should stop flashing', () => {
      ghost.isFlashing = true;
      respawnGhost(ghost);
      expect(ghost.isFlashing).toBe(false);
    });
  });

  describe('[US-004#8] getSpeedMultiplier', () => {
    it('should return 0.5 for frightened ghosts', () => {
      ghost.mode = 'frightened';
      expect(getSpeedMultiplier(ghost)).toBe(0.5);
    });

    it('should return 2 for eyes', () => {
      ghost.mode = 'eyes';
      expect(getSpeedMultiplier(ghost)).toBe(2);
    });

    it('should return 1 for chase mode', () => {
      ghost.mode = 'chase';
      expect(getSpeedMultiplier(ghost)).toBe(1);
    });

    it('should return 1 for scatter mode', () => {
      ghost.mode = 'scatter';
      expect(getSpeedMultiplier(ghost)).toBe(1);
    });
  });

  describe('[US-004#9] isGhostVisible', () => {
    it('should return true for non-frightened ghosts', () => {
      ghost.mode = 'chase';
      expect(isGhostVisible(ghost)).toBe(true);
    });

    it('should return true when not flashing', () => {
      ghost.mode = 'frightened';
      ghost.isFlashing = false;
      expect(isGhostVisible(ghost)).toBe(true);
    });

    it('should return false when flashing', () => {
      ghost.mode = 'frightened';
      ghost.isFlashing = true;
      expect(isGhostVisible(ghost)).toBe(false);
    });

    it('should return true for eyes mode', () => {
      ghost.mode = 'eyes';
      expect(isGhostVisible(ghost)).toBe(true);
    });
  });

  describe('[US-004#10] Integration: Full frightened lifecycle', () => {
    it('should complete full frightened cycle: activate -> update -> exit', () => {
      ghost.mode = 'chase';
      
      // Activate frightened mode
      activateFrightenedMode(ghost);
      expect(ghost.mode).toBe('frightened');
      expect((ghost as any).previousMode).toBe('chase');
      
      // Update for some time
      updateFrightenedState(ghost, 3000);
      expect(ghost.frightenedTimer).toBe(3000);
      
      // Update until exit
      updateFrightenedState(ghost, 3500);
      expect(ghost.mode).toBe('chase');
    });

    it('should complete full eaten lifecycle: activate -> eyes -> respawn', () => {
      ghost.mode = 'chase';
      
      // Activate frightened mode
      activateFrightenedMode(ghost);
      expect(ghost.mode).toBe('frightened');
      
      // Convert to eyes
      convertToEyes(ghost);
      expect(ghost.mode).toBe('eyes');
      
      // Move to ghost house
      ghost.x = ghost.ghostHouseX;
      ghost.y = ghost.ghostHouseY;
      
      // Respawn
      respawnGhost(ghost);
      expect(ghost.mode).toBe('chase');
      expect(ghost.x).toBe(ghost.ghostHouseX);
      expect(ghost.y).toBe(ghost.ghostHouseY);
    });
  });
});
