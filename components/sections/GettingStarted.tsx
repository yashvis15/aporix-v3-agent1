import { Upload, Target, FileOutput, MessageCircle, Play } from "lucide-react";
import SectionTitle from "@/components/ui/SectionTitle";

const webSteps = [
  { icon: Upload, step: "Step 1", title: "Upload a document", description: "Drag and drop a PDF, TXT, JSON, or Markdown file." },
  { icon: Target, step: "Step 2", title: "Choose an optimization goal", description: "Tell Aporix what you need — summarize, extract risks, find key arguments." },
  { icon: FileOutput, step: "Step 3", title: "Receive optimized context", description: "Get clean, compressed context ready for any LLM." },
];

const telegramSteps = [
  { icon: MessageCircle, step: "1", title: "Start a chat", description: "Open Telegram and message the Aporix bot." },
  { icon: Upload, step: "2", title: "Upload document", description: "Send any supported document directly in chat." },
  { icon: FileOutput, step: "3", title: "Receive optimized context", description: "Get optimized text delivered instantly." },
];

function StepCard({ icon: Icon, step, title, description }: typeof webSteps[0] & { step: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-xl bg-[#2563EB]/10 border border-[#2563EB]/20 flex items-center justify-center text-[#2563EB] shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        <div className="w-px flex-1 bg-[#334155] mt-2" />
      </div>
      <div className="pb-8">
        <span className="text-xs font-medium text-[#2563EB]">{step}</span>
        <h4 className="text-sm font-semibold text-[#F8FAFC] mt-0.5">{title}</h4>
        <p className="text-xs text-[#94A3B8] mt-1">{description}</p>
      </div>
    </div>
  );
}

export default function GettingStarted() {
  return (
    <section id="getting-started" className="py-20 md:py-28 border-t border-[#334155]/50">
      <div className="mx-auto max-w-page px-4 sm:px-6 lg:px-8">
        <SectionTitle
          label="Getting Started"
          title="Start Optimizing in Minutes"
          description="Choose your interface — web app or Telegram — and start reducing token usage immediately."
        />
        <div className="mt-12 grid gap-8 md:grid-cols-2">
          <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#2563EB]/10 border border-[#2563EB]/20 flex items-center justify-center text-[#2563EB]">
                <Play className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#F8FAFC]">Web App</h3>
                <p className="text-xs text-[#64748B]">Directly in browser</p>
              </div>
            </div>
            {webSteps.map((s) => (
              <StepCard key={s.step} {...s} />
            ))}
          </div>
          <a
            href="https://t.me/Aporix_optbot"
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-[#1E293B] border border-[#334155] rounded-xl p-6 hover:border-[#10B981]/40 transition-all duration-200 group"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center text-[#10B981] group-hover:bg-[#10B981]/20 transition-colors">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#F8FAFC]">Telegram</h3>
                <p className="text-xs text-[#64748B]">On the go</p>
              </div>
            </div>
            {telegramSteps.map((s) => (
              <StepCard key={s.step} {...s} />
            ))}
            <p className="mt-3 text-xs text-[#94A3B8] leading-relaxed">
              Send <code className="text-[#10B981]">/start</code> to the bot, then upload a document and describe your goal (e.g. "extract key risks" or "summarize this"). The bot runs the full optimization loop and returns compressed output ready to paste into any LLM.
            </p>
          </a>
        </div>
      </div>
    </section>
  );
}
