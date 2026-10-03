"use client";

import type { OptionInput } from "@/server/types/admin.types";
import { Button, Heading } from "../atoms";
import { FormField, ListField } from "../molecules";

export interface OptionsFieldProps {
  options: OptionInput[];
  onChange: (options: OptionInput[]) => void;
}

export function OptionsField({ options, onChange }: OptionsFieldProps) {
  const patch = (index: number, change: Partial<OptionInput>): void =>
    onChange(options.map((option: OptionInput, at: number): OptionInput => (at === index ? { ...option, ...change } : option)));

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Heading level={3}>Options</Heading>
        <Button variant="outline" tone="secondary" onClick={() => onChange([...options, { name: "", values: [] }])}>
          Add option
        </Button>
      </div>
      {options.map((option, index) => (
        <div key={index} className="grid items-start gap-3 rounded-lg border bg-surface p-3 sm:grid-cols-[200px_1fr_auto]">
          <FormField
            id={`option-name-${index}`}
            label="Name"
            value={option.name}
            onChange={(event) => patch(index, { name: event.target.value })}
            placeholder="Size"
          />
          <ListField
            id={`option-values-${index}`}
            label="Values"
            values={option.values}
            onCommit={(values: string[]) => patch(index, { values })}
          />
          <Button
            className="sm:mt-6"
            variant="outline"
            tone="danger"
            onClick={() => onChange(options.filter((_: OptionInput, at: number): boolean => at !== index))}
          >
            Remove
          </Button>
        </div>
      ))}
    </section>
  );
}
