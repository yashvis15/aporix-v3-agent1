import { test, expect } from '@playwright/test';
import { openOptimizeTool, uploadSamplePdf } from './helpers';

test.describe('C: User input validation', () => {
  test('prevents submission when optimization goal is missing', async ({ page }) => {
    let optimizeRequestMade = false;
    await page.route('**/api/optimize', async (route) => {
      optimizeRequestMade = true;
      await route.abort();
    });

    await openOptimizeTool(page);
    await uploadSamplePdf(page);
    await expect(page.getByLabel('Optimization goal')).toHaveValue('');

    const optimizeButton = page.getByRole('button', { name: 'Optimize', exact: true });
    await expect(optimizeButton).toBeDisabled();
    await optimizeButton.click({ force: true }).catch(() => {});

    expect(optimizeRequestMade).toBe(false);
    await expect(page.getByText('Tokens saved', { exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Copy', exact: true })).toHaveCount(0);
  });

  test('treats whitespace-only goals as missing input', async ({ page }) => {
    await openOptimizeTool(page);
    await uploadSamplePdf(page);
    await page.getByLabel('Optimization goal').fill('   ');

    await expect(page.getByRole('button', { name: 'Optimize', exact: true })).toBeDisabled();
  });
});
