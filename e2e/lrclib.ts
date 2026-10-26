import { readFileSync } from 'node:fs'
import type { Page } from '@playwright/test'

export const JAPANESE_SONG = 8948466 // 米津玄師 - Lemon
export const KOREAN_SONG = 36068429 // IU - 밤편지

// LRCLib is flaky, so tests serve trimmed copies of real responses.
export async function mockLrclib(page: Page) {
  await page.route(/^https:\/\/lrclib\.net\/api\/get\/(\d+)$/, (route) => {
    const id = route.request().url().split('/').pop()
    route.fulfill({
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' },
      body: readFileSync(new URL(`./fixtures/${id}.json`, import.meta.url), 'utf8'),
    })
  })
}
