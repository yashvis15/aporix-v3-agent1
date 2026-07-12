import { NextRequest, NextResponse } from "next/server";
import { extractTextFromFile } from "@/lib/pdfExtract";
import { runOptimizationAgent } from "@/agent/orchestrator";
import type {
  OptimizeErrorResponse,
  OptimizeResponse,
  SupportedFileType,
} from "@/lib/types";

export const runtime = "nodejs";

const FILE_TYPE_MAP: Record<string, SupportedFileType> = {
  "application/pdf": "pdf",
  "text/plain": "txt",
  "application/json": "json",
};

const EXTENSION_MAP: Record<string, SupportedFileType> = {
  pdf: "pdf",
  txt: "txt",
  json: "json",
  md: "md",
};

function detectFileType(file: File): SupportedFileType | null {
  if (FILE_TYPE_MAP[file.type]) return FILE_TYPE_MAP[file.type];

  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext && EXTENSION_MAP[ext]) return EXTENSION_MAP[ext];

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const goal = formData.get("goal");

    if (!file || !(file instanceof File)) {
      return errorResponse("No file was uploaded.", 400);
    }
    if (!goal || typeof goal !== "string" || !goal.trim()) {
      return errorResponse("A goal/instruction is required.", 400);
    }

    const fileType = detectFileType(file);
    if (!fileType) {
      return errorResponse(
        "Unsupported file type. Please upload a PDF, TXT, JSON, or Markdown (.md) file.",
        400
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { text: extractedText } = await extractTextFromFile(
      buffer,
      fileType
    );

    if (!extractedText || extractedText.trim().length === 0) {
      return errorResponse(
        "Could not extract any text from this file.",
        422
      );
    }

    const { result, debug } = await runOptimizationAgent({
      extractedText,
      goal: goal.trim(),
    });

    const payload: OptimizeResponse = {
      success: true,
      optimizedText: result.optimizedText,
      removedSummary: result.removedSummary,
      tokenStats: result.tokenStats,
      costAnalysis: result.costAnalysis,
      latencyEstimate: result.latencyEstimate,
      trustLayer: {
        confidenceScore: result.quality.confidenceScore,
        semanticSimilarity: result.quality.semanticSimilarity,
        preservedSummary: result.quality.preservedSummary,
        optimizationReasoning: result.quality.optimizationReasoning,
        removedSections: result.quality.removedSections,
      },
      meta: {
        goal: goal.trim(),
        fileName: file.name,
        fileSizeBytes: file.size,
        fileType,
      },
      debug,
    };

    return NextResponse.json(payload, { status: 200 });
  } catch (err) {
    console.error("[/api/optimize] error:", err);
    const message =
      err instanceof Error ? err.message : "Unexpected server error.";
    return errorResponse(message, 500);
  }
}

function errorResponse(message: string, status: number) {
  const body: OptimizeErrorResponse = { success: false, error: message };
  return NextResponse.json(body, { status });
}