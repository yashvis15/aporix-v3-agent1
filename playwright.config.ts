import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Aporix (v3 agent) E2E tests.
 *
 * Regular tests run against a local Next.js dev server with GEMINI_API_BASE
 * pointed at a lightweight mock Gemini HTTP server (no real API calls/keys).
 */
export default defineConfig({
  testDir: './tests/e2e',
  testIgnore: ['**/*.integration.spec.ts'],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
  ],
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
  webServer: [
    {
      command: 'node tests/mock-gemini-server.mjs',
      url: 'http://127.0.0.1:4010/health',
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
    {
      command: 'npm run dev',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        GEMINI_API_BASE: 'http://127.0.0.1:4010/v1beta',
        GEMINI_API_KEY: 'test-api-key',
      },
    },
  ],
  outputDir: 'test-results',
});
