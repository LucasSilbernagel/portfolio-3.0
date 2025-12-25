import { expect, test } from '@playwright/test'

test.describe('Navigation Between Pages', () => {
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

  test('should navigate to About page', async ({ page }) => {
    // Click on Information card (links to /about)
    await page.getByRole('link', { name: /^Information : About Lucas/i }).click()

    // Verify we're on the about page
    await expect(page).toHaveURL(/\/about/)
    await expect(page.getByRole('heading', { name: /About/i }).first()).toBeVisible()
  })

  test('should navigate to Tech Stack page', async ({ page }) => {
    // Click on Luggage card (links to /tech-stack)
    await page.getByRole('link', { name: /Luggage/i }).click()

    // Verify we're on the tech-stack page
    await expect(page).toHaveURL(/\/tech-stack/)
    await expect(page.getByRole('heading', { name: /Tech Stack/i })).toBeVisible()
  })

  test('should navigate to Experience page', async ({ page }) => {
    // Click on Destinations card (links to /experience)
    await page.getByRole('link', { name: /Destinations/i }).click()

    // Verify we're on the experience page
    await expect(page).toHaveURL(/\/experience/)
    await expect(page.getByRole('heading', { name: /Experience/i })).toBeVisible()
  })

  test('should navigate to Projects page', async ({ page }) => {
    // Click on Flights card (links to /projects)
    await page.getByRole('link', { name: /Flights/i }).click()

    // Verify we're on the projects page
    await expect(page).toHaveURL(/\/projects/)
    await expect(page.getByRole('heading', { name: 'Projects', exact: true })).toBeVisible()
  })

  test('should navigate to Contact page', async ({ page }) => {
    // Click on Help card (links to /contact)
    await page.getByRole('link', { name: /^Help : Contact Information/i }).click()

    // Verify we're on the contact page
    await expect(page).toHaveURL(/\/contact/)
    await expect(page.getByRole('heading', { name: 'Contact Me', exact: true })).toBeVisible()
  })

  test('should navigate to Map page', async ({ page }) => {
    // Click on Map card
    await page.getByRole('link', { name: /Map/i }).click()

    // Verify we're on the map page
    await expect(page).toHaveURL(/\/map/)
  })

  test('should have back link on sub-pages', async ({ page }) => {
    // Navigate to a sub-page
    await page.getByRole('link', { name: /^Information : About Lucas/i }).click()
    await expect(page).toHaveURL(/\/about/)

    // Check for back link (should be in header)
    const backLink = page.getByRole('link', { name: /Back/i })
    await expect(backLink).toBeVisible()
  })

  test('should navigate back to homepage from sub-page', async ({ page }) => {
    // Navigate to a sub-page
    await page.getByRole('link', { name: /^Information : About Lucas/i }).click()
    await expect(page).toHaveURL(/\/about/)

    // Click back link
    const backLink = page.getByRole('link', { name: /Back/i })
    await backLink.click()

    // Verify we're back on homepage
    await expect(page).toHaveURL('/')
    await expect(page.locator('#homepage')).toBeVisible()
  })

  test('should have accessible navigation links', async ({ page }) => {
    // Check that all main navigation cards are accessible
    const navigationLinks = [
      { name: /^Information : About Lucas/i, url: '/about' },
      { name: /Luggage/i, url: '/tech-stack' },
      { name: /Destinations/i, url: '/experience' },
      { name: /Flights/i, url: '/projects' },
      { name: /^Help : Contact Information/i, url: '/contact' },
    ]

    for (const link of navigationLinks) {
      const linkElement = page.getByRole('link', { name: link.name })
      await expect(linkElement).toBeVisible()
      await expect(linkElement).toHaveAttribute('href', link.url)
    }
  })
})

