import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Aporix — AI Context Optimization Agent",
  description:
    "Transform large documents into task-specific LLM context. Reduce token usage, latency, and inference cost with an autonomous AI agent.",
  openGraph: {
    title: "Aporix — AI Context Optimization Agent",
    description:
      "Transform large documents into task-specific LLM context. Reduce token usage, latency, and inference cost.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={`${inter.variable} font-sans min-h-screen antialiased bg-[#0F172A] text-[#F8FAFC]`}>
        {children}
      </body>
    </html>
  );
}
