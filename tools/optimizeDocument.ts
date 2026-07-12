import { callGemini, parseJsonResponse } from "@/lib/llm";
import type { OptimizationStrategy, QualityReport } from "@/lib/types";

const MAX_INPUT_CHARS = Number(process.env.MAX_INPUT_CHARS || 60000);

const OPTIMIZER_PROMPT = `You are a document compression engine. Your output must be 50-80% SHORTER than the input.

GOAL: Keep only content that is essential for the user's stated goal. Delete everything else.

- Delete recitals, background, boilerplate, definitions, signatures
- Delete redundant sentences, examples, explanations, procedural steps
- Delete section headings, numbering, formatting, legalese
- Keep only: names, dates, dollar amounts, obligations, restrictions, deadlines
- Make facts concise — don't copy original sentences verbatim
- Never add, explain, or summarize. Only delete and condense.

Your output MUST be under 50% of the input length.

Return JSON:
{
  "optimizedText": "kept content only, condensed",
  "removedSummary": "what was removed",
  "preservedSummary": "what was kept",
  "optimizationReasoning": "why",
  "confidenceScore": 0.9,
  "semanticSimilarity": 0.85,
  "removedSections": []
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

INPUT LENGTH: ${inputChars} characters
STRICT LIMIT: Your output MUST be under ${targetMaxChars} characters (${Math.round((1 - targetMaxChars / inputChars) * 100)}% reduction).

DOCUMENT:
"""
${truncated}
"""`;

  const { text: raw, model } = await callGemini(`${OPTIMIZER_PROMPT}\n\n${userPrompt}`, {
    temperature: 0.4,
  });

  const fallback = {
    optimizedText: truncated,
    removedSummary: "Extraction applied.",
    preservedSummary: "Content preserved based on goal relevance.",
    optimizationReasoning: "Standard extraction applied.",
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