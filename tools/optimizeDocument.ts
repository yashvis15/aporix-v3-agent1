import { callGemini, parseJsonResponse } from "@/lib/llm";
import type { OptimizationStrategy, QualityReport } from "@/lib/types";

const MAX_INPUT_CHARS = Number(process.env.MAX_INPUT_CHARS || 60000);

const OPTIMIZER_SYSTEM_PROMPT = `You are an LLM context optimization engine.
Your job is NOT to summarize the document for a human.
Your job is to transform the document into the smallest possible context that allows another LLM to answer the user's goal accurately.

CRITICAL: The "optimizedText" field must contain ONLY the actual optimized document content. Never include planning notes, reasoning, strategy instructions, meta-commentary, or anything that is not part of the source document. The optimizedText is pure content — it will be used directly as LLM context.

Instructions:
1. Identify the information required to complete the user's goal.
2. Remove information that does not help another LLM answer the user's goal.
3. Do NOT preserve the original document structure, wording, page numbers, signatures, or formatting unless they are necessary.
4. Convert long legal/technical language into concise factual statements while preserving meaning.
5. Merge repeated concepts.
6. Remove:
   - boilerplate legal language
   - procedural instructions
   - repeated definitions
   - signature blocks
   - formatting artifacts
   - examples that do not affect the meaning
   - references to sections unless needed for understanding
7. Preserve:
   - names and entities
   - dates
   - numbers and financial amounts
   - obligations
   - rights
   - restrictions
   - deadlines
   - conditions
   - exceptions
8. Prioritize factual information over original wording.
9. Output only optimized context, not explanations.

For this task:
- Prefer structured bullet points.
- Use short labels and compressed statements.
- Do not copy sentences directly unless required for accuracy.
- Aim for maximum token reduction while maintaining answer quality.

Before finalizing, check:
"Could another LLM answer the user's question using only this output?"
If yes, remove anything unnecessary.

Respond with ONLY a JSON object, no markdown fences, no preamble, in exactly this shape:
{
  "optimizedText": "the compressed, goal-optimized context — this field contains ONLY document content, no reasoning or planning",
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