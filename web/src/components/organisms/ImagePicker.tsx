"use client";

import { useState } from "react";
import { useImageLibrary } from "@/lib/use-image-library";
import { Button, Heading, Input, Text } from "../atoms";
import { AlertMessage, ImageTile, PagerBar, UploadButton } from "../molecules";

export interface ImagePickerProps {
  multiple: boolean;
  onPick: (urls: string[]) => void;
  onClose: () => void;
}

export function ImagePicker({ multiple, onPick, onClose }: ImagePickerProps) {
  const library = useImageLibrary();
  const [chosen, setChosen] = useState<string[]>([]);

  const toggle = (url: string): void => {
    if (!multiple) return setChosen([url]);
    setChosen((current: string[]): string[] =>
      current.includes(url) ? current.filter((item: string): boolean => item !== url) : [...current, url],
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4" role="dialog" aria-modal="true">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col gap-4 overflow-hidden rounded-xl bg-background p-5 text-foreground shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Heading level={3}>Select {multiple ? "images" : "an image"}</Heading>
          <div className="flex items-center gap-3">
            <Input
              placeholder="Search"
              value={library.search}
              onChange={(event) => library.setSearch(event.target.value)}
              className="w-44"
            />
            <UploadButton disabled={library.busy} onFiles={library.upload} />
          </div>
        </div>
        {library.error ? <AlertMessage tone="danger" message={library.error} /> : null}
        <div className="grid min-h-0 flex-1 grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-4 lg:grid-cols-5">
          {library.items.map((image) => (
            <ImageTile key={image.id} image={image} selected={chosen.includes(image.url)} onSelect={() => toggle(image.url)} />
          ))}
        </div>
        <PagerBar page={library.page} totalPages={library.totalPages} onChange={library.setPage} />
        <div className="flex items-center justify-between gap-3">
          <Text tone="muted" className="text-sm">
            {chosen.length} selected
          </Text>
          <div className="flex gap-2">
            <Button variant="outline" tone="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button disabled={!chosen.length} onClick={() => onPick(chosen)}>
              Use selected
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
