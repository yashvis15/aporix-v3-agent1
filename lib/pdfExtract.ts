import type { SupportedFileType } from "./types";

const pdfParse = require("pdf-parse");

export interface FileExtractResult {
  text: string;
  numPages: number;
  fileType: SupportedFileType;
}

export async function extractTextFromFile(
  buffer: Buffer,
  fileType: SupportedFileType
): Promise<FileExtractResult> {
  switch (fileType) {
    case "pdf":
      return extractFromPdf(buffer);
    case "txt":
      return extractFromTxt(buffer);
    case "json":
      return extractFromJson(buffer);
    case "md":
      return extractFromMd(buffer);
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
}

async function extractFromPdf(buffer: Buffer): Promise<FileExtractResult> {
  const data = await pdfParse(buffer);
  const cleaned = data.text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return { text: cleaned, numPages: data.numpages ?? 0, fileType: "pdf" };
}

function extractFromTxt(buffer: Buffer): FileExtractResult {
  const text = buffer.toString("utf-8").trim();
  return { text, numPages: 1, fileType: "txt" };
}

function extractFromJson(buffer: Buffer): FileExtractResult {
  const raw = buffer.toString("utf-8").trim();

  try {
    const parsed = JSON.parse(raw);
    const text =
      typeof parsed === "string"
        ? parsed
        : JSON.stringify(parsed, null, 2);
    return { text, numPages: 1, fileType: "json" };
  } catch {
    return { text: raw, numPages: 1, fileType: "json" };
  }
}

function extractFromMd(buffer: Buffer): FileExtractResult {
  const text = buffer.toString("utf-8").trim();
  return { text, numPages: 1, fileType: "md" };
}
