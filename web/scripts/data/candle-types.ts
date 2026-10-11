export interface CandleSeed {
  title: string;
  price: number;
  compareAtPrice: number;
  intro: string;
  features: string[];
  details: [string, string][];
  optionName: string;
  optionValues: string[];
  images: string[];
}

export const CDN = "https://cdn.shopify.com/s/files/1/0507/3413/7537/";

export const MADE: [string, string] = ["Made in", "India, handmade"];
export const SCENT: [string, string] = ["Scent", "Vanilla"];
export const WAX: [string, string] = ["Material", "Soy wax"];
export const SOLD: string = "Sold individually";
export const HANDMADE: string = "Handmade, so colour may vary slightly";
