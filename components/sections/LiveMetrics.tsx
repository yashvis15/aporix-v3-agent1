"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  TrendingDown,
  DollarSign,
  Timer,
  ShieldCheck,
} from "lucide-react";
import SectionTitle from "@/components/ui/SectionTitle";

interface MetricProps {
  icon: typeof FileText;
  label: string;
  value: string;
  sub: string;
  color: string;
}

function MetricCard({ icon: Icon, label, value, sub, color }: MetricProps) {
  return (
    <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-5 hover:border-[#2563EB]/30 transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">
          {label}
        </span>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}15`, color }}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-2xl font-bold text-[#F8FAFC] tracking-tight">
        {value}
      </p>
      <p className="mt-1 text-xs text-[#64748B]">{sub}</p>
    </div>
  );
}

const metrics: MetricProps[] = [
  {
    icon: FileText,
    label: "Documents Optimized",
    value: "—",
    sub: "Coming soon with analytics integration",
    color: "#2563EB",
  },
  {
    icon: TrendingDown,
    label: "Average Token Reduction",
    value: "—",
    sub: "Coming soon with analytics integration",
    color: "#10B981",
  },
  {
    icon: DollarSign,
    label: "Estimated Cost Savings",
    value: "—",
    sub: "Coming soon with analytics integration",
    color: "#10B981",
  },
  {
    icon: Timer,
    label: "Avg Latency Reduction",
    value: "—",
    sub: "Coming soon with analytics integration",
    color: "#2563EB",
  },
  {
    icon: ShieldCheck,
    label: "Quality Validation Rate",
    value: "—",
    sub: "Coming soon with analytics integration",
    color: "#10B981",
  },
];

async function fetchMetrics(): Promise<Record<string, string | number>> {
  try {
    const res = await fetch("/api/metrics");
    return await res.json();
  } catch {
    return {};
  }
}

export default function LiveMetrics() {
  const [data, setData] = useState<Record<string, string | number> | null>(null);

  useEffect(() => {
    fetchMetrics().then(setData);
    const interval = setInterval(() => fetchMetrics().then(setData), 10000);
    return () => clearInterval(interval);
  }, []);

  const live: MetricProps[] = [
    {
      icon: FileText,
      label: "Documents Optimized",
      value: data ? String(data.totalOptimizations ?? "—") : "—",
      sub: "All time",
      color: "#2563EB",
    },
    {
      icon: TrendingDown,
      label: "Average Token Reduction",
      value: data ? `${data.avgTokenReduction ?? "—"}%` : "—",
      sub: "Per document",
      color: "#10B981",
    },
    {
      icon: DollarSign,
      label: "Estimated Cost Savings",
      value: data ? String(data.totalCostSaved ?? "—") : "—",
      sub: "Total saved",
      color: "#10B981",
    },
    {
      icon: Timer,
      label: "Avg Latency Reduction",
      value: data ? `${data.avgLatencyReduction ?? "—"}ms` : "—",
      sub: "Per document",
      color: "#2563EB",
    },
    {
      icon: ShieldCheck,
      label: "Quality Validation Rate",
      value: data ? String(data.qualityRate ?? "—") : "—",
      sub: "Confidence > 70%",
      color: "#10B981",
    },
  ];

  return (
    <section className="py-20 md:py-28 border-t border-[#334155]/50">
      <div className="mx-auto max-w-page px-4 sm:px-6 lg:px-8">
        <SectionTitle
          label="Live Metrics"
          title="Real-Time Performance"
          description="Aggregate metrics across all document optimizations. Live data will appear as usage grows."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {live.map((m) => (
            <MetricCard key={m.label} {...m} />
          ))}
        </div>
      </div>
    </section>
  );
}
