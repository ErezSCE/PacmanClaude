/**
 * Fixed-timestep requestAnimationFrame loop that drives update() and render()
 * every frame, coordinating entities, collisions, scoring and level state.
 *
 * All mutable loop state (animation frame id, last frame time, accumulator)
 * is encapsulated per-call rather than held at module scope, so multiple
 * independent loops can run/stop without sharing state (important for
 * testability and for any future multi-instance use).
 */

/** Handle returned by `startGameLoop`, used to stop that specific loop instance. */
export interface GameLoopHandle {
  stop: () => void;
}

const TIMESTEP = 1000 / 60;

/**
 * Starts a new game loop with the given update and render callbacks and
 * returns a handle that can be passed to `stopGameLoop` to stop it.
 */
export function startGameLoop(
  update: (dt: number) => void,
  render: () => void,
): GameLoopHandle {
  let animationFrameId: number | null = null;
  let lastTime = performance.now();
  let accumulator = 0;

  function loop(currentTime: number): void {
    const elapsed = currentTime - lastTime;
    lastTime = currentTime;
    accumulator += elapsed;

    while (accumulator >= TIMESTEP) {
      update(TIMESTEP);
      accumulator -= TIMESTEP;
    }

    render();
    animationFrameId = requestAnimationFrame(loop);
  }

  animationFrameId = requestAnimationFrame(loop);

  return {
    stop(): void {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    },
  };
}

/**
 * Stops the game loop associated with the given handle.
 */
export function stopGameLoop(handle: GameLoopHandle): void {
  handle.stop();
}
