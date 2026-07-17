import { DollarSign, Clock, AlertTriangle, Layers } from "lucide-react";
import SectionTitle from "@/components/ui/SectionTitle";

const problems = [
  {
    icon: DollarSign,
    title: "High Inference Costs",
    description:
      "LLMs charge per token. Long documents with boilerplate, recitals, and repetitive content waste tokens and drive up API costs unnecessarily.",
    color: "#EF4444",
  },
  {
    icon: Clock,
    title: "Slow Processing",
    description:
      "More tokens means longer processing time. Latency scales linearly with input length, making AI applications feel sluggish and unresponsive.",
    color: "#F59E0B",
  },
  {
    icon: AlertTriangle,
    title: "Lost Context",
    description:
      "Important information gets buried in verbose documents. LLMs with limited context windows miss critical facts when documents are too long.",
    color: "#F59E0B",
  },
  {
    icon: Layers,
    title: "Limited Context Windows",
    description:
      "Even the largest context windows have limits. Dense legal, technical, and academic documents often exceed what LLMs can process in a single pass.",
    color: "#EF4444",
  },
];

export default function ProblemSection() {
  return (
    <section id="features" className="py-20 md:py-28">
      <div className="mx-auto max-w-page px-4 sm:px-6 lg:px-8">
        <SectionTitle
          label="Problem"
          title="Why Context Optimization Matters"
          description="LLMs waste tokens on boilerplate, increasing cost and latency while risking context loss. Without optimization, AI applications become slower, more expensive, and less accurate."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {problems.map((p) => (
            <div
              key={p.title}
              className="group bg-[#1E293B] border border-[#334155] rounded-xl p-5 hover:border-[#2563EB]/30 transition-all duration-200 hover:-translate-y-0.5"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                style={{ backgroundColor: `${p.color}15`, color: p.color }}
              >
                <p.icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-[#F8FAFC]">
                {p.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-[#94A3B8]">
                {p.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
