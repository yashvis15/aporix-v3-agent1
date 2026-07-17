"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import type {
  OptimizeErrorResponse,
  OptimizeResponse,
  SupportedFileType,
} from "@/lib/types";
import {
  Upload,
  FileText,
  Sparkles,
  Copy,
  Check,
  Download,
  AlertTriangle,
  TrendingDown,
  Timer,
  ShieldCheck,
  ChevronDown,
  Code2,
  Menu,
  X,
  Sun,
  Moon,
} from "lucide-react";
import Button from "@/components/ui/Button";

type ApiResult = OptimizeResponse | OptimizeErrorResponse;
type TabId = "output" | "comparison" | "analysis";

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

export default function OptimizeTool() {
  const [file, setFile] = useState<File | null>(null);
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OptimizeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("output");
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [dark, setDark] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canSubmit = !!file && goal.trim().length > 0 && !loading;

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

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
      <div className="bg-[#0F172A] text-[#F8FAFC]">
        <div className="mx-auto max-w-page px-4 sm:px-6 lg:px-8 py-8">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[#F8FAFC]">
                Optimize a Document
              </h2>
              <p className="text-sm text-[#94A3B8] mt-1">
                Upload, set a goal, and get optimized LLM context.
              </p>
            </div>
            <button
              onClick={() => setDark(!dark)}
              className="w-8 h-8 rounded-lg border border-[#334155] flex items-center justify-center text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B] transition-colors"
              aria-label="Toggle theme"
            >
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-6 lg:grid-cols-5">
              {/* Upload area */}
              <div className="lg:col-span-3">
                <label className="mb-1.5 block text-xs font-medium text-[#94A3B8] uppercase tracking-wider">
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
                      ? "border-[#2563EB] bg-[#2563EB]/5"
                      : "border-[#334155] bg-[#1E293B]/50 hover:border-[#2563EB]/40 hover:bg-[#2563EB]/5"
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
                      <div className="w-10 h-10 rounded-xl bg-[#2563EB]/10 border border-[#2563EB]/20 flex items-center justify-center text-[#2563EB] mx-auto mb-3">
                        <FileText className="w-5 h-5" />
                      </div>
                      <p className="text-sm font-medium text-[#F8FAFC]">
                        {file.name}
                      </p>
                      <p className="mt-1 text-xs text-[#64748B]">
                        {(file.size / 1024).toFixed(0)} KB &middot; Click or
                        drag to change
                      </p>
                    </div>
                  ) : (
                    <div>
                      <Upload className="mx-auto mb-3 w-8 h-8 text-[#64748B]" />
                      <p className="text-sm font-medium text-[#94A3B8]">
                        Drop a file or click to upload
                      </p>
                      <div className="mt-3 flex items-center justify-center gap-2">
                        {FILE_TYPE_BADGES.map((b) => (
                          <span
                            key={b.type}
                            className="rounded border border-[#334155] px-2 py-0.5 text-[11px] font-medium text-[#64748B]"
                          >
                            {b.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Goal + button */}
              <div className="lg:col-span-2">
                <label
                  htmlFor="goal"
                  className="mb-1.5 block text-xs font-medium text-[#94A3B8] uppercase tracking-wider"
                >
                  Optimization goal
                </label>
                <input
                  id="goal"
                  type="text"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder='e.g. "extract key risks"'
                  className="w-full rounded-xl border border-[#334155] bg-[#1E293B] px-4 py-2.5 text-sm text-[#F8FAFC] outline-none ring-[#2563EB] focus:ring-2 placeholder:text-[#64748B]"
                />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {GOAL_SUGGESTIONS.map((g) => (
                    <button
                      type="button"
                      key={g}
                      onClick={() => setGoal(g)}
                      className="rounded-full border border-[#334155] bg-[#1E293B]/50 px-2.5 py-0.5 text-[11px] text-[#94A3B8] hover:border-[#2563EB]/40 hover:text-[#2563EB] transition-colors"
                    >
                      {g}
                    </button>
                  ))}
                </div>
                <Button
                  type="submit"
                  disabled={!canSubmit}
                  className="mt-4 w-full"
                  size="lg"
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
                    <span className="flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Optimize
                    </span>
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-[#EF4444]/30 bg-[#EF4444]/5 px-4 py-3 text-sm text-[#EF4444]">
                {error}
              </div>
            )}
          </form>

          {/* Results */}
          {result && (
            <div className="mt-8 animate-fade-in">
              {/* Stats bar */}
              <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-5">
                <StatCard
                  label="Tokens saved"
                  value={`${result.tokenStats.percentSaved}%`}
                  sub={`${result.tokenStats.tokensSaved.toLocaleString()} tokens`}
                  accent
                />
                <StatCard
                  label="Cost savings"
                  value={`$${result.costAnalysis.savings.toFixed(4)}`}
                  sub={result.costAnalysis.model}
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
                      ? `${Math.round(result.trustLayer.semanticSimilarity * 100)}% semantic`
                      : "High accuracy"
                  }
                />
                <StatCard
                  label="Model"
                  value={`${result.debug?.modelUsed ?? "?"}`}
                  sub={`${result.debug?.inputChars?.toLocaleString() ?? "?"}→${result.debug?.outputChars?.toLocaleString() ?? "?"} chars`}
                />
              </div>

              {/* Tabs */}
              <div className="mb-4 border-b border-[#334155]">
                <nav className="flex gap-6">
                  {(
                    [
                      { id: "output", label: "Optimized Text", icon: FileText },
                      { id: "comparison", label: "Comparison", icon: TrendingDown },
                      { id: "analysis", label: "Analysis", icon: Code2 },
                    ] as { id: TabId; label: string; icon: typeof FileText }[]
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 border-b-2 pb-2 text-sm font-medium transition ${
                        activeTab === tab.id
                          ? "border-[#2563EB] text-[#2563EB]"
                          : "border-transparent text-[#64748B] hover:text-[#94A3B8]"
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab content */}
              <div className="rounded-xl border border-[#334155] bg-[#1E293B] p-6">
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
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ───── Sub-components ───── */

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
    <div className="rounded-xl border border-[#334155] bg-[#1E293B] p-4">
      <p className="text-xs text-[#94A3B8]">{label}</p>
      <p
        className={`mt-0.5 text-lg font-bold ${
          accent ? "text-[#2563EB]" : "text-[#F8FAFC]"
        }`}
      >
        {value}
      </p>
      <p className="text-xs text-[#64748B]">{sub}</p>
    </div>
  );
}

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
          <h3 className="text-sm font-semibold text-[#F8FAFC]">
            Optimized context
          </h3>
          <p className="text-xs text-[#64748B]">
            {result.tokenStats.optimizedTokens.toLocaleString()} tokens
            &middot; Goal: {result.meta.goal}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onCopy(result.optimizedText)}
          >
            {copied ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            {copied ? "Copied!" : "Copy"}
          </Button>
          <Button variant="secondary" size="sm" onClick={onDownloadTxt}>
            <Download className="w-3.5 h-3.5" />
            .txt
          </Button>
          <Button variant="secondary" size="sm" onClick={onDownloadJson}>
            <Download className="w-3.5 h-3.5" />
            .json
          </Button>
        </div>
      </div>
      <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-xl border border-[#334155] bg-[#0F172A] p-4 text-sm leading-relaxed text-[#F8FAFC] scrollbar-thin">
        {result.optimizedText}
      </pre>

      {result.removedSummary && (
        <div className="mt-4 rounded-xl border border-[#F59E0B]/30 bg-[#F59E0B]/5 px-4 py-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 w-4 h-4 shrink-0 text-[#F59E0B]" />
            <div>
              <p className="text-xs font-semibold text-[#F59E0B]">
                What was removed
              </p>
              <p className="mt-0.5 text-xs text-[#F59E0B]/80">
                {result.removedSummary}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ComparisonTab({ result }: { result: OptimizeResponse }) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[#10B981]/30 bg-[#10B981]/5 px-4 py-3">
        <p className="text-xs font-semibold text-[#10B981]">Preserved</p>
        <p className="mt-0.5 text-xs text-[#10B981]/80">
          {result.trustLayer.preservedSummary}
        </p>
      </div>
      <div className="rounded-xl border border-[#F59E0B]/30 bg-[#F59E0B]/5 px-4 py-3">
        <p className="text-xs font-semibold text-[#F59E0B]">Removed</p>
        <p className="mt-0.5 text-xs text-[#F59E0B]/80">
          {result.removedSummary}
        </p>
        {result.trustLayer.removedSections.length > 0 && (
          <ul className="mt-2 space-y-1">
            {result.trustLayer.removedSections.map((s, i) => (
              <li key={i} className="text-xs text-[#F59E0B]/70">
                &bull; {s}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="rounded-xl border border-[#2563EB]/30 bg-[#2563EB]/5 px-4 py-3">
        <p className="text-xs font-semibold text-[#2563EB]">
          Optimization reasoning
        </p>
        <p className="mt-0.5 text-xs text-[#2563EB]/80">
          {result.trustLayer.optimizationReasoning}
        </p>
      </div>
    </div>
  );
}

function AnalysisTab({ result }: { result: OptimizeResponse }) {
  const { tokenStats, costAnalysis, latencyEstimate, trustLayer } = result;
  const maxForBar = Math.max(tokenStats.originalTokens, 1);

  return (
    <div className="space-y-8">
      {/* Token comparison */}
      <div>
        <h4 className="mb-3 text-sm font-semibold text-[#F8FAFC]">
          Token comparison
        </h4>
        <div className="space-y-3">
          <BarRow
            label="Original"
            value={tokenStats.originalTokens}
            max={maxForBar}
            color="bg-[#64748B]"
          />
          <BarRow
            label="Optimized"
            value={tokenStats.optimizedTokens}
            max={maxForBar}
            color="bg-[#2563EB]"
          />
          <BarRow
            label="Saved"
            value={tokenStats.tokensSaved}
            max={maxForBar}
            color="bg-[#10B981]"
          />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-3 text-center text-xs">
          <div>
            <span className="block text-lg font-bold text-[#F8FAFC]">
              {tokenStats.originalTokens.toLocaleString()}
            </span>
            <span className="text-[#64748B]">Original</span>
          </div>
          <div>
            <span className="block text-lg font-bold text-[#2563EB]">
              {tokenStats.optimizedTokens.toLocaleString()}
            </span>
            <span className="text-[#64748B]">Optimized</span>
          </div>
          <div>
            <span className="block text-lg font-bold text-[#10B981]">
              {tokenStats.tokensSaved.toLocaleString()}
            </span>
            <span className="text-[#64748B]">
              Saved ({tokenStats.percentSaved}%)
            </span>
          </div>
        </div>
      </div>

      {/* Cost analysis */}
      <div>
        <h4 className="mb-3 text-sm font-semibold text-[#F8FAFC]">
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
        <p className="mt-2 text-xs text-[#64748B]">
          Based on {costAnalysis.model} pricing ($
          {costAnalysis.costPer1kInputTokens.toFixed(5)}/1K input, $
          {costAnalysis.costPer1kOutputTokens.toFixed(5)}/1K output).
        </p>
      </div>

      {/* Latency */}
      <div>
        <h4 className="mb-3 text-sm font-semibold text-[#F8FAFC]">
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

      {/* Trust */}
      <div>
        <h4 className="mb-3 text-sm font-semibold text-[#F8FAFC]">
          Trust &amp; accuracy
        </h4>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-[#334155] p-4">
            <p className="text-xs text-[#94A3B8]">Confidence score</p>
            <p className="mt-1 text-2xl font-bold text-[#2563EB]">
              {Math.round(trustLayer.confidenceScore * 100)}%
            </p>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#334155]">
              <div
                className="h-full rounded-full bg-[#2563EB] transition-all"
                style={{
                  width: `${trustLayer.confidenceScore * 100}%`,
                }}
              />
            </div>
          </div>
          <div className="rounded-xl border border-[#334155] p-4">
            <p className="text-xs text-[#94A3B8]">Semantic similarity</p>
            <p className="mt-1 text-2xl font-bold text-[#10B981]">
              {Math.round(trustLayer.semanticSimilarity * 100)}%
            </p>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#334155]">
              <div
                className="h-full rounded-full bg-[#10B981] transition-all"
                style={{
                  width: `${trustLayer.semanticSimilarity * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
        <div className="mt-3 rounded-xl border border-[#2563EB]/30 bg-[#2563EB]/5 px-4 py-3">
          <p className="text-xs font-semibold text-[#2563EB]">
            Optimization reasoning
          </p>
          <p className="mt-0.5 text-xs text-[#2563EB]/80">
            {trustLayer.optimizationReasoning}
          </p>
        </div>
      </div>
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
      <span className="w-20 shrink-0 text-right text-xs text-[#94A3B8]">
        {label}
      </span>
      <div className="flex-1">
        <div className="h-5 w-full overflow-hidden rounded-full bg-[#0F172A]">
          <div
            className={`h-full rounded-full ${color} transition-all`}
            style={{ width: `${Math.max(pct, 2)}%` }}
          />
        </div>
      </div>
      <span className="w-24 shrink-0 text-right text-xs font-medium text-[#F8FAFC]">
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
    <div className="rounded-xl border border-[#334155] p-4">
      <p className="text-xs text-[#94A3B8]">{label}</p>
      <p
        className={`mt-0.5 text-base font-bold ${
          accent ? "text-[#10B981]" : "text-[#F8FAFC]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
