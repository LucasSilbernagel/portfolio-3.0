# Portfolio 3.0

The third iteration of my software development portfolio, themed as an airport check-in terminal screen.

<img width="2940" height="1800" alt="Screen Shot 2026-05-01 at 16 34 00" src="https://github.com/user-attachments/assets/18ac2306-c07d-4fff-8d4e-37878baec8a0" />

## Live link

https://lucassilbernagel.com/

## Tech stack

### Front End

- [Astro](https://astro.build/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [astro-icon](https://www.npmjs.com/package/astro-icon)
- [Iconify](https://iconify.design/)

### Content Management

- [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/) - git-based content in `src/content/`
- [Sveltia CMS](https://github.com/sveltia/sveltia-cms) - editing UI at `/admin`

### Testing

- [Vitest](https://vitest.dev/) - Unit testing
- [Playwright](https://playwright.dev/) - End-to-end testing

### Linting & Formatting

- [ESLint](https://eslint.org/)
- [Prettier](https://prettier.io/)

## Run Locally

### Prerequisites

In order to run this application locally, you must have Node.js (v20 or higher) and pnpm installed on your computer. To check if you already have them installed, enter `node -v` and `pnpm -v` in your terminal. If you do not have Node.js, you can install it here: https://nodejs.org/en/. To install pnpm, run `npm install -g pnpm`.

### Clone the repository

Once you have confirmed that Node.js and pnpm are installed, `cd` into a folder on your computer and run the following command to clone the repository:

`git clone https://github.com/LucasSilbernagel/portfolio-3.0.git`

Then `cd` into the project folder and open it in your code editor. For Visual Studio Code:

`cd portfolio-3.0`
`code .`

### Environment variables

Create a `.env` file in the project root directory. Add the following environment variable:

`PUBLIC_FORMSPARK_ID=*********`

This is the [Formspark](https://formspark.io/) form ID used by the contact form.

### Install dependencies

To install all of the required dependencies, run `pnpm install`.

### Start up the app

Run `pnpm dev` in your terminal.
Your terminal should indicate a `localhost` URL (typically `http://localhost:4321`) at which you can view the app in your browser.
All content is stored in the repository, so no external services are needed.

## Content management

Site content lives in the repository as markdown files in `src/content/`, validated at build time by the Zod schemas in `src/lib/content-schemas.ts` (wired up in `src/content.config.ts`).
Images referenced by content live in `src/assets/content/` and are optimized by `astro:assets`; the resume PDF is served as-is from `public/`.

Content can be edited three ways:

- Edit the markdown files directly and commit.
- Use [Sveltia CMS](https://github.com/sveltia/sveltia-cms) at `/admin` on the live site, signing in with a GitHub personal access token that has read/write access to this repository's contents.
- Open a pull request.

### Caveats

- **CMS edits commit directly to `main`** and trigger a production deploy.
  Sveltia validates URLs at save time (`pattern` rules in `public/admin/config.yml`), but an edit that breaks the build fails silently: Netlify keeps serving the last good deploy.
  Keep Netlify deploy-failure notifications enabled so a broken edit is noticed.
- **The content model is defined in two places**: the Zod schemas in `src/lib/content-schemas.ts` and the Sveltia config in `public/admin/config.yml`.
  If you change one, change the other.
  A unit test (`src/lib/content-schemas.test.ts`) fails on any field-name drift between them.

### Upgrading Sveltia CMS

The CMS script is self-hosted at `public/admin/sveltia-cms.js` (pinned copy of `@sveltia/cms`, version noted in `public/admin/index.html`) so the admin page, which handles a GitHub PAT, never executes third-party CDN code.
To upgrade:

1. Download the new version: `https://unpkg.com/@sveltia/cms@<version>/dist/sveltia-cms.js`
2. Verify its integrity against the npm package: `npm pack @sveltia/cms@<version>` and compare the sha256 of `dist/sveltia-cms.js`
3. Replace `public/admin/sveltia-cms.js` and update the version comment in `public/admin/index.html`
4. Load `/admin` and check the browser console for Content-Security-Policy violations (the CSP for `/admin` is set in `public/_headers`)

## Testing

### Unit Tests

Unit tests are written with [Vitest](https://vitest.dev/).

- Use `pnpm test` to run all unit tests in watch mode
- Use `pnpm test:run` to run all unit tests once
- Use `pnpm test:ui` to run tests with the Vitest UI
- Use `pnpm test:coverage` to run tests with coverage reporting

### End-to-End Tests

End-to-end tests are written with [Playwright](https://playwright.dev/).

- Use `pnpm test:e2e` to run all e2e tests
- Use `pnpm test:e2e:ui` to run tests with the Playwright UI
- Use `pnpm test:e2e:headed` to run tests in headed mode (visible browser)

## Design inspiration

The design is themed as an airport check-in terminal screen, featuring:

- Boarding pass styled project cards
- Terminal-style interface elements
- Airline schedule/timetable for career timeline
- Help desk styling for contact page
- Clean, modern UI with airport terminal aesthetics
