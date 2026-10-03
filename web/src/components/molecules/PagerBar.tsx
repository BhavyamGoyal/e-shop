import { Button, Text } from "../atoms";

export interface PagerBarProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function PagerBar({ page, totalPages, onChange }: PagerBarProps) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-3">
      <Button variant="outline" tone="secondary" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Previous
      </Button>
      <Text tone="muted" className="text-sm">
        Page {page} of {totalPages}
      </Text>
      <Button
        variant="outline"
        tone="secondary"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        Next
      </Button>
    </div>
  );
}
