import { defineConfig, devices } from '@playwright/test';

/**
 * Optional Playwright config for the real AI integration test.
 *
 * Does NOT start the mock Gemini server and does not override GEMINI_* env,
 * so the app uses its real configuration. Run only intentionally:
 *
 *   RUN_REAL_AI_TESTS=1 GEMINI_API_KEY=... npx playwright test --config=playwright.integration.config.ts
 */
export default defineConfig({
  testDir: './tests/e2e',
  testMatch: ['**/*.integration.spec.ts'],
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  outputDir: 'test-results',
});
