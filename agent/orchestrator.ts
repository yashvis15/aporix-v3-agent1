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
): Promise<{
  result: AgentResult;
  debug: {
    analysis: import("@/lib/types").DocumentAnalysis;
    strategy: import("@/lib/types").OptimizationStrategy;
    qualityReport: import("@/lib/types").QualityReport;
    agentSteps: string[];
    agentVersion: string;
  };
}> {
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
  // Safety strip: remove any leaked strategy/reasoning from optimized output
  optimization.optimizedText = stripLeakedContent(optimization.optimizedText);

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

  const debug = {
    analysis,
    strategy,
    qualityReport: quality,
    agentSteps: steps,
    agentVersion: "3.0.0",
  };

  return { result, debug };
}

function stripLeakedContent(text: string): string {
  const leakPatterns = [
    /^#+\s*(Strategy|Planning|Reasoning|Analysis|Optimization|Instructions|Notes)\b.*?\n{2,}/gim,
    /\b(?:I've applied|The strategy|Per the strategy|Following the strategy|Based on my analysis|My reasoning|I considered)\b[\s\S]*?(?=\n\n|\Z)/gi,
    /\b(?:OPTIMIZATION STRATEGY|USER GOAL|PRESERVE RULES|REMOVE RULES|COMPRESSION TARGET|FOCUS AREA|CUSTOM INSTRUCTIONS)\b.*?(\n|$)/gi,
  ];

  let cleaned = text;
  for (const pattern of leakPatterns) {
    cleaned = cleaned.replace(pattern, "").trim();
  }
  return cleaned;
}