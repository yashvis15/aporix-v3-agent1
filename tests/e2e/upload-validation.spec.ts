import { test, expect } from '@playwright/test';
import { openOptimizeTool, fillGoal } from './helpers';

test.describe('B: PDF upload validation', () => {
  test('shows an error for unsupported file types', async ({ page }) => {
    await openOptimizeTool(page);

    await page.locator('input[type="file"]').setInputFiles({
      name: 'malware.exe',
      mimeType: 'application/x-msdownload',
      buffer: Buffer.from('MZ fake executable content'),
    });

    await expect(
      page.getByText('Unsupported file type. Use PDF, TXT, JSON, or MD.')
    ).toBeVisible();
    await expect(page.getByText('malware.exe')).toHaveCount(0);
  });

  test('prevents submission when no file is provided', async ({ page }) => {
    let optimizeRequestMade = false;
    await page.route('**/api/optimize', async (route) => {
      optimizeRequestMade = true;
      await route.abort();
    });

    await openOptimizeTool(page);
    await fillGoal(page, 'extract key risks');

    const optimizeButton = page.getByRole('button', { name: 'Optimize', exact: true });
    await expect(optimizeButton).toBeDisabled();
    await optimizeButton.click({ force: true }).catch(() => {});

    expect(optimizeRequestMade).toBe(false);
    await expect(page.getByText('Tokens saved', { exact: true })).toHaveCount(0);
  });
});
