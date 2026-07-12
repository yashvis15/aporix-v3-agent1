import { callGemini, parseJsonResponse } from "@/lib/llm";
import type { DocumentAnalysis, OptimizationStrategy } from "@/lib/types";

const STRATEGY_PROMPT = `You are an optimization strategist. Given a document analysis and a user goal, create a compression strategy.

Return ONLY valid JSON (no markdown, no explanation) in exactly this shape:
{
  "preserveRules": ["rule1", "rule2", ...],
  "removeRules": ["rule1", "rule2", ...],
  "focusArea": "short description of what to focus on",
  "customInstructions": "detailed instructions for the optimizer",
  "compressionTarget": "aggressive|moderate|minimal"
}

Rules:
- preserveRules: 2-4 specific things to keep verbatim (e.g. "Preserve all defined terms and their definitions")
- removeRules: 2-4 specific things to cut (e.g. "Remove boilerplate disclaimers repeated on every page")
- focusArea: one sentence on what matters most
- customInstructions: 2-3 sentences with detailed optimization guidance
- compressionTarget: "aggressive" for marketing/sales content, "minimal" for legal/technical docs where precision matters, "moderate" otherwise`;

export async function createStrategy(
  analysis: DocumentAnalysis,
  goal: string
): Promise<OptimizationStrategy> {
  const prompt = `${STRATEGY_PROMPT}

USER GOAL: ${goal}

DOCUMENT ANALYSIS:
- Category: ${analysis.category}
- Estimated Pages: ${analysis.estimatedPages}
- Key Topics: ${analysis.keyTopics.join(", ")}
- Structural Elements: ${analysis.structuralElements.join(", ")}
- Est. Reading Time: ${analysis.estimatedReadingTimeMinutes} min`;

  const raw = await callGemini(prompt);
  const fallback: OptimizationStrategy = {
    preserveRules: [
      "Preserve all facts, figures, names, and dates",
      "Keep content directly relevant to the goal",
    ],
    removeRules: [
      "Remove filler, boilerplate, and redundant phrasing",
      "Remove content unrelated to the goal",
    ],
    focusArea: `Content relevant to: ${goal}`,
    customInstructions: "Optimize the document context to serve the stated goal. Retain relevant precision, remove distractions.",
    compressionTarget: "moderate",
  };

  return parseJsonResponse(raw, fallback);
}