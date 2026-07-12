import type { DocumentAnalysis, DocumentCategory } from "@/lib/types";

function detectCategory(text: string): DocumentCategory {
  const t = text.slice(0, 3000).toLowerCase();
  if (/\b(agreement|contract|clause|indemnify|warrant|hereby|therein|party.*shall|section\s+\d+\.\d)\b/.test(t)) return "legal";
  if (/\b(api|endpoint|function|class|import|export|module|algorithm|syntax|compiler|deploy)\b/.test(t)) return "technical";
  if (/\b(study|hypothesis|methodology|participant|statistical|p<|p-value|doi|et\s+al)\b/.test(t)) return "academic";
  if (/\b(revenue|profit|market|shareholder|quarter|fiscal|ebitda|roi|valuation)\b/.test(t)) return "business";
  if (/\b(chapter|scene|verse|narrative|protagonist|metaphor|poem|dialogue)\b/.test(t)) return "creative";
  return "general";
}

export function analyzeDocument(
  extractedText: string,
  _goal: string
): DocumentAnalysis {
  const text = extractedText;
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const estimatedPages = Math.max(1, Math.round(wordCount / 500));
  const estimatedReadingTimeMinutes = Math.max(1, Math.round(wordCount / 250));
  const category = detectCategory(text);

  const structuralElements: string[] = [];
  if (/\b(section\s+\d+|article\s+\d+|clause)\b/i.test(text)) structuralElements.push("sections");
  if (/\b(table\s+\d+|fig(?:ure)?\s+\d+)\b/i.test(text)) structuralElements.push("tables/figures");
  if (/\b(bullet|•|- |\*\s)/.test(text)) structuralElements.push("bullet points");
  if (/\b(definitions?\b|"[\w\s]+"\s*means?\b)/i.test(text)) structuralElements.push("definitions");
  if (/\b(signature|executed|witness)\b/i.test(text)) structuralElements.push("signature block");

  const sentences = text.slice(0, 5000).split(/[.!?]+/);
  const topicWords = new Map<string, number>();
  const skip = new Set(["the", "a", "an", "is", "are", "was", "were", "this", "that", "these", "those", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by", "from", "as", "be", "been", "has", "have", "had", "do", "does", "did", "will", "would", "could", "should", "may", "might", "shall", "can", "not", "no", "it", "its", "if", "then", "than", "also", "about", "into", "over", "after", "before", "between", "under", "per", "each", "all", "any", "both", "each", "few", "more", "most", "other", "some", "such", "only", "own", "same", "so", "too", "very", "just", "because", "when", "where", "which", "who", "whom", "what", "how"]);
  for (const s of sentences) {
    const words = s.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
    for (const w of words) {
      if (!skip.has(w)) topicWords.set(w, (topicWords.get(w) || 0) + 1);
    }
  }

  const keyTopics = [...topicWords.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1));

  return {
    category,
    estimatedPages,
    keyTopics,
    structuralElements,
    estimatedReadingTimeMinutes,
  };
}