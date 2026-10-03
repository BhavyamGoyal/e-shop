"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { ArrowButton, type ArrowDirection } from "../atoms";

interface ScrollRowProps {
  children: ReactNode;
  className?: string;
  scrollerClassName?: string;
  scrollerStyle?: CSSProperties;
}

const SCROLL_FRACTION = 0.8;
const EDGE_TOLERANCE = 2;

export function ScrollRow({ children, className, scrollerClassName, scrollerStyle }: ScrollRowProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const update = useCallback((): void => {
    const element = scrollerRef.current;
    if (!element) return;
    setCanScrollLeft(element.scrollLeft > EDGE_TOLERANCE);
    setCanScrollRight(element.scrollLeft + element.clientWidth < element.scrollWidth - EDGE_TOLERANCE);
  }, []);

  useEffect(() => {
    const element = scrollerRef.current;
    if (!element) return;
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    Array.from(element.children).forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, [update, children]);

  const scrollBy = (direction: ArrowDirection): void => {
    const element = scrollerRef.current;
    if (!element) return;
    const distance = element.clientWidth * SCROLL_FRACTION;
    element.scrollBy({ left: direction === "left" ? -distance : distance, behavior: "smooth" });
  };

  return (
    <div className={cn("relative", className)}>
      <div
        ref={scrollerRef}
        onScroll={update}
        className={cn("overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", scrollerClassName)}
        style={scrollerStyle}
      >
        {children}
      </div>
      {canScrollLeft && (
        <ArrowButton
          direction="left"
          onClick={() => scrollBy("left")}
          className="absolute top-1/2 left-2 z-10 -translate-y-1/2"
        />
      )}
      {canScrollRight && (
        <ArrowButton
          direction="right"
          onClick={() => scrollBy("right")}
          className="absolute top-1/2 right-2 z-10 -translate-y-1/2"
        />
      )}
    </div>
  );
}
