import type { SectionHeadingData } from "@/lib/website-data";

interface SectionHeadingProps {
  heading: SectionHeadingData;
}

export function SectionHeading({ heading }: SectionHeadingProps) {
  const { action } = heading;
  return (
    <div className="mb-5 flex items-end justify-between">
      <div>
        <h2
          className="m-0 p-0"
          style={{
            textAlign: heading.align,
            color: heading.color,
            fontWeight: heading.weight,
            fontSize: `clamp(20px, 3vw, ${heading.size}px)`,
          }}
        >
          {heading.title}
        </h2>
        {heading.subtitle && (
          <p className="mt-2 max-w-[560px] text-base" style={{ color: heading.color }}>
            {heading.subtitle}
          </p>
        )}
      </div>
      {action && (
        <a
          href={action.href}
          className="hidden shrink-0 items-center gap-1.5 rounded-lg border px-4 py-2.5 text-sm font-semibold md:flex"
          style={{ backgroundColor: action.background, color: action.color, borderColor: action.borderColor }}
        >
          {action.label}
        </a>
      )}
    </div>
  );
}
