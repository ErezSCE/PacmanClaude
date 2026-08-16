import type { Ghost } from './Ghost';
import type { Maze } from '../maze/Maze';

/**
 * Manages the frightened state lifecycle for ghosts.
 * Handles:
 * - Entering frightened mode (reversing direction, slowing down)
 * - Flashing warning during final 2 seconds
 * - Exiting frightened mode back to normal
 * - Eyes mode when eaten (returning to ghost house)
 */

const FRIGHTENED_DURATION_MS = 6000; // 6 seconds of frightened mode (in milliseconds)
const FLASH_WARNING_START_MS = 2000; // Last 2 seconds flash (in milliseconds)
const FLASH_INTERVAL_MS = 200; // Flash every 200ms (in milliseconds)
const EYES_RETURN_SPEED = 2; // Pixels per frame for eyes returning to ghost house

/**
 * Activates frightened mode for a ghost.
 * Reverses direction and starts the frightened timer.
 * Stores the previous mode to restore it when exiting frightened state.
 */
export function activateFrightenedMode(ghost: Ghost): void {
  // Store previous mode for restoration
  ghost.previousMode = ghost.mode;
  
  ghost.mode = 'frightened';
  ghost.frightenedTimer = FRIGHTENED_DURATION_MS;
  ghost.frightenedFlashStart = FRIGHTENED_DURATION_MS - FLASH_WARNING_START_MS;
  ghost.isFlashing = false;

  // Reverse direction
  reverseGhostDirection(ghost);
}

/**
 * Reverses the ghost's current direction.
 */
export function reverseGhostDirection(ghost: Ghost): void {
  switch (ghost.direction) {
    case 'up':
      ghost.direction = 'down';
      ghost.queuedDirection = 'down';
      break;
    case 'down':
      ghost.direction = 'up';
      ghost.queuedDirection = 'up';
      break;
    case 'left':
      ghost.direction = 'right';
      ghost.queuedDirection = 'right';
      break;
    case 'right':
      ghost.direction = 'left';
      ghost.queuedDirection = 'left';
      break;
  }
}

/**
 * Updates the frightened state timer and handles transitions.
 * Called once per frame from the game loop.
 */
export function updateFrightenedState(ghost: Ghost, dt: number): void {
  if (ghost.mode !== 'frightened' && ghost.mode !== 'eyes') {
    return;
  }

  if (ghost.mode === 'frightened') {
    ghost.frightenedTimer -= dt;

    // Check if we should start flashing
    if (ghost.frightenedTimer <= ghost.frightenedFlashStart) {
      updateFlashingState(ghost, dt);
    }

    // Check if frightened mode has ended
    if (ghost.frightenedTimer <= 0) {
      exitFrightenedMode(ghost);
    }
  }
}

/**
 * Updates the flashing state during the warning window.
 */
function updateFlashingState(ghost: Ghost, dt: number): void {
  // Use a simple toggle based on time remaining
  const timeInFlashWindow = ghost.frightenedFlashStart - ghost.frightenedTimer;
  const flashCycle = Math.floor(timeInFlashWindow / FLASH_INTERVAL_MS);
  ghost.isFlashing = flashCycle % 2 === 0;
}

/**
 * Exits frightened mode and returns ghost to its previous mode.
 * If no previous mode was stored, defaults to 'chase'.
 */
export function exitFrightenedMode(ghost: Ghost): void {
  // Restore previous mode or default to 'chase'
  ghost.mode = (ghost.previousMode === 'chase' || ghost.previousMode === 'scatter') ? ghost.previousMode : 'chase';
  ghost.frightenedTimer = 0;
  ghost.isFlashing = false;
}

/**
 * Converts a ghost to eyes mode after being eaten.
 * Eyes travel back to the ghost house at increased speed.
 */
export function convertToEyes(ghost: Ghost): void {
  ghost.mode = 'eyes';
  ghost.frightenedTimer = 0;
  ghost.isFlashing = false;
  // Direction will be recalculated by pathfinding to ghost house
}

/**
 * Updates eyes movement toward the ghost house using pathfinding.
 * Uses BFS to find a valid path through the maze corridors.
 * Returns true if the eyes have reached the ghost house.
 */
