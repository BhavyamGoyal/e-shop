import type { Tile } from "@/lib/website-data";

interface TileCardProps {
  tile: Tile;
}

export function TileCard({ tile }: TileCardProps) {
  const { caption } = tile;
  return (
    <a href={tile.href} className="group block">
      <div
        className="@container relative overflow-hidden bg-muted"
        style={{ aspectRatio: tile.aspectRatio, borderRadius: tile.radius }}
      >
        <img
          src={tile.image}
          alt={tile.alt}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {tile.hero ? (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex w-1/2 flex-col justify-center gap-[1.2cqw] pl-[6cqw] text-primary-foreground">
            <span className="text-[4.2cqw] leading-[1.05] font-semibold tracking-tight drop-shadow">{tile.hero.title}</span>
            <span className="max-w-[34cqw] text-[1.7cqw] leading-snug opacity-90 drop-shadow">{tile.hero.subtitle}</span>
            <span className="mt-[0.8cqw] w-fit rounded-[0.8cqw] bg-background px-[2.2cqw] py-[1cqw] text-[1.6cqw] font-semibold text-foreground shadow">
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
