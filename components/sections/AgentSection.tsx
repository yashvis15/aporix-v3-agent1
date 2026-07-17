import {
  Bot,
  MessageCircle,
  FileSearch,
  Brain,
  Cpu,
  Server,
  CheckCircle,
} from "lucide-react";
import SectionTitle from "@/components/ui/SectionTitle";

const features = [
  {
    icon: MessageCircle,
    title: "Telegram Interface",
    description:
      "Interact with Aporix directly through Telegram. Send documents and receive optimized context on the go.",
    color: "#2563EB",
  },
  {
    icon: FileSearch,
    title: "Document Analysis",
    description:
      "Automatic classification and structural analysis of legal, technical, academic, and business documents.",
    color: "#10B981",
  },
  {
    icon: Brain,
    title: "Optimization Strategy",
    description:
      "Goal-driven compression strategies that preserve essential information while removing irrelevant content.",
    color: "#2563EB",
  },
  {
    icon: Cpu,
    title: "Gemini Integration",
    description:
      "Powered by Google Gemini for intelligent document understanding and context-aware optimization.",
    color: "#10B981",
  },
  {
    icon: Server,
    title: "MCP Server",
    description:
      "Model Context Protocol server for seamless integration with AI agents and development tools.",
    color: "#2563EB",
  },
  {
    icon: CheckCircle,
    title: "ERC-8004 Registered",
    description:
      "Verifiable on-chain identity on GOAT Network. Registered as Agent #83 with provable reputation.",
    color: "#10B981",
  },
];

export default function AgentSection() {
  return (
    <section id="agent" className="py-20 md:py-28 border-t border-[#334155]/50">
      <div className="mx-auto max-w-page px-4 sm:px-6 lg:px-8">
        <SectionTitle
          label="AI Agent"
          title="Powered by an Autonomous AI Agent"
          description="Aporix is more than a web application. It is deployed as an OpenClaw / ClawUp AI Agent that can autonomously process document optimization requests — accessible via Telegram, web, or MCP."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group bg-[#1E293B] border border-[#334155] rounded-xl p-5 hover:border-[#2563EB]/30 transition-all duration-200 hover:-translate-y-0.5"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                style={{ backgroundColor: `${f.color}15`, color: f.color }}
              >
                <f.icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-[#F8FAFC]">
                {f.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-[#94A3B8]">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
