import { analyzeDocument } from "@/tools/analyzeDocument";
import { createStrategy } from "@/agent/strategy";
import { optimizeDocument } from "@/tools/optimizeDocument";
import { validateQuality } from "@/tools/validateQuality";
import { calculateSavings } from "@/tools/calculateSavings";
import type { AgentResult, QualityReport } from "@/lib/types";

export interface OrchestratorInput {
  extractedText: string;
  goal: string;
}

export interface OrchestratorMeta {
  modelUsed: string;
  agentSteps: string[];
  agentVersion: string;
}

export async function runOptimizationAgent(
  input: OrchestratorInput
): Promise<{ result: AgentResult; meta: OrchestratorMeta }> {
  const { extractedText, goal } = input;
  const steps: string[] = [];

  // Step 1: Analyze the document
  steps.push("analyzeDocument");
  const analysis = await analyzeDocument(extractedText, goal);

  // Step 2: Create optimization strategy
  steps.push("createStrategy");
  const strategy = await createStrategy(analysis, goal);

  // Step 3: Run the optimizer with the strategy
  steps.push("optimizeDocument");
  const optimization = await optimizeDocument(extractedText, goal, strategy);

  // Step 4: Validate quality
  steps.push("validateQuality");
  let quality: QualityReport;
  try {
    quality = await validateQuality(
      extractedText,
      optimization.optimizedText,
      goal
    );
  } catch {
    quality = {
      confidenceScore: optimization.confidenceScore,
      semanticSimilarity: optimization.semanticSimilarity,
      preservedSummary: optimization.preservedSummary,
      optimizationReasoning: optimization.optimizationReasoning,
      removedSections: optimization.removedSections,
      warnings: ["Quality validation step failed; using model-provided scores."],
    };
  }

  // Step 5: Calculate token/cost/latency savings
  steps.push("calculateSavings");
  const { tokenStats, costAnalysis, latencyEstimate } = calculateSavings(
    extractedText,
    optimization.optimizedText
  );

  const result: AgentResult = {
    optimizedText: optimization.optimizedText,
    removedSummary: optimization.removedSummary,
    quality,
    tokenStats,
    costAnalysis,
    latencyEstimate,
  };

  const meta: OrchestratorMeta = {
    modelUsed: "gemini (auto-discovered)",
    agentSteps: steps,
    agentVersion: "3.0.0",
  };

  return { result, meta };
}