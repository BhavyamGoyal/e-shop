"use client";

import type { CostInput } from "@/server/types/admin.types";
import { Button, Heading, Text } from "../atoms";
import { FormField } from "../molecules";

export interface CostsFieldProps {
  costs: CostInput[];
  onChange: (costs: CostInput[]) => void;
}

export function CostsField({ costs, onChange }: CostsFieldProps) {
  const patch = (index: number, change: Partial<CostInput>): void =>
    onChange(costs.map((cost: CostInput, at: number): CostInput => (at === index ? { ...cost, ...change } : cost)));

  const total: number = costs.reduce((sum: number, cost: CostInput): number => sum + (cost.amount || 0), 0);

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Heading level={3}>Costs</Heading>
        <Button variant="outline" tone="secondary" onClick={() => onChange([...costs, { name: "", amount: 0 }])}>
          Add cost
        </Button>
      </div>
      {costs.map((cost, index) => (
        <div key={index} className="grid items-start gap-3 rounded-lg border bg-surface p-3 sm:grid-cols-[1fr_200px_auto]">
          <FormField
            id={`cost-name-${index}`}
            label="Name"
            value={cost.name}
            onChange={(event) => patch(index, { name: event.target.value })}
            placeholder="Packaging"
          />
          <FormField
            id={`cost-amount-${index}`}
            label="Amount (₹)"
            type="number"
            min={0}
            value={cost.amount}
            onChange={(event) => patch(index, { amount: Number(event.target.value) })}
          />
          <Button
            className="sm:mt-6"
            variant="outline"
            tone="danger"
            onClick={() => onChange(costs.filter((_: CostInput, at: number): boolean => at !== index))}
          >
            Remove
          </Button>
        </div>
      ))}
      <Text tone="muted">Total cost: ₹{total}</Text>
    </section>
  );
}
