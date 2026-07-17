interface SectionTitleProps {
  label?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}

export default function SectionTitle({
  label,
  title,
  description,
  align = "center",
}: SectionTitleProps) {
  return (
    <div
      className={`max-w-2xl ${align === "center" ? "mx-auto text-center" : ""}`}
    >
      {label && (
        <span className="inline-block mb-3 text-xs font-semibold tracking-widest uppercase text-[#2563EB]">
          {label}
        </span>
      )}
      <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#F8FAFC]">
        {title}
      </h2>
      {description && (
        <p className="mt-3 text-sm md:text-base leading-relaxed text-[#94A3B8]">
          {description}
        </p>
      )}
    </div>
  );
}
