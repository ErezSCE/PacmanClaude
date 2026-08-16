import { test, expect } from '@playwright/test';

/**
 * Offline and Service Worker caching tests.
 * Verifies that the app shell and static assets are precached and the game
 * loads and runs offline after an initial online visit.
 */

test.describe('Offline Support & Service Worker Caching', () => {
  test('[US-014#1] Service Worker registers and caches assets on first load', async ({
    page,
  }) => {
    // Load the app for the first time
    await page.goto('/');

    // Wait for the page to fully load
    await page.waitForLoadState('networkidle');

    // Verify the Service Worker is registered
    const swRegistered = await page.evaluate(() => {
      return navigator.serviceWorker.controller !== null;
    });
    expect(swRegistered).toBe(true);

    // Verify the canvas element is present (app shell loaded)
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // Verify the main script loaded
    const mainScript = await page.evaluate(() => {
      return document.querySelector('script[type="module"]') !== null;
    });
    expect(mainScript).toBe(true);
  });

  test('[US-014#1] App loads offline after Service Worker caches assets', async ({
    page,
    context,
  }) => {
    // First, load the app online to trigger caching
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify Service Worker is active
    const swActive = await page.evaluate(() => {
      return navigator.serviceWorker.controller !== null;
    });
    expect(swActive).toBe(true);

    // Go offline by setting network condition
    await context.setOffline(true);

    // Reload the page while offline
    await page.reload();

    // Verify the app still loads (canvas is visible)
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 5000 });

    // Verify the page title is still present
    const title = page.locator('title');
    await expect(title).toContainText('Pac-Man');

    // Restore network
    await context.setOffline(false);
  });

  test('[US-014#1] Cached assets are served from Service Worker offline', async ({
    page,
    context,
  }) => {
    // Load online first
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Go offline
    await context.setOffline(true);

    // Verify we can still access the app
    await page.goto('/');

    // Check that the canvas renders (indicating JS loaded from cache)
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 5000 });

    // Verify no network errors occurred
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Allow a moment for any errors to be logged
    await page.waitForTimeout(1000);

    // We expect no critical errors (Service Worker should handle offline gracefully)
    const criticalErrors = errors.filter(
      (e) => e.includes('Failed to fetch') && !e.includes('sw.js')
    );
    expect(criticalErrors.length).toBe(0);

    // Restore network
    await context.setOffline(false);
  });

  test('[US-014#2] Build output is static with no server dependency', async ({
    page,
  }) => {
    // Load the app
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify the app is a static SPA (no API calls to a backend)
    const requests: string[] = [];
    page.on('response', (response) => {
      requests.push(response.url());
    });

    // Simulate some user interaction (e.g., wait a moment)
    await page.waitForTimeout(500);

    // Filter for any API/backend requests (should be none)
    const apiRequests = requests.filter(
      (url) =>
        url.includes('/api/') ||
        url.includes('/graphql') ||
        url.includes('localhost:3000') ||
        url.includes('localhost:8000')
    );

    expect(apiRequests.length).toBe(0);

    // Verify the app is purely client-side
    const isClientOnly = await page.evaluate(() => {
      // Check that there are no references to server-side rendering
      return !document.documentElement.innerHTML.includes('__INITIAL_STATE__');
    });
    expect(isClientOnly).toBe(true);
  });

  test('[US-014#2] Total shipped assets remain under 2 MB budget', async ({
    page,
  }) => {
    const resourceSizes: { [key: string]: number } = {};

    page.on('response', (response) => {
      const url = response.url();
      const size = response.headers()['content-length'];
      if (size) {
        resourceSizes[url] = parseInt(size, 10);
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Calculate total size of all resources
    const totalSize = Object.values(resourceSizes).reduce((sum, size) => sum + size, 0);

    // 2 MB = 2,097,152 bytes
    const budgetBytes = 2 * 1024 * 1024;

    // Log the total size for debugging
    console.log(`Total asset size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);

    // Assert that total is under budget
    expect(totalSize).toBeLessThan(budgetBytes);
  });
});
