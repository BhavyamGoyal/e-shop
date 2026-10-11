import { Badge, type Tone } from "../atoms";

const TONES: Record<string, Tone> = {
  paid: "success",
  captured: "success",
  shipped: "accent",
  delivered: "success",
  pending: "warning",
  created: "warning",
  failed: "danger",
  cancelled: "danger",
};

export function StatusBadge({ status }: { status: string }) {
  return <Badge tone={TONES[status] ?? "secondary"}>{status}</Badge>;
}