export function updateEyesMovement(ghost: Ghost, dt: number, maze: Maze): boolean {
  if (ghost.mode !== 'eyes') {
    return false;
  }

  // Convert pixel coordinates to tile coordinates
  const currentTileX = Math.round(ghost.x / 16);
  const currentTileY = Math.round(ghost.y / 16);
  const targetTileX = Math.round(ghost.ghostHouseX / 16);
  const targetTileY = Math.round(ghost.ghostHouseY / 16);

  // If we've reached the ghost house, respawn as normal ghost
  if (currentTileX === targetTileX && currentTileY === targetTileY) {
    respawnGhost(ghost);
    return true;
  }

  // Find next step toward ghost house using BFS
  const nextTile = findNextPathStep(maze, currentTileX, currentTileY, targetTileX, targetTileY);
  
  if (nextTile) {
    // Move toward the next tile
    const targetPixelX = nextTile.x * 16;
    const targetPixelY = nextTile.y * 16;
    
    const dx = targetPixelX - ghost.x;
    const dy = targetPixelY - ghost.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Speed is pixels per second × seconds elapsed
    const speed = EYES_RETURN_SPEED * dt;
    
    if (distance > speed) {
      const moveX = (dx / distance) * speed;
      const moveY = (dy / distance) * speed;
      ghost.x += moveX;
      ghost.y += moveY;
    } else {
      // Snap to tile center if very close
      ghost.x = targetPixelX;
      ghost.y = targetPixelY;
    }
  }

  return false;
}

/**
 * Finds the next step in the path from start to target using BFS.
 * Returns the next tile to move to, or null if no path exists.
 */
function findNextPathStep(
  maze: Maze,
  startX: number,
  startY: number,
  targetX: number,
  targetY: number
): { x: number; y: number } | null {
  const grid = maze.getGrid();
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;

  // BFS to find shortest path
  const queue: Array<{ x: number; y: number; parent: { x: number; y: number } | null }> = [
    { x: startX, y: startY, parent: null }
  ];
  const visited = new Set<string>();
  visited.add(`${startX},${startY}`);

  const directions = [
    { dx: 0, dy: -1 }, // up
    { dx: 0, dy: 1 },  // down
    { dx: -1, dy: 0 }, // left
    { dx: 1, dy: 0 }   // right
  ];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) break;

    // Found target
    if (current.x === targetX && current.y === targetY) {
      // Backtrack to find the first step from start
      let step = current;
      while (step.parent && !(step.parent.x === startX && step.parent.y === startY)) {
        step = step.parent;
      }
      return { x: step.x, y: step.y };
    }

    // Explore neighbors
    for (const dir of directions) {
      const nextX = current.x + dir.dx;
      const nextY = current.y + dir.dy;
      const key = `${nextX},${nextY}`;

      if (
        nextX >= 0 &&
        nextX < cols &&
        nextY >= 0 &&
        nextY < rows &&
        !visited.has(key) &&
        maze.getTile(nextY, nextX) !== 'wall'
      ) {
        visited.add(key);
        queue.push({ x: nextX, y: nextY, parent: current });
      }
    }
  }

  // No path found, return null
  return null;
}

/**
 * Respawns a ghost as a normal ghost after eyes return to ghost house.
 * Restores the ghost to its previous mode (chase or scatter).
 */
export function respawnGhost(ghost: Ghost): void {
  // Restore previous mode or default to 'chase'
  ghost.mode = (ghost.previousMode === 'chase' || ghost.previousMode === 'scatter') ? ghost.previousMode : 'chase';
  ghost.x = ghost.ghostHouseX;
  ghost.y = ghost.ghostHouseY;
  ghost.direction = 'up';
  ghost.queuedDirection = 'up';
  ghost.frightenedTimer = 0;
  ghost.isFlashing = false;
}

/**
 * Gets the current speed multiplier for a ghost based on its mode.
 * Frightened ghosts move slower than normal ghosts.
 */
export function getSpeedMultiplier(ghost: Ghost): number {
  if (ghost.mode === 'frightened') {
    return 0.5; // Frightened ghosts move at 50% speed
  }
  if (ghost.mode === 'eyes') {
    return 2; // Eyes move at 200% speed back to ghost house
  }
  return 1; // Normal speed
}

/**
 * Checks if a ghost should be visible (not flashing, or flashing is "on").
 */
export function isGhostVisible(ghost: Ghost): boolean {
  if (ghost.mode !== 'frightened') {
    return true;
  }
  // During flashing, alternate visibility
  return !ghost.isFlashing;
}
