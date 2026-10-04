"use client";

import { useState } from "react";
import { Button } from "../atoms";
import { ImagePicker } from "./ImagePicker";

export interface TagImageCellProps {
  url: string;
  label: string;
  onChange: (url: string) => void;
}

export function TagImageCell({ url, label, onChange }: TagImageCellProps) {
  const [picking, setPicking] = useState<boolean>(false);

  return (
    <div className="flex items-center gap-2">
      {url ? (
        <img src={url} alt="" className="h-10 w-10 rounded-md border object-cover" loading="lazy" />
      ) : (
        <div className="h-10 w-10 rounded-md border border-dashed" />
      )}
      <Button size="sm" variant="outline" tone="secondary" onClick={() => setPicking(true)}>
        {url ? "Change" : `Add ${label}`}
      </Button>
      {url ? (
        <Button size="sm" variant="outline" tone="danger" onClick={() => onChange("")}>
          Clear
        </Button>
      ) : null}
      {picking ? (
        <ImagePicker
          multiple={false}
          onPick={(urls: string[]): void => {
            onChange(urls[0] ?? "");
            setPicking(false);
          }}
          onClose={() => setPicking(false)}
        />
      ) : null}
    </div>
  );
}
