import { test, expect, devices } from '@playwright/test';

/**
 * Responsive layout tests.
 * Verifies that the game layout scales correctly from 375px to 2560px
 * across supported browsers and maintains playability on mobile and desktop.
 */

test.describe('Responsive Layout & Scaling', () => {
  const viewportSizes = [
    { width: 375, height: 667, name: 'Mobile (375px)' },
    { width: 768, height: 1024, name: 'Tablet (768px)' },
    { width: 1024, height: 768, name: 'Desktop (1024px)' },
    { width: 1920, height: 1080, name: 'Full HD (1920px)' },
    { width: 2560, height: 1440, name: '2K (2560px)' },
  ];

  for (const viewport of viewportSizes) {
    test(`[US-014#3] Layout scales correctly at ${viewport.name}`, async ({
      page,
    }) => {
      // Set the viewport size
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });

      // Load the app
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Verify the canvas element is visible
      const canvas = page.locator('canvas');
      await expect(canvas).toBeVisible();

      // Get the canvas dimensions
      const canvasBox = await canvas.boundingBox();
      expect(canvasBox).not.toBeNull();

      if (canvasBox) {
        // Verify canvas is within viewport bounds (with some margin for UI)
        expect(canvasBox.width).toBeGreaterThan(0);
        expect(canvasBox.height).toBeGreaterThan(0);
        expect(canvasBox.width).toBeLessThanOrEqual(viewport.width);
        expect(canvasBox.height).toBeLessThanOrEqual(viewport.height);
      }

      // Verify no horizontal scrollbar is needed
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      expect(hasHorizontalScroll).toBe(false);
    });
  }

  test('[US-014#3] Mobile viewport (375px) displays touch-friendly UI', async ({
    page,
  }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Load the app
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify the canvas is visible
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // Verify the app doesn't require horizontal scrolling
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasHorizontalScroll).toBe(false);

    // Verify touch events are supported (no errors on touch)
    const touchSupported = await page.evaluate(() => {
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    });
    expect(touchSupported).toBe(true);
  });

  test('[US-014#3] Desktop viewport (1920px) displays full layout', async ({
    page,
  }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Load the app
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify the canvas is visible and properly sized
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    const canvasBox = await canvas.boundingBox();
    expect(canvasBox).not.toBeNull();

    if (canvasBox) {
      // On desktop, canvas should be reasonably large
      expect(canvasBox.width).toBeGreaterThan(400);
      expect(canvasBox.height).toBeGreaterThan(400);
    }
  });

  test('[US-014#3] Ultra-wide viewport (2560px) scales without breaking', async ({
    page,
  }) => {
    // Set ultra-wide viewport
    await page.setViewportSize({ width: 2560, height: 1440 });

    // Load the app
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify the canvas is visible
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // Verify no layout issues
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasHorizontalScroll).toBe(false);

    // Verify canvas is properly scaled
    const canvasBox = await canvas.boundingBox();
    expect(canvasBox).not.toBeNull();

    if (canvasBox) {
      expect(canvasBox.width).toBeGreaterThan(0);
      expect(canvasBox.height).toBeGreaterThan(0);
    }
  });

  test('[US-014#3] Orientation change (portrait to landscape) adapts layout', async ({
    page,
  }) => {
    // Start in portrait
    await page.setViewportSize({ width: 375, height: 667 });

    // Load the app
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify canvas is visible in portrait
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    const portraitBox = await canvas.boundingBox();
    expect(portraitBox).not.toBeNull();

    // Switch to landscape
    await page.setViewportSize({ width: 667, height: 375 });

    // Wait for layout to adapt
    await page.waitForTimeout(500);

    // Verify canvas is still visible in landscape
    await expect(canvas).toBeVisible();

    const landscapeBox = await canvas.boundingBox();
    expect(landscapeBox).not.toBeNull();

    // Both should be valid (dimensions may change)
    if (portraitBox && landscapeBox) {
      expect(portraitBox.width).toBeGreaterThan(0);
      expect(landscapeBox.width).toBeGreaterThan(0);
    }
  });
});
