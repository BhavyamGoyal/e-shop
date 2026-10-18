"use client";

import type { ReviewedInput } from "@/server/types/admin.types";
import { Heading } from "../atoms";
import { CheckField } from "../molecules";

export interface ReviewedFieldProps {
  reviewed: ReviewedInput;
  onChange: (reviewed: ReviewedInput) => void;
}

const ITEMS: { key: keyof ReviewedInput; label: string }[] = [
  { key: "title", label: "Title reviewed" },
  { key: "description", label: "Description reviewed" },
  { key: "images", label: "Images reviewed" },
];

export function ReviewedField({ reviewed, onChange }: ReviewedFieldProps) {
  return (
    <section className="flex flex-col gap-3">
      <Heading level={3}>Reviewed</Heading>
      <div className="flex flex-wrap gap-6">
        {ITEMS.map(({ key, label }) => (
          <CheckField
            key={key}
            label={label}
            checked={reviewed[key]}
            onChange={(e) => onChange({ ...reviewed, [key]: e.target.checked })}
          />
        ))}
      </div>
    </section>
  );
}
