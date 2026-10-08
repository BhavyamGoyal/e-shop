import { collectionController } from "@/server/controllers/collection.controller";
import { storefrontCategoryController } from "@/server/controllers/storefront-category.controller";
import { productController } from "@/server/controllers/product.controller";
import type {
  CollectionSummary,
  ProductQuery,
  StorefrontCategory,
} from "@/server/types/product.types";
import { toProduct } from "@/lib/product-mapper";
import { heroBannerSection, promoBannerSection } from "@/data/banners";
import type {
  HeaderData,
  HomeSectionData,
  Tile,
  WebsiteData,
} from "@/lib/website-data";

const BRAND = "Tinglet";
const TAGLINE = "Crafted for you";
const FEATURED_HANDLE = "featured-products";
const TAB_COLLECTIONS = 4;
const RAIL_SIZE = 12;
const TAB_SIZE = 10;
const BUDGET_PRICE = 999;
const ICON_BASE = "https://static-assets-prod.fnp.com/icons/web";

const baseQuery: ProductQuery = {
  collections: [],
  categories: [],
  tags: [],
  productTypes: [],
  sort: "newest",
  page: 1,
  limit: RAIL_SIZE,
};

const toTile = (category: StorefrontCategory): Tile => ({
  href: category.href,
  image: category.image,
  alt: category.name,
  aspectRatio: 1,
  radius: 16,
  caption: {
    text: `${category.name} (${category.count})`,
    placement: "below",
    color: "var(--foreground)",
    weight: 600,
    size: 15,
  },
});

const fetchProducts = async (overrides: Partial<ProductQuery>) =>
  (await productController.search({ ...baseQuery, ...overrides })).data.map(
    toProduct,
  );

const sectionBase = {
  background: "var(--background)",
  padding: "0px 48px 24px 48px",
  margin: "24px 0px 0px 0px",
};

const heading = (
  title: string,
  subtitle?: string,
  actionHref?: string,
): HomeSectionData["header"] => ({
  title,
  subtitle,
  align: "left",
  color: "var(--foreground)",
  size: 32,
  weight: 600,
  action: actionHref
    ? {
        href: actionHref,
        label: "View All →",
        background: "var(--background)",
        color: "var(--foreground)",
        borderColor: "var(--border)",
      }
    : undefined,
});

export function buildHeader(categories: StorefrontCategory[]): HeaderData {
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
      {
        href: "/corporate-gifts",
        icon: `${ICON_BASE}/corporate-gift.svg`,
        label: "Corporate Gifts",
      },
      { href: "/cart", icon: `${ICON_BASE}/cart.svg`, label: "Cart" },
      {
        href: "/login",
        icon: `${ICON_BASE}/user-square-desktop.svg`,
        label: "Hi Guest",
      },
    ],
    nav: categories.map((category: StorefrontCategory) => ({
      href: category.href,
      icon: category.icon,
      label: category.name,
    })),
  };
}

export const buildSiteHeader = (): HeaderData => buildHeader([]);

export async function buildHomeData(): Promise<WebsiteData> {
  const [collections, homeCategories] = await Promise.all([
    collectionController.all(),
    storefrontCategoryController.home(),
  ]);
  const categories = collections.filter(
    (collection) => collection.handle !== FEATURED_HANDLE,
  );
  const featured = collections.find(
    (collection) => collection.handle === FEATURED_HANDLE,
  );
  const tabSources = [
    ...(featured ? [featured] : []),
    ...categories.slice(0, TAB_COLLECTIONS),
  ];

  const [tabs, onSale, budget] = await Promise.all([
    Promise.all(
      tabSources.map(async (collection) => ({
        label:
          collection.handle === FEATURED_HANDLE ? "Featured" : collection.title,
        products: await fetchProducts({
          collections: [collection.handle],
          limit: TAB_SIZE,
        }),
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
        "Lamps, planters, desk organisers and more, designed and 3D Printed to order.",
      ),
      blocks: [
        {
          type: "tileScroller",
          gap: 20,
          visible: 6,
          tiles: homeCategories.map(toTile),
        },
      ],
    },
    promoBannerSection,
    {
      ...sectionBase,
      key: "featuredCollections",
      id: "featuredCollections",
      background:
        "linear-gradient(180deg, var(--muted) 0%, var(--background) 100%)",
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
      header: heading(
        "On Sale Now",
        "Limited-time prices on popular prints.",
        "/product?onSale=true",
      ),
      blocks: [
        { type: "productRail", gap: 24, visible: 4.4, products: onSale },
      ],
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
      blocks: [
        { type: "productRail", gap: 24, visible: 4.4, products: budget },
      ],
    },
  ];

  return { header: buildHeader(homeCategories), sections };
}
