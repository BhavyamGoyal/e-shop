import type { CSSProperties } from "react";
import { ScrollRow, TileCard } from "../molecules";
import type { TileScrollerBlock } from "@/lib/website-data";

interface TileScrollerProps {
  block: TileScrollerBlock;
}

const itemWidth = (gap: number, visible: number) =>
  `calc((100% - ${gap}px * ${Math.ceil(visible) - 1}) / ${visible})`;

export function TileScroller({ block }: TileScrollerProps) {
  const style = {
    "--gap": `${block.gap}px`,
    "--w": itemWidth(block.gap, block.visible),
    "--mw": itemWidth(12, 1.4),
  } as CSSProperties;
  return (
    <ScrollRow
      scrollerClassName="flex snap-x gap-3 scroll-smooth pb-1 md:gap-(--gap)"
      scrollerStyle={style}
    >
      {block.tiles.map((tile) => (
        <div key={tile.href} className="w-(--mw) shrink-0 snap-start md:w-(--w)">
          <TileCard tile={tile} />
        </div>
      ))}
    </ScrollRow>
  );
}
