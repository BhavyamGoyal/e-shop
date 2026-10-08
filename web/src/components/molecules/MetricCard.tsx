import { Text } from "../atoms";
import { Card } from "./Card";

export interface MetricCardProps {
  label: string;
  value: number;
}

export function MetricCard({ label, value }: MetricCardProps) {
  return (
    <Card className="p-4">
      <Text tone="muted" className="text-sm">
        {label}
      </Text>
      <p className="mt-1 text-2xl font-semibold">{value.toLocaleString()}</p>
    </Card>
  );
}
