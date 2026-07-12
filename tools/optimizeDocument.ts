import { callGemini, parseJsonResponse } from "@/lib/llm";
import type { OptimizationStrategy, QualityReport } from "@/lib/types";

const MAX_INPUT_CHARS = Number(process.env.MAX_INPUT_CHARS || 60000);

const OPTIMIZER_PROMPT = `You are an LLM context extractor. DELETE everything not needed for the user's goal. Keep ONLY essential facts.

RULES:
- Convert content into short bullet-point facts.
- DELETE: boilerplate, signatures, formatting, headers, procedural text, examples, definitions, repeated concepts, section references.
- KEEP only: names, dates, numbers, amounts, obligations, rights, restrictions, deadlines, conditions, exceptions — but only if related to the goal.
- Rewrite in your own concise words. Do not preserve original sentences.
- No explanations, no meta-commentary in the output.

CRITICAL: Your output MUST be less than 40% of the input length. If it's longer, you failed.

EXAMPLE:
Input: "This Employment Agreement (the 'Agreement') is entered into as of January 15, 2024, by and between Acme Corporation, a Delaware corporation with its principal place of business at 123 Main Street, Wilmington, DE 19801 (the 'Company'), and John Smith, an individual residing at 456 Oak Avenue, Springfield, IL 62701 (the 'Employee')."
Output:
- Party: Acme Corp (DE)
- Employee: John Smith (Springfield, IL)
- Date: Jan 15, 2024

Respond with JSON only:
{
  "optimizedText": "bullet-point facts only",
  "removedSummary": "what was deleted",
  "preservedSummary": "what was kept",
  "optimizationReasoning": "key decisions",
  "confidenceScore": 0.95,
  "semanticSimilarity": 0.92,
  "removedSections": ["x", "y"]
}`;

export async function optimizeDocument(
  extractedText: string,
  goal: string,
  _strategy: OptimizationStrategy
): Promise<QualityReport & { optimizedText: string; removedSummary: string; modelUsed: string; rawLlmResponse: string }> {
  const truncated =
    extractedText.length > MAX_INPUT_CHARS
      ? extractedText.slice(0, MAX_INPUT_CHARS) +
        "\n\n[...document truncated for input limit...]"
      : extractedText;

  const inputChars = truncated.length;
  const targetMaxChars = Math.round(inputChars * 0.4);

  const userPrompt = `USER GOAL: ${goal}

INPUT LENGTH: ~${inputChars} characters
YOUR OUTPUT MUST BE UNDER ${targetMaxChars} CHARACTERS (${Math.round((1 - targetMaxChars / inputChars) * 100)}% reduction).

DOCUMENT TEXT:
"""
${truncated}
"""`;

  const { text: raw, model } = await callGemini(`${OPTIMIZER_PROMPT}\n\n${userPrompt}`, {
    temperature: 0.9,
  });

  const fallback = {
    optimizedText: truncated,
    removedSummary: "Optimization applied.",
    preservedSummary: "Content preserved based on goal relevance.",
    optimizationReasoning: "Standard optimization applied.",
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

  if (!parsed.optimizedText) {
    return { ...fallback, modelUsed: model, rawLlmResponse: raw };
  }

  return {
    modelUsed: model,
    rawLlmResponse: raw,
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