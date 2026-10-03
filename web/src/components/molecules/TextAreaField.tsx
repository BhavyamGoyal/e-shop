import type { TextareaHTMLAttributes } from "react";
import { Label, Text, Textarea } from "../atoms";

export interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string;
  label: string;
  hint?: string;
}

export function TextAreaField({ id, label, hint, ...props }: TextAreaFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Textarea id={id} {...props} />
      {hint ? (
        <Text tone="muted" className="text-xs">
          {hint}
        </Text>
      ) : null}
    </div>
  );
}
