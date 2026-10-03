const ITEMS: string[] = ["3D printed to order", "Biodegradable PLA", "Designed in-house", "Made in India"];

export function TrustGrid() {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-[18px] border border-(--pp-line-soft) bg-(--pp-card) p-[18px]">
      {ITEMS.map((item: string) => (
        <div key={item} className="flex items-center gap-2.5 text-[13.5px] font-medium text-(--pp-ink)">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--pp-green-l)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M8 12.5l3 3 5-6" />
          </svg>
          {item}
        </div>
      ))}
    </div>
  );
}
