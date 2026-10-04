import type { Tile } from "@/lib/website-data";

interface TileCardProps {
  tile: Tile;
}

export function TileCard({ tile }: TileCardProps) {
  const { caption } = tile;
  return (
    <a href={tile.href} className="group block">
      <div
        className="relative overflow-hidden bg-muted"
        style={{ aspectRatio: tile.aspectRatio, borderRadius: tile.radius }}
      >
        <img
          src={tile.image}
          alt={tile.alt}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
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
