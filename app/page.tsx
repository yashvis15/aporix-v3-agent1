"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import type {
  OptimizeErrorResponse,
  OptimizeResponse,
  SupportedFileType,
} from "@/lib/types";

type ApiResult = OptimizeResponse | OptimizeErrorResponse;
type TabId = "output" | "comparison" | "analysis" | "api";

const GOAL_SUGGESTIONS = [
  "Summarize",
  "Extract risks",
  "Study for interview",
  "Find key arguments",
  "Extract action items",
];

const ACCEPTED_TYPES = ".pdf,.txt,.json,.md";

const FILE_TYPE_BADGES: { type: SupportedFileType; label: string }[] = [
  { type: "pdf", label: "PDF" },
  { type: "txt", label: "TXT" },
  { type: "json", label: "JSON" },
  { type: "md", label: "MD" },
];

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OptimizeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("output");
  const [copied, setCopied] = useState(false);
  const [dark, setDark] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canSubmit = !!file && goal.trim().length > 0 && !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !goal.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setActiveTab("output");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("goal", goal.trim());

      const res = await fetch("/api/optimize", {
        method: "POST",
        body: formData,
      });

      const data: ApiResult = await res.json();

      if (!res.ok || !data.success) {
        setError(
          (data as OptimizeErrorResponse).error || "Something went wrong."
        );
        return;
      }

      setResult(data);
      console.log("[Aporix Debug]", JSON.stringify(data.debug, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error.");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function handleDownloadTxt() {
    if (!result) return;
    const blob = new Blob([result.optimizedText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${result.meta.fileName.replace(/\.[^.]+$/, "")}-optimized.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleDownloadJson() {
    if (!result) return;
    const payload = {
      optimizedText: result.optimizedText,
      tokenStats: result.tokenStats,
      costAnalysis: result.costAnalysis,
      latencyEstimate: result.latencyEstimate,
      trustLayer: result.trustLayer,
      meta: result.meta,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${result.meta.fileName.replace(/\.[^.]+$/, "")}-optimized.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) acceptFile(f);
  }, []);

  function acceptFile(f: File) {
    const ext = f.name.split(".").pop()?.toLowerCase();
    const valid = ["pdf", "txt", "json", "md"].includes(ext || "");
    if (valid) {
      setFile(f);
      setResult(null);
      setError(null);
    } else {
      setError("Unsupported file type. Use PDF, TXT, JSON, or MD.");
    }
  }

  return (
    <div className={dark ? "dark" : ""}>
      <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold tracking-tight">
                <span className="text-brand-600">A</span>porix
              </span>
              <span className="hidden rounded-full border border-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-500 dark:border-slate-700 dark:text-slate-400 sm:inline-block">
                V2 Preview
              </span>
            </div>
            <div className="flex items-center gap-3">
              {result && (
                <span className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">
                  {result.meta.fileName} &middot;{" "}
                  {result.tokenStats.percentSaved}% saved
                </span>
              )}
              <button
                onClick={() => setDark(!dark)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                aria-label="Toggle dark mode"
              >
                {dark ? "Light" : "Dark"}
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-8">
          {/* Input Section */}
          <section className="mb-8">
            <form onSubmit={handleSubmit}>
              <div className="grid gap-6 md:grid-cols-5">
                {/* Upload area - 3 cols */}
                <div className="md:col-span-3">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Upload document
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition ${
                      dragOver
                        ? "border-brand-500 bg-brand-50 dark:bg-brand-950"
                        : "border-slate-300 bg-slate-50 hover:border-brand-400 hover:bg-brand-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-brand-500 dark:hover:bg-brand-950/30"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={ACCEPTED_TYPES}
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) acceptFile(f);
                      }}
                    />
                    {file ? (
                      <div>
                        <p className="text-base font-medium text-slate-800 dark:text-slate-200">
                          {file.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {(file.size / 1024).toFixed(0)} KB &middot; Click or
                          drag to change
                        </p>
                      </div>
                    ) : (
                      <div>
                        <svg
                          className="mx-auto mb-3 h-8 w-8 text-slate-400 dark:text-slate-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                          />
                        </svg>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Drop a file or click to upload
                        </p>
                        <div className="mt-3 flex items-center justify-center gap-2">
                          {FILE_TYPE_BADGES.map((b) => (
                            <span
                              key={b.type}
                              className="rounded border border-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-500 dark:border-slate-700 dark:text-slate-400"
                            >
                              {b.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Goal + button - 2 cols */}
                <div className="md:col-span-2">
                  <label
                    htmlFor="goal"
                    className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Optimization goal
                  </label>
                  <input
                    id="goal"
                    type="text"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder='e.g. "extract key risks"'
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none ring-brand-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {GOAL_SUGGESTIONS.map((g) => (
                      <button
                        type="button"
                        key={g}
                        onClick={() => setGoal(g)}
                        className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[11px] text-slate-600 hover:border-brand-400 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-brand-500 dark:hover:text-brand-400"
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="mt-4 w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="h-4 w-4 animate-spin"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                        Optimizing...
                      </span>
                    ) : (
                      "Optimize"
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
                  {error}
                </div>
              )}
            </form>
          </section>

          {/* Results */}
          {result && (
            <section>
              {/* Quick stats bar */}
              <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
                <StatCard
                  label="Tokens saved"
                  value={`${result.tokenStats.percentSaved}%`}
                  sub={`${result.tokenStats.tokensSaved.toLocaleString()} tokens`}
                  accent
                />
                <StatCard
                  label="Cost savings"
                  value={`$${result.costAnalysis.savings.toFixed(4)}`}
                  sub={`${result.costAnalysis.model}`}
                  accent
                />
                <StatCard
                  label="Latency reduction"
                  value={`${result.latencyEstimate.reductionPercent}%`}
                  sub={`${result.latencyEstimate.reductionMs}ms faster`}
                />
                <StatCard
                  label="Confidence"
                  value={`${Math.round(result.trustLayer.confidenceScore * 100)}%`}
                  sub={
                    result.trustLayer.semanticSimilarity > 0
                      ? `${Math.round(result.trustLayer.semanticSimilarity * 100)}% semantic similarity`
                      : "High accuracy"
                  }
                />
                <StatCard
                  label="Model / Debug"
                  value={`${result.debug?.modelUsed ?? "?"}`}
                  sub={`${result.debug?.inputChars?.toLocaleString() ?? "?"}→${result.debug?.outputChars?.toLocaleString() ?? "?"} chars · ${result.debug?.commitHash?.slice(0,7) ?? "?"}`}
                />
              </div>

              {/* Tabs */}
              <div className="mb-4 border-b border-slate-200 dark:border-slate-800">
                <nav className="flex gap-6">
                  {(
                    [
                      { id: "output", label: "Optimized Text" },
                      { id: "comparison", label: "Comparison" },
                      { id: "analysis", label: "Analysis" },
                      { id: "api", label: "API" },
                    ] as { id: TabId; label: string }[]
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`border-b-2 pb-2 text-sm font-medium transition ${
                        activeTab === tab.id
                          ? "border-brand-600 text-brand-700 dark:border-brand-400 dark:text-brand-400"
                          : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab content */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                {activeTab === "output" && (
                  <OutputTab
                    result={result}
                    onCopy={handleCopy}
                    onDownloadTxt={handleDownloadTxt}
                    onDownloadJson={handleDownloadJson}
                    copied={copied}
                  />
                )}
                {activeTab === "comparison" && (
                  <ComparisonTab result={result} />
                )}
                {activeTab === "analysis" && (
                  <AnalysisTab result={result} />
                )}
                {activeTab === "api" && <ApiTab />}
              </div>
            </section>
          )}

          {/* Empty state when no result */}
          {!result && !loading && (
            <section className="py-16 text-center">
              <div className="mx-auto max-w-md">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-950">
                  <svg
                    className="h-6 w-6 text-brand-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                    />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                  Reduce LLM costs without sacrificing context
                </h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Upload a document, set your goal, and Aporix removes
                  unnecessary tokens while preserving what matters.
                </p>
                <div className="mt-6 grid grid-cols-3 gap-4 text-left text-xs text-slate-500 dark:text-slate-400">
                  <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                    <div className="mb-1 font-medium text-slate-700 dark:text-slate-300">
                      Upload
                    </div>
                    PDF, TXT, JSON, or Markdown
                  </div>
                  <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                    <div className="mb-1 font-medium text-slate-700 dark:text-slate-300">
                      Optimize
                    </div>
                    Goal-driven compression
                  </div>
                  <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                    <div className="mb-1 font-medium text-slate-700 dark:text-slate-300">
                      Deploy
                    </div>
                    Copy, download, or API
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Footer */}
          <footer className="mt-16 border-t border-slate-200 py-6 text-center text-xs text-slate-400 dark:border-slate-800">
            Aporix V2 &middot; Token estimates are approximate. Costs based on{" "}
            GPT-4o mini pricing.
          </footer>
        </main>
      </div>
    </div>
  );
}

/* ───── Tab components ───── */

function OutputTab({
  result,
  onCopy,
  onDownloadTxt,
  onDownloadJson,
  copied,
}: {
  result: OptimizeResponse;
  onCopy: (text: string) => void;
  onDownloadTxt: () => void;
  onDownloadJson: () => void;
  copied: boolean;
}) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Optimized context
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {result.tokenStats.optimizedTokens.toLocaleString()} tokens &middot;
            Goal: {result.meta.goal}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onCopy(result.optimizedText)}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-brand-400 hover:text-brand-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-brand-500 dark:hover:text-brand-400"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            onClick={onDownloadTxt}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-brand-400 hover:text-brand-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-brand-500 dark:hover:text-brand-400"
          >
            .txt
          </button>
          <button
            onClick={onDownloadJson}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-brand-400 hover:text-brand-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-brand-500 dark:hover:text-brand-400"
          >
            .json
          </button>
        </div>
      </div>
      <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
        {result.optimizedText}
      </pre>

      {/* Removed summary */}
      <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-950/30">
        <div className="flex items-start gap-2">
          <svg
            className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
          <div>
            <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
              What was removed
            </p>
            <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-400">
              {result.removedSummary}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ComparisonTab({ result }: { result: OptimizeResponse }) {
  const [view, setView] = useState<"side" | "diff">("side");

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          Side-by-side comparison
        </h3>
        <div className="flex gap-1 rounded-lg border border-slate-200 p-0.5 dark:border-slate-700">
          <button
            onClick={() => setView("side")}
            className={`rounded-md px-2.5 py-1 text-xs font-medium ${
              view === "side"
                ? "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            Side by side
          </button>
          <button
            onClick={() => setView("diff")}
            className={`rounded-md px-2.5 py-1 text-xs font-medium ${
              view === "diff"
                ? "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            Summary
          </button>
        </div>
      </div>

      {view === "side" && (
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              Original ({result.tokenStats.originalTokens.toLocaleString()}{" "}
              tokens)
            </p>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950">
              <p className="text-xs italic text-slate-400 dark:text-slate-500">
                Original text omitted for display. Token savings shown in
                Analysis tab.
              </p>
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              Optimized ({result.tokenStats.optimizedTokens.toLocaleString()}{" "}
              tokens)
            </p>
            <div className="max-h-60 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950">
              <pre className="whitespace-pre-wrap text-xs leading-relaxed text-slate-800 dark:text-slate-200">
                {result.optimizedText}
              </pre>
            </div>
          </div>
        </div>
      )}

      {view === "diff" && (
        <div className="space-y-4">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-950/30">
            <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              Preserved
            </p>
            <p className="mt-0.5 text-xs text-emerald-700 dark:text-emerald-400">
              {result.trustLayer.preservedSummary}
            </p>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-950/30">
            <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
              Removed
            </p>
            <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-400">
              {result.removedSummary}
            </p>
            {result.trustLayer.removedSections.length > 0 && (
              <ul className="mt-2 space-y-1">
                {result.trustLayer.removedSections.map((s, i) => (
                  <li
                    key={i}
                    className="text-xs text-amber-700 dark:text-amber-400"
                  >
                    &bull; {s}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800 dark:bg-blue-950/30">
            <p className="text-xs font-semibold text-blue-800 dark:text-blue-300">
              Optimization reasoning
            </p>
            <p className="mt-0.5 text-xs text-blue-700 dark:text-blue-400">
              {result.trustLayer.optimizationReasoning}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function AnalysisTab({ result }: { result: OptimizeResponse }) {
  const {
    tokenStats,
    costAnalysis,
    latencyEstimate,
    trustLayer,
  } = result;

  const maxForBar = Math.max(tokenStats.originalTokens, 1);

  return (
    <div className="space-y-8">
      {/* Token comparison bar chart */}
      <div>
        <h4 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-200">
          Token comparison
        </h4>
        <div className="space-y-3">
          <BarRow
            label="Original"
            value={tokenStats.originalTokens}
            max={maxForBar}
            color="bg-slate-400 dark:bg-slate-600"
          />
          <BarRow
            label="Optimized"
            value={tokenStats.optimizedTokens}
            max={maxForBar}
            color="bg-brand-500"
          />
          <BarRow
            label="Saved"
            value={tokenStats.tokensSaved}
            max={maxForBar}
            color="bg-emerald-500"
          />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-3 text-center text-xs">
          <div>
            <span className="block text-lg font-bold text-slate-700 dark:text-slate-300">
              {tokenStats.originalTokens.toLocaleString()}
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              Original
            </span>
          </div>
          <div>
            <span className="block text-lg font-bold text-brand-600">
              {tokenStats.optimizedTokens.toLocaleString()}
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              Optimized
            </span>
          </div>
          <div>
            <span className="block text-lg font-bold text-emerald-600">
              {tokenStats.tokensSaved.toLocaleString()}
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              Saved ({tokenStats.percentSaved}%)
            </span>
          </div>
        </div>
      </div>

      {/* Cost analysis */}
      <div>
        <h4 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-200">
          Cost analysis
        </h4>
        <div className="grid gap-3 sm:grid-cols-3">
          <MetricBox
            label="Original cost"
            value={`$${costAnalysis.originalCost.toFixed(6)}`}
          />
          <MetricBox
            label="Optimized cost"
            value={`$${costAnalysis.optimizedCost.toFixed(6)}`}
          />
          <MetricBox
            label="You save"
            value={`$${costAnalysis.savings.toFixed(6)}`}
            accent
          />
        </div>
        <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
          Based on {costAnalysis.model} pricing (${costAnalysis.costPer1kInputTokens.toFixed(5)}/1K input, ${costAnalysis.costPer1kOutputTokens.toFixed(5)}/1K output). Costs scale linearly with volume.
        </p>
      </div>

      {/* Latency estimate */}
      <div>
        <h4 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-200">
          Latency estimate
        </h4>
        <div className="grid gap-3 sm:grid-cols-3">
          <MetricBox
            label="Original"
            value={`${latencyEstimate.originalEstimatedLatencyMs}ms`}
          />
          <MetricBox
            label="Optimized"
            value={`${latencyEstimate.optimizedEstimatedLatencyMs}ms`}
          />
          <MetricBox
            label={`Faster by ${latencyEstimate.reductionPercent}%`}
            value={`${latencyEstimate.reductionMs}ms`}
            accent
          />
        </div>
      </div>

      {/* Trust metrics */}
      <div>
        <h4 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-200">
          Trust &amp; accuracy
        </h4>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Confidence score
            </p>
            <p className="mt-1 text-2xl font-bold text-brand-600">
              {Math.round(trustLayer.confidenceScore * 100)}%
            </p>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                className="h-full rounded-full bg-brand-500 transition-all"
                style={{
                  width: `${trustLayer.confidenceScore * 100}%`,
                }}
              />
            </div>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              How well goal-relevant info is preserved
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Semantic similarity
            </p>
            <p className="mt-1 text-2xl font-bold text-emerald-600">
              {Math.round(trustLayer.semanticSimilarity * 100)}%
            </p>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{
                  width: `${trustLayer.semanticSimilarity * 100}%`,
                }}
              />
            </div>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              Semantic overlap with original content
            </p>
          </div>
        </div>
        <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800 dark:bg-blue-950/30">
          <p className="text-xs font-semibold text-blue-800 dark:text-blue-300">
            Optimization reasoning
          </p>
          <p className="mt-0.5 text-xs text-blue-700 dark:text-blue-400">
            {trustLayer.optimizationReasoning}
          </p>
        </div>
      </div>
    </div>
  );
}

function ApiTab() {
  const [sdkLang, setSdkLang] = useState<"curl" | "js" | "python">("curl");

  const curlExample = `curl -X POST https://aporix.example.com/api/optimize \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "file=@document.pdf" \\
  -F "goal=extract key risks"`;

  const jsExample = `import fs from 'fs';

const formData = new FormData();
formData.append('file', fs.readFileSync('document.pdf'));
formData.append('goal', 'extract key risks');

const res = await fetch('https://aporix.example.com/api/optimize', {
  method: 'POST',
  headers: { Authorization: 'Bearer YOUR_API_KEY' },
  body: formData,
});

const data = await res.json();
console.log(data.optimizedText);`;

  const pythonExample = `import requests

res = requests.post(
    'https://aporix.example.com/api/optimize',
    headers={'Authorization': 'Bearer YOUR_API_KEY'},
    files={'file': open('document.pdf', 'rb')},
    data={'goal': 'extract key risks'}
)

data = res.json()
print(data['optimizedText'])`;

  const examples = {
    curl: curlExample,
    js: jsExample,
    python: pythonExample,
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="mb-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
          API Reference
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Integrate Aporix directly into your pipeline. The API accepts a file
          and goal, returns optimized context with analytics.
        </p>
      </div>

      {/* Endpoint */}
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-950">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Endpoint
        </p>
        <p className="font-mono text-sm font-semibold text-slate-800 dark:text-slate-200">
          POST /api/optimize
        </p>
      </div>

      {/* Request body schema */}
      <div>
        <h5 className="mb-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
          Request body (multipart/form-data)
        </h5>
        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900">
                <th className="px-4 py-2 text-left font-medium text-slate-600 dark:text-slate-400">
                  Field
                </th>
                <th className="px-4 py-2 text-left font-medium text-slate-600 dark:text-slate-400">
                  Type
                </th>
                <th className="px-4 py-2 text-left font-medium text-slate-600 dark:text-slate-400">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              <tr>
                <td className="px-4 py-2 font-mono text-slate-800 dark:text-slate-200">
                  file
                </td>
                <td className="text-slate-600 dark:text-slate-400">File</td>
                <td className="text-slate-600 dark:text-slate-400">
                  PDF, TXT, JSON, or Markdown
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-mono text-slate-800 dark:text-slate-200">
                  goal
                </td>
                <td className="text-slate-600 dark:text-slate-400">string</td>
                <td className="text-slate-600 dark:text-slate-400">
                  Optimization goal/instruction
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* SDK examples */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h5 className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            SDK examples
          </h5>
          <div className="flex gap-1 rounded-lg border border-slate-200 p-0.5 dark:border-slate-700">
            {(
              [
                { id: "curl", label: "cURL" },
                { id: "js", label: "JavaScript" },
                { id: "python", label: "Python" },
              ] as const
            ).map((lang) => (
              <button
                key={lang.id}
                onClick={() => setSdkLang(lang.id)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                  sdkLang === lang.id
                    ? "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>
        <pre className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-950 p-4 text-xs leading-relaxed text-green-400 dark:border-slate-700">
          {examples[sdkLang]}
        </pre>
      </div>

      {/* Response schema */}
      <div>
        <h5 className="mb-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
          Response schema (JSON)
        </h5>
        <pre className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
{`{
  "optimizedText": "string",
  "tokenStats": {
    "originalTokens": 15000,
    "optimizedTokens": 3200,
    "tokensSaved": 11800,
    "percentSaved": 78.7
  },
  "costAnalysis": {
    "model": "GPT-4o mini",
    "originalCost": 0.0045,
    "optimizedCost": 0.00096,
    "savings": 0.00354
  },
  "latencyEstimate": {
    "originalEstimatedLatencyMs": 15500,
    "optimizedEstimatedLatencyMs": 4100,
    "reductionMs": 11400,
    "reductionPercent": 73.5
  },
  "trustLayer": {
    "confidenceScore": 0.93,
    "semanticSimilarity": 0.91,
    "preservedSummary": "string",
    "optimizationReasoning": "string",
    "removedSections": ["..."]
  },
  "meta": {
    "goal": "extract risks",
    "fileName": "report.pdf",
    "fileType": "pdf"
  }
}`}
        </pre>
      </div>

      {/* Coming soon */}
      <div className="rounded-lg border border-dashed border-slate-300 p-4 text-center dark:border-slate-700">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Coming soon: Official SDK packages, webhooks, batch processing, and
          usage dashboards.
        </p>
      </div>
    </div>
  );
}

/* ───── Shared sub-components ───── */

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p
        className={`mt-0.5 text-lg font-bold ${
          accent
            ? "text-brand-600 dark:text-brand-400"
            : "text-slate-800 dark:text-slate-200"
        }`}
      >
        {value}
      </p>
      <p className="text-xs text-slate-400 dark:text-slate-500">{sub}</p>
    </div>
  );
}

function BarRow({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 shrink-0 text-right text-xs text-slate-500 dark:text-slate-400">
        {label}
      </span>
      <div className="flex-1">
        <div className="h-5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className={`h-full rounded-full ${color} transition-all`}
            style={{ width: `${Math.max(pct, 2)}%` }}
          />
        </div>
      </div>
      <span className="w-24 shrink-0 text-right text-xs font-medium text-slate-600 dark:text-slate-300">
        {value.toLocaleString()}
      </span>
    </div>
  );
}

function MetricBox({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p
        className={`mt-0.5 text-base font-bold ${
          accent
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-slate-800 dark:text-slate-200"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
