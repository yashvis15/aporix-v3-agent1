"use client";

import { ArrowUpRight, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";

const NAV_ITEMS = [
  { label: "Features", href: "#features" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "AI Agent", href: "#agent" },
  { label: "Docs", href: "#developer" },
  { label: "FAQ", href: "#faq" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? "bg-[#0F172A]/80 backdrop-blur-lg border-b border-[#334155]/50"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-page px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <a
            href="#"
            className="flex items-center gap-2 text-[#F8FAFC] font-bold text-lg tracking-tight"
          >
            <span className="text-[#2563EB]">A</span>
            porix
          </a>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.href}
                onClick={() => handleNavClick(item.href)}
                className="px-3 py-1.5 text-sm text-[#94A3B8] hover:text-[#F8FAFC] rounded-lg hover:bg-[#1E293B] transition-colors"
              >
                {item.label}
              </button>
            ))}
            <a
              href="https://github.com/yashvis15/aporix-mcp-server"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 text-sm text-[#94A3B8] hover:text-[#F8FAFC] rounded-lg hover:bg-[#1E293B] transition-colors inline-flex items-center gap-1"
            >
              GitHub
              <ArrowUpRight className="w-3 h-3" />
            </a>
            <div className="ml-3">
              <Button
                size="sm"
                onClick={() => handleNavClick("#try-now")}
              >
                Try Now
              </Button>
            </div>
          </nav>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-[#94A3B8] hover:text-[#F8FAFC] rounded-lg"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-[#334155]/50 bg-[#0F172A]/95 backdrop-blur-lg">
          <div className="px-4 py-4 space-y-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.href}
                onClick={() => handleNavClick(item.href)}
                className="block w-full text-left px-3 py-2 text-sm text-[#94A3B8] hover:text-[#F8FAFC] rounded-lg hover:bg-[#1E293B]"
              >
                {item.label}
              </button>
            ))}
            <a
              href="https://github.com/yashvis15/aporix-mcp-server"
              target="_blank"
              rel="noopener noreferrer"
              className="block px-3 py-2 text-sm text-[#94A3B8] hover:text-[#F8FAFC] rounded-lg hover:bg-[#1E293B]"
            >
              GitHub
            </a>
            <div className="pt-2 px-3">
              <Button className="w-full" onClick={() => handleNavClick("#try-now")}>
                Try Now
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
