"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import SectionTitle from "@/components/ui/SectionTitle";

const faqs = [
  {
    q: "What is Aporix?",
    a: "Aporix is an AI agent that optimizes documents into task-specific LLM context. It analyzes document structure, removes boilerplate and irrelevant content, and compresses what remains — reducing token usage by up to 80% while preserving goal-relevant information.",
  },
  {
    q: "How is this different from summarization?",
    a: "Summarization produces a condensed version of the full document. Optimization, by contrast, preserve all goal-relevant facts, dates, names, and obligations while removing only the content that is irrelevant to your specific task. The output is optimized for downstream LLM processing, not human reading.",
  },
  {
    q: "Which models are supported?",
    a: "Aporix is powered by Google Gemini for its optimization pipeline. The output is compatible with any LLM — GPT, Claude, Gemini, Llama, and others. You can use the optimized context with any model or API.",
  },
  {
    q: "How much does it reduce costs?",
    a: "Typical token savings range from 60-80%, depending on the document type and optimization goal. Legal and technical documents with heavy boilerplate see the highest savings. Cost reductions scale linearly with token savings.",
  },
  {
    q: "Can I use Telegram?",
    a: "Yes! Aporix has a Telegram bot that lets you send documents and receive optimized context directly in chat. This is ideal for quick optimization tasks on the go.",
  },
  {
    q: "Is my data stored?",
    a: "Documents are processed in real-time and are not persisted on our servers. The extracted text is sent to Gemini for optimization and discarded after the response is returned. We do not train on your data.",
  },
  {
    q: "What file types are supported?",
    a: "Aporix supports PDF, TXT, JSON, and Markdown files. PDF text extraction is handled via the pdf-parse library, and all supported formats are converted to clean text before optimization.",
  },
  {
    q: "What is the ERC-8004 registration?",
    a: "Aporix is registered as Agent #83 on GOAT Network's ERC-8004 Identity Registry. This provides verifiable on-chain identity, allowing clients and indexers to discover and trust the agent through a decentralized registry.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 md:py-28 border-t border-[#334155]/50">
      <div className="mx-auto max-w-page px-4 sm:px-6 lg:px-8">
        <SectionTitle
          label="FAQ"
          title="Frequently Asked Questions"
          description="Common questions about Aporix, context optimization, and the agent ecosystem."
        />
        <div className="mt-12 max-w-2xl mx-auto space-y-2">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-[#1E293B] border border-[#334155] rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
              >
                <span className="text-sm font-medium text-[#F8FAFC]">
                  {faq.q}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-[#64748B] transition-transform duration-200 ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-200 ${
                  openIndex === i ? "max-h-96" : "max-h-0"
                }`}
              >
                <p className="px-5 pb-4 text-xs leading-relaxed text-[#94A3B8]">
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
