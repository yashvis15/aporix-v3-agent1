import {
  User,
  MessageCircle,
  Globe,
  Bot,
  Layers,
  Cpu,
  Sparkles,
  ArrowDown,
} from "lucide-react";
import SectionTitle from "@/components/ui/SectionTitle";

const archItems = [
  { icon: User, label: "User", color: "#94A3B8" },
  { icon: MessageCircle, label: "Telegram", color: "#2563EB" },
  { icon: Globe, label: "Web", color: "#2563EB" },
  { icon: Bot, label: "ClawUp Agent", color: "#10B981" },
  { icon: Server, label: "Aporix MCP Server", color: "#F59E0B" },
  { icon: Layers, label: "Optimization Pipeline", color: "#10B981" },
  { icon: Cpu, label: "Gemini", color: "#2563EB" },
  { icon: Sparkles, label: "Optimized Context", color: "#10B981" },
];

function Server({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 17.25v-.228a4.5 4.5 0 00-.12-1.03l-2.268-9.64a3.375 3.375 0 00-3.285-2.602H7.923a3.375 3.375 0 00-3.285 2.602l-2.268 9.64a4.5 4.5 0 00-.12 1.03v.228m19.5 0a3 3 0 01-3 3H5.25a3 3 0 01-3-3m19.5 0a3 3 0 00-3-3H5.25a3 3 0 00-3 3m16.5 0h.008v.008h-.008v-.008zm-3 0h.008v.008h-.008v-.008z" />
    </svg>
  );
}

export default function ArchitectureSection() {
  return (
    <section className="py-20 md:py-28 border-t border-[#334155]/50">
      <div className="mx-auto max-w-page px-4 sm:px-6 lg:px-8">
        <SectionTitle
          label="Architecture"
          title="System Architecture"
          description="End-to-end architecture showing how documents flow through the Aporix optimization pipeline."
        />
        <div className="mt-12 max-w-3xl mx-auto">
          <div className="flex flex-col items-center gap-2">
            {archItems.map((item, i) => (
              <div key={item.label} className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-xl bg-[#1E293B] border border-[#334155] flex items-center justify-center transition-all duration-200 hover:border-[#2563EB]/30 hover:-translate-y-0.5"
                  style={{ color: item.color }}
                >
                  <item.icon className="w-7 h-7" />
                </div>
                <span className="mt-1.5 text-[11px] text-[#94A3B8] font-medium">
                  {item.label}
                </span>
                {i < archItems.length - 1 && (
                  <ArrowDown className="w-4 h-4 text-[#334155] my-1" />
                )}
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-xs text-[#64748B]">
            Documents flow through the pipeline and return as optimized, validated context.
          </p>
        </div>
      </div>
    </section>
  );
}
