interface FilterOptionProps {
  name: string;
  value: string;
  label: string;
  count?: number;
  checked: boolean;
}

export function FilterOption({ name, value, label, count, checked }: FilterOptionProps) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[#191a0b]">
      <input
        type="checkbox"
        name={name}
        value={value}
        defaultChecked={checked}
        className="h-4 w-4 accent-[#191a0b]"
      />
      <span className="flex-1">{label}</span>
      {count !== undefined && <span className="text-xs text-neutral-400">{count}</span>}
    </label>
  );
}
