import { Code2, Scale, BookOpen, Building2, GraduationCap } from "lucide-react";
import SectionTitle from "@/components/ui/SectionTitle";

const users = [
  {
    icon: Code2,
    title: "AI Developers",
    description: "Reduce API costs and improve response times in LLM-powered applications and pipelines.",
    color: "#2563EB",
  },
  {
    icon: Scale,
    title: "Legal Teams",
    description: "Process contracts, agreements, and compliance documents faster with goal-specific extraction.",
    color: "#10B981",
  },
  {
    icon: BookOpen,
    title: "Researchers",
    description: "Analyze large academic papers and technical reports without losing critical findings.",
    color: "#2563EB",
  },
  {
    icon: Building2,
    title: "Enterprises",
    description: "Scale AI pipelines across departments with consistent, cost-efficient context optimization.",
    color: "#10B981",
  },
  {
    icon: GraduationCap,
    title: "Students",
    description: "Optimize study materials, lecture notes, and textbooks for faster comprehension and review.",
    color: "#2563EB",
  },
];

export default function WhoItsFor() {
  return (
    <section className="py-20 md:py-28 border-t border-[#334155]/50">
      <div className="mx-auto max-w-page px-4 sm:px-6 lg:px-8">
        <SectionTitle
          label="Audience"
          title="Who Is Aporix For?"
          description="From individual developers to enterprise teams — Aporix serves anyone working with LLMs and long documents."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {users.map((u) => (
            <div
              key={u.title}
              className="group bg-[#1E293B] border border-[#334155] rounded-xl p-5 hover:border-[#2563EB]/30 transition-all duration-200 hover:-translate-y-0.5"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                style={{ backgroundColor: `${u.color}15`, color: u.color }}
              >
                <u.icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-[#F8FAFC]">{u.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-[#94A3B8]">{u.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
