import { expect, Page } from '@playwright/test';
import path from 'node:path';

export const SAMPLE_PDF = path.resolve(process.cwd(), 'tests', 'fixtures', 'sample.pdf');
export const SAMPLE_GOAL = 'extract key risks and obligations';

/** Realistic /api/optimize success payload matching OptimizeResponse (v3). */
export function makeOptimizeResponse(overrides: Record<string, unknown> = {}) {
  return {
    success: true,
    optimizedText:
      'Key risks and obligations:\n- Late deliveries incur a penalty of 5% per month.\n- Provider must meet all agreed delivery deadlines.\n- Either party may terminate with 30 days written notice.\n- Confidentiality obligations survive termination for two years.',
    removedSummary:
      'Removed ~68% of text (boilerplate, background, redundant content).',
    tokenStats: {
      originalTokens: 1200,
      optimizedTokens: 260,
      tokensSaved: 940,
      percentSaved: 78.3,
    },
    costAnalysis: {
      model: 'GPT-4o mini',
      costPer1kInputTokens: 0.00015,
      costPer1kOutputTokens: 0.0006,
      originalCost: 0.0009,
      optimizedCost: 0.000195,
      savings: 0.000705,
    },
    latencyEstimate: {
      originalEstimatedLatencyMs: 2900,
      optimizedEstimatedLatencyMs: 1020,
      reductionMs: 1880,
      reductionPercent: 64.8,
    },
    trustLayer: {
      confidenceScore: 0.94,
      semanticSimilarity: 0.91,
      preservedSummary:
        'Goal-relevant facts, dates, obligations, and key data points retained.',
      optimizationReasoning:
        'Deleted sections not relevant to goal. Condensed remaining content.',
      removedSections: ['boilerplate', 'background', 'redundant content'],
    },
    meta: {
      goal: SAMPLE_GOAL,
      fileName: 'sample.pdf',
      fileSizeBytes: 1024,
      fileType: 'pdf',
    },
    ...overrides,
  };
}

export async function openOptimizeTool(page: Page) {
  await page.goto('/#try-now');
  await expect(page.getByLabel('Optimization goal')).toBeVisible();
}

export async function uploadSamplePdf(page: Page) {
  await page.locator('input[type="file"]').setInputFiles(SAMPLE_PDF);
  await expect(page.getByText('sample.pdf', { exact: true }).first()).toBeVisible();
}

export async function fillGoal(page: Page, goal = SAMPLE_GOAL) {
  await page.getByLabel('Optimization goal').fill(goal);
}

export async function submitOptimization(page: Page) {
  await page.getByRole('button', { name: 'Optimize', exact: true }).click();
}
