import { Button, Input } from "../atoms";

export interface ImageSlotProps {
  url: string;
  alt: string;
  index: number;
  count: number;
  onAlt: (alt: string) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
}

export function ImageSlot({ url, alt, index, count, onAlt, onMove, onRemove }: ImageSlotProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-surface p-2">
      <img src={url} alt="" className="h-16 w-16 shrink-0 rounded-md object-cover" loading="lazy" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="truncate text-xs text-muted-foreground">
          {index === 0 ? "Featured · " : ""}
          {url}
        </span>
        <Input value={alt} onChange={(event) => onAlt(event.target.value)} placeholder="Alt text" className="h-8" />
      </div>
      <div className="flex shrink-0 gap-1">
        <Button size="sm" variant="outline" tone="secondary" disabled={index === 0} onClick={() => onMove(-1)}>
          Up
        </Button>
        <Button size="sm" variant="outline" tone="secondary" disabled={index === count - 1} onClick={() => onMove(1)}>
          Down
        </Button>
        <Button size="sm" variant="outline" tone="danger" onClick={onRemove}>
          Remove
        </Button>
      </div>
    </div>
  );
}
