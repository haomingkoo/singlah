import { expect, test } from '@playwright/test'

test('tour opens from the link and returns focus on Esc', async ({ page }) => {
  await page.goto('/')
  const trigger = page.getByRole('button', { name: '▶ 30-second tour' })
  await trigger.focus()
  await page.keyboard.press('Enter')

  const dialog = page.getByRole('dialog', { name: 'SingLah in 30 seconds' })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByText('Music: Sascha Ende, ende.app (CC BY 4.0)')).toBeVisible()
  expect(await dialog.locator('video').evaluate((v: HTMLVideoElement) => v.paused)).toBe(true)

  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()
})

test('?tour=1 opens the tour without autoplay', async ({ page }) => {
  await page.goto('/?tour=1')
  const dialog = page.getByRole('dialog', { name: 'SingLah in 30 seconds' })
  await expect(dialog).toBeVisible()
  expect(await dialog.locator('video').evaluate((v: HTMLVideoElement) => v.paused)).toBe(true)
  await dialog.getByRole('button', { name: 'Close tour' }).click()
  await expect(dialog).toBeHidden()
})
