import type { CSSProperties } from "react";
import { TileCard } from "../molecules";
import type { TileGridBlock } from "@/lib/website-data";

interface TileGridProps {
  block: TileGridBlock;
}

const mobileColumns = (block: TileGridBlock): number => {
  if (block.columns === 1) return 1;
  if (block.tiles.every((tile) => tile.radius >= 100)) return 4;
  if (block.columns === 3) return 1;
  return 2;
};

export function TileGrid({ block }: TileGridProps) {
  const style = {
    "--cols": block.columns,
    "--mcols": mobileColumns(block),
    "--gap": `${block.gap}px`,
    paddingBottom: block.paddingBottom,
  } as CSSProperties;
  return (
    <div
      className="grid grid-cols-[repeat(var(--mcols),minmax(0,1fr))] gap-[min(var(--gap),12px)] md:grid-cols-[repeat(var(--cols),minmax(0,1fr))] md:gap-(--gap)"
      style={style}
    >
      {block.tiles.map((tile) => (
        <TileCard key={tile.href} tile={tile} />
      ))}
    </div>
  );
}
