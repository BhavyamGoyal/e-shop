import { cn } from "@/lib/cn";
import type { Tile } from "@/lib/website-data";

interface TileCardProps {
  tile: Tile;
}

const HERO_LANDSCAPE = "inset-y-0 left-0 w-1/2 justify-center gap-[1.2cqw] pl-[6cqw]";
const HERO_PORTRAIT =
  "inset-x-0 top-0 items-center gap-[3cqw] px-[6cqw] pt-[12cqw] text-center md:inset-x-auto md:inset-y-0 md:left-0 md:w-1/2 md:items-stretch md:justify-center md:gap-[1.2cqw] md:px-0 md:pt-0 md:pl-[6cqw] md:text-left";

export function TileCard({ tile }: TileCardProps) {
  const { caption } = tile;
  const portrait = Boolean(tile.mobileImage);
  return (
    <a href={tile.href} className="group block">
      <div
        className={cn("@container relative overflow-hidden bg-muted", portrait ? "h-[50svh] md:h-auto md:aspect-(--tile-ar)" : "aspect-(--tile-ar)")}
        style={
          {
            "--tile-ar": tile.aspectRatio,
            borderRadius: tile.radius,
          } as React.CSSProperties
        }
      >
        <picture>
          {tile.mobileImage ? <source media="(max-width: 767px)" srcSet={tile.mobileImage} /> : null}
          <img
            src={tile.image}
            alt={tile.alt}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </picture>
        {tile.hero ? (
          <div className={cn("pointer-events-none absolute flex flex-col text-primary-foreground", portrait ? HERO_PORTRAIT : HERO_LANDSCAPE)}>
            <span className={cn("leading-[1.05] font-semibold tracking-tight drop-shadow", portrait ? "text-[9cqw] md:text-[4.2cqw]" : "text-[4.2cqw]")}>{tile.hero.title}</span>
            <span className={cn("leading-snug opacity-90 drop-shadow", portrait ? "max-w-[80cqw] text-[4cqw] md:max-w-[34cqw] md:text-[1.7cqw]" : "max-w-[34cqw] text-[1.7cqw]")}>{tile.hero.subtitle}</span>
            <span className={cn("w-fit bg-background font-semibold text-foreground shadow", portrait ? "mt-[2cqw] rounded-[2cqw] px-[6cqw] py-[2.5cqw] text-[4cqw] md:mt-[0.8cqw] md:rounded-[0.8cqw] md:px-[2.2cqw] md:py-[1cqw] md:text-[1.6cqw]" : "mt-[0.8cqw] rounded-[0.8cqw] px-[2.2cqw] py-[1cqw] text-[1.6cqw]")}>
              {tile.hero.cta} &rsaquo;
            </span>
          </div>
        ) : null}
        {caption?.placement === "overlay" && (
          <div className="pointer-events-none absolute inset-0 flex items-end justify-center bg-linear-to-t from-black/40 via-transparent to-transparent p-5 text-center">
            <span
              className="drop-shadow"
              style={{ color: caption.color, fontWeight: caption.weight, fontSize: caption.size }}
            >
              {caption.text}
            </span>
          </div>
        )}
      </div>
      {caption?.placement === "below" && (
        <div
          className="mt-3 text-center"
          style={{ color: caption.color, fontWeight: caption.weight, fontSize: caption.size }}
        >
          {caption.text}
        </div>
      )}
    </a>
  );
}
