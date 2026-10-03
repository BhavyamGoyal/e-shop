import { SectionHeading } from "../molecules";
import type { Block, HomeSectionData } from "@/lib/website-data";
import { HeroSlider } from "./HeroSlider";
import { ProductRail } from "./ProductRail";
import { TabbedProductShowcase } from "./TabbedProductShowcase";
import { TileGrid } from "./TileGrid";
import { TileScroller } from "./TileScroller";

interface HomeSectionProps {
  section: HomeSectionData;
}

function renderBlock(block: Block, index: number) {
  switch (block.type) {
    case "tileGrid":
      return <TileGrid key={index} block={block} />;
    case "tileScroller":
      return <TileScroller key={index} block={block} />;
    case "slider":
      return <HeroSlider key={index} block={block} />;
    case "tabbedProducts":
      return <TabbedProductShowcase key={index} block={block} />;
    case "productRail":
      return (
        <ProductRail key={index} products={block.products} gap={block.gap} visible={block.visible} />
      );
  }
}

export function HomeSection({ section }: HomeSectionProps) {
  return (
    <section
      id={section.key}
      className="w-full max-md:px-4!"
      style={{ background: section.background, padding: section.padding, margin: section.margin }}
    >
      {section.header && <SectionHeading heading={section.header} />}
      <div className="flex flex-col">{section.blocks.map(renderBlock)}</div>
    </section>
  );
}
