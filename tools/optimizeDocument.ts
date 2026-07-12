import { callGemini, parseJsonResponse } from "@/lib/llm";
import type { OptimizationStrategy, QualityReport } from "@/lib/types";

const MAX_INPUT_CHARS = Number(process.env.MAX_INPUT_CHARS || 60000);

const OPTIMIZER_PROMPT = `You are a legal document extractor. Your job is to extract ONLY the specific facts needed for the user's goal. Discard everything else.

Do NOT summarize. Do NOT rephrase the document. Do NOT preserve any original text structure. Extract only the raw relevant data points as short bullet points.

For each piece of information, ask: "Is this specifically needed to answer the user's goal?" If the answer is not a clear YES — delete it.

Extract ONLY:
- Names of parties, entities, people
- Dates and deadlines
- Dollar amounts, payment terms, financial figures
- Specific obligations (what each party MUST do)
- Specific restrictions (what each party MUST NOT do)
- Conditions and exceptions
- Termination and renewal terms
- Anything directly answering the user's goal

DELETE EVERYTHING ELSE including:
- Recitals, background sections, whereas clauses
- Boilerplate legal language (governing law, venue, entire agreement, etc.)
- Definitions (unless a term is critical to understanding an obligation)
- Signature blocks, witness lines, notary sections
- Section headings, numbering, formatting
- Examples, explanations, procedural steps
- Repeated or redundant statements

RULES:
- Output MUST be < 40% of input length. Delete more if needed.
- Use short bullet points with labels. No full sentences.
- Do not copy original wording. Express facts concisely.
- No explanations or commentary in the output.

Respond with JSON only:
{
  "optimizedText": "bullet-point facts only — no prose, no explanation",
  "removedSummary": "what was deleted",
  "preservedSummary": "what was kept and why",
  "optimizationReasoning": "key decisions",
  "confidenceScore": 0.95,
  "semanticSimilarity": 0.92,
  "removedSections": ["recitals", "boilerplate", "definitions"]
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
    temperature: 0.9,
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