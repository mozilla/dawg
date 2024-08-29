import { test, expect } from '@playwright/test'

// See here how to get started:
// https://playwright.dev/docs/intro
test('visits the app root url', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('#home-link')).toBeInViewport()
})

test('search for a DAWG', async ({ page }) => {
  await page.goto('/')
  await page.getByPlaceholder('Search').fill('0din')
  // 0din is known to return a single result from search so the table should have just one row
  await expect(page.locator('table tbody tr')).toHaveCount(1)
})

test('check that we can navigate to a detail page', async ({ page }) => {
  await page.goto('/workgroup%3Adatasre')
  await expect(page.locator('h1 .monospace')).toHaveText('workgroup:datasre')
  await expect(page.getByText('jgibbs@mozilla.com')).toHaveCount(1) // Sponsor
  await expect(page.getByText('None')).toHaveCount(1) // Managers
  await expect(page.getByText('whd@firefox.gcp.mozilla.com')).toHaveCount(1) // Members
})

test('check that we can toggle dark mode', async ({ page }) => {
  await page.goto('/')
  await page.locator('#theme-toggle').click()
  await expect(page.locator('html')).toHaveClass('dark')
  await page.locator('#theme-toggle').click()
  await expect(page.locator('html')).not.toHaveClass('dark')
})
