export interface CartItem {
  key: string;
  handle: string;
  title: string;
  variantTitle: string | null;
  image: string | null;
  price: number;
  compareAtPrice: number | null;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  add: (item: CartItem) => void;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
}
