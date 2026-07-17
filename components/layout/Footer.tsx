import { GitFork, MessageCircle, BookOpen, ExternalLink } from "lucide-react";

const footerLinks = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "How it Works", href: "#how-it-works" },
      { label: "AI Agent", href: "#agent" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "#developer" },
      { label: "API Reference", href: "#try-now" },
      { label: "GitHub", href: "https://github.com/yashvis15/aporix-mcp-server" },
      { label: "Roadmap", href: "#roadmap" },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "Telegram", href: "#" },
      { label: "Twitter", href: "#" },
      { label: "8004scan", href: "https://8004scan.io/agents/2345/83" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-[#334155] bg-[#0F172A]">
      <div className="mx-auto max-w-page px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <a href="#" className="flex items-center gap-2 text-[#F8FAFC] font-bold text-lg tracking-tight">
              <span className="text-[#2563EB]">A</span>porix
            </a>
            <p className="mt-3 text-sm text-[#64748B] leading-relaxed max-w-xs">
              AI-powered context optimization for LLMs. Reduce token usage,
              latency, and cost without sacrificing relevant information.
            </p>
          </div>
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h4 className="text-xs font-semibold tracking-wider uppercase text-[#94A3B8] mb-3">
                {group.title}
              </h4>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-[#64748B] hover:text-[#F8FAFC] transition-colors inline-flex items-center gap-1"
                    >
                      {link.label}
                      {link.href.startsWith("http") && (
                        <ExternalLink className="w-3 h-3" />
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-[#334155] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#64748B]">
            &copy; {new Date().getFullYear()} Aporix. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-[#64748B]">
            <span>Built with</span>
            <span className="text-[#94A3B8]">Next.js</span>
            <span className="text-[#334155]">·</span>
            <span className="text-[#94A3B8]">Gemini</span>
            <span className="text-[#334155]">·</span>
            <span className="text-[#94A3B8]">OpenClaw</span>
            <span className="text-[#334155]">·</span>
            <span className="text-[#94A3B8]">GOAT Network</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
