import {
  GitFork,
  BookOpen,
  Layout,
  Server,
  MessageCircle,
  CreditCard,
} from "lucide-react";
import SectionTitle from "@/components/ui/SectionTitle";

const resources = [
  {
    icon: GitFork,
    title: "GitHub Repository",
    description: "Explore the source code, contribute, and star the project.",
    href: "https://github.com/yashvis15/aporix-mcp-server",
    color: "#F8FAFC",
  },
  {
    icon: BookOpen,
    title: "API Documentation",
    description: "Complete API reference for integrating Aporix into your pipeline.",
    href: "#try-now",
    color: "#2563EB",
  },
  {
    icon: Layout,
    title: "Architecture",
    description: "Deep dive into the system design and optimization pipeline.",
    href: "#",
    color: "#10B981",
  },
  {
    icon: Server,
    title: "MCP Server",
    description: "Model Context Protocol server for agent-to-tool communication.",
    href: "https://github.com/yashvis15/aporix-mcp-server",
    color: "#F59E0B",
  },
  {
    icon: MessageCircle,
    title: "Telegram Agent",
    description: "Interact with Aporix directly through Telegram.",
    href: "#",
    color: "#2563EB",
  },
  {
    icon: CreditCard,
    title: "x402 Payments",
    description: "Coming soon — pay-per-request with x402 micropayments.",
    href: "#",
    color: "#64748B",
  },
];

export default function DeveloperSection() {
  return (
    <section id="developer" className="py-20 md:py-28 border-t border-[#334155]/50">
      <div className="mx-auto max-w-page px-4 sm:px-6 lg:px-8">
        <SectionTitle
          label="Resources"
          title="Developer Resources"
          description="Everything you need to integrate, extend, and deploy with Aporix."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((r) => (
            <a
              key={r.title}
              href={r.href}
              target={r.href.startsWith("http") ? "_blank" : undefined}
              rel={r.href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="group bg-[#1E293B] border border-[#334155] rounded-xl p-5 hover:border-[#2563EB]/30 transition-all duration-200 hover:-translate-y-0.5 block"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                style={{ backgroundColor: `${r.color}15`, color: r.color }}
              >
                <r.icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-[#F8FAFC] group-hover:text-[#2563EB] transition-colors">
                {r.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-[#94A3B8]">
                {r.description}
              </p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
