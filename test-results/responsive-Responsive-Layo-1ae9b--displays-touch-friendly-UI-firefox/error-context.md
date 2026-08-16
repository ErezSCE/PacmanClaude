# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: responsive.spec.ts >> Responsive Layout & Scaling >> [US-014#3] Mobile viewport (375px) displays touch-friendly UI
- Location: tests/e2e/responsive.spec.ts:56:3

# Error details

```
Error: page.goto: NS_ERROR_CONNECTION_REFUSED
Call log:
  - navigating to "http://localhost:5173/", waiting until "load"

```

# Page snapshot

```yaml
- article [ref=e3]:
  - generic [ref=e6]:
    - heading "Unable to connect" [level=1] [ref=e7]
    - paragraph [ref=e8]:
      - text: Nightly can’t connect to the server at
      - strong [ref=e9]: localhost:5173
    - generic [ref=e10]:
      - heading "What can you do about it?" [level=3] [ref=e11]
      - list [ref=e12]:
        - listitem [ref=e13]: The site could be temporarily unavailable or too busy. Try again in a few moments.
        - listitem [ref=e14]: If you are unable to load any pages, check your computer’s network connection.
        - listitem [ref=e15]: If your computer or network is protected by a firewall or proxy, make sure that Nightly is permitted to access the web.
    - button "Try Again" [ref=e18]
```

# Test source

