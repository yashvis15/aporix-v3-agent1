import { CheckCircle2, Clock, Circle } from "lucide-react";
import SectionTitle from "@/components/ui/SectionTitle";

const items = [
  {
    status: "completed" as const,
    title: "AI Optimization Pipeline",
    description: "Core document analysis and compression engine powered by Gemini.",
  },
  {
    status: "completed" as const,
    title: "Web Interface",
    description: "Full-featured web application with drag-and-drop, tabs, and analytics.",
  },
  {
    status: "completed" as const,
    title: "Telegram Agent",
    description: "Telegram bot for on-the-go document optimization.",
  },
  {
    status: "completed" as const,
    title: "MCP Server",
    description: "Model Context Protocol server for AI agent integration.",
  },
  {
    status: "completed" as const,
    title: "ERC-8004 Registration",
    description: "On-chain agent identity on GOAT Network (Agent #83).",
  },
  {
    status: "in-progress" as const,
    title: "x402 Payments",
    description: "Pay-per-request micropayments for API access.",
  },
  {
    status: "planned" as const,
    title: "Multi-Model Support",
    description: "Support for GPT, Claude, Llama, and other LLM providers.",
  },
  {
    status: "planned" as const,
    title: "Enterprise Dashboard",
    description: "Usage analytics, team management, and billing.",
  },
  {
    status: "planned" as const,
    title: "Batch Optimization",
    description: "Process multiple documents simultaneously.",
  },
  {
    status: "planned" as const,
    title: "Collaboration",
    description: "Shared workspaces and team workflows.",
  },
  {
    status: "planned" as const,
    title: "Usage Analytics",
    description: "Detailed metrics on token savings, costs, and usage patterns.",
  },
];

const statusConfig = {
  completed: {
    icon: CheckCircle2,
    color: "#10B981",
    label: "Completed",
  },
  "in-progress": {
    icon: Clock,
    color: "#F59E0B",
    label: "In Progress",
  },
  planned: {
    icon: Circle,
    color: "#64748B",
    label: "Planned",
  },
};

export default function Roadmap() {
  return (
    <section id="roadmap" className="py-20 md:py-28 border-t border-[#334155]/50">
      <div className="mx-auto max-w-page px-4 sm:px-6 lg:px-8">
        <SectionTitle
          label="Roadmap"
          title="What's Next"
          description="Aporix is actively developed. Here's what we've shipped and what's coming."
        />
        <div className="mt-12 max-w-2xl mx-auto">
          <div className="relative">
            <div className="absolute left-[19px] top-2 bottom-2 w-px bg-[#334155]" />
            <div className="space-y-6">
              {items.map((item) => {
                const cfg = statusConfig[item.status];
                const Icon = cfg.icon;
                return (
                  <div key={item.title} className="flex gap-4 relative">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 relative z-10"
                      style={{
                        backgroundColor: `${cfg.color}15`,
                        color: cfg.color,
                        borderColor: `${cfg.color}30`,
                        borderWidth: 1,
                      }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="pt-1.5">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-[#F8FAFC]">
                          {item.title}
                        </h3>
                        <span
                          className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                          style={{
                            backgroundColor: `${cfg.color}15`,
                            color: cfg.color,
                          }}
                        >
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-[#94A3B8] mt-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
