import { callGemini, parseJsonResponse } from "@/lib/llm";
import type { DocumentAnalysis, DocumentCategory } from "@/lib/types";

const ANALYSIS_PROMPT = `You are a document analyst. Given a document text and a user goal, analyze the document and return JSON describing its characteristics.

Return ONLY valid JSON (no markdown, no explanation) in exactly this shape:
{
  "category": "legal|technical|academic|business|creative|general",
  "estimatedPages": <number>,
  "keyTopics": ["topic1", "topic2", ...],
  "structuralElements": ["headings", "clauses", "tables", ...],
  "estimatedReadingTimeMinutes": <number>
}

Rules:
- category: pick the most specific type. Use "general" only if none of the others fit.
- keyTopics: 3-7 distinct topics central to the document
- structuralElements: note observable structures like "clauses", "definitions", "sections", "bullet points", "code blocks", "citations"
- estimatedReadingTimeMinutes: approximate at ~250 words/min
- estimatedPages: approximate at ~500 words/page`;

export async function analyzeDocument(
  extractedText: string,
  goal: string
): Promise<DocumentAnalysis> {
  const prompt = `${ANALYSIS_PROMPT}

USER GOAL: ${goal}

DOCUMENT TEXT (first 8000 chars):
"""
${extractedText.slice(0, 8000)}
"""`;

  const raw = await callGemini(prompt);
  const fallback: DocumentAnalysis = {
    category: "general",
    estimatedPages: Math.max(1, Math.round(extractedText.length / 2000)),
    keyTopics: [],
    structuralElements: [],
    estimatedReadingTimeMinutes: Math.max(1, Math.round(extractedText.split(/\s+/).length / 250)),
  };

  return parseJsonResponse(raw, fallback);
}