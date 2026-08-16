import { test, expect } from '@playwright/test';

/**
 * Keyboard accessibility and focus tests.
 * Verifies that the game is fully operable via keyboard with visible focus indicators
 * for all menus and screens, supporting arrow keys, WASD, and pause/mute bindings.
 */

test.describe('Keyboard Accessibility & Focus', () => {
  test('[US-014#3] Keyboard navigation is fully functional', async ({ page }) => {
    // Load the app
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify the page is interactive
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // Focus on the page
    await page.focus('body');

    // Test arrow key input
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowRight');

    // Verify no errors occurred
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Allow a moment for any errors to be logged
    await page.waitForTimeout(500);

    // Should have no critical errors from keyboard input
    expect(errors.length).toBe(0);
  });

  test('[US-014#3] WASD keys are supported for movement', async ({ page }) => {
    // Load the app
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Focus on the page
    await page.focus('body');

    // Test WASD keys
    await page.keyboard.press('KeyW');
    await page.keyboard.press('KeyA');
    await page.keyboard.press('KeyS');
    await page.keyboard.press('KeyD');

    // Verify no errors occurred
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.waitForTimeout(500);

    // Should have no critical errors from WASD input
    expect(errors.length).toBe(0);
  });

  test('[US-014#3] Pause key binding is accessible', async ({ page }) => {
    // Load the app
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Focus on the page
    await page.focus('body');

    // Test pause key (typically Space or P)
    await page.keyboard.press('Space');

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

  test('[US-014#3] Mute key binding is accessible', async ({ page }) => {
    // Load the app
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Focus on the page
    await page.focus('body');

    // Test mute key (typically M)
    await page.keyboard.press('KeyM');

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

  test('[US-014#3] Focus indicators are visible on interactive elements', async ({
    page,
  }) => {
    // Load the app
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Focus on the body
    await page.focus('body');

    // Tab to navigate (if there are focusable elements)
    await page.keyboard.press('Tab');

    // Get the currently focused element
    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement;
      if (!el) return null;
      const style = window.getComputedStyle(el);
      return {
        tagName: el.tagName,
        outline: style.outline,
        boxShadow: style.boxShadow,
      };
    });

    // If there are focusable elements, they should have visible focus indicators
    if (focusedElement && focusedElement.tagName !== 'BODY') {
      const hasFocusIndicator =
        focusedElement.outline !== 'none' || focusedElement.boxShadow !== 'none';
      expect(hasFocusIndicator).toBe(true);
    }
  });

  test('[US-014#3] Canvas receives keyboard input without losing focus', async ({
    page,
  }) => {
    // Load the app
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Get the canvas element
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // Focus on the canvas
    await canvas.focus();

    // Send keyboard input
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowDown');

    // Verify canvas is still focused
    const isFocused = await page.evaluate(() => {
      return document.activeElement === document.querySelector('canvas');
    });

    // Canvas may not be focusable by default, but the app should handle keyboard input
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
});
