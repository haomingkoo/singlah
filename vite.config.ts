import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { copyFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

// GitHub Pages has no SPA fallback. Copying index.html into each client route folder
// makes /saved and /play?id= answer with HTTP 200 instead of the 404 page.
const SPA_ROUTES = ['saved', 'play']
function spaRouteCopies() {
  return {
    name: 'spa-route-copies',
    apply: 'build' as const,
    closeBundle() {
      for (const route of SPA_ROUTES) {
        mkdirSync(`dist/${route}`, { recursive: true })
        copyFileSync('dist/index.html', `dist/${route}/index.html`)
      }
    },
  }
}

export default defineConfig({
  base: '/',
  resolve: {
    alias: {
      'zlibjs/bin/gunzip.min.js': fileURLToPath(new URL('./src/lib/romanizer/gunzipShim.ts', import.meta.url)),
    },
  },
  plugins: [
    react(),
    spaRouteCopies(),
    tailwindcss(),
    nodePolyfills({
      include: ['path', 'buffer', 'process', 'stream', 'zlib'],
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'SingLah: karaoke lyrics with romanisation',
        short_name: 'SingLah',
        description: 'Synced karaoke lyrics with romanisation',
        theme_color: '#141119',
        background_color: '#141119',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        navigateFallbackDenylist: [/^\/(privacy|terms)(\/|$)/],
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/lrclib\.net\/api\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'lrclib-api',
              expiration: { maxEntries: 100, maxAgeSeconds: 86400 },
            },
          },
          {
            urlPattern: /dict\/.*\.dat\.gz$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'kuromoji-dict',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
        ],
      },
    }),
  ],
})
