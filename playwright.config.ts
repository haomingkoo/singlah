import { defineConfig, devices } from '@playwright/test'

// Build first with VITE_PARTY_BACKEND_URL=http://127.0.0.1:8791 (see `npm run test:e2e`).
// BASE_URL points the romanisation check at a deployed site instead.
const external = !!process.env.BASE_URL

export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:4173',
    // A registered service worker would answer LRCLib requests before page.route can mock them.
    serviceWorkers: 'block',
    ...devices['Desktop Chrome'],
  },
  webServer: external
    ? undefined
    : [
        {
          command: 'npx vite preview --port 4173 --strictPort',
          url: 'http://localhost:4173',
          reuseExistingServer: !process.env.CI,
        },
        {
          command: 'python -m uvicorn main:app --port 8791 --app-dir backend',
          url: 'http://127.0.0.1:8791/rooms/ABCDEF',
          reuseExistingServer: !process.env.CI,
        },
      ],
})
