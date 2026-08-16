# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: gameplay.spec.ts >> Basic Gameplay Smoke Tests >> [US-014#3] Game handles rapid viewport changes gracefully
- Location: tests/e2e/gameplay.spec.ts:201:3

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5173/
Call log:
  - navigating to "http://localhost:5173/", waiting until "load"

```

# Test source

```ts
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
  146 |     // Get canvas state after waiting
  147 |     const laterCanvasData = await canvas.screenshot();
  148 |     expect(laterCanvasData).toBeTruthy();
  149 | 
  150 |     // Canvas should have changed (game loop is running)
  151 |     // Note: We can't directly compare screenshots due to animation,
  152 |     // but we can verify the canvas is still rendering
  153 |     expect(laterCanvasData.length).toBeGreaterThan(0);
  154 |   });
  155 | 
  156 |   test('[US-014#3] No memory leaks during extended gameplay', async ({ page }) => {
  157 |     // Load the app
  158 |     await page.goto('/');
  159 |     await page.waitForLoadState('networkidle');
  160 | 
  161 |     // Verify the canvas is visible
  162 |     const canvas = page.locator('canvas');
  163 |     await expect(canvas).toBeVisible();
  164 | 
  165 |     // Measure memory usage at start
  166 |     const initialMemory = await page.evaluate(() => {
  167 |       if ((performance as any).memory) {
  168 |         return (performance as any).memory.usedJSHeapSize;
  169 |       }
  170 |       return 0;
  171 |     });
  172 | 
  173 |     // Simulate extended gameplay (30 seconds of input)
  174 |     await page.focus('body');
  175 | 
  176 |     for (let i = 0; i < 30; i++) {
  177 |       await page.keyboard.press('ArrowUp');
  178 |       await page.keyboard.press('ArrowDown');
  179 |       await page.keyboard.press('ArrowLeft');
  180 |       await page.keyboard.press('ArrowRight');
  181 |       await page.waitForTimeout(100);
  182 |     }
  183 | 
  184 |     // Measure memory usage at end
  185 |     const finalMemory = await page.evaluate(() => {
  186 |       if ((performance as any).memory) {
  187 |         return (performance as any).memory.usedJSHeapSize;
  188 |       }
  189 |       return 0;
  190 |     });
  191 | 
  192 |     // Memory growth should be reasonable (< 50MB)
  193 |     const memoryGrowth = finalMemory - initialMemory;
  194 |     const maxGrowth = 50 * 1024 * 1024; // 50MB
  195 | 
  196 |     if (initialMemory > 0) {
  197 |       expect(memoryGrowth).toBeLessThan(maxGrowth);
  198 |     }
  199 |   });
  200 | 
  201 |   test('[US-014#3] Game handles rapid viewport changes gracefully', async ({
  202 |     page,
  203 |   }) => {
  204 |     // Load the app
> 205 |     await page.goto('/');
      |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5173/
  206 |     await page.waitForLoadState('networkidle');
  207 | 
  208 |     // Verify the canvas is visible
  209 |     const canvas = page.locator('canvas');
  210 |     await expect(canvas).toBeVisible();
  211 | 
  212 |     // Rapidly change viewport sizes
  213 |     const sizes = [
  214 |       { width: 375, height: 667 },
  215 |       { width: 768, height: 1024 },
  216 |       { width: 1024, height: 768 },
  217 |       { width: 1920, height: 1080 },
  218 |     ];
  219 | 
  220 |     for (const size of sizes) {
  221 |       await page.setViewportSize(size);
  222 |       await page.waitForTimeout(200);
  223 | 
  224 |       // Verify canvas is still visible
  225 |       await expect(canvas).toBeVisible();
  226 |     }
  227 | 
  228 |     // Verify no errors occurred
  229 |     const errors: string[] = [];
  230 |     page.on('console', (msg) => {
  231 |       if (msg.type() === 'error') {
  232 |         errors.push(msg.text());
  233 |       }
  234 |     });
  235 | 
  236 |     expect(errors.length).toBe(0);
  237 |   });
  238 | 
  239 |   test('[US-014#3] App recovers from network interruption', async ({
  240 |     page,
  241 |     context,
  242 |   }) => {
  243 |     // Load the app online
  244 |     await page.goto('/');
  245 |     await page.waitForLoadState('networkidle');
  246 | 
  247 |     // Verify the canvas is visible
  248 |     const canvas = page.locator('canvas');
  249 |     await expect(canvas).toBeVisible();
  250 | 
  251 |     // Go offline briefly
  252 |     await context.setOffline(true);
  253 |     await page.waitForTimeout(500);
  254 | 
  255 |     // Come back online
  256 |     await context.setOffline(false);
  257 | 
  258 |     // Verify the app still works
  259 |     await expect(canvas).toBeVisible();
  260 | 
  261 |     // Verify no critical errors
  262 |     const errors: string[] = [];
  263 |     page.on('console', (msg) => {
  264 |       if (msg.type() === 'error') {
  265 |         errors.push(msg.text());
  266 |       }
  267 |     });
  268 | 
  269 |     await page.waitForTimeout(500);
  270 | 
  271 |     expect(errors.length).toBe(0);
  272 |   });
  273 | });
  274 | 
```