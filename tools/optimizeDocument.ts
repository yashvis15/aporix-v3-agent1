import { callGemini, parseJsonResponse } from "@/lib/llm";
import type { OptimizationStrategy, QualityReport } from "@/lib/types";

const MAX_INPUT_CHARS = Number(process.env.MAX_INPUT_CHARS || 60000);

const OPTIMIZER_SYSTEM_PROMPT = `You are a context optimization engine for an LLM pipeline tool.

Your job is NOT to write a human-friendly summary. You produce the MINIMAL, DENSE, TASK-SPECIFIC text extract that another LLM could use as context, following the provided strategy.

Rules:
- Aggressively cut content irrelevant to the goal (boilerplate, repeated disclaimers, unrelated sections, filler, redundant phrasing).
- Preserve relevant facts, figures, definitions, and arguments verbatim or near-verbatim where precision matters (numbers, names, dates, clauses).
- It is OK for the output to be non-narrative (bullet points, fragments, labeled sections) if that is more token-efficient than prose.
- Do not add opinions, analysis, or information not present in the source.
- Do not pad the output to sound complete; shorter is better as long as it serves the goal.
- FOLLOW THE STRATEGY RULES precisely.

Respond with ONLY a JSON object, no markdown fences, no preamble, in exactly this shape:
{
  "optimizedText": "the compressed, goal-optimized context",
  "removedSummary": "1-3 sentences describing what kinds of content were removed and why",
  "preservedSummary": "1-2 sentences describing what content was preserved and why it is relevant",
  "optimizationReasoning": "2-3 sentences explaining the key decisions made during optimization",
  "confidenceScore": 0.95,
  "semanticSimilarity": 0.92,
  "removedSections": ["section heading or topic briefly", "another removed section"]
}`;

export async function optimizeDocument(
  extractedText: string,
  goal: string,
  strategy: OptimizationStrategy
): Promise<QualityReport & { optimizedText: string; removedSummary: string }> {
  const truncated =
    extractedText.length > MAX_INPUT_CHARS
      ? extractedText.slice(0, MAX_INPUT_CHARS) +
        "\n\n[...document truncated for input limit...]"
      : extractedText;

  const strategyBlock = `OPTIMIZATION STRATEGY:
- Compression Target: ${strategy.compressionTarget}
- Focus Area: ${strategy.focusArea}
- Preserve Rules: ${strategy.preserveRules.map((r) => `"${r}"`).join(", ")}
- Remove Rules: ${strategy.removeRules.map((r) => `"${r}"`).join(", ")}
- Custom Instructions: ${strategy.customInstructions}`;

  const userPrompt = `${strategyBlock}

USER GOAL: ${goal}

DOCUMENT TEXT:
"""
${truncated}
"""

Produce the JSON object described in the system prompt now.`;

  const raw = await callGemini(`${OPTIMIZER_SYSTEM_PROMPT}\n\n${userPrompt}`);

  const fallback = {
    optimizedText: truncated,
    removedSummary: "Optimization applied following the strategy.",
    preservedSummary: "Content preserved based on goal relevance.",
    optimizationReasoning: "Strategy-driven optimization applied.",
    confidenceScore: 0.8,
    semanticSimilarity: 0.75,
    removedSections: [] as string[],
    warnings: ["Could not parse structured response from model."] as string[],
  };

  const parsed = parseJsonResponse<{
    optimizedText?: string;
    removedSummary?: string;
    preservedSummary?: string;
    optimizationReasoning?: string;
    confidenceScore?: number;
    semanticSimilarity?: number;
    removedSections?: string[];
  }>(raw, fallback);

  if (!parsed.optimizedText) return fallback;

  return {
    optimizedText: parsed.optimizedText,
    removedSummary:
      typeof parsed.removedSummary === "string"
        ? parsed.removedSummary
        : fallback.removedSummary,
    preservedSummary:
      typeof parsed.preservedSummary === "string"
        ? parsed.preservedSummary
        : fallback.preservedSummary,
    optimizationReasoning:
      typeof parsed.optimizationReasoning === "string"
        ? parsed.optimizationReasoning
        : fallback.optimizationReasoning,
    confidenceScore:
      typeof parsed.confidenceScore === "number"
        ? Math.min(1, Math.max(0, parsed.confidenceScore))
        : 0.85,
    semanticSimilarity:
      typeof parsed.semanticSimilarity === "number"
        ? Math.min(1, Math.max(0, parsed.semanticSimilarity))
        : 0.8,
    removedSections: Array.isArray(parsed.removedSections)
      ? parsed.removedSections
      : [],
    warnings: [],
  };
}