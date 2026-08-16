/**
 * Fixed-timestep requestAnimationFrame loop that drives update() and render()
 * every frame, coordinating entities, collisions, scoring and level state.
 */

let animationFrameId: number | null = null;

/**
 * Starts the game loop with the given update and render callbacks.
 */
export function startGameLoop(
  update: (dt: number) => void,
  render: () => void,
): void {
  const TIMESTEP = 1000 / 60;
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
}

/**
 * Stops the game loop.
 */
export function stopGameLoop(): void {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}
