import type { ChangeEvent } from "react";
import { cn } from "@/lib/cn";

export interface UploadButtonProps {
  disabled?: boolean;
  onFiles: (event: ChangeEvent<HTMLInputElement>) => void;
}

export function UploadButton({ disabled = false, onFiles }: UploadButtonProps) {
  return (
    <label
      className={cn(
        "inline-flex h-10 cursor-pointer items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90",
        disabled && "pointer-events-none opacity-50",
      )}
    >
      Upload images
      <input type="file" accept="image/*" multiple className="sr-only" disabled={disabled} onChange={onFiles} />
    </label>
  );
}
