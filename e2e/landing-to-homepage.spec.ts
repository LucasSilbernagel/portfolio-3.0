import { expect, test } from '@playwright/test'

// Test timing constants
const ANIMATION_WAIT_MS = 200

test.describe('Landing Screen to Homepage', () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear session storage to simulate first-time visitor
    await context.clearCookies()
    await page.goto('/')
  })

  test('should show landing screen for first-time visitors', async ({
    page,
  }) => {
    // Check that landing screen is visible
    const landingScreen = page.locator('#landing-screen')
    await expect(landingScreen).toBeVisible()

    // Check that homepage is hidden
    const homepage = page.locator('#homepage')
    await expect(homepage).toBeHidden()

    // Verify landing screen content
    await expect(
      page.getByRole('heading', { name: 'Lucas Silbernagel' })
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Software Developer' })
    ).toBeVisible()
    await expect(page.getByRole('button', { name: 'Check in' })).toBeVisible()
  })

  test('should transition to homepage when check-in button is clicked', async ({
    page,
  }) => {
    // Click the check-in button
    const checkInButton = page.getByRole('button', { name: 'Check in' })
    await checkInButton.click()

    // Wait for homepage to be visible
    const homepage = page.locator('#homepage')
    await expect(homepage).toBeVisible({ timeout: 5000 })

    // Verify landing screen is hidden
    const landingScreen = page.locator('#landing-screen')
    await expect(landingScreen).toBeHidden()

    // Verify homepage content is visible
    await expect(
      page.getByRole('heading', { name: 'Information' })
    ).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Luggage' })).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Destinations' })
    ).toBeVisible()
  })

  test('should show homepage directly for returning visitors', async ({
    page,
  }) => {
    // Set session storage to simulate returning visitor
    await page.goto('/')
    await page.evaluate(() => {
      sessionStorage.setItem('checked-in', 'true')
    })

    // Reload the page
    await page.reload()

    // Verify homepage is visible immediately
    const homepage = page.locator('#homepage')
    await expect(homepage).toBeVisible()

    // Verify landing screen is hidden
    const landingScreen = page.locator('#landing-screen')
    await expect(landingScreen).toBeHidden()
  })

  test('should animate homepage tiles on load', async ({ page }) => {
    // Click check-in to show homepage
    await page.getByRole('button', { name: 'Check in' }).click()

    // Wait for homepage to be visible
    const homepage = page.locator('#homepage')
    await expect(homepage).toBeVisible()

    // Wait a bit for animations to start
    await page.waitForTimeout(ANIMATION_WAIT_MS)

    // Check that tiles are visible (they should animate in)
    const tiles = page.locator('.kiosk-tile')
    const count = await tiles.count()
    expect(count).toBeGreaterThan(0)

    // Verify tiles are visible (opacity should be 1 after animation)
    for (let i = 0; i < count; i++) {
      const tile = tiles.nth(i)
      await expect(tile).toBeVisible({ timeout: 2000 })
    }
  })
})
