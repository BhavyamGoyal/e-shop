export interface Caption {
  text: string;
  placement: "below" | "overlay";
  color: string;
  weight: number;
  size: number;
}

export interface HeroCopy {
  title: string;
  subtitle: string;
  cta: string;
}

export interface Tile {
  href: string;
  image: string;
  mobileImage?: string;
  alt: string;
  aspectRatio: number;
  radius: number;
  caption?: Caption;
  hero?: HeroCopy;
}

export interface Product {
  href: string;
  image: string;
  name: string;
  price: number;
  mrp?: number;
  discountLabel?: string;
}

export interface SectionAction {
  href: string;
  label: string;
  background: string;
  color: string;
  borderColor: string;
}

export interface SectionHeadingData {
  title: string;
  align: "left" | "center" | "right";
  color: string;
  size: number;
  weight: number;
  subtitle?: string;
  action?: SectionAction;
}

export interface TileGridBlock {
  type: "tileGrid";
  columns: number;
  gap: number;
  paddingBottom?: number;
  tiles: Tile[];
}

export interface TileScrollerBlock {
  type: "tileScroller";
  gap: number;
  visible: number;
  tiles: Tile[];
}

export interface SliderBlock {
  type: "slider";
  autoplay: number;
  slides: Tile[];
  mobileImages?: string[];
}

export interface TabbedProductsBlock {
  type: "tabbedProducts";
  tabs: { label: string; products: Product[] }[];
}

export interface ProductRailBlock {
  type: "productRail";
  gap: number;
  visible: number;
  products: Product[];
}

export type Block =
  | TileGridBlock
  | TileScrollerBlock
  | SliderBlock
  | TabbedProductsBlock
  | ProductRailBlock;

export interface HomeSectionData {
  key: string;
  id: string;
  background: string;
  padding: string;
  margin: string;
  header: SectionHeadingData | null;
  blocks: Block[];
}

export interface IconLink {
  href: string;
  icon: string;
  label: string;
}

export interface HeaderData {
  logo: { href: string; text: string; tagline: string };
  location: { icon: string; title: string; status: string; chevron: string };
  search: { icon: string; placeholder: string };
  actions: IconLink[];
  nav: IconLink[];
}

export interface WebsiteData {
  header: HeaderData;
  sections: HomeSectionData[];
}
