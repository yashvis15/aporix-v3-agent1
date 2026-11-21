import { test, expect } from '@playwright/test';
import { openOptimizeTool, uploadSamplePdf, fillGoal, submitOptimization } from './helpers';

test.describe('D: Error handling', () => {
  test('shows an understandable error and does not stay stuck loading on API failure', async ({
    page,
  }) => {
    await page.route('**/api/optimize', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Optimization service is temporarily unavailable. Please try again.',
        }),
      });
    });

    await openOptimizeTool(page);
    await uploadSamplePdf(page);
    await fillGoal(page, 'extract key risks');
    await submitOptimization(page);

    await expect(
      page.getByText('Optimization service is temporarily unavailable. Please try again.')
    ).toBeVisible({ timeout: 30_000 });

    // Not stuck in loading state
    await expect(page.getByRole('button', { name: 'Optimizing...' })).toHaveCount(0);
    const optimizeButton = page.getByRole('button', { name: 'Optimize', exact: true });
    await expect(optimizeButton).toBeVisible();
    await expect(optimizeButton).toBeEnabled();

    // No results shown
    await expect(page.getByText('Tokens saved', { exact: true })).toHaveCount(0);
  });

  test('surfaces an error message when the request fails to reach the server', async ({
    page,
  }) => {
    await page.route('**/api/optimize', (route) => route.abort('failed'));

    await openOptimizeTool(page);
    await uploadSamplePdf(page);
    await fillGoal(page, 'extract key risks');
    await submitOptimization(page);

    // Error alert visible and loading cleared
    await expect(page.locator('[class*="EF4444"]').first()).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole('button', { name: 'Optimizing...' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Optimize', exact: true })).toBeEnabled();
  });
});