```ts
  1   | import { test, expect, devices } from '@playwright/test';
  2   | 
  3   | /**
  4   |  * Responsive layout tests.
  5   |  * Verifies that the game layout scales correctly from 375px to 2560px
  6   |  * across supported browsers and maintains playability on mobile and desktop.
  7   |  */
  8   | 
  9   | test.describe('Responsive Layout & Scaling', () => {
  10  |   const viewportSizes = [
  11  |     { width: 375, height: 667, name: 'Mobile (375px)' },
  12  |     { width: 768, height: 1024, name: 'Tablet (768px)' },
  13  |     { width: 1024, height: 768, name: 'Desktop (1024px)' },
  14  |     { width: 1920, height: 1080, name: 'Full HD (1920px)' },
  15  |     { width: 2560, height: 1440, name: '2K (2560px)' },
  16  |   ];
  17  | 
  18  |   for (const viewport of viewportSizes) {
  19  |     test(`[US-014#3] Layout scales correctly at ${viewport.name}`, async ({
  20  |       page,
  21  |     }) => {
  22  |       // Set the viewport size
  23  |       await page.setViewportSize({
  24  |         width: viewport.width,
  25  |         height: viewport.height,
  26  |       });
  27  | 
  28  |       // Load the app
  29  |       await page.goto('/');
  30  |       await page.waitForLoadState('networkidle');
  31  | 
  32  |       // Verify the canvas element is visible
  33  |       const canvas = page.locator('canvas');
  34  |       await expect(canvas).toBeVisible();
  35  | 
  36  |       // Get the canvas dimensions
  37  |       const canvasBox = await canvas.boundingBox();
  38  |       expect(canvasBox).not.toBeNull();
  39  | 
  40  |       if (canvasBox) {
  41  |         // Verify canvas is within viewport bounds (with some margin for UI)
  42  |         expect(canvasBox.width).toBeGreaterThan(0);
  43  |         expect(canvasBox.height).toBeGreaterThan(0);
  44  |         expect(canvasBox.width).toBeLessThanOrEqual(viewport.width);
  45  |         expect(canvasBox.height).toBeLessThanOrEqual(viewport.height);
  46  |       }
  47  | 
  48  |       // Verify no horizontal scrollbar is needed
  49  |       const hasHorizontalScroll = await page.evaluate(() => {
  50  |         return document.documentElement.scrollWidth > window.innerWidth;
  51  |       });
  52  |       expect(hasHorizontalScroll).toBe(false);
  53  |     });
  54  |   }
  55  | 
  56  |   test('[US-014#3] Mobile viewport (375px) displays touch-friendly UI', async ({
  57  |     page,
  58  |   }) => {
  59  |     // Set mobile viewport
  60  |     await page.setViewportSize({ width: 375, height: 667 });
  61  | 
  62  |     // Load the app
> 63  |     await page.goto('/');
      |                ^ Error: page.goto: NS_ERROR_CONNECTION_REFUSED
  64  |     await page.waitForLoadState('networkidle');
  65  | 
  66  |     // Verify the canvas is visible
  67  |     const canvas = page.locator('canvas');
  68  |     await expect(canvas).toBeVisible();
  69  | 
  70  |     // Verify the app doesn't require horizontal scrolling
  71  |     const hasHorizontalScroll = await page.evaluate(() => {
  72  |       return document.documentElement.scrollWidth > window.innerWidth;
  73  |     });
  74  |     expect(hasHorizontalScroll).toBe(false);
  75  | 
  76  |     // Verify touch events are supported (no errors on touch)
  77  |     const touchSupported = await page.evaluate(() => {
  78  |       return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  79  |     });
  80  |     expect(touchSupported).toBe(true);
  81  |   });
  82  | 
  83  |   test('[US-014#3] Desktop viewport (1920px) displays full layout', async ({
  84  |     page,
  85  |   }) => {
  86  |     // Set desktop viewport
  87  |     await page.setViewportSize({ width: 1920, height: 1080 });
  88  | 
  89  |     // Load the app
  90  |     await page.goto('/');
  91  |     await page.waitForLoadState('networkidle');
  92  | 
  93  |     // Verify the canvas is visible and properly sized
  94  |     const canvas = page.locator('canvas');
  95  |     await expect(canvas).toBeVisible();
  96  | 
  97  |     const canvasBox = await canvas.boundingBox();
  98  |     expect(canvasBox).not.toBeNull();
  99  | 
  100 |     if (canvasBox) {
  101 |       // On desktop, canvas should be reasonably large
  102 |       expect(canvasBox.width).toBeGreaterThan(400);
  103 |       expect(canvasBox.height).toBeGreaterThan(400);
  104 |     }
  105 |   });
  106 | 
  107 |   test('[US-014#3] Ultra-wide viewport (2560px) scales without breaking', async ({
  108 |     page,
  109 |   }) => {
  110 |     // Set ultra-wide viewport
  111 |     await page.setViewportSize({ width: 2560, height: 1440 });
  112 | 
  113 |     // Load the app
  114 |     await page.goto('/');
  115 |     await page.waitForLoadState('networkidle');
  116 | 
  117 |     // Verify the canvas is visible
  118 |     const canvas = page.locator('canvas');
  119 |     await expect(canvas).toBeVisible();
  120 | 
  121 |     // Verify no layout issues
  122 |     const hasHorizontalScroll = await page.evaluate(() => {
  123 |       return document.documentElement.scrollWidth > window.innerWidth;
  124 |     });
  125 |     expect(hasHorizontalScroll).toBe(false);
  126 | 
  127 |     // Verify canvas is properly scaled
  128 |     const canvasBox = await canvas.boundingBox();
  129 |     expect(canvasBox).not.toBeNull();
  130 | 
  131 |     if (canvasBox) {
  132 |       expect(canvasBox.width).toBeGreaterThan(0);
  133 |       expect(canvasBox.height).toBeGreaterThan(0);
  134 |     }
  135 |   });
  136 | 
  137 |   test('[US-014#3] Orientation change (portrait to landscape) adapts layout', async ({
  138 |     page,
  139 |   }) => {
  140 |     // Start in portrait
  141 |     await page.setViewportSize({ width: 375, height: 667 });
  142 | 
  143 |     // Load the app
  144 |     await page.goto('/');
  145 |     await page.waitForLoadState('networkidle');
  146 | 
  147 |     // Verify canvas is visible in portrait
  148 |     const canvas = page.locator('canvas');
  149 |     await expect(canvas).toBeVisible();
  150 | 
  151 |     const portraitBox = await canvas.boundingBox();
  152 |     expect(portraitBox).not.toBeNull();
  153 | 
  154 |     // Switch to landscape
  155 |     await page.setViewportSize({ width: 667, height: 375 });
  156 | 
  157 |     // Wait for layout to adapt
  158 |     await page.waitForTimeout(500);
  159 | 
  160 |     // Verify canvas is still visible in landscape
  161 |     await expect(canvas).toBeVisible();
  162 | 
  163 |     const landscapeBox = await canvas.boundingBox();
```