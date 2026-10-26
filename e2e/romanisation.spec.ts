import { expect, test } from '@playwright/test'
import { JAPANESE_SONG, KOREAN_SONG, mockLrclib } from './lrclib'

test.beforeEach(async ({ page }) => {
  if (!process.env.LIVE_LRCLIB) await mockLrclib(page)
})

test('Japanese lyrics show Hepburn romaji', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto(`/play?id=${JAPANESE_SONG}`)

  await expect(page.getByText('夢ならばどれほどよかったでしょう')).toBeVisible()
  // Kuromoji fetches and gunzips a ~17 MB dictionary before the first reading appears.
  await expect(page.getByText(/^yume nara ba dorehodo yokatta/)).toBeVisible({ timeout: 45_000 })
  await expect(page.getByText(/^imadani anata no koto o yume ni miru/)).toBeVisible()
  expect(errors).toEqual([])
})

test('Korean lyrics show Revised Romanisation', async ({ page }) => {
  await page.goto(`/play?id=${KOREAN_SONG}`)

  await expect(page.getByText('이 밤 그날의 반딧불을 당신의')).toBeVisible()
  await expect(page.getByText('i bam geunarui banditbureul dangsinui')).toBeVisible()
  await expect(page.getByText('chang gakkai bonaelgeyo')).toBeVisible()
})
