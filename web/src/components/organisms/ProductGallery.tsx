import { cn } from "@/lib/cn";
import type { MediaItem } from "@/server/types/product.types";

interface ProductGalleryProps {
  images: MediaItem[];
  title: string;
  activeIndex: number;
  badge?: string;
  onSelect: (index: number) => void;
}

interface ArrowProps {
  direction: "prev" | "next";
  onClick: () => void;
}

const arrowClass =
  "absolute top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-(--pp-line-soft) bg-surface/90 shadow-(--pp-shadow-sm) backdrop-blur transition hover:bg-background active:scale-95";

function Arrow({ direction, onClick }: ArrowProps) {
  return (
    <button
      type="button"
      aria-label={direction === "prev" ? "Previous image" : "Next image"}
      onClick={onClick}
      className={cn(arrowClass, direction === "prev" ? "left-3" : "right-3")}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--pp-green-d)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={direction === "prev" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} />
      </svg>
    </button>
  );
}

export function ProductGallery({ images, title, activeIndex, badge, onSelect }: ProductGalleryProps) {
  const total: number = images.length;
  const step = (delta: number): void => onSelect((activeIndex + delta + total) % total);
  return (
    <div className="min-w-0">
      <div className="group relative aspect-square max-w-full overflow-hidden rounded-3xl border border-(--pp-line-soft) bg-linear-to-b from-(--pp-card) to-(--pp-bone-d) shadow-(--pp-shadow)">
        {images.map((image: MediaItem, index: number) => (
          <img
            key={image.url}
            src={image.url}
            alt={image.alt ?? title}
            loading={index === 0 ? "eager" : "lazy"}
            className={cn(
              "absolute inset-0 h-full w-full object-contain transition-[opacity,transform] duration-500 md:object-cover md:duration-700 md:group-hover:scale-[1.045]",
              index === activeIndex ? "opacity-100" : "pointer-events-none opacity-0",
            )}
          />
        ))}
        {badge && (
          <span className="absolute top-4 right-4 z-10 rounded-full bg-(--pp-amber) px-3 py-1.5 text-[11px] font-extrabold tracking-wide text-(--pp-green-d) uppercase shadow-(--pp-shadow-sm)">
            {badge}
          </span>
        )}
        {total > 1 && (
          <>
            <Arrow direction="prev" onClick={(): void => step(-1)} />
            <Arrow direction="next" onClick={(): void => step(1)} />
            <span className="absolute right-3.5 bottom-3.5 z-10 rounded-full bg-foreground/60 px-2.5 py-1 text-xs font-semibold tracking-wide text-background backdrop-blur md:hidden">
              {activeIndex + 1} / {total}
            </span>
          </>
        )}
      </div>
      {total > 1 && (
        <div className="mt-3.5 flex max-w-full gap-2.5 overflow-x-auto [scrollbar-width:none]">
          {images.map((image: MediaItem, index: number) => (
            <button
              key={image.url}
              type="button"
              onClick={(): void => onSelect(index)}
              aria-label={`Show image ${index + 1}`}
              className={cn(
                "h-[68px] w-[68px] shrink-0 overflow-hidden rounded-[14px] border border-(--pp-line-soft) bg-(--pp-card) transition hover:-translate-y-0.5 hover:opacity-85",
                index === activeIndex ? "opacity-100" : "opacity-50",
              )}
            >
              <img src={image.url} alt="" loading="lazy" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
