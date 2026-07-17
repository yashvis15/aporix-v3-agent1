"use client";

import { ArrowRight, MessageCircle, GitFork } from "lucide-react";
import Button from "@/components/ui/Button";

export default function Hero() {
  const scrollToTool = () => {
    const el = document.querySelector("#try-now");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#2563EB]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-[600px] h-[600px] bg-[#2563EB]/3 rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-page px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#334155] bg-[#1E293B]/50 text-xs text-[#94A3B8] mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
            ERC-8004 Registered Agent · Agent #83
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#F8FAFC] leading-[1.1]">
            <span className="text-[#2563EB]">Aporix</span>
            <br />
            AI Agent for Context Optimization
          </h1>

          <p className="mt-5 text-base md:text-lg text-[#94A3B8] leading-relaxed max-w-2xl mx-auto">
            Transform large documents into task-specific LLM context while
            dramatically reducing token usage, latency, and inference cost.
            Built for AI agents, developers, and enterprise AI workflows.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" onClick={scrollToTool}>
              Try Web App
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => {
                const el = document.querySelector("#getting-started");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <MessageCircle className="w-4 h-4" />
              Chat with Telegram Agent
            </Button>
            <a
              href="https://github.com/yashvis15/aporix-mcp-server"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" variant="ghost">
                <GitFork className="w-4 h-4" />
                View GitHub
              </Button>
            </a>
          </div>
        </div>

        {/* Architecture visualization */}
        <div className="mt-16 max-w-3xl mx-auto">
          <div className="relative bg-[#1E293B] border border-[#334155] rounded-xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-2">
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-[#2563EB]/10 border border-[#2563EB]/30 flex items-center justify-center text-[#2563EB] text-xs font-bold">
                  PDF
                </div>
                <span className="text-[10px] text-[#64748B] font-medium">
                  Document
                </span>
              </div>
              <ArrowRight className="w-5 h-5 text-[#64748B] hidden md:block" />
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-[#1E293B] border border-[#334155] flex items-center justify-center text-[#94A3B8] text-xs font-bold">
                  AI
                </div>
                <span className="text-[10px] text-[#64748B] font-medium">
                  Aporix Agent
                </span>
              </div>
              <ArrowRight className="w-5 h-5 text-[#64748B] hidden md:block" />
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-center text-[#10B981] text-xs font-bold">
                  78%
                </div>
                <span className="text-[10px] text-[#64748B] font-medium">
                  Token Savings
                </span>
              </div>
              <ArrowRight className="w-5 h-5 text-[#64748B] hidden md:block" />
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-[#1E293B] border border-[#334155] flex items-center justify-center text-[#94A3B8]">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                </div>
                <span className="text-[10px] text-[#64748B] font-medium">
                  Any LLM
                </span>
              </div>
            </div>

            {/* Mobile arrows */}
            <div className="flex md:hidden items-center justify-center gap-1 mt-4">
              <ArrowRight className="w-4 h-4 text-[#64748B]" />
              <ArrowRight className="w-4 h-4 text-[#64748B]" />
              <ArrowRight className="w-4 h-4 text-[#64748B]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
