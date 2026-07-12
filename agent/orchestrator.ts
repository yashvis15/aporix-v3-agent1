import { analyzeDocument } from "@/tools/analyzeDocument";
import { createStrategy } from "@/agent/strategy";
import { optimizeDocument } from "@/tools/optimizeDocument";
import { calculateSavings } from "@/tools/calculateSavings";
import type { AgentResult, QualityReport } from "@/lib/types";

export interface OrchestratorInput {
  extractedText: string;
  goal: string;
}

export async function runOptimizationAgent(
  input: OrchestratorInput
): Promise<{
  result: AgentResult;
  debug: {
    analysis: import("@/lib/types").DocumentAnalysis;
    strategy: import("@/lib/types").OptimizationStrategy;
    qualityReport: import("@/lib/types").QualityReport;
    agentSteps: string[];
    agentVersion: string;
    modelUsed: string;
    inputChars: number;
    outputChars: number;
    rawLlmResponse: string;
    commitHash: string;
  };
}> {
  const { extractedText, goal } = input;
  const steps: string[] = [];

  // Step 1: Analyze the document (fast heuristic, no LLM)
  steps.push("analyzeDocument");
  const analysis = analyzeDocument(extractedText, goal);

  // Step 2: Create optimization strategy (fast heuristic, no LLM)
  steps.push("createStrategy");
  const strategy = createStrategy(analysis, goal);

  // Step 3: Run the optimizer (single LLM call with aggressive target)
  steps.push("optimizeDocument");
  const optimization = await optimizeDocument(extractedText, goal, strategy);

  // Step 4: Calculate token/cost/latency savings
  steps.push("calculateSavings");
  const { tokenStats, costAnalysis, latencyEstimate } = calculateSavings(
    extractedText,
    optimization.optimizedText
  );

  // Quality report derived from the optimizer output
  const quality: QualityReport = {
    confidenceScore: optimization.confidenceScore,
    semanticSimilarity: optimization.semanticSimilarity,
    preservedSummary: optimization.preservedSummary,
    optimizationReasoning: optimization.optimizationReasoning,
    removedSections: optimization.removedSections,
    warnings: [],
  };

  const result: AgentResult = {
    optimizedText: optimization.optimizedText,
    removedSummary: optimization.removedSummary,
    quality,
    tokenStats,
    costAnalysis,
    latencyEstimate,
  };

  const debug = {
    analysis,
    strategy,
    qualityReport: quality,
    agentSteps: steps,
    agentVersion: "3.0.0",
    modelUsed: optimization.modelUsed,
    inputChars: extractedText.length,
    outputChars: optimization.optimizedText.length,
    rawLlmResponse: optimization.rawLlmResponse,
    commitHash: "49e2574",
  };

  return { result, debug };
}