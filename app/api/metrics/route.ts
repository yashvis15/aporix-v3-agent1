import { NextRequest, NextResponse } from "next/server";

interface Metrics {
  totalOptimizations: number;
  totalTokensSaved: number;
  totalCostSaved: number;
  totalLatencyReductionMs: number;
  totalValidated: number;
}

const metrics: Metrics = {
  totalOptimizations: 0,
  totalTokensSaved: 0,
  totalCostSaved: 0,
  totalLatencyReductionMs: 0,
  totalValidated: 0,
};

export async function GET() {
  const avgTokenReduction =
    metrics.totalOptimizations > 0
      ? metrics.totalTokensSaved / metrics.totalOptimizations
      : 0;
  const avgCostSaved =
    metrics.totalOptimizations > 0
      ? metrics.totalCostSaved / metrics.totalOptimizations
      : 0;
  const avgLatencyReduction =
    metrics.totalOptimizations > 0
      ? metrics.totalLatencyReductionMs / metrics.totalOptimizations
      : 0;

  return NextResponse.json({
    totalOptimizations: metrics.totalOptimizations,
    avgTokenReduction: Math.round(avgTokenReduction),
    totalCostSaved: `$${metrics.totalCostSaved.toFixed(4)}`,
    avgLatencyReduction: Math.round(avgLatencyReduction),
    qualityRate: metrics.totalOptimizations > 0
      ? `${Math.round((metrics.totalValidated / metrics.totalOptimizations) * 100)}%`
      : "—",
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { tokensSaved, costSaved, latencyReductionMs, validated } = body;

  metrics.totalOptimizations += 1;
  metrics.totalTokensSaved += tokensSaved ?? 0;
  metrics.totalCostSaved += costSaved ?? 0;
  metrics.totalLatencyReductionMs += latencyReductionMs ?? 0;
  if (validated) metrics.totalValidated += 1;

  return NextResponse.json({ ok: true });
}
