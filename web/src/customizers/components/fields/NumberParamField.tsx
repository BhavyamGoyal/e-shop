import { Label } from "@/components/atoms";
import type { ParamFieldProps } from "./types";

export function NumberParamField({ definition, value, onChange }: ParamFieldProps) {
  const id: string = `param-${definition.key}`;
  const unit: string = definition.unit ? ` ${definition.unit}` : "";
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={id}>{definition.label}</Label>
        <span className="text-xs text-muted-foreground">
          {Number(value)}
          {unit}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={definition.min}
        max={definition.max}
        step={definition.step ?? 1}
        value={Number(value)}
        onChange={(e): void => onChange(Number(e.target.value))}
        className="w-full accent-primary"
      />
    </div>
  );
}
