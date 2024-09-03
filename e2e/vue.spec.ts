import { test, expect } from '@playwright/test'

// See here how to get started:
// https://playwright.dev/docs/intro
test('visits the app root url', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('#home-link')).toBeInViewport()
})

test('search for a DAWG', async ({ page }) => {
  await page.goto('/')
  page.locator('header p')
  await page.getByPlaceholder('Search').fill('madeup-workgroup-two')
  // 0din is known to return a single result from search so the table should have just one row
  await expect(page.locator('table tbody tr')).toHaveCount(1)
})

test('check that we can navigate to a detail page', async ({ page }) => {
  await page.goto('/')
  page.locator('header p')
  await page.goto('/workgroup/madeup-workgroup-two')
  await expect(page.locator('h1 .monospace')).toHaveText('workgroup:madeup-workgroup-two')
  await expect(page.getByText('sponsor@mozilla.com')).toHaveCount(1) // Sponsor
  await expect(page.getByText('manager@mozilla.com')).toHaveCount(1) // Managers
  await expect(page.getByText('group:da-wg-madeup-workgroup-two@mozilla.com')).toHaveCount(1) // Members
})

test('check that we can toggle dark mode', async ({ page }) => {
  await page.goto('/')
  await page.locator('#theme-toggle').click()
  await expect(page.locator('html')).toHaveClass('dark')
  await page.locator('#theme-toggle').click()
  await expect(page.locator('html')).not.toHaveClass('dark')
})

test('check that we can link to plain text searches', async ({ page }) => {
  const term = 'two'
  await page.goto(`?searchstring=${encodeURIComponent(term)}`)
  await expect(page.locator('input#search')).toHaveValue(term)
  await expect(page.locator('table tbody tr')).toHaveCount(1)
})

test('check that we can link to regex searchess', async ({ page }) => {
  const term = 'two$'
  const isRegex = true
  await page.goto(`?isRegex=${isRegex}&searchstring=${encodeURIComponent(term)}`)
  await expect(page.locator('input#search')).toHaveValue(term)
  await expect(page.locator('input[name="regex"]')).toBeChecked()
  await expect(page.locator('table tbody tr')).toHaveCount(1)
})
