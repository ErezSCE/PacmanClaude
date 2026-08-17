/**
 * Fixed-timestep requestAnimationFrame loop.
 */

let animationFrameId: number | null = null;

export function startGameLoop(
  update: (dt: number) => void,
  render: (dt: number) => void,
): void {
  if (animationFrameId !== null) {
    stopGameLoop();
  }

  const TIMESTEP = 1000 / 60;
  let lastTime = performance.now();
  let accumulator = 0;

  function loop(currentTime: number): void {
    const elapsed = currentTime - lastTime;
    lastTime = currentTime;
    accumulator += elapsed;

    // Cap accumulator to prevent spiral of death
    if (accumulator > 200) accumulator = 200;

    while (accumulator >= TIMESTEP) {
      update(TIMESTEP);
      accumulator -= TIMESTEP;
    }

    render(TIMESTEP);
    animationFrameId = requestAnimationFrame(loop);
  }

  animationFrameId = requestAnimationFrame(loop);
}

export function stopGameLoop(): void {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}
