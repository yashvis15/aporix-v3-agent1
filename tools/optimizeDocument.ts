import { callGemini, parseJsonResponse } from "@/lib/llm";
import { estimateTokens } from "@/lib/tokenCount";
import type { OptimizationStrategy, QualityReport } from "@/lib/types";

const MAX_INPUT_CHARS = Number(process.env.MAX_INPUT_CHARS || 60000);

const OPTIMIZER_PROMPT = `You are an LLM context extractor. Your job is to DELETE everything from the document that is NOT needed to answer the user's goal. Keep ONLY the essential facts.

RULES:
- Answer this question for every sentence: "Is this needed to answer the user's goal?" If NO → DELETE it.
- Convert remaining content into short bullet-point facts.
- DELETE: boilerplate, recitals, signatures, formatting, page numbers, headers/footers, procedural text, examples, definitions (unless needed for understanding), section references, repeated concepts.
- KEEP only: names, dates, numbers, amounts, obligations, rights, restrictions, deadlines, conditions, exceptions — but ONLY if they relate to the goal.
- Do NOT preserve original wording or sentence structure. Rewrite as concise facts.
- Do NOT add any explanation, reasoning, or meta-commentary.

OUTPUT RULES:
- The "optimizedText" must be SHORTER than the input document. Much shorter.
- If your output is similar in length to the input, you did it wrong — go back and delete more.
- Target: remove at least 60% of the content.

EXAMPLE:
Input: "This Employment Agreement (the 'Agreement') is entered into as of January 15, 2024, by and between Acme Corporation, a Delaware corporation with its principal place of business at 123 Main Street, Wilmington, DE 19801 (the 'Company'), and John Smith, an individual residing at 456 Oak Avenue, Springfield, IL 62701 (the 'Employee')."
Output:
- Party: Acme Corp (DE)
- Employee: John Smith (Springfield, IL)
- Date: Jan 15, 2024

Respond with ONLY JSON, no markdown fences:
{
  "optimizedText": "compressed content ONLY — no reasoning",
  "removedSummary": "what was deleted and why",
  "preservedSummary": "what was kept and why",
  "optimizationReasoning": "brief key decisions",
  "confidenceScore": 0.95,
  "semanticSimilarity": 0.92,
  "removedSections": ["section", "another"]
}`;

export async function optimizeDocument(
  extractedText: string,
  goal: string,
  _strategy: OptimizationStrategy
): Promise<QualityReport & { optimizedText: string; removedSummary: string; modelUsed: string }> {
  const truncated =
    extractedText.length > MAX_INPUT_CHARS
      ? extractedText.slice(0, MAX_INPUT_CHARS) +
        "\n\n[...document truncated for input limit...]"
      : extractedText;

  const inputChars = truncated.length;
  const targetMaxChars = Math.round(inputChars * 0.4);

  const userPrompt = `USER GOAL: ${goal}

INPUT CHARACTER COUNT: ~${inputChars}
YOUR OUTPUT MUST BE UNDER ${targetMaxChars} CHARACTERS.

DOCUMENT TEXT:
"""
${truncated}
"""`;

  const { text: raw, model } = await callGemini(`${OPTIMIZER_PROMPT}\n\n${userPrompt}`, {
    temperature: 0.7,
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

  if (!parsed.optimizedText) return { ...fallback, modelUsed: model };

  return {
    modelUsed: model,
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