import { expect, test } from '@playwright/test'

const HTTP_OK = 200

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
    // Check if resume URL is available (might not be in CI)
    const boardingPassButton = page.locator('#boarding-pass-download')
    await expect(boardingPassButton).toBeVisible()

    // The resume URL is statically generated from site settings, so it must
    // always be present; a missing URL is a regression, not a skip condition
    const resumeUrl = await boardingPassButton.getAttribute('data-resume-url')
    expect(resumeUrl).toBeTruthy()

    // Set up download listener
    const downloadPromise = page
      .waitForEvent('download', { timeout: 5000 })
      .catch(() => {
        // Download might not trigger in test environment, that's okay
        return null
      })

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

    // Verify button has data attributes for resume URL and filename; both are
    // statically generated from site settings and must always be present
    const resumeUrl = await boardingPassButton.getAttribute('data-resume-url')
    const resumeFilename = await boardingPassButton.getAttribute(
      'data-resume-filename'
    )

    expect(resumeUrl).toBeTruthy()
    expect(resumeFilename).toBeTruthy()
  })

  test('should serve the resume file at the linked URL', async ({
    page,
    request,
  }) => {
    const boardingPassButton = page.locator('#boarding-pass-download')
    await expect(boardingPassButton).toBeVisible()

    const resumeUrl = await boardingPassButton.getAttribute('data-resume-url')
    if (!resumeUrl) {
      throw new Error('data-resume-url attribute is missing')
    }

    // Guard against a broken site-settings edit: the URL being present is
    // not enough, the file behind it must actually be served
    const response = await request.get(resumeUrl)
    expect(response.status()).toBe(HTTP_OK)
    expect(response.headers()['content-type']).toContain('pdf')
  })

  test('should hide loading overlay after download attempt', async ({
    page,
  }) => {
    const boardingPassButton = page.locator('#boarding-pass-download')
    await expect(boardingPassButton).toBeVisible()

    // The resume URL is statically generated from site settings, so it must
    // always be present; a missing URL is a regression, not a skip condition
    const resumeUrl = await boardingPassButton.getAttribute('data-resume-url')
    expect(resumeUrl).toBeTruthy()

    // Set up download listener
    page.waitForEvent('download', { timeout: 5000 }).catch(() => {
      // Download might not trigger in test environment
    })

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
