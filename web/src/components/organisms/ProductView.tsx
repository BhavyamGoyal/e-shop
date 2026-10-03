"use client";

import { useState, type ReactNode } from "react";
import { ProductPrice, TrustGrid } from "../molecules";
import { ProductActions } from "./ProductActions";
import { ProductGallery } from "./ProductGallery";
import { StickyBuyBar } from "./StickyBuyBar";
import { VariantSelector } from "./VariantSelector";
import type { MediaItem, ProductOption, ProductVariant } from "@/server/types/product.types";

interface ProductViewProps {
  title: string;
  summary: string;
  breadcrumbs: ReactNode;
  images: MediaItem[];
  options: ProductOption[];
  variants: ProductVariant[];
  price: number;
  compareAtPrice: number | null;
  available: boolean;
}

const matches = (variant: ProductVariant, selected: string[]): boolean =>
  variant.options.every((value: string, index: number): boolean => value === selected[index]);

const initialSelection = (options: ProductOption[], variants: ProductVariant[]): string[] => {
  const first: ProductVariant | undefined = variants.find((variant) => variant.available) ?? variants[0];
  return first?.options ?? options.map((option: ProductOption): string => option.values[0] ?? "");
};

const isSingleDefault = (options: ProductOption[]): boolean =>
  options.length === 0 || (options.length === 1 && options[0].values.length === 1);

export function ProductView(props: ProductViewProps) {
  const { title, summary, breadcrumbs, images, options, variants, price, compareAtPrice, available } = props;
  const [selected, setSelected] = useState<string[]>(() => initialSelection(options, variants));
  const [imageIndex, setImageIndex] = useState<number>(0);

  const variant: ProductVariant | undefined = variants.find((item) => matches(item, selected));
  const currentPrice: number = variant?.price ?? price;
  const currentMrp: number | null = variant ? variant.compareAtPrice : compareAtPrice;
  const inStock: boolean = variant ? variant.available : available;
  const discount: number | null =
    currentMrp !== null && currentMrp > currentPrice
      ? Math.round(((currentMrp - currentPrice) / currentMrp) * 100)
      : null;

  const handleChange = (optionIndex: number, value: string): void => {
    const next: string[] = selected.map((current: string, index: number): string =>
      index === optionIndex ? value : current,
    );
    setSelected(next);
    const image: string | null | undefined = variants.find((item) => matches(item, next))?.image;
    const found: number = images.findIndex((item: MediaItem): boolean => item.url === image);
    if (found >= 0) setImageIndex(found);
  };

  return (
    <div className="mx-auto grid w-full max-w-[1280px] gap-[30px] px-4 pt-5 pb-10 md:px-10 md:pt-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:items-start lg:gap-14">
      <div className="min-w-0 lg:sticky lg:top-[88px]">
        <ProductGallery
          images={images}
          title={title}
          activeIndex={imageIndex}
          badge={discount ? `Save ${discount}%` : undefined}
          onSelect={setImageIndex}
        />
      </div>
      <div className="flex min-w-0 flex-col gap-[18px]">
        <div className="hidden lg:block">{breadcrumbs}</div>
        <h1 className="text-[clamp(28px,4.4vw,42px)] leading-[1.08] font-semibold tracking-[-0.02em] text-(--pp-ink)">
          {title}
        </h1>
        <ProductPrice price={currentPrice} compareAtPrice={currentMrp} />
        {summary && (
          <p className="text-[15.5px] leading-[1.7] text-(--pp-muted)">
            {summary}{" "}
            <a href="#story" className="font-semibold whitespace-nowrap text-(--pp-green) hover:underline">
              Read more
            </a>
          </p>
        )}
        {!isSingleDefault(options) && (
          <VariantSelector options={options} selected={selected} onChange={handleChange} />
        )}
        <ProductActions inStock={inStock} />
        <TrustGrid />
      </div>
      <StickyBuyBar title={title} image={images[0]?.url ?? null} price={currentPrice} inStock={inStock} />
    </div>
  );
}
