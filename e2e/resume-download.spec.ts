import { expect, test } from '@playwright/test'

test.describe('Resume Download', () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear session storage and navigate to homepage
    await context.clearCookies()
    await page.goto('/')

    // Set session storage to show homepage directly
    await page.evaluate(() => {
      sessionStorage.setItem('checked-in', 'true')
    })
    await page.reload()

    // Wait for homepage to be visible
    await expect(page.locator('#homepage')).toBeVisible()
  })

  test('should show loading overlay when resume download is clicked', async ({
    page,
  }) => {
    // Set up download listener
    const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => {
      // Download might not trigger in test environment, that's okay
      return null
    })

    // Find and click the boarding pass download button
    const boardingPassButton = page.locator('#boarding-pass-download')
    await expect(boardingPassButton).toBeVisible()

    // Click the button
    await boardingPassButton.click()

    // Verify loading overlay appears
    const loadingOverlay = page.locator('#loading-overlay')
    await expect(loadingOverlay).toBeVisible({ timeout: 1000 })

    // Verify loading text is present (target the visible one in the overlay)
    await expect(loadingOverlay.getByText('Printing...')).toBeVisible()

    // Wait for download or timeout
    await downloadPromise
  })

  test('should have boarding pass button with correct attributes', async ({
    page,
  }) => {
    const boardingPassButton = page.locator('#boarding-pass-download')
    await expect(boardingPassButton).toBeVisible()

    // Verify button has data attributes for resume URL and filename
    const resumeUrl = await boardingPassButton.getAttribute('data-resume-url')
    const resumeFilename = await boardingPassButton.getAttribute('data-resume-filename')

    // At least one should be present (URL might be empty if resume not configured)
    expect(resumeUrl !== null || resumeFilename !== null).toBeTruthy()
  })

  test('should hide loading overlay after download attempt', async ({ page }) => {
    // Set up download listener
    page.waitForEvent('download', { timeout: 5000 }).catch(() => {
      // Download might not trigger in test environment
    })

    const boardingPassButton = page.locator('#boarding-pass-download')
    await boardingPassButton.click()

    // Wait for loading overlay to appear
    const loadingOverlay = page.locator('#loading-overlay')
    await expect(loadingOverlay).toBeVisible()

    // Wait for loading overlay to disappear (after 2 seconds based on LOADING_OVERLAY_DURATION_MS)
    await expect(loadingOverlay).toBeHidden({ timeout: 3000 })
  })

  test('should announce loading state to screen readers', async ({ page }) => {
    const boardingPassButton = page.locator('#boarding-pass-download')
    await boardingPassButton.click()

    // Check that loading announcement is present (even if visually hidden)
    const loadingAnnouncement = page.locator('#loading-announcement')
    await expect(loadingAnnouncement).toHaveAttribute('role', 'status')
    await expect(loadingAnnouncement).toHaveAttribute('aria-live', 'polite')
  })
})

