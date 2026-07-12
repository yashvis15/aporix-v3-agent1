const GEMINI_API_BASE =
  process.env.GEMINI_API_BASE || "https://generativelanguage.googleapis.com/v1beta";

function getGeminiApiKey(): string {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      "Missing GEMINI_API_KEY. Add it to your .env.local file (see .env.example)."
    );
  }
  return process.env.GEMINI_API_KEY;
}

export async function discoverModels(): Promise<string[]> {
  const apiKey = getGeminiApiKey();
  const url = `${GEMINI_API_BASE}/models?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url);
  if (!res.ok) return [];

  const data = await res.json().catch(() => null);
  if (!data?.models) return [];

  const preferred = [
    "gemini-2.5-flash",
    "gemini-3.5-flash",
    "gemini-2.0-flash",
    "gemini-2.5-pro",
    "gemini-1.5-flash",
  ];

  const available: string[] = [];
  for (const m of data.models) {
    const name = m.name?.replace(/^models\//, "");
    if (name && m.supportedGenerationMethods?.includes("generateContent")) {
      available.push(name);
    }
  }

  const ranked = preferred.filter((p) => available.includes(p));
  const rest = available.filter((a) => !preferred.includes(a));
  const userModel = process.env.GEMINI_MODEL?.replace(/^models\//, "").trim();
  if (userModel && !ranked.includes(userModel) && !rest.includes(userModel)) {
    return [userModel, ...ranked, ...rest];
  }
  return ranked.length > 0 ? [...ranked, ...rest] : available;
}

export interface GeminiConfig {
  temperature?: number;
  maxOutputTokens?: number;
}

export interface GeminiResult {
  text: string;
  model: string;
}

export async function callGemini(
  prompt: string,
  config?: GeminiConfig
): Promise<GeminiResult> {
  const apiKey = getGeminiApiKey();

  let modelsToTry: string[] = [];
  const userModel = process.env.GEMINI_MODEL?.replace(/^models\//, "").trim();

  if (userModel) {
    modelsToTry = [userModel];
  } else {
    modelsToTry = await discoverModels();
    if (modelsToTry.length === 0) {
      modelsToTry = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash"];
    }
  }

  let lastError: string | null = null;

  for (const model of modelsToTry) {
    const url = `${GEMINI_API_BASE}/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: config?.temperature ?? 0.2,
          maxOutputTokens: config?.maxOutputTokens ?? 8192,
        },
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts
        ?.map((part: { text?: string }) => part.text || "")
        .join("")
        .trim();

      if (text) return { text, model };
    }

    const data = await response.json().catch(() => null);
    lastError = data?.error?.message || `Status ${response.status}`;
  }

  throw new Error(
    `All Gemini models failed. Last error: ${lastError}. ` +
      `Tried: ${modelsToTry.join(", ")}. ` +
      `Set GEMINI_MODEL env var to a working model, or check your API key.`
  );
}

function stripMarkdownJson(raw: string): string {
  return raw.trim().replace(/^```json\s*|^```\s*|```$/g, "");
}

export function parseJsonResponse<T>(raw: string, fallback: T): T {
  const cleaned = stripMarkdownJson(raw);
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    return fallback;
  }
}
