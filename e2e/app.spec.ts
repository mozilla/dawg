import { test, expect } from '@playwright/test'

// Tests the configuration of the vite+playwright system itself, if this fails ignore other test failures
test('meta', async ({ page }) => {
  const ideal = process.env.CI ? 'http://localhost:5173/dawg/' : 'http://localhost:5173/'
  await page.goto('./')
  await expect(page.url()).toBe(ideal)
})

// See here how to get started:
// https://playwright.dev/docs/intro
test('visits the app root url', async ({ page }) => {
  await page.goto('./')
  await expect(page.locator('#home-link')).toBeInViewport()
})

test('search for a DAWG', async ({ page }) => {
  await page.goto('/')
  await page.waitForSelector('header p')
  await page.getByPlaceholder('Search').fill('madeup-workgroup-two')
  await expect(page.locator('table tbody tr')).toHaveCount(1)
})

test('check that we can navigate to a detail page', async ({ page }) => {
  await page.goto('./workgroup/madeup-workgroup-two')
  await page.waitForSelector('h1')
  await expect(page.locator('h1')).toHaveText('workgroup:madeup-workgroup-two 🔗')
  await expect(page.locator('h2')).toHaveText('mockdata (m1)')
  await expect(page.getByText('sponsor@mozilla.com')).toHaveCount(1) // Sponsor
  await expect(page.getByText('manager@mozilla.com')).toHaveCount(1) // Managers
  await expect(page.getByText('group:da-wg-madeup-workgroup-two@mozilla.com')).toHaveCount(1) // Members
})

test('check that we can toggle dark mode', async ({ page }) => {
  await page.goto('./')
  await page.locator('#theme-toggle').click()
  await expect(page.locator('html')).toHaveClass('dark')
  await page.locator('#theme-toggle').click()
  await expect(page.locator('html')).not.toHaveClass('dark')
})

test('check that we can link to plain text searches', async ({ page }) => {
  const term = 'two'
  await page.goto(`./?searchstring=${encodeURIComponent(term)}`)
  await page.waitForSelector('input#search')
  await expect(page.locator('input#search')).toHaveValue(term)
  await expect(page.locator('table tbody tr')).toHaveCount(1)
})

test('check that we can link to regex searches', async ({ page }) => {
  const term = 'two$'
  const isRegex = true
  await page.goto(`./?isRegex=${isRegex}&searchstring=${encodeURIComponent(term)}`)
  await page.waitForSelector('input#search')

  await expect(page.locator('input#search')).toHaveValue(term)
  await expect(page.locator('input[name="regex"]')).toBeChecked()
  await expect(page.locator('table tbody tr')).toHaveCount(1)
})

test('check that 404 errors route and render correctly', async ({ page }) => {
  await page.goto('./workgroup/nonexistent')
  await expect(page.locator('h1')).toHaveText('404 Workgroup Not Found')
})

test('check that application errors render with provided details correctly', async ({ page }) => {
  await page.goto('./error?err=1&details=%7B%22data%22%3A%22foobar%22%7D')
  await expect(page.locator('.monospace')).toHaveText('foobar')
})
