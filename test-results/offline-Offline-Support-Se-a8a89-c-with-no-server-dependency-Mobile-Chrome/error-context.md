# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: offline.spec.ts >> Offline Support & Service Worker Caching >> [US-014#2] Build output is static with no server dependency
- Location: tests/e2e/offline.spec.ts:107:3

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5173/
Call log:
  - navigating to "http://localhost:5173/", waiting until "load"

```

# Test source

```ts
  11  |     page,
  12  |   }) => {
  13  |     // Load the app for the first time
  14  |     await page.goto('/');
  15  | 
  16  |     // Wait for the page to fully load
  17  |     await page.waitForLoadState('networkidle');
  18  | 
  19  |     // Verify the Service Worker is registered
  20  |     const swRegistered = await page.evaluate(() => {
  21  |       return navigator.serviceWorker.controller !== null;
  22  |     });
  23  |     expect(swRegistered).toBe(true);
  24  | 
  25  |     // Verify the canvas element is present (app shell loaded)
  26  |     const canvas = page.locator('canvas');
  27  |     await expect(canvas).toBeVisible();
  28  | 
  29  |     // Verify the main script loaded
  30  |     const mainScript = await page.evaluate(() => {
  31  |       return document.querySelector('script[type="module"]') !== null;
  32  |     });
  33  |     expect(mainScript).toBe(true);
  34  |   });
  35  | 
  36  |   test('[US-014#1] App loads offline after Service Worker caches assets', async ({
  37  |     page,
  38  |     context,
  39  |   }) => {
  40  |     // First, load the app online to trigger caching
  41  |     await page.goto('/');
  42  |     await page.waitForLoadState('networkidle');
  43  | 
  44  |     // Verify Service Worker is active
  45  |     const swActive = await page.evaluate(() => {
  46  |       return navigator.serviceWorker.controller !== null;
  47  |     });
  48  |     expect(swActive).toBe(true);
  49  | 
  50  |     // Go offline by setting network condition
  51  |     await context.setOffline(true);
  52  | 
  53  |     // Reload the page while offline
  54  |     await page.reload();
  55  | 
  56  |     // Verify the app still loads (canvas is visible)
  57  |     const canvas = page.locator('canvas');
  58  |     await expect(canvas).toBeVisible({ timeout: 5000 });
  59  | 
  60  |     // Verify the page title is still present
  61  |     const title = page.locator('title');
  62  |     await expect(title).toContainText('Pac-Man');
  63  | 
  64  |     // Restore network
  65  |     await context.setOffline(false);
  66  |   });
  67  | 
  68  |   test('[US-014#1] Cached assets are served from Service Worker offline', async ({
  69  |     page,
  70  |     context,
  71  |   }) => {
  72  |     // Load online first
  73  |     await page.goto('/');
  74  |     await page.waitForLoadState('networkidle');
  75  | 
  76  |     // Go offline
  77  |     await context.setOffline(true);
  78  | 
  79  |     // Verify we can still access the app
  80  |     await page.goto('/');
  81  | 
  82  |     // Check that the canvas renders (indicating JS loaded from cache)
  83  |     const canvas = page.locator('canvas');
  84  |     await expect(canvas).toBeVisible({ timeout: 5000 });
  85  | 
  86  |     // Verify no network errors occurred
  87  |     const errors: string[] = [];
  88  |     page.on('console', (msg) => {
  89  |       if (msg.type() === 'error') {
  90  |         errors.push(msg.text());
  91  |       }
  92  |     });
  93  | 
  94  |     // Allow a moment for any errors to be logged
  95  |     await page.waitForTimeout(1000);
  96  | 
  97  |     // We expect no critical errors (Service Worker should handle offline gracefully)
  98  |     const criticalErrors = errors.filter(
  99  |       (e) => e.includes('Failed to fetch') && !e.includes('sw.js')
  100 |     );
  101 |     expect(criticalErrors.length).toBe(0);
  102 | 
  103 |     // Restore network
  104 |     await context.setOffline(false);
  105 |   });
  106 | 
  107 |   test('[US-014#2] Build output is static with no server dependency', async ({
  108 |     page,
  109 |   }) => {
  110 |     // Load the app
> 111 |     await page.goto('/');
      |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5173/
  112 |     await page.waitForLoadState('networkidle');
  113 | 
  114 |     // Verify the app is a static SPA (no API calls to a backend)
  115 |     const requests: string[] = [];
  116 |     page.on('response', (response) => {
  117 |       requests.push(response.url());
  118 |     });
  119 | 
  120 |     // Simulate some user interaction (e.g., wait a moment)
  121 |     await page.waitForTimeout(500);
  122 | 
  123 |     // Filter for any API/backend requests (should be none)
  124 |     const apiRequests = requests.filter(
  125 |       (url) =>
  126 |         url.includes('/api/') ||
  127 |         url.includes('/graphql') ||
  128 |         url.includes('localhost:3000') ||
  129 |         url.includes('localhost:8000')
  130 |     );
  131 | 
  132 |     expect(apiRequests.length).toBe(0);
  133 | 
  134 |     // Verify the app is purely client-side
  135 |     const isClientOnly = await page.evaluate(() => {
  136 |       // Check that there are no references to server-side rendering
  137 |       return !document.documentElement.innerHTML.includes('__INITIAL_STATE__');
  138 |     });
  139 |     expect(isClientOnly).toBe(true);
  140 |   });
  141 | 
  142 |   test('[US-014#2] Total shipped assets remain under 2 MB budget', async ({
  143 |     page,
  144 |   }) => {
  145 |     const resourceSizes: { [key: string]: number } = {};
  146 | 
  147 |     page.on('response', (response) => {
  148 |       const url = response.url();
  149 |       const size = response.headers()['content-length'];
  150 |       if (size) {
  151 |         resourceSizes[url] = parseInt(size, 10);
  152 |       }
  153 |     });
  154 | 
  155 |     await page.goto('/');
  156 |     await page.waitForLoadState('networkidle');
  157 | 
  158 |     // Calculate total size of all resources
  159 |     const totalSize = Object.values(resourceSizes).reduce((sum, size) => sum + size, 0);
  160 | 
  161 |     // 2 MB = 2,097,152 bytes
  162 |     const budgetBytes = 2 * 1024 * 1024;
  163 | 
  164 |     // Log the total size for debugging
  165 |     console.log(`Total asset size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
  166 | 
  167 |     // Assert that total is under budget
  168 |     expect(totalSize).toBeLessThan(budgetBytes);
  169 |   });
  170 | });
  171 | 
```