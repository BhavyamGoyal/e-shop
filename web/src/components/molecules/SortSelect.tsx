import { SORT_OPTIONS, type SortOption } from "@/server/types/product.types";

const LABELS: Record<SortOption, string> = {
  newest: "Newest",
  oldest: "Oldest",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
  "title-asc": "Name: A to Z",
  "title-desc": "Name: Z to A",
};

interface SortSelectProps {
  value: SortOption;
}

export function SortSelect({ value }: SortSelectProps) {
  return (
    <label className="flex items-center gap-2 text-sm text-neutral-600">
      Sort by
      <select
        name="sort"
        defaultValue={value}
        className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-[#191a0b] outline-none focus:border-[#191a0b]"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {LABELS[option]}
          </option>
        ))}
      </select>
    </label>
  );
}
