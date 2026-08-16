# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: gameplay.spec.ts >> Basic Gameplay Smoke Tests >> [US-014#3] Game maintains 60fps rendering
- Location: tests/e2e/gameplay.spec.ts:43:3

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5173/
Call log:
  - navigating to "http://localhost:5173/", waiting until "load"

```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | /**
  4   |  * Basic gameplay smoke tests.
  5   |  * Verifies that the game initializes correctly, the game loop runs,
  6   |  * and basic interactions work without errors.
  7   |  */
  8   | 
  9   | test.describe('Basic Gameplay Smoke Tests', () => {
  10  |   test('[US-014#3] App initializes and game loop starts', async ({ page }) => {
  11  |     // Load the app
  12  |     await page.goto('/');
  13  |     await page.waitForLoadState('networkidle');
  14  | 
  15  |     // Verify the canvas element is present and visible
  16  |     const canvas = page.locator('canvas');
  17  |     await expect(canvas).toBeVisible();
  18  | 
  19  |     // Verify the canvas has valid dimensions
  20  |     const canvasBox = await canvas.boundingBox();
  21  |     expect(canvasBox).not.toBeNull();
  22  | 
  23  |     if (canvasBox) {
  24  |       expect(canvasBox.width).toBeGreaterThan(0);
  25  |       expect(canvasBox.height).toBeGreaterThan(0);
  26  |     }
  27  | 
  28  |     // Verify no critical errors on startup
  29  |     const errors: string[] = [];
  30  |     page.on('console', (msg) => {
  31  |       if (msg.type() === 'error') {
  32  |         errors.push(msg.text());
  33  |       }
  34  |     });
  35  | 
  36  |     // Wait a moment for the game loop to start
  37  |     await page.waitForTimeout(1000);
  38  | 
  39  |     // Should have no critical errors
  40  |     expect(errors.length).toBe(0);
  41  |   });
  42  | 
  43  |   test('[US-014#3] Game maintains 60fps rendering', async ({ page }) => {
  44  |     // Load the app
> 45  |     await page.goto('/');
      |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5173/
  46  |     await page.waitForLoadState('networkidle');
  47  | 
  48  |     // Verify the canvas is visible
  49  |     const canvas = page.locator('canvas');
  50  |     await expect(canvas).toBeVisible();
  51  | 
  52  |     // Measure frame timing
  53  |     const frameTimings = await page.evaluate(() => {
  54  |       return new Promise<number[]>((resolve) => {
  55  |         const timings: number[] = [];
  56  |         let lastTime = performance.now();
  57  |         let frameCount = 0;
  58  | 
  59  |         const measureFrames = () => {
  60  |           const now = performance.now();
  61  |           const deltaTime = now - lastTime;
  62  |           timings.push(deltaTime);
  63  |           lastTime = now;
  64  |           frameCount++;
  65  | 
  66  |           if (frameCount < 60) {
  67  |             requestAnimationFrame(measureFrames);
  68  |           } else {
  69  |             resolve(timings);
  70  |           }
  71  |         };
  72  | 
  73  |         requestAnimationFrame(measureFrames);
  74  |       });
  75  |     });
  76  | 
  77  |     // Calculate average frame time
  78  |     const avgFrameTime = frameTimings.reduce((a, b) => a + b, 0) / frameTimings.length;
  79  | 
  80  |     // 60fps = ~16.67ms per frame
  81  |     // Allow some variance (up to 20ms average)
  82  |     expect(avgFrameTime).toBeLessThan(20);
  83  | 
  84  |     // Verify most frames are close to 16.67ms
  85  |     const goodFrames = frameTimings.filter((t) => t < 20).length;
  86  |     expect(goodFrames / frameTimings.length).toBeGreaterThan(0.8);
  87  |   });
  88  | 
  89  |   test('[US-014#3] Keyboard input is processed without lag', async ({ page }) => {
  90  |     // Load the app
  91  |     await page.goto('/');
  92  |     await page.waitForLoadState('networkidle');
  93  | 
  94  |     // Verify the canvas is visible
  95  |     const canvas = page.locator('canvas');
  96  |     await expect(canvas).toBeVisible();
  97  | 
  98  |     // Focus on the page
  99  |     await page.focus('body');
  100 | 
  101 |     // Send rapid keyboard input
  102 |     const startTime = Date.now();
  103 | 
  104 |     for (let i = 0; i < 10; i++) {
  105 |       await page.keyboard.press('ArrowUp');
  106 |       await page.keyboard.press('ArrowDown');
  107 |       await page.keyboard.press('ArrowLeft');
  108 |       await page.keyboard.press('ArrowRight');
  109 |     }
  110 | 
  111 |     const endTime = Date.now();
  112 |     const totalTime = endTime - startTime;
  113 | 
  114 |     // 40 key presses should complete in reasonable time (< 5 seconds)
  115 |     expect(totalTime).toBeLessThan(5000);
  116 | 
  117 |     // Verify no errors occurred
  118 |     const errors: string[] = [];
  119 |     page.on('console', (msg) => {
  120 |       if (msg.type() === 'error') {
  121 |         errors.push(msg.text());
  122 |       }
  123 |     });
  124 | 
  125 |     await page.waitForTimeout(500);
  126 | 
  127 |     expect(errors.length).toBe(0);
  128 |   });
  129 | 
  130 |   test('[US-014#3] Game state persists across interactions', async ({ page }) => {
  131 |     // Load the app
  132 |     await page.goto('/');
  133 |     await page.waitForLoadState('networkidle');
  134 | 
  135 |     // Verify the canvas is visible
  136 |     const canvas = page.locator('canvas');
  137 |     await expect(canvas).toBeVisible();
  138 | 
  139 |     // Get initial canvas state
  140 |     const initialCanvasData = await canvas.screenshot();
  141 |     expect(initialCanvasData).toBeTruthy();
  142 | 
  143 |     // Wait a moment
  144 |     await page.waitForTimeout(1000);
  145 | 
```