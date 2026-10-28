import { Input, Label, Textarea } from "@/components/atoms";
import type { ParamFieldProps } from "./types";

export function TextParamField({ definition, value, onChange }: ParamFieldProps) {
  const id: string = `param-${definition.key}`;
  const text: string = String(value);
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{definition.label}</Label>
      {definition.type === "textarea" ? (
        <Textarea
          id={id}
          rows={2}
          value={text}
          maxLength={definition.maxLength}
          spellCheck={false}
          onChange={(e): void => onChange(e.target.value)}
        />
      ) : (
        <Input
          id={id}
          value={text}
          maxLength={definition.maxLength}
          spellCheck={false}
          onChange={(e): void => onChange(e.target.value)}
        />
      )}
      {definition.maxLength ? (
        <span className="text-xs text-muted-foreground">
          {text.length}/{definition.maxLength}
        </span>
      ) : null}
    </div>
  );
}
