import { Heading, Text } from "../atoms";
import { Card } from "./Card";

export interface BarItem {
  label: string;
  value: number;
}

export interface BarListProps {
  title: string;
  items: BarItem[];
}

const MAX_ITEMS: number = 8;

export function BarList({ title, items }: BarListProps) {
  const shown: BarItem[] = [...items].sort((a: BarItem, b: BarItem): number => b.value - a.value).slice(0, MAX_ITEMS);
  const max: number = Math.max(...shown.map((item: BarItem): number => item.value), 1);
  return (
    <Card className="p-4">
      <Heading level={3} className="text-base">
        {title}
      </Heading>
      <ul className="mt-3 flex flex-col gap-2">
        {shown.map((item: BarItem) => (
          <li key={item.label} className="text-sm">
            <div className="flex justify-between">
              <span>{item.label}</span>
              <Text tone="muted">{item.value.toLocaleString()}</Text>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${(item.value / max) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
