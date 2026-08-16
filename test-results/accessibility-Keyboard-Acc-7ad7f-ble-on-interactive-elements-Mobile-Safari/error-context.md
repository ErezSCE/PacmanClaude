# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: accessibility.spec.ts >> Keyboard Accessibility & Focus >> [US-014#3] Focus indicators are visible on interactive elements
- Location: tests/e2e/accessibility.spec.ts:119:3

# Error details

```
Error: page.goto: Could not connect to localhost: Connection refused
Call log:
  - navigating to "http://localhost:5173/", waiting until "load"

```

# Test source

```ts
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
  113 | 
  114 |     await page.waitForTimeout(500);
  115 | 
  116 |     expect(errors.length).toBe(0);
  117 |   });
  118 | 
  119 |   test('[US-014#3] Focus indicators are visible on interactive elements', async ({
  120 |     page,
  121 |   }) => {
  122 |     // Load the app
> 123 |     await page.goto('/');
      |                ^ Error: page.goto: Could not connect to localhost: Connection refused
  124 |     await page.waitForLoadState('networkidle');
  125 | 
  126 |     // Focus on the body
  127 |     await page.focus('body');
  128 | 
  129 |     // Tab to navigate (if there are focusable elements)
  130 |     await page.keyboard.press('Tab');
  131 | 
  132 |     // Get the currently focused element
  133 |     const focusedElement = await page.evaluate(() => {
  134 |       const el = document.activeElement as HTMLElement;
  135 |       if (!el) return null;
  136 |       const style = window.getComputedStyle(el);
  137 |       return {
  138 |         tagName: el.tagName,
  139 |         outline: style.outline,
  140 |         boxShadow: style.boxShadow,
  141 |       };
  142 |     });
  143 | 
  144 |     // If there are focusable elements, they should have visible focus indicators
  145 |     if (focusedElement && focusedElement.tagName !== 'BODY') {
  146 |       const hasFocusIndicator =
  147 |         focusedElement.outline !== 'none' || focusedElement.boxShadow !== 'none';
  148 |       expect(hasFocusIndicator).toBe(true);
  149 |     }
  150 |   });
  151 | 
  152 |   test('[US-014#3] Canvas receives keyboard input without losing focus', async ({
  153 |     page,
  154 |   }) => {
  155 |     // Load the app
  156 |     await page.goto('/');
  157 |     await page.waitForLoadState('networkidle');
  158 | 
  159 |     // Get the canvas element
  160 |     const canvas = page.locator('canvas');
  161 |     await expect(canvas).toBeVisible();
  162 | 
  163 |     // Focus on the canvas
  164 |     await canvas.focus();
  165 | 
  166 |     // Send keyboard input
  167 |     await page.keyboard.press('ArrowUp');
  168 |     await page.keyboard.press('ArrowDown');
  169 | 
  170 |     // Verify canvas is still focused
  171 |     const isFocused = await page.evaluate(() => {
  172 |       return document.activeElement === document.querySelector('canvas');
  173 |     });
  174 | 
  175 |     // Canvas may not be focusable by default, but the app should handle keyboard input
  176 |     // Verify no errors occurred
  177 |     const errors: string[] = [];
  178 |     page.on('console', (msg) => {
  179 |       if (msg.type() === 'error') {
  180 |         errors.push(msg.text());
  181 |       }
  182 |     });
  183 | 
  184 |     await page.waitForTimeout(500);
  185 | 
  186 |     expect(errors.length).toBe(0);
  187 |   });
  188 | });
  189 | 
```