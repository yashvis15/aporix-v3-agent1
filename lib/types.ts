export interface TokenStats {
  originalTokens: number;
  optimizedTokens: number;
  tokensSaved: number;
  percentSaved: number;
}

export interface CostAnalysis {
  model: string;
  costPer1kInputTokens: number;
  costPer1kOutputTokens: number;
  originalCost: number;
  optimizedCost: number;
  savings: number;
}

export interface LatencyEstimate {
  originalEstimatedLatencyMs: number;
  optimizedEstimatedLatencyMs: number;
  reductionMs: number;
  reductionPercent: number;
}

export interface TrustLayer {
  confidenceScore: number;
  semanticSimilarity: number;
  preservedSummary: string;
  optimizationReasoning: string;
  removedSections: string[];
}

export interface OptimizeRequestMeta {
  goal: string;
  fileName: string;
  fileSizeBytes: number;
  fileType: SupportedFileType;
}

export type SupportedFileType = "pdf" | "txt" | "json" | "md";

export interface OptimizeResponse {
  success: true;
  optimizedText: string;
  removedSummary: string;
  tokenStats: TokenStats;
  costAnalysis: CostAnalysis;
  latencyEstimate: LatencyEstimate;
  trustLayer: TrustLayer;
  meta: OptimizeRequestMeta;
  debug?: {
    analysis: DocumentAnalysis;
    strategy: OptimizationStrategy;
    qualityReport: QualityReport;
    agentSteps: string[];
    agentVersion: string;
    modelUsed: string;
    inputChars: number;
    outputChars: number;
    rawLlmResponse: string;
    commitHash: string;
  };
}

export interface OptimizeErrorResponse {
  success: false;
  error: string;
}

export interface MultiDocumentOptimizeRequest {
  goal: string;
  documentIds: string[];
}

export interface X402UsageRecord {
  requestId: string;
  walletAddress?: string;
  costUsd?: number;
  settled: boolean;
}

export interface StoredDocument {
  id: string;
  userId?: string;
  fileName: string;
  extractedText: string;
  createdAt: string;
}

// Agent types

export type DocumentCategory =
  | "legal"
  | "technical"
  | "academic"
  | "business"
  | "creative"
  | "general";

export interface DocumentAnalysis {
  category: DocumentCategory;
  estimatedPages: number;
  keyTopics: string[];
  structuralElements: string[];
  estimatedReadingTimeMinutes: number;
}

export interface OptimizationStrategy {
  preserveRules: string[];
  removeRules: string[];
  focusArea: string;
  customInstructions: string;
  compressionTarget: "aggressive" | "moderate" | "minimal";
}

export interface QualityReport {
  confidenceScore: number;
  semanticSimilarity: number;
  preservedSummary: string;
  optimizationReasoning: string;
  removedSections: string[];
  warnings: string[];
}

export interface AgentResult {
  optimizedText: string;
  removedSummary: string;
  quality: QualityReport;
  tokenStats: TokenStats;
  costAnalysis: CostAnalysis;
  latencyEstimate: LatencyEstimate;
}
