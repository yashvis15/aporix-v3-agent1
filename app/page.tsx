"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import ProblemSection from "@/components/sections/ProblemSection";
import SolutionSection from "@/components/sections/SolutionSection";
import AgentSection from "@/components/sections/AgentSection";
import ArchitectureSection from "@/components/sections/ArchitectureSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import WhoItsFor from "@/components/sections/WhoItsFor";
import LiveMetrics from "@/components/sections/LiveMetrics";
import DeveloperSection from "@/components/sections/DeveloperSection";
import GettingStarted from "@/components/sections/GettingStarted";
import Roadmap from "@/components/sections/Roadmap";
import SeedUsers from "@/components/sections/SeedUsers";
import Testimonials from "@/components/sections/Testimonials";
import FAQ from "@/components/sections/FAQ";
import FinalCTA from "@/components/sections/FinalCTA";
import OptimizeTool from "@/components/tool/OptimizeTool";

export default function HomePage() {
  return (
    <div className="bg-[#0F172A] text-[#F8FAFC] min-h-screen">
      <Header />
      <main>
        <Hero />
        <ProblemSection />
        <SolutionSection />
        <AgentSection />
        <ArchitectureSection />
        <FeaturesSection />
        <WhoItsFor />
        <LiveMetrics />
        <DeveloperSection />
        <GettingStarted />
        <Roadmap />
        <SeedUsers />
        <Testimonials />
        <FAQ />
        <section id="try-now" className="py-20 md:py-28 border-t border-[#334155]/50">
          <OptimizeTool />
        </section>
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
