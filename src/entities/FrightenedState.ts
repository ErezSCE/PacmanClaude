import type { Ghost } from './Ghost';

/**
 * Manages the frightened state lifecycle for ghosts.
 * Handles:
 * - Entering frightened mode (reversing direction, slowing down)
 * - Flashing warning during final 2 seconds
 * - Exiting frightened mode back to normal
 * - Eyes mode when eaten (returning to ghost house)
 */

const FRIGHTENED_DURATION_MS = 6000; // 6 seconds of frightened mode
const FLASH_WARNING_START_MS = 2000; // Last 2 seconds flash
const FLASH_INTERVAL_MS = 200; // Flash every 200ms
const EYES_RETURN_SPEED = 2; // Pixels per frame for eyes returning to ghost house

/**
 * Activates frightened mode for a ghost.
 * Reverses direction and starts the frightened timer.
 */
export function activateFrightenedMode(ghost: Ghost): void {
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
 * Exits frightened mode and returns ghost to normal mode.
 */
export function exitFrightenedMode(ghost: Ghost): void {
  ghost.mode = 'chase';
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
 * Updates eyes movement toward the ghost house.
 * Returns true if the eyes have reached the ghost house.
 */
export function updateEyesMovement(ghost: Ghost, dt: number): boolean {
  if (ghost.mode !== 'eyes') {
    return false;
  }

  // Calculate distance to ghost house
  const dx = ghost.ghostHouseX - ghost.x;
  const dy = ghost.ghostHouseY - ghost.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // If we've reached the ghost house, respawn as normal ghost
  if (distance < EYES_RETURN_SPEED) {
    respawnGhost(ghost);
    return true;
  }

  // Move toward ghost house
  const moveDistance = EYES_RETURN_SPEED;
  const moveX = (dx / distance) * moveDistance;
  const moveY = (dy / distance) * moveDistance;

  ghost.x += moveX;
  ghost.y += moveY;

  return false;
}

/**
 * Respawns a ghost as a normal ghost after eyes return to ghost house.
 */
export function respawnGhost(ghost: Ghost): void {
  ghost.mode = 'chase';
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
