"use client";

import type { ParamDefinition } from "@/customizers/core";
import { Button } from "../atoms";
import { ParamRowEditor } from "./ParamRowEditor";

export interface ParamBuilderProps {
  params: ParamDefinition[];
  onChange: (params: ParamDefinition[]) => void;
}

const BLANK: ParamDefinition = { key: "", type: "text", label: "", default: "", mutable: true };

export function ParamBuilder({ params, onChange }: ParamBuilderProps) {
  const patch = (index: number, change: Partial<ParamDefinition>): void =>
    onChange(params.map((item: ParamDefinition, at: number): ParamDefinition => (at === index ? { ...item, ...change } : item)));

  const move = (index: number, direction: -1 | 1): void => {
    const target: number = index + direction;
    if (target < 0 || target >= params.length) return;
    const next: ParamDefinition[] = [...params];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-3">
      {params.map((definition: ParamDefinition, index: number) => (
        <ParamRowEditor
          key={index}
          index={index}
          definition={definition}
          onChange={(change: Partial<ParamDefinition>): void => patch(index, change)}
          onRemove={(): void => onChange(params.filter((_item: ParamDefinition, at: number): boolean => at !== index))}
          onMove={(direction: -1 | 1): void => move(index, direction)}
        />
      ))}
      <div>
        <Button variant="outline" tone="secondary" onClick={() => onChange([...params, BLANK])}>
          Add param
        </Button>
      </div>
    </div>
  );
}
