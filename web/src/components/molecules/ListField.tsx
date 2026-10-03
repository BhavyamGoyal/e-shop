"use client";

import { useState } from "react";
import { FormField } from "./FormField";

export interface ListFieldProps {
  id: string;
  label: string;
  hint?: string;
  values: string[];
  onCommit: (values: string[]) => void;
}

const parse = (raw: string): string[] =>
  raw
    .split(",")
    .map((item: string): string => item.trim())
    .filter((item: string): boolean => item.length > 0);

export function ListField({ id, label, hint, values, onCommit }: ListFieldProps) {
  const [raw, setRaw] = useState<string>(values.join(", "));

  return (
    <FormField
      id={id}
      label={label}
      hint={hint ?? "Comma separated"}
      value={raw}
      onChange={(event) => setRaw(event.target.value)}
      onBlur={() => onCommit(parse(raw))}
    />
  );
}
