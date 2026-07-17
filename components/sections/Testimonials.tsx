import { MessageSquareQuote } from "lucide-react";
import SectionTitle from "@/components/ui/SectionTitle";

const placeholders = [
  {
    text: "Aporix reduced our LLM costs by over 70% while maintaining the quality of our extracted insights. The goal-driven compression is a game changer for our legal document pipeline.",
    role: "AI Engineer",
    company: "Enterprise Legal Tech",
  },
  {
    text: "We process thousands of academic papers monthly. Aporix helps us cut token usage in half without losing the information we need for our research aggregation platform.",
    role: "ML Engineer",
    company: "Research Platform",
  },
  {
    text: "The MCP server integration was seamless. Our AI agents now automatically optimize context before passing it to our reasoning models. The Telegram interface is a nice bonus.",
    role: "Founder",
    company: "AI Agent Startup",
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 md:py-28 border-t border-[#334155]/50">
      <div className="mx-auto max-w-page px-4 sm:px-6 lg:px-8">
        <SectionTitle
          label="Testimonials"
          title="What Users Say"
          description="Early feedback from developers and teams using Aporix."
        />
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {placeholders.map((t, i) => (
            <div
              key={i}
              className="bg-[#1E293B] border border-[#334155] rounded-xl p-5 flex flex-col"
            >
              <MessageSquareQuote className="w-5 h-5 text-[#2563EB]/30 mb-3" />
              <p className="text-xs leading-relaxed text-[#94A3B8] flex-1">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="mt-4 pt-4 border-t border-[#334155]">
                <p className="text-xs font-medium text-[#F8FAFC]">{t.role}</p>
                <p className="text-xs text-[#64748B]">{t.company}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-[#64748B]">
          Placeholder testimonials — real quotes coming soon.
        </p>
      </div>
    </section>
  );
}
