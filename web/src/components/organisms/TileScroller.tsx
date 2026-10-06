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
    "--mw": itemWidth(12, 2),
  } as CSSProperties;
  return (
    <ScrollRow
      scrollerClassName="grid snap-x auto-cols-(--mw) grid-flow-col grid-rows-2 gap-3 scroll-smooth pb-1 md:flex md:gap-(--gap)"
      scrollerStyle={style}
    >
      {block.tiles.map((tile) => (
        <div key={tile.href} className="snap-start overflow-hidden rounded-2xl border-[0.5px] border-solid border-[#e2e8f0] md:w-(--w) md:shrink-0">
          <TileCard tile={tile} />
        </div>
      ))}
    </ScrollRow>
  );
}
