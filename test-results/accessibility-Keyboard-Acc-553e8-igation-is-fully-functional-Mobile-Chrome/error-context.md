# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: accessibility.spec.ts >> Keyboard Accessibility & Focus >> [US-014#3] Keyboard navigation is fully functional
- Location: tests/e2e/accessibility.spec.ts:10:3

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
  4   |  * Keyboard accessibility and focus tests.
  5   |  * Verifies that the game is fully operable via keyboard with visible focus indicators
  6   |  * for all menus and screens, supporting arrow keys, WASD, and pause/mute bindings.
  7   |  */
  8   | 
  9   | test.describe('Keyboard Accessibility & Focus', () => {
  10  |   test('[US-014#3] Keyboard navigation is fully functional', async ({ page }) => {
  11  |     // Load the app
> 12  |     await page.goto('/');
      |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5173/
  13  |     await page.waitForLoadState('networkidle');
  14  | 
  15  |     // Verify the page is interactive
  16  |     const canvas = page.locator('canvas');
  17  |     await expect(canvas).toBeVisible();
  18  | 
  19  |     // Focus on the page
  20  |     await page.focus('body');
  21  | 
  22  |     // Test arrow key input
  23  |     await page.keyboard.press('ArrowUp');
  24  |     await page.keyboard.press('ArrowDown');
  25  |     await page.keyboard.press('ArrowLeft');
  26  |     await page.keyboard.press('ArrowRight');
  27  | 
  28  |     // Verify no errors occurred
  29  |     const errors: string[] = [];
  30  |     page.on('console', (msg) => {
  31  |       if (msg.type() === 'error') {
  32  |         errors.push(msg.text());
  33  |       }
  34  |     });
  35  | 
  36  |     // Allow a moment for any errors to be logged
  37  |     await page.waitForTimeout(500);
  38  | 
  39  |     // Should have no critical errors from keyboard input
  40  |     expect(errors.length).toBe(0);
  41  |   });
  42  | 
  43  |   test('[US-014#3] WASD keys are supported for movement', async ({ page }) => {
  44  |     // Load the app
  45  |     await page.goto('/');
  46  |     await page.waitForLoadState('networkidle');
  47  | 
  48  |     // Focus on the page
  49  |     await page.focus('body');
  50  | 
  51  |     // Test WASD keys
  52  |     await page.keyboard.press('KeyW');
  53  |     await page.keyboard.press('KeyA');
  54  |     await page.keyboard.press('KeyS');
  55  |     await page.keyboard.press('KeyD');
  56  | 
  57  |     // Verify no errors occurred
  58  |     const errors: string[] = [];
  59  |     page.on('console', (msg) => {
  60  |       if (msg.type() === 'error') {
  61  |         errors.push(msg.text());
  62  |       }
  63  |     });
  64  | 
  65  |     await page.waitForTimeout(500);
  66  | 
  67  |     // Should have no critical errors from WASD input
  68  |     expect(errors.length).toBe(0);
  69  |   });
  70  | 
  71  |   test('[US-014#3] Pause key binding is accessible', async ({ page }) => {
  72  |     // Load the app
  73  |     await page.goto('/');
  74  |     await page.waitForLoadState('networkidle');
  75  | 
  76  |     // Focus on the page
  77  |     await page.focus('body');
  78  | 
  79  |     // Test pause key (typically Space or P)
  80  |     await page.keyboard.press('Space');
  81  | 
  82  |     // Verify no errors occurred
  83  |     const errors: string[] = [];
  84  |     page.on('console', (msg) => {
  85  |       if (msg.type() === 'error') {
  86  |         errors.push(msg.text());
  87  |       }
  88  |     });
  89  | 
  90  |     await page.waitForTimeout(500);
  91  | 
  92  |     expect(errors.length).toBe(0);
  93  |   });
  94  | 
  95  |   test('[US-014#3] Mute key binding is accessible', async ({ page }) => {
  96  |     // Load the app
  97  |     await page.goto('/');
  98  |     await page.waitForLoadState('networkidle');
  99  | 
  100 |     // Focus on the page
  101 |     await page.focus('body');
  102 | 
  103 |     // Test mute key (typically M)
  104 |     await page.keyboard.press('KeyM');
  105 | 
  106 |     // Verify no errors occurred
  107 |     const errors: string[] = [];
  108 |     page.on('console', (msg) => {
  109 |       if (msg.type() === 'error') {
  110 |         errors.push(msg.text());
  111 |       }
  112 |     });
```