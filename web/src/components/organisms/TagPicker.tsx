"use client";

import { useEffect, useRef, useState } from "react";
import { Badge, Button } from "../atoms";

export interface TagPickerProps {
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
  compact?: boolean;
}

interface Anchor {
  top: number;
  left: number;
}

const MENU_WIDTH = 224;

export function TagPicker({ options, selected, onChange, disabled, compact }: TagPickerProps) {
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!anchor) return;
    const close = (event: Event): void => {
      if (event.target instanceof Node && (menuRef.current?.contains(event.target) || buttonRef.current?.contains(event.target))) return;
      setAnchor(null);
    };
    document.addEventListener("pointerdown", close);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return (): void => {
      document.removeEventListener("pointerdown", close);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [anchor]);

  const toggleMenu = (): void => {
    if (anchor) return setAnchor(null);
    const rect: DOMRect | undefined = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    setAnchor({ top: rect.bottom + 4, left: Math.min(rect.left, window.innerWidth - MENU_WIDTH - 8) });
  };

  const toggleTag = (name: string): void => {
    onChange(selected.includes(name) ? selected.filter((tag: string): boolean => tag !== name) : [...selected, name]);
  };

  return (
    <div ref={buttonRef} className={compact ? "flex items-center gap-2" : "flex flex-wrap items-center gap-1"}>
      {compact ? (
        selected.length ? (
          <span title={selected.join(", ")} className="line-clamp-2 min-w-0 flex-1 break-words text-sm">
            {selected.join(", ")}
          </span>
        ) : null
      ) : (
        selected.map((name: string) => <Badge key={name}>{name}</Badge>)
      )}
      <Button size="sm" variant="outline" tone="secondary" disabled={disabled} onClick={toggleMenu}>
        {selected.length ? "Edit" : "Add tags"}
      </Button>
      {anchor ? (
        <div
          ref={menuRef}
          style={{ top: anchor.top, left: anchor.left, width: MENU_WIDTH }}
          className="fixed z-50 max-h-64 overflow-y-auto rounded-md border bg-surface p-2 text-sm text-surface-foreground shadow-lg"
        >
          {options.length ? (
            options.map((name: string) => (
              <label key={name} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 hover:bg-muted">
                <input type="checkbox" checked={selected.includes(name)} onChange={() => toggleTag(name)} />
                <span className="truncate">{name}</span>
              </label>
            ))
          ) : (
            <span className="px-2 text-muted-foreground">No tags yet. Create some in the Tags page.</span>
          )}
        </div>
      ) : null}
    </div>
  );
}
