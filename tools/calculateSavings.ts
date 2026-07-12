import type {
  TokenStats,
  CostAnalysis,
  LatencyEstimate,
} from "@/lib/types";
import {
  computeTokenStats,
  computeCostAnalysis,
  estimateLatency,
} from "@/lib/tokenCount";

export interface SavingsResult {
  tokenStats: TokenStats;
  costAnalysis: CostAnalysis;
  latencyEstimate: LatencyEstimate;
}

export function calculateSavings(
  originalText: string,
  optimizedText: string
): SavingsResult {
  const tokenStats = computeTokenStats(originalText, optimizedText);
  const costAnalysis = computeCostAnalysis(
    tokenStats.originalTokens,
    tokenStats.optimizedTokens
  );
  const latencyEstimate = estimateLatency(
    tokenStats.originalTokens,
    tokenStats.optimizedTokens
  );

  return { tokenStats, costAnalysis, latencyEstimate };
}