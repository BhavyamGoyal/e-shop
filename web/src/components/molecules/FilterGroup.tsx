"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface FilterGroupProps {
  title: string;
  children: ReactNode;
  selected?: number;
}

export function FilterGroup({ title, children, selected = 0 }: FilterGroupProps) {
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const close = (event: PointerEvent): void => {
      const node = ref.current;
      if (node?.open && event.target instanceof Node && !node.contains(event.target)) node.open = false;
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  return (
    <details ref={ref} className="group relative">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-[#191a0b] hover:border-[#191a0b] group-open:border-[#191a0b] [&::-webkit-details-marker]:hidden">
        {title}
        {selected > 0 && (
          <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#191a0b] px-1 text-xs text-white">
            {selected}
          </span>
        )}
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="transition-transform group-open:rotate-180"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </summary>
      <div className="absolute left-0 top-full z-20 mt-2 flex max-h-80 w-64 flex-col gap-2.5 overflow-y-auto rounded-xl border border-neutral-200 bg-white p-4 shadow-lg">
        {children}
      </div>
    </details>
  );
}
