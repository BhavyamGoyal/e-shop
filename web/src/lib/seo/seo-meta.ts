export interface SeoMeta {
  title?: string;
  description?: string;
  canonical?: string;
  robots?: string;
  image?: string;
  ogType?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
}

export const NOINDEX: string = "noindex, nofollow";
