import { Label } from "@/components/atoms";
import type { ParamFieldProps } from "./types";

export function BooleanParamField({ definition, value, onChange }: ParamFieldProps) {
  const id: string = `param-${definition.key}`;
  return (
    <div className="flex items-center justify-between gap-3">
      <Label htmlFor={id}>{definition.label}</Label>
      <input
        id={id}
        type="checkbox"
        checked={value === true}
        onChange={(e): void => onChange(e.target.checked)}
        className="size-5 accent-primary"
      />
    </div>
  );
}
