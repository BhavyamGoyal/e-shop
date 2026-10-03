"use client";

import { useState } from "react";
import type { ImageInput } from "@/server/types/admin.types";
import { Button, Heading, Text } from "../atoms";
import { ImageSlot } from "../molecules";
import { ImagePicker } from "./ImagePicker";

export interface ImagesFieldProps {
  images: ImageInput[];
  onChange: (images: ImageInput[]) => void;
}

export function ImagesField({ images, onChange }: ImagesFieldProps) {
  const [picking, setPicking] = useState<boolean>(false);

  const add = (urls: string[]): void => {
    const known: Set<string> = new Set(images.map((image: ImageInput): string => image.url));
    const fresh: ImageInput[] = urls
      .filter((url: string): boolean => !known.has(url))
      .map((url: string): ImageInput => ({ url, alt: "" }));
    onChange([...images, ...fresh]);
    setPicking(false);
  };

  const patch = (index: number, change: Partial<ImageInput>): void =>
    onChange(images.map((image: ImageInput, at: number): ImageInput => (at === index ? { ...image, ...change } : image)));

  const move = (index: number, direction: -1 | 1): void => {
    const next: ImageInput[] = [...images];
    [next[index], next[index + direction]] = [next[index + direction], next[index]];
    onChange(next);
  };

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Heading level={3}>Images</Heading>
        <Button onClick={() => setPicking(true)}>Select from library</Button>
      </div>
      {images.length === 0 ? (
        <Text tone="muted" className="text-sm">
          No images yet. The first image is the featured image.
        </Text>
      ) : null}
      {images.map((image, index) => (
        <ImageSlot
          key={image.url}
          url={image.url}
          alt={image.alt}
          index={index}
          count={images.length}
          onAlt={(alt: string) => patch(index, { alt })}
          onMove={(direction: -1 | 1) => move(index, direction)}
          onRemove={() => onChange(images.filter((_: ImageInput, at: number): boolean => at !== index))}
        />
      ))}
      {picking ? <ImagePicker multiple onPick={add} onClose={() => setPicking(false)} /> : null}
    </section>
  );
}
