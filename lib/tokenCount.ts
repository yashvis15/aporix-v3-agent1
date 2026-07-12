import type { CostAnalysis, LatencyEstimate } from "./types";

const DEFAULT_MODEL = "GPT-4o mini";
const DEFAULT_COST_PER_1K_INPUT = 0.00015;
const DEFAULT_COST_PER_1K_OUTPUT = 0.00060;

const LATENCY_MS_PER_INPUT_TOKEN = 0.5;
const LATENCY_MS_PER_OUTPUT_TOKEN = 1.5;
const LATENCY_BASE_OVERHEAD_MS = 500;

export function estimateTokens(text: string): number {
  if (!text || text.trim().length === 0) return 0;

  const trimmed = text.trim();
  const byChars = trimmed.length / 4;
  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
  const byWords = wordCount * 1.3;
  const blended = (byChars + byWords) / 2;

  return Math.max(1, Math.round(blended));
}

export function computeTokenStats(originalText: string, optimizedText: string) {
  const originalTokens = estimateTokens(originalText);
  const optimizedTokens = estimateTokens(optimizedText);
  const tokensSaved = Math.max(0, originalTokens - optimizedTokens);
  const percentSaved =
    originalTokens > 0
      ? Math.round((tokensSaved / originalTokens) * 1000) / 10
      : 0;

  return {
    originalTokens,
    optimizedTokens,
    tokensSaved,
    percentSaved,
  };
}

export function computeCostAnalysis(
  originalTokens: number,
  optimizedTokens: number,
  model?: string
): CostAnalysis {
  const modelName = model || DEFAULT_MODEL;
  const costPer1kInput = DEFAULT_COST_PER_1K_INPUT;
  const costPer1kOutput = DEFAULT_COST_PER_1K_OUTPUT;

  const originalCost =
    (originalTokens / 1000) * costPer1kInput +
    (originalTokens / 1000) * costPer1kOutput;
  const optimizedCost =
    (optimizedTokens / 1000) * costPer1kInput +
    (optimizedTokens / 1000) * costPer1kOutput;
  const savings = Math.max(0, +(originalCost - optimizedCost).toFixed(6));

  return {
    model: modelName,
    costPer1kInputTokens: costPer1kInput,
    costPer1kOutputTokens: costPer1kOutput,
    originalCost: +originalCost.toFixed(6),
    optimizedCost: +optimizedCost.toFixed(6),
    savings,
  };
}

export function estimateLatency(
  originalTokens: number,
  optimizedTokens: number
): LatencyEstimate {
  const originalMs = Math.round(
    LATENCY_BASE_OVERHEAD_MS +
      originalTokens * LATENCY_MS_PER_INPUT_TOKEN +
      originalTokens * LATENCY_MS_PER_OUTPUT_TOKEN
  );
  const optimizedMs = Math.round(
    LATENCY_BASE_OVERHEAD_MS +
      optimizedTokens * LATENCY_MS_PER_INPUT_TOKEN +
      optimizedTokens * LATENCY_MS_PER_OUTPUT_TOKEN
  );
  const reductionMs = Math.max(0, originalMs - optimizedMs);
  const reductionPercent =
    originalMs > 0 ? Math.round((reductionMs / originalMs) * 1000) / 10 : 0;

  return {
    originalEstimatedLatencyMs: originalMs,
    optimizedEstimatedLatencyMs: optimizedMs,
    reductionMs,
    reductionPercent,
  };
}
