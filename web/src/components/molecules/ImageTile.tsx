import { cn } from "@/lib/cn";
import type { ImageRecord } from "@/server/types/admin.types";

export interface ImageTileProps {
  image: ImageRecord;
  selected?: boolean;
  onSelect?: (image: ImageRecord) => void;
  onDelete?: (image: ImageRecord) => void;
}

const kilobytes = (bytes: number): string => `${Math.max(1, Math.round(bytes / 1024))} KB`;

export function ImageTile({ image, selected = false, onSelect, onDelete }: ImageTileProps) {
  return (
    <div className={cn("group relative overflow-hidden rounded-lg border bg-surface", selected && "ring-2 ring-primary")}>
      <button
        type="button"
        onClick={() => onSelect?.(image)}
        disabled={!onSelect}
        className="block aspect-square w-full bg-muted"
      >
        <img src={image.url} alt={image.filename} loading="lazy" className="h-full w-full object-cover" />
      </button>
      <div className="flex items-center justify-between gap-2 px-2 py-1.5">
        <span className="truncate text-xs text-muted-foreground" title={image.filename}>
          {image.filename} · {kilobytes(image.size)}
        </span>
        {onDelete ? (
          <button
            type="button"
            onClick={() => onDelete(image)}
            className="shrink-0 text-xs font-medium text-danger hover:underline"
          >
            Delete
          </button>
        ) : null}
      </div>
      {selected ? (
        <span className="absolute left-2 top-2 rounded bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
          Selected
        </span>
      ) : null}
    </div>
  );
}
