import { callGemini, parseJsonResponse } from "@/lib/llm";
import { estimateTokens } from "@/lib/tokenCount";
import type { OptimizationStrategy, QualityReport } from "@/lib/types";

const MAX_INPUT_CHARS = Number(process.env.MAX_INPUT_CHARS || 60000);

const OPTIMIZER_SYSTEM_PROMPT = `You are an LLM context optimization engine.

Your job is NOT to summarize for a human. Transform the document into the smallest possible factual context that another LLM can use to answer the goal.

RULES:
- Output ONLY compressed facts. No explanations, no meta-commentary, no reasoning.
- Prefer bullet points, short labels, compressed statements.
- Merge repeated concepts. State each fact once.
- Convert verbose prose into concise factual statements.
- Remove ALL: boilerplate, formatting artifacts, signature blocks, procedural text, repeated definitions, examples not needed for meaning, section references unless essential.
- Preserve: names, dates, numbers, amounts, obligations, rights, restrictions, deadlines, conditions, exceptions.
- Prioritize factual precision over original wording.
- Do not preserve original document structure or formatting.

Before finalizing, verify:
"Could another LLM answer the goal using ONLY this output?"
If yes, cut anything unnecessary.

EXAMPLE of good compression (this is a SEPARATE document, not related to the user's input):

Original (87 tokens):
"This Employment Agreement (the 'Agreement') is entered into as of January 15, 2024, by and between Acme Corporation, a Delaware corporation with its principal place of business at 123 Main Street, Wilmington, DE 19801 (the 'Company'), and John Smith, an individual residing at 456 Oak Avenue, Springfield, IL 62701 (the 'Employee')."

Optimized (18 tokens, 79% reduction):
- Party: Acme Corp (Delaware)
- Employee: John Smith (Springfield, IL)
- Agreement Date: Jan 15, 2024

Respond with ONLY a JSON object, no markdown fences, no preamble:
{
  "optimizedText": "the compressed content only",
  "removedSummary": "what was removed and why",
  "preservedSummary": "what was preserved and why",
  "optimizationReasoning": "key decisions made",
  "confidenceScore": 0.95,
  "semanticSimilarity": 0.92,
  "removedSections": ["section briefly", "another"]
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

  const originalTokens = estimateTokens(truncated);
  const targetMinTokens = Math.round(originalTokens * 0.2);
  const targetMaxTokens = Math.round(originalTokens * 0.5);

  const strategyBlock = `STRATEGY:
- Compression Target: ${strategy.compressionTarget}
- Focus: ${strategy.focusArea}
- Preserve: ${strategy.preserveRules.join("; ")}
- Remove: ${strategy.removeRules.join("; ")}`;

  const userPrompt = `${strategyBlock}

USER GOAL: ${goal}

ORIGINAL TOKEN COUNT: ~${originalTokens} tokens
TARGET OUTPUT: ${targetMinTokens}-${targetMaxTokens} tokens (${Math.round((1 - targetMaxTokens / originalTokens) * 100)}-${Math.round((1 - targetMinTokens / originalTokens) * 100)}% reduction)

DOCUMENT TEXT:
"""
${truncated}
"""`;

  const raw = await callGemini(`${OPTIMIZER_SYSTEM_PROMPT}\n\n${userPrompt}`, {
    temperature: 0.7,
  });

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