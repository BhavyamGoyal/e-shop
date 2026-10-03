import type { InputHTMLAttributes } from "react";

export interface CheckFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
}

export function CheckField({ label, ...props }: CheckFieldProps) {
  return (
    <label className="flex items-center gap-2 text-sm font-medium text-foreground">
      <input type="checkbox" className="h-4 w-4 accent-primary" {...props} />
      {label}
    </label>
  );
}
