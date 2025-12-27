# Portfolio 3.0

The third iteration of my software development portfolio, themed as an airport check-in terminal screen.

<img width="1468" height="721" alt="og-image" src="https://github.com/user-attachments/assets/b75e999e-d56f-43c0-8f9d-072ceaf7f6ee" />

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

- [Strapi](https://strapi.io/)

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

`STRAPI_URL=http://localhost:1337`

This should point to your local Strapi instance. For production builds, you'll need to set this to your production Strapi URL.

### Install dependencies

To install all of the required dependencies for both the main application and the CMS, run the following commands:

`pnpm install`
`cd cms && npm install && cd ..`

### Start up the app

You have a few options for running the application:

- **Frontend only**: Run `pnpm dev` in your terminal. Your terminal should indicate a `localhost` URL (typically `http://localhost:4321`) at which you can view the app in your browser. Note that without Strapi running, the site will build but content will be empty.

- **CMS only**: Run `pnpm cms:dev` (or `cd cms && npm run develop`) to start Strapi. The Strapi admin panel will be available at `http://localhost:1337/admin`.

- **Both frontend and CMS**: Run `pnpm dev:all` to start both the Astro dev server and Strapi concurrently.

#### Setting up Strapi

If you're running Strapi for the first time, you'll need to:

1. Create an admin account when prompted
2. Create and publish content in the Strapi admin panel
3. Configure public permissions:
   - Go to Settings > Users & Permissions Plugin > Roles > Public
   - Enable "find" permission for each content type you want to display (projects, experience, tech-stack, about-page, etc.)

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
