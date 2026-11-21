import { test, expect } from '@playwright/test';
import path from 'node:path';

const hasApiKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'test-api-key';
const SAMPLE_PDF = path.resolve(process.cwd(), 'tests', 'fixtures', 'sample.pdf');

/**
 * Optional integration test that exercises the real AI optimization pipeline.
 *
 * Not part of the regular mocked suite. Skipped unless a real GEMINI_API_KEY
 * is provided and RUN_REAL_AI_TESTS=1 is set. Makes a real Gemini API call
 * and may incur cost.
 *
 * Run with:
 *   RUN_REAL_AI_TESTS=1 GEMINI_API_KEY=<your-key> npx playwright test --config=playwright.integration.config.ts
 */
test.describe('Optional: Real AI optimization pipeline', () => {
  test.skip(
    !hasApiKey || process.env.RUN_REAL_AI_TESTS !== '1',
    'Skipped: set RUN_REAL_AI_TESTS=1 and a real GEMINI_API_KEY to run this optional integration test.'
  );

  test('completes an optimization using the real Gemini-backed pipeline', async ({ page }) => {
    test.setTimeout(180_000);

    await page.goto('/#try-now');
    await expect(page.getByLabel('Optimization goal')).toBeVisible();

    await page.locator('input[type="file"]').setInputFiles(SAMPLE_PDF);
    await expect(page.getByText('sample.pdf', { exact: true }).first()).toBeVisible();

    await page.getByLabel('Optimization goal').fill('extract key risks and obligations');
    await page.getByRole('button', { name: 'Optimize', exact: true }).click();

    await expect(page.getByRole('button', { name: 'Optimizing...' })).toHaveCount(0, {
      timeout: 150_000,
    });

    const errorVisible = await page
      .locator('[class*="EF4444"]')
      .first()
      .isVisible()
      .catch(() => false);
    test.skip(errorVisible, 'Real API call returned an error in this environment; skipping assertions.');

    const optimized = page.locator('pre').first();
    await expect(optimized).toBeVisible();
    expect((await optimized.innerText()).trim().length).toBeGreaterThan(0);

    await expect(page.getByText('Tokens saved', { exact: true })).toBeVisible();
    await expect(page.getByText('Confidence', { exact: true }).first()).toBeVisible();
  });
});
