export interface CartLineRecord {
  key: string;
  handle: string;
  title: string;
  variantTitle: string | null;
  image: string | null;
  price: number;
  compareAtPrice: number | null;
  quantity: number;
}

export interface CartSummary {
  userId: string;
  email: string;
  name: string;
  itemCount: number;
  total: number;
  updatedAt: string;
}

export interface CartDetail extends CartSummary {
  items: CartLineRecord[];
}
