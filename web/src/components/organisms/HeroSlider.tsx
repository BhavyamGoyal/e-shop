"use client";

import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import type { SliderBlock, Tile } from "@/lib/website-data";
import { ArrowButton } from "../atoms";
import { TileCard } from "../molecules";

interface HeroSliderProps {
  block: SliderBlock;
}

function withMobile(slide: Tile, block: SliderBlock, i: number): Tile {
  const mobileImage = block.mobileImages?.[i];
  if (!mobileImage) return slide;
  return { ...slide, mobileImage };
}

export function HeroSlider({ block }: HeroSliderProps) {
  const count = block.slides.length;
  const [index, setIndex] = useState(0);

  const step = useCallback(
    (delta: number) => setIndex((current) => (current + delta + count) % count),
    [count],
  );

  useEffect(() => {
    if (count < 2) return;
    const timer = setInterval(() => step(1), block.autoplay);
    return () => clearInterval(timer);
  }, [index, count, block.autoplay, step]);

  return (
    <div className="group relative overflow-hidden">
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ width: `${count * 100}%`, transform: `translateX(-${index * (100 / count)}%)` }}
      >
        {block.slides.map((slide, i) => (
          <div key={slide.href} className="shrink-0" style={{ width: `${100 / count}%` }}>
            <TileCard tile={withMobile(slide, block, i)} />
          </div>
        ))}
      </div>
      <ArrowButton
        direction="left"
        onClick={() => step(-1)}
        className="absolute top-1/2 left-4 -translate-y-1/2 opacity-0 group-hover:opacity-100"
      />
      <ArrowButton
        direction="right"
        onClick={() => step(1)}
        className="absolute top-1/2 right-4 -translate-y-1/2 opacity-0 group-hover:opacity-100"
      />
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {block.slides.map((slide, i) => (
          <button
            key={slide.href}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={cn(
              "h-2 cursor-pointer rounded-full transition-all",
              i === index ? "w-5 bg-background" : "w-2 bg-background/60",
            )}
          />
        ))}
      </div>
    </div>
  );
}
