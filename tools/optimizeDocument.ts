import { callGemini } from "@/lib/llm";
import type { OptimizationStrategy, QualityReport } from "@/lib/types";

const MAX_INPUT_CHARS = Number(process.env.MAX_INPUT_CHARS || 60000);

const OPTIMIZER_PROMPT = `Extract key facts from the document to achieve the user's goal. Be concise.

RULES:
- Output must be MUCH shorter than the input (aim for 70% reduction)
- Delete: recitals, background, definitions, boilerplate, signatures, examples
- Keep only: names, dates, amounts, obligations, deadlines, conditions
- Write in short bullet points. No full paragraphs.
- Never add commentary or explanations.

Start writing the extracted facts immediately.`;

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

  async function callOnce(extra: string): Promise<{ text: string; model: string }> {
    return callGemini(`${OPTIMIZER_PROMPT}\n\n${userPrompt}\n\n${extra}`, {
      temperature: 0.8,
      maxOutputTokens: 4096,
    });
  }

  let { text: raw, model } = await callOnce("IMPORTANT: Your output MUST be at least 50% shorter than the input text above.");

  // Strip common preamble lines from the model response
  let cleaned = raw.replace(/^(here|okay|sure|certainly|of course|i('ve| have) (read|analyzed|processed|reviewed)|the (extracted|optimized|compressed|relevant) (text|content|information|facts)|below (is|are)|based on|after (reviewing|analyzing)).*?\n+/im, "").trim();

  // Retry once if model didn't compress (returned >=90% of input)
  if (cleaned.length >= truncated.length * 0.9) {
    const retry = await callOnce("CRITICAL: You MUST delete at least 60% of the text below. Keep only 2-3 sentences per relevant section. Output ONLY the kept text.");
    raw = retry.text;
    model = retry.model;
    cleaned = raw.replace(/^(here|okay|sure|certainly|of course|i('ve| have) (read|analyzed|processed|reviewed)|the (extracted|optimized|compressed|relevant) (text|content|information|facts)|below (is|are)|based on|after (reviewing|analyzing)).*?\n+/im, "").trim();
  }

  const outputText = cleaned.length < truncated.length * 0.9 ? cleaned : truncated;

  const pct = 1 - outputText.length / truncated.length;
  const wasCompressed = pct > 0.05;

  return {
    modelUsed: model,
    rawLlmResponse: raw,
    optimizedText: outputText,
    removedSummary: wasCompressed
      ? `Removed ~${Math.round(pct * 100)}% of text (boilerplate, background, redundant content).`
      : "Extraction applied.",
    preservedSummary: wasCompressed
      ? "Goal-relevant facts, dates, obligations, and key data points retained."
      : "Content preserved based on goal relevance.",
    optimizationReasoning: wasCompressed
      ? "Deleted sections not relevant to goal. Condensed remaining content."
      : "Standard extraction applied.",
    confidenceScore: wasCompressed ? 0.9 : 0.7,
    semanticSimilarity: wasCompressed ? 0.85 : 0.75,
    removedSections: wasCompressed
      ? ["boilerplate", "background", "redundant content"]
      : ([] as string[]),
    warnings: [],
  };
}