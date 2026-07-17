"use client";

import { ArrowRight, MessageCircle, GitFork } from "lucide-react";
import Button from "@/components/ui/Button";

export default function FinalCTA() {
  const scrollToTool = () => {
    const el = document.querySelector("#try-now");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="py-20 md:py-28 border-t border-[#334155]/50">
      <div className="mx-auto max-w-page px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#F8FAFC]">
            Ready to Optimize Your AI Context?
          </h2>
          <p className="mt-4 text-base text-[#94A3B8] leading-relaxed">
            Join early adopters who are already reducing token usage, cutting
            costs, and improving LLM response quality.
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
      </div>
    </section>
  );
}
