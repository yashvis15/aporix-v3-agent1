import {
  Upload,
  FileSearch,
  Brain,
  Minimize2,
  ShieldCheck,
  FileOutput,
  ArrowDown,
} from "lucide-react";
import SectionTitle from "@/components/ui/SectionTitle";

const steps = [
  { icon: Upload, label: "Upload Document" },
  { icon: FileSearch, label: "Analyze Structure" },
  { icon: Brain, label: "Generate Strategy" },
  { icon: Minimize2, label: "Compress Context" },
  { icon: ShieldCheck, label: "Validate Quality" },
  { icon: FileOutput, label: "Optimized Context" },
];

export default function SolutionSection() {
  return (
    <section id="how-it-works" className="py-20 md:py-28 border-t border-[#334155]/50">
      <div className="mx-auto max-w-page px-4 sm:px-6 lg:px-8">
        <SectionTitle
          label="How It Works"
          title="From Document to Optimized Context"
          description="Aporix analyzes, compresses, and validates documents into task-specific context — ready for any LLM."
        />
        <div className="mt-12">
          <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-0">
            {steps.map((step, i) => (
              <div key={step.label} className="flex items-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 rounded-xl bg-[#1E293B] border border-[#334155] flex items-center justify-center text-[#2563EB] group hover:border-[#2563EB]/40 hover:bg-[#2563EB]/5 transition-all duration-200">
                    <step.icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] text-[#94A3B8] font-medium text-center max-w-[80px] leading-tight">
                    {step.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <ArrowDown className="w-4 h-4 text-[#334155] mx-3 md:hidden" />
                )}
                {i < steps.length - 1 && (
                  <div className="hidden md:flex items-center mx-4">
                    <div className="w-8 h-px bg-[#334155]" />
                    <ArrowDown className="w-3 h-3 text-[#334155] -ml-1 rotate-[-90deg]" />
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-[#64748B]">
            Use with any LLM · GPT · Claude · Gemini · Llama
          </p>
        </div>
      </div>
    </section>
  );
}
