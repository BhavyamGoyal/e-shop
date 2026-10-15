export interface WishlistItem {
  handle: string;
  title: string;
  image: string | null;
  price: number;
  compareAtPrice: number | null;
}

export interface WishlistState {
  items: WishlistItem[];
  toggle: (item: WishlistItem) => void;
  remove: (handle: string) => void;
  replace: (items: WishlistItem[]) => void;
}
