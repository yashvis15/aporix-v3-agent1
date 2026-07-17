"use client";

import { Users, ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";

export default function SeedUsers() {
  return (
    <section className="py-20 md:py-28 border-t border-[#334155]/50">
      <div className="mx-auto max-w-page px-4 sm:px-6 lg:px-8">
        <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-8 md:p-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-12 h-12 rounded-xl bg-[#2563EB]/10 border border-[#2563EB]/20 flex items-center justify-center text-[#2563EB] mx-auto mb-5">
              <Users className="w-6 h-6" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#F8FAFC]">
              Built For Early Adopters
            </h2>
            <p className="mt-3 text-sm md:text-base text-[#94A3B8] leading-relaxed">
              Aporix is designed for AI engineers building LLM applications,
              developers using RAG pipelines, startups deploying AI agents,
              legal professionals processing contracts, and researchers
              working with long documents.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs text-[#64748B]">
              {[
                "AI Engineers",
                "RAG Developers",
                "AI Agent Startups",
                "Legal Professionals",
                "Researchers",
              ].map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full border border-[#334155] bg-[#0F172A] text-[#94A3B8]"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="mt-8">
              <Button
                size="lg"
                onClick={() => {
                  const el = document.querySelector("#try-now");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Try Aporix Now
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
