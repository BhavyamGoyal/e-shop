import { collectionController } from "@/server/controllers/collection.controller";
import { productController } from "@/server/controllers/product.controller";
import type { CollectionSummary, ProductQuery, ProductSummary } from "@/server/types/product.types";
import { heroBannerSection, promoBannerSection } from "@/data/banners";
import type { HeaderData, HomeSectionData, Product, Tile, WebsiteData } from "@/lib/website-data";

const BRAND = "Tinglet";
const TAGLINE = "Crafted for you";
const FEATURED_HANDLE = "featured-products";
const NAV_LIMIT = 11;
const TAB_COLLECTIONS = 4;
const RAIL_SIZE = 12;
const TAB_SIZE = 10;
const BUDGET_PRICE = 999;
const ICON_BASE = "https://static-assets-prod.fnp.com/icons/web";

const baseQuery: ProductQuery = {
  collections: [],
  tags: [],
  productTypes: [],
  sort: "newest",
  page: 1,
  limit: RAIL_SIZE,
};

export const toProduct = (product: ProductSummary): Product => ({
  href: `/product/${product.handle}`,
  image: product.image ?? "",
  name: product.title,
  price: product.price,
  mrp: product.compareAtPrice ?? undefined,
  discountLabel: product.discountPercent ? `${product.discountPercent}% OFF` : undefined,
});

const toTile = (collection: CollectionSummary): Tile => ({
  href: `/${collection.handle}`,
  image: collection.image ?? "",
  alt: collection.title,
  aspectRatio: 1,
  radius: 16,
  caption: {
    text: `${collection.title} (${collection.count})`,
    placement: "below",
    color: "#191a0b",
    weight: 600,
    size: 15,
  },
});

const fetchProducts = async (overrides: Partial<ProductQuery>) =>
  (await productController.search({ ...baseQuery, ...overrides })).data.map(toProduct);

const sectionBase = {
  background: "#FFFFFF",
  padding: "0px 48px 24px 48px",
  margin: "24px 0px 0px 0px",
};

const heading = (title: string, subtitle?: string, actionHref?: string): HomeSectionData["header"] => ({
  title,
  subtitle,
  align: "left",
  color: "#191a0b",
  size: 32,
  weight: 600,
  action: actionHref
    ? { href: actionHref, label: "View All →", background: "#ffffff", color: "#191a0b", borderColor: "#e0e0e0" }
    : undefined,
});

export function buildHeader(categories: CollectionSummary[]): HeaderData {
  return {
    logo: { href: "/", text: BRAND, tagline: TAGLINE },
    location: {
      icon: `${ICON_BASE}/location_icon_green.svg`,
      title: "Where to deliver?",
      status: "Enter your pincode",
      chevron: `${ICON_BASE}/chevron-location.svg`,
    },
    search: {
      icon: `${ICON_BASE}/search-bar.svg`,
      placeholder: "Search for lamps, planters, desk organisers...",
    },
    actions: [
      { href: "/corporate-gifts", icon: `${ICON_BASE}/corporate-gift.svg`, label: "Corporate Gifts" },
      { href: "/cart", icon: `${ICON_BASE}/cart.svg`, label: "Cart" },
      { href: "/login", icon: `${ICON_BASE}/user-square-desktop.svg`, label: "Hi Guest" },
    ],
    nav: categories.slice(0, NAV_LIMIT).map((category) => ({
      href: `/${category.handle}`,
      icon: category.image ?? "",
      label: category.title,
    })),
  };
}

export const buildSiteHeader = (): HeaderData => buildHeader([]);

export async function buildHomeData(): Promise<WebsiteData> {
  const collections = await collectionController.all();
  const categories = collections.filter((collection) => collection.handle !== FEATURED_HANDLE);
  const featured = collections.find((collection) => collection.handle === FEATURED_HANDLE);
  const tabSources = [...(featured ? [featured] : []), ...categories.slice(0, TAB_COLLECTIONS)];

  const [tabs, onSale, budget] = await Promise.all([
    Promise.all(
      tabSources.map(async (collection) => ({
        label: collection.handle === FEATURED_HANDLE ? "Featured" : collection.title,
        products: await fetchProducts({ collections: [collection.handle], limit: TAB_SIZE }),
      })),
    ),
    fetchProducts({ onSale: true, sort: "price-asc" }),
    fetchProducts({ maxPrice: BUDGET_PRICE, sort: "price-desc" }),
  ]);

  const sections: HomeSectionData[] = [
    heroBannerSection,
    {
      ...sectionBase,
      key: "shopByCategory",
      id: "shopByCategory",
      header: heading(
        "Shop by Category",
        "Lamps, planters, desk organisers and more, designed and 3D printed to order.",
      ),
      blocks: [{ type: "tileScroller", gap: 20, visible: 6, tiles: categories.map(toTile) }],
    },
    promoBannerSection,
    {
      ...sectionBase,
      key: "featuredCollections",
      id: "featuredCollections",
      background: "linear-gradient(180deg, #f2f3e8 0%, #ffffff 100%)",
      padding: "40px 48px 0px 48px",
      header: heading(
        "Our Collections",
        "Browse our most-loved pieces, each one printed in biodegradable PLA right here in India.",
        "/product",
      ),
      blocks: [{ type: "tabbedProducts", tabs }],
    },
    {
      ...sectionBase,
      key: "onSale",
      id: "onSale",
      header: heading("On Sale Now", "Limited-time prices on popular prints.", "/product?onSale=true"),
      blocks: [{ type: "productRail", gap: 24, visible: 4.4, products: onSale }],
    },
    {
      ...sectionBase,
      key: "budgetPicks",
      id: "budgetPicks",
      header: heading(
        `Gifts Under ₹${BUDGET_PRICE}`,
        "Small prints that make big impressions.",
        `/product?maxPrice=${BUDGET_PRICE}`,
      ),
      blocks: [{ type: "productRail", gap: 24, visible: 4.4, products: budget }],
    },
  ];

  return { header: buildHeader(categories), sections };
}
