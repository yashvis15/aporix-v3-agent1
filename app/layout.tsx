import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aporix — LLM Context Optimizer",
  description:
    "Reduce LLM costs without sacrificing context. Upload a document, set a goal, and get optimized, task-specific context.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
