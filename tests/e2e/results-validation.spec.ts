import { test, expect } from '@playwright/test';
import {
  makeOptimizeResponse,
  openOptimizeTool,
  uploadSamplePdf,
  fillGoal,
  submitOptimization,
} from './helpers';

test.describe('E: Results validation', () => {
  test('displays expected fields and values consistent with the API response', async ({ page }) => {
    const mock = makeOptimizeResponse();

    await page.route('**/api/optimize', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mock),
      });
    });

    await openOptimizeTool(page);
    await uploadSamplePdf(page);
    await fillGoal(page, 'extract key risks and obligations');
    await submitOptimization(page);

    // Optimized output is present and not empty, matches mocked text
    const output = page.locator('pre').first();
    await expect(output).toBeVisible();
    const outputText = (await output.innerText()).trim();
    expect(outputText.length).toBeGreaterThan(0);
    expect(outputText).toBe(mock.optimizedText);

    // Expected result fields surfaced in UI
    await expect(page.getByText('What was removed', { exact: true })).toBeVisible();
    await expect(page.getByText(mock.removedSummary)).toBeVisible();

    // Displayed token savings consistent with mocked response
    await expect(
      page.getByText(`${mock.tokenStats.percentSaved}%`, { exact: true })
    ).toBeVisible();
    await expect(
      page.getByText(`${mock.tokenStats.tokensSaved.toLocaleString()} tokens`, { exact: true })
    ).toBeVisible();

    // Other key metrics reflect the mocked response
    await expect(
      page.getByText(`$${mock.costAnalysis.savings.toFixed(4)}`, { exact: true })
    ).toBeVisible();
    await expect(
      page.getByText(`${mock.latencyEstimate.reductionPercent}%`, { exact: true })
    ).toBeVisible();
    await expect(
      page.getByText(`${Math.round(mock.trustLayer.confidenceScore * 100)}%`, { exact: true })
    ).toBeVisible();

    // Analysis tab exposes deeper fields
    await page.getByRole('button', { name: 'Analysis', exact: true }).click();
    await expect(page.getByText('Token comparison', { exact: true })).toBeVisible();
    await expect(page.getByText('Cost analysis', { exact: true })).toBeVisible();
    await expect(page.getByText('Latency estimate', { exact: true })).toBeVisible();
    await expect(page.getByText('Trust & accuracy', { exact: true })).toBeVisible();
    await expect(page.getByText(mock.trustLayer.optimizationReasoning)).toBeVisible();
    await expect(
      page.getByText(mock.tokenStats.originalTokens.toLocaleString(), { exact: true }).first()
    ).toBeVisible();

    // Comparison tab reflects preserved/removed fields
    await page.getByRole('button', { name: 'Comparison', exact: true }).click();
    await expect(page.getByText('Preserved', { exact: true })).toBeVisible();
    await expect(page.getByText(mock.trustLayer.preservedSummary)).toBeVisible();
    await expect(page.getByText('Removed', { exact: true })).toBeVisible();
    await expect(page.getByRole('listitem').filter({ hasText: mock.trustLayer.removedSections[0] }).first()).toBeVisible();
  });
});
