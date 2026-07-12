import type { DocumentAnalysis, OptimizationStrategy } from "@/lib/types";

export function createStrategy(
  analysis: DocumentAnalysis,
  goal: string
): OptimizationStrategy {
  const isPrecisionDoc = analysis.category === "legal";
  const compressionTarget = isPrecisionDoc ? "moderate" : "aggressive";

  return {
    preserveRules: [
      "Preserve all names, dates, numbers, financial amounts, and specific facts",
      "Keep obligations, rights, restrictions, deadlines, conditions, and exceptions",
      `Keep content directly relevant to: ${goal}`,
    ],
    removeRules: [
      "Remove boilerplate, formatting artifacts, signature blocks, procedural text",
      "Remove examples, repeated definitions, and section references unless essential",
      "Remove content not directly serving the user's goal",
    ],
    focusArea: `Content relevant to: ${goal}`,
    customInstructions: `Aggressively compress into the smallest possible context that still allows another LLM to answer the goal. Merge repeated concepts. Convert verbose prose into concise bullet-point facts.`,
    compressionTarget,
  };
}