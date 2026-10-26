import { expect, test, type Browser, type Page } from '@playwright/test'
import { JAPANESE_SONG, KOREAN_SONG, mockLrclib } from './lrclib'

test.skip(!!process.env.BASE_URL, 'needs the local party backend')

async function openSong(browser: Browser, id: number): Promise<Page> {
  const page = await (await browser.newContext({ serviceWorkers: 'block' })).newPage()
  await mockLrclib(page)
  await page.goto(`/play?id=${id}`)
  await expect(page.getByRole('button', { name: 'Play' })).toBeVisible()
  return page
}

async function join(page: Page, code: string) {
  await page.getByRole('button', { name: 'Party mode' }).click()
  await page.getByLabel('Room code').fill(code)
  await page.getByRole('button', { name: 'Join' }).click()
  await expect(page.getByText(`Room ${code}`)).toBeVisible()
  await page.keyboard.press('Escape')
}

const position = (page: Page) => page.getByLabel('Position in song').inputValue().then(Number)

async function expectNear(page: Page, seconds: number) {
  await expect.poll(() => position(page), { timeout: 5_000 }).toBeGreaterThan(seconds - 1.5)
  expect(await position(page)).toBeLessThan(seconds + 3)
}

test('guests follow the host, including song, seek, pause and late joins', async ({ browser }) => {
  const host = await openSong(browser, JAPANESE_SONG)
  await host.getByRole('button', { name: 'Party mode' }).click()
  await host.getByRole('button', { name: 'Create a room' }).click()
  const code = (await host.locator('p.tracking-widest').innerText()).trim()
  expect(code).toMatch(/^[A-Z2-9]{6}$/)
  await host.keyboard.press('Escape')

  // The guest starts on a different song and is moved onto the host's.
  const guest = await openSong(browser, KOREAN_SONG)
  await join(guest, code)
  await expect(guest).toHaveURL(new RegExp(`id=${JAPANESE_SONG}`))
  await expect(host.getByText('2 connected')).toBeVisible()

  await host.getByRole('button', { name: 'Play' }).click()
  await expect(guest.getByRole('button', { name: 'Pause' })).toBeVisible()

  await host.getByLabel('Position in song').fill('120')
  await expectNear(guest, 120)

  // A late joiner lands mid-song, already playing.
  const late = await openSong(browser, KOREAN_SONG)
  await join(late, code)
  await expect(late).toHaveURL(new RegExp(`id=${JAPANESE_SONG}`))
  await expect(late.getByRole('button', { name: 'Pause' })).toBeVisible()
  await expectNear(late, await position(host))

  await host.getByRole('button', { name: 'Pause' }).click()
  await expect(guest.getByRole('button', { name: 'Play' })).toBeVisible()
  await expect(late.getByRole('button', { name: 'Play' })).toBeVisible()
  const paused = await position(host)
  await expect.poll(() => position(guest)).toBeCloseTo(paused, 0)
})
