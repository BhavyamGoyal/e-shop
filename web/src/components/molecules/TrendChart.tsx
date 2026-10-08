import { Heading, Text } from "../atoms";
import { Card } from "./Card";

export interface TrendPoint {
  label: string;
  value: number;
}

export interface TrendChartProps {
  title: string;
  points: TrendPoint[];
}

const WIDTH: number = 300;
const HEIGHT: number = 80;
const PAD: number = 4;

function toPath(points: TrendPoint[]): string {
  const max: number = Math.max(...points.map((point: TrendPoint): number => point.value), 1);
  const step: number = points.length > 1 ? (WIDTH - PAD * 2) / (points.length - 1) : 0;
  return points
    .map((point: TrendPoint, index: number): string => {
      const x: number = PAD + index * step;
      const y: number = HEIGHT - PAD - (point.value / max) * (HEIGHT - PAD * 2);
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

export function TrendChart({ title, points }: TrendChartProps) {
  const last: TrendPoint | undefined = points[points.length - 1];
  return (
    <Card className="p-4">
      <div className="flex items-baseline justify-between">
        <Heading level={3} className="text-base">
          {title}
        </Heading>
        <Text tone="muted" className="text-sm">
          {last ? last.value.toLocaleString() : "-"}
        </Text>
      </div>
      {points.length === 0 ? (
        <Text tone="muted" className="mt-3 text-sm">
          No data yet.
        </Text>
      ) : (
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="mt-3 h-20 w-full" role="img" aria-label={title}>
          <path d={toPath(points)} fill="none" strokeWidth={2} strokeLinecap="round" className="stroke-primary" />
        </svg>
      )}
      {last ? (
        <Text tone="muted" className="mt-1 text-xs">
          {points[0].label} to {last.label}
        </Text>
      ) : null}
    </Card>
  );
}
