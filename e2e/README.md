# E2E Tests

This directory contains end-to-end tests using Playwright for critical user journeys.

## Test Files

- **`landing-to-homepage.spec.ts`** - Tests the landing screen to homepage transition
  - First-time visitor experience
  - Check-in button functionality
  - Returning visitor experience
  - Homepage tile animations

- **`resume-download.spec.ts`** - Tests resume download functionality
  - Loading overlay display
  - Download button attributes
  - Screen reader announcements
  - Loading state management

- **`navigation.spec.ts`** - Tests navigation between pages
  - Navigation to all main pages (About, Tech Stack, Experience, Projects, Contact, Map)
  - Back button functionality
  - Accessible navigation links

## Running Tests

```bash
# Run all E2E tests (builds site and starts preview server automatically)
pnpm test:e2e

# Run tests with UI mode (interactive)
pnpm test:e2e:ui

# Run tests in headed mode (see browser)
pnpm test:e2e:headed

# Run specific test file
pnpm test:e2e e2e/landing-to-homepage.spec.ts

# Run tests in debug mode
pnpm test:e2e --debug
```

## Prerequisites

1. Build the site first: `pnpm run build`
2. The tests will automatically start the preview server (`pnpm run preview`)
3. Make sure Chromium is installed: `pnpm exec playwright install chromium`

## Test Configuration

Tests are configured in `playwright.config.ts`:
- Base URL: `http://localhost:4321`
- Browser: Chromium (Desktop Chrome)
- Test directory: `./e2e`
- Automatically starts preview server before tests

