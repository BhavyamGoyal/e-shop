"use client";

import type { MetaDataInput } from "@/server/types/admin.types";
import { Button, Heading, Text } from "../atoms";
import { FormField } from "../molecules";

export interface MetaDataFieldProps {
  metaData: MetaDataInput[];
  onChange: (metaData: MetaDataInput[]) => void;
}

export function MetaDataField({ metaData, onChange }: MetaDataFieldProps) {
  const patch = (index: number, change: Partial<MetaDataInput>): void =>
    onChange(metaData.map((entry: MetaDataInput, at: number): MetaDataInput => (at === index ? { ...entry, ...change } : entry)));

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Heading level={3}>Meta data</Heading>
        <Button variant="outline" tone="secondary" onClick={() => onChange([...metaData, { key: "", value: "" }])}>
          Add entry
        </Button>
      </div>
      {metaData.map((entry, index) => (
        <div key={index} className="grid items-start gap-3 rounded-lg border bg-surface p-3 sm:grid-cols-[1fr_2fr_auto]">
          <FormField
            id={`meta-key-${index}`}
            label="Key"
            value={entry.key}
            onChange={(event) => patch(index, { key: event.target.value })}
          />
          <FormField
            id={`meta-value-${index}`}
            label="Value"
            value={entry.value}
            onChange={(event) => patch(index, { value: event.target.value })}
          />
          <Button
            className="sm:mt-6"
            variant="outline"
            tone="danger"
            onClick={() => onChange(metaData.filter((_: MetaDataInput, at: number): boolean => at !== index))}
          >
            Remove
          </Button>
        </div>
      ))}
      <Text tone="muted">Values are stored as JSON when valid (numbers, true/false, objects, arrays), otherwise as text.</Text>
    </section>
  );
}
