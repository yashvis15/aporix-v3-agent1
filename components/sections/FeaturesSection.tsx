import {
  Wand2,
  Target,
  DollarSign,
  BarChart3,
  ShieldCheck,
  Files,
  FileOutput,
  Zap,
} from "lucide-react";
import SectionTitle from "@/components/ui/SectionTitle";

const features = [
  { icon: Wand2, title: "AI-Powered Optimization", description: "Goal-driven compression that understands document structure and preserves essential information." },
  { icon: Target, title: "Task-Specific Context", description: "Generate context tailored to your specific task — summarization, risk extraction, analysis, and more." },
  { icon: DollarSign, title: "Cost Reduction", description: "Reduce API costs by up to 80% by eliminating unnecessary tokens before they reach the LLM." },
  { icon: BarChart3, title: "Token Savings", description: "Detailed token analytics showing exactly how much you saved and where." },
  { icon: ShieldCheck, title: "Quality Validation", description: "Built-in confidence scoring and semantic similarity metrics to ensure quality is preserved." },
  { icon: Files, title: "Multi-Document Support", description: "PDF, TXT, JSON, and Markdown — with automatic text extraction and structure analysis." },
  { icon: FileOutput, title: "LLM-Ready Output", description: "Clean, compressed text optimized for direct use with any LLM API." },
  { icon: Zap, title: "Fast Processing", description: "Sub-second optimization for most documents, with intelligent caching and parallel processing." },
];

export default function FeaturesSection() {
  return (
    <section className="py-20 md:py-28 border-t border-[#334155]/50">
      <div className="mx-auto max-w-page px-4 sm:px-6 lg:px-8">
        <SectionTitle
          title="Everything You Need"
          description="A complete set of tools for document optimization, quality assurance, and cost management."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="group bg-[#1E293B] border border-[#334155] rounded-xl p-5 hover:border-[#2563EB]/30 transition-all duration-200 hover:-translate-y-0.5"
            >
              <div className="w-10 h-10 rounded-lg bg-[#2563EB]/10 border border-[#2563EB]/20 flex items-center justify-center text-[#2563EB] mb-4 group-hover:bg-[#2563EB]/15 transition-colors">
                <f.icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-[#F8FAFC]">{f.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-[#94A3B8]">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
