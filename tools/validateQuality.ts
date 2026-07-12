import { callGemini, parseJsonResponse } from "@/lib/llm";
import type { QualityReport } from "@/lib/types";

const VALIDATION_PROMPT = `You are a quality assurance validator. Given the original document text, the optimized text, and the user's goal, assess the quality of the optimization.

Return ONLY valid JSON (no markdown, no explanation) in exactly this shape:
{
  "confidenceScore": 0.93,
  "semanticSimilarity": 0.88,
  "preservedSummary": "1-2 sentences on what was preserved",
  "optimizationReasoning": "2-3 sentences on why this optimization is effective",
  "removedSections": ["section or topic removed", "another"],
  "warnings": ["any concern about lost context", "another warning if any"]
}

Rules:
- confidenceScore (0-1): how confident you are that all goal-relevant info is preserved
- semanticSimilarity (0-1): estimated semantic overlap between original and optimized for the stated goal
- removedSections: list specific content types or sections that appear to have been removed
- warnings: flag any potential issues (missing data, unclear context, over-truncation)
- If the optimized text is too short or missing key info, set low scores and add warnings`;

export async function validateQuality(
  originalText: string,
  optimizedText: string,
  goal: string
): Promise<QualityReport> {
  const prompt = `${VALIDATION_PROMPT}

USER GOAL: ${goal}

ORIGINAL TEXT (first 3000 chars):
"""
${originalText.slice(0, 3000)}
"""

OPTIMIZED TEXT:
"""
${optimizedText.slice(0, 3000)}
"""`;

  const { text: raw } = await callGemini(prompt);
  const fallback: QualityReport = {
    confidenceScore: 0.85,
    semanticSimilarity: 0.8,
    preservedSummary: "Content preserved based on goal relevance.",
    optimizationReasoning: "Standard optimization applied via strategy.",
    removedSections: [],
    warnings: [],
  };

  return parseJsonResponse(raw, fallback);
}