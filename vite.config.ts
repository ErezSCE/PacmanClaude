import { defineConfig } from 'vite';

// VitePWA service-worker generation requires Node 20+; skip in Node 18.
const nodeVersion = parseInt(process.versions.node.split('.')[0], 10);
const useVitePWA = nodeVersion >= 20;

export default defineConfig(async () => {
  const plugins: any[] = [];

  if (useVitePWA) {
    const { VitePWA } = await import('vite-plugin-pwa');
    plugins.push(
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: null,
        strategies: 'generateSW',
        workbox: {
          globPatterns: [
            '**/*.{js,css,html,png,svg,ico,webp,mp3,ogg,wav,woff,woff2}',
          ],
          maximumFileSizeToCacheInBytes: 2 * 1024 * 1024,
          runtimeCaching: [
            {
              urlPattern: /\.(?:png|svg|ico|webp)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'sprite-assets',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 30 * 24 * 60 * 60,
                },
              },
            },
            {
              urlPattern: /\.(?:mp3|ogg|wav)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'audio-assets',
                expiration: {
                  maxEntries: 30,
                  maxAgeSeconds: 30 * 24 * 60 * 60,
                },
              },
            },
          ],
        },
        manifest: {
          name: 'Pac-Man',
          short_name: 'PacMan',
          description: 'Classic Pac-Man arcade game — playable offline',
          theme_color: '#000000',
          background_color: '#000000',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/',
          icons: [
            {
              src: '/icons/icon-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: '/icons/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
          ],
        },
      }),
    );
  }

  return {
    root: '.',
    base: '/',
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      target: 'es2020',
      assetsInlineLimit: 0,
    },
    plugins,
    server: {
      port: 3000,
    },
    test: {
      globals: false,
      environment: 'jsdom',
      include: ['tests/**/*.test.ts'],
    },
  };
});
