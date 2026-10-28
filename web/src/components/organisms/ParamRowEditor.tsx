"use client";

import { PARAM_TYPES, type ParamDefinition, type ParamOption, type ParamType } from "@/customizers/core";
import { Button } from "../atoms";
import { Select } from "../atoms/Controls/Select";
import { CheckField, FormField, TextAreaField } from "../molecules";

export interface ParamRowEditorProps {
  index: number;
  definition: ParamDefinition;
  onChange: (patch: Partial<ParamDefinition>) => void;
  onRemove: () => void;
  onMove: (direction: -1 | 1) => void;
}

const TYPE_OPTIONS = PARAM_TYPES.map((type: ParamType) => ({ value: type, label: type }));
const OPTION_TYPES: readonly ParamType[] = ["select", "font"];
const NUMERIC_FIELDS = ["min", "max", "step"] as const;

const optionsToText = (options: ParamOption[] | undefined): string =>
  (options ?? []).map((option: ParamOption): string => `${option.value}|${option.label}`).join("\n");

const textToOptions = (text: string): ParamOption[] =>
  text
    .split("\n")
    .map((line: string): string => line.trim())
    .filter((line: string): boolean => line.length > 0)
    .map((line: string): ParamOption => {
      const [value, ...rest] = line.split("|");
      return { value: value.trim(), label: rest.join("|").trim() || value.trim() };
    });

const parseDefault = (type: ParamType, raw: string): ParamDefinition["default"] => {
  if (type === "number") return Number(raw);
  return raw;
};

export function ParamRowEditor({ index, definition, onChange, onRemove, onMove }: ParamRowEditorProps) {
  const id: string = `param-${index}`;
  const hasOptions: boolean = OPTION_TYPES.includes(definition.type);
  return (
    <div className="flex flex-col gap-3 rounded-md border p-3">
      <div className="grid gap-3 sm:grid-cols-4">
        <FormField id={`${id}-key`} label="Key" value={definition.key} onChange={(e) => onChange({ key: e.target.value })} />
        <FormField id={`${id}-label`} label="Label" value={definition.label} onChange={(e) => onChange({ label: e.target.value })} />
        <FormField id={`${id}-group`} label="Group" value={definition.group ?? ""} onChange={(e) => onChange({ group: e.target.value })} />
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${id}-type`} className="text-sm font-medium">Type</label>
          <Select
            id={`${id}-type`}
            options={TYPE_OPTIONS}
            value={definition.type}
            onChange={(e) => onChange({ type: e.target.value as ParamType })}
          />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        {definition.type === "boolean" ? (
          <CheckField label="Default on" checked={definition.default === true} onChange={(e) => onChange({ default: e.target.checked })} />
        ) : (
          <FormField
            id={`${id}-default`}
            label="Default"
            value={String(definition.default)}
            onChange={(e) => onChange({ default: parseDefault(definition.type, e.target.value) })}
          />
        )}
        {definition.type === "number" &&
          NUMERIC_FIELDS.map((field) => (
            <FormField
              key={field}
              id={`${id}-${field}`}
              label={field}
              type="number"
              value={definition[field] ?? ""}
              onChange={(e) => onChange({ [field]: e.target.value === "" ? undefined : Number(e.target.value) })}
            />
          ))}
        {definition.type === "number" && (
          <FormField id={`${id}-unit`} label="Unit" value={definition.unit ?? ""} onChange={(e) => onChange({ unit: e.target.value })} />
        )}
        {(definition.type === "text" || definition.type === "textarea") && (
          <FormField
            id={`${id}-maxLength`}
            label="Max length"
            type="number"
            value={definition.maxLength ?? ""}
            onChange={(e) => onChange({ maxLength: e.target.value === "" ? undefined : Number(e.target.value) })}
          />
        )}
      </div>
      {hasOptions && (
        <TextAreaField
          key={optionsToText(definition.options)}
          id={`${id}-options`}
          label="Options (one per line: value|label)"
          className="min-h-24 font-mono"
          defaultValue={optionsToText(definition.options)}
          onBlur={(e) => onChange({ options: textToOptions(e.target.value) })}
        />
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <CheckField
          label="Shopper can change this (off = constant)"
          checked={definition.mutable}
          onChange={(e) => onChange({ mutable: e.target.checked })}
        />
        <div className="flex gap-2">
          <Button size="sm" variant="outline" tone="secondary" onClick={() => onMove(-1)}>Up</Button>
          <Button size="sm" variant="outline" tone="secondary" onClick={() => onMove(1)}>Down</Button>
          <Button size="sm" variant="outline" tone="danger" onClick={onRemove}>Remove</Button>
        </div>
      </div>
    </div>
  );
}
