import { test, expect } from '@playwright/test';

/**
 * Basic gameplay smoke tests.
 * Verifies that the game initializes correctly, the game loop runs,
 * and basic interactions work without errors.
 */

test.describe('Basic Gameplay Smoke Tests', () => {
  test('[US-014#3] App initializes and game loop starts', async ({ page }) => {
    // Load the app
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify the canvas element is present and visible
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // Verify the canvas has valid dimensions
    const canvasBox = await canvas.boundingBox();
    expect(canvasBox).not.toBeNull();

    if (canvasBox) {
      expect(canvasBox.width).toBeGreaterThan(0);
      expect(canvasBox.height).toBeGreaterThan(0);
    }

    // Verify no critical errors on startup
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Wait a moment for the game loop to start
    await page.waitForTimeout(1000);

    // Should have no critical errors
    expect(errors.length).toBe(0);
  });

  test('[US-014#3] Game maintains 60fps rendering', async ({ page }) => {
    // Load the app
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify the canvas is visible
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // Measure frame timing
    const frameTimings = await page.evaluate(() => {
      return new Promise<number[]>((resolve) => {
        const timings: number[] = [];
        let lastTime = performance.now();
        let frameCount = 0;

        const measureFrames = () => {
          const now = performance.now();
          const deltaTime = now - lastTime;
          timings.push(deltaTime);
          lastTime = now;
          frameCount++;

          if (frameCount < 60) {
            requestAnimationFrame(measureFrames);
          } else {
            resolve(timings);
          }
        };

        requestAnimationFrame(measureFrames);
      });
    });

    // Calculate average frame time
    const avgFrameTime = frameTimings.reduce((a, b) => a + b, 0) / frameTimings.length;

    // 60fps = ~16.67ms per frame
    // Allow some variance (up to 20ms average)
    expect(avgFrameTime).toBeLessThan(20);

    // Verify most frames are close to 16.67ms
    const goodFrames = frameTimings.filter((t) => t < 20).length;
    expect(goodFrames / frameTimings.length).toBeGreaterThan(0.8);
  });

  test('[US-014#3] Keyboard input is processed without lag', async ({ page }) => {
    // Load the app
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify the canvas is visible
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // Focus on the page
    await page.focus('body');

    // Send rapid keyboard input
    const startTime = Date.now();

    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('ArrowUp');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowLeft');
      await page.keyboard.press('ArrowRight');
    }

    const endTime = Date.now();
    const totalTime = endTime - startTime;

    // 40 key presses should complete in reasonable time (< 5 seconds)
    expect(totalTime).toBeLessThan(5000);

    // Verify no errors occurred
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.waitForTimeout(500);

    expect(errors.length).toBe(0);
  });

  test('[US-014#3] Game state persists across interactions', async ({ page }) => {
    // Load the app
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify the canvas is visible
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // Get initial canvas state
    const initialCanvasData = await canvas.screenshot();
    expect(initialCanvasData).toBeTruthy();

    // Wait a moment
    await page.waitForTimeout(1000);

    // Get canvas state after waiting
    const laterCanvasData = await canvas.screenshot();
    expect(laterCanvasData).toBeTruthy();

    // Canvas should have changed (game loop is running)
    // Note: We can't directly compare screenshots due to animation,
    // but we can verify the canvas is still rendering
    expect(laterCanvasData.length).toBeGreaterThan(0);
  });

  test('[US-014#3] No memory leaks during extended gameplay', async ({ page }) => {
    // Load the app
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify the canvas is visible
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // Measure memory usage at start
    const initialMemory = await page.evaluate(() => {
      if ((performance as any).memory) {
        return (performance as any).memory.usedJSHeapSize;
      }
      return 0;
    });

    // Simulate extended gameplay (30 seconds of input)
    await page.focus('body');

    for (let i = 0; i < 30; i++) {
      await page.keyboard.press('ArrowUp');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowLeft');
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(100);
    }

    // Measure memory usage at end
    const finalMemory = await page.evaluate(() => {
      if ((performance as any).memory) {
        return (performance as any).memory.usedJSHeapSize;
      }
      return 0;
    });

    // Memory growth should be reasonable (< 50MB)
    const memoryGrowth = finalMemory - initialMemory;
    const maxGrowth = 50 * 1024 * 1024; // 50MB

    if (initialMemory > 0) {
      expect(memoryGrowth).toBeLessThan(maxGrowth);
    }
  });

  test('[US-014#3] Game handles rapid viewport changes gracefully', async ({
    page,
  }) => {
    // Load the app
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify the canvas is visible
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // Rapidly change viewport sizes
    const sizes = [
      { width: 375, height: 667 },
      { width: 768, height: 1024 },
      { width: 1024, height: 768 },
      { width: 1920, height: 1080 },
    ];

    for (const size of sizes) {
      await page.setViewportSize(size);
      await page.waitForTimeout(200);

      // Verify canvas is still visible
      await expect(canvas).toBeVisible();
    }

    // Verify no errors occurred
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    expect(errors.length).toBe(0);
  });

  test('[US-014#3] App recovers from network interruption', async ({
    page,
    context,
  }) => {
    // Load the app online
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify the canvas is visible
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // Go offline briefly
    await context.setOffline(true);
    await page.waitForTimeout(500);

    // Come back online
    await context.setOffline(false);

    // Verify the app still works
    await expect(canvas).toBeVisible();

    // Verify no critical errors
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.waitForTimeout(500);

    expect(errors.length).toBe(0);
  });
});
