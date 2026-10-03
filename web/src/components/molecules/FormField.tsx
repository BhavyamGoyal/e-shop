import type { InputHTMLAttributes } from "react";
import { Input, Label, Text } from "../atoms";

export interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  hint?: string;
}

export function FormField({ id, label, hint, ...inputProps }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} {...inputProps} />
      {hint ? (
        <Text tone="muted" className="text-xs">
          {hint}
        </Text>
      ) : null}
    </div>
  );
}
