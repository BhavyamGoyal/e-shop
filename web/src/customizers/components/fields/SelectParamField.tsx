import { Label } from "@/components/atoms";
import { Select } from "@/components/atoms/Controls/Select";
import type { ParamFieldProps } from "./types";

export function SelectParamField({ definition, value, onChange }: ParamFieldProps) {
  const id: string = `param-${definition.key}`;
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{definition.label}</Label>
      <Select
        id={id}
        options={definition.options ?? []}
        value={String(value)}
        onChange={(e): void => onChange(e.target.value)}
      />
    </div>
  );
}
