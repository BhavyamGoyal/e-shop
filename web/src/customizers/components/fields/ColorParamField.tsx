import { Label } from "@/components/atoms";
import type { ParamFieldProps } from "./types";

export function ColorParamField({ definition, value, onChange }: ParamFieldProps) {
  const id: string = `param-${definition.key}`;
  return (
    <div className="flex items-center justify-between gap-3">
      <Label htmlFor={id}>{definition.label}</Label>
      <input
        id={id}
        type="color"
        value={String(value)}
        onChange={(e): void => onChange(e.target.value)}
        className="h-9 w-14 cursor-pointer rounded-md border border-border bg-background p-1"
      />
    </div>
  );
}
