interface FilterOptionProps {
  name: string;
  value: string;
  label: string;
  count?: number;
  checked: boolean;
}

export function FilterOption({ name, value, label, count, checked }: FilterOptionProps) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-foreground">
      <input
        type="checkbox"
        name={name}
        value={value}
        defaultChecked={checked}
        className="h-4 w-4 accent-primary"
      />
      <span className="flex-1">{label}</span>
      {count !== undefined && <span className="text-xs text-muted-foreground">{count}</span>}
    </label>
  );
}
