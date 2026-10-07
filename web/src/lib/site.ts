export const SITE_NAME: string = "Tinglet";
export const SITE_TITLE: string =
  "Tinglet | Thoughtful Gifts for Every Occasion";
export const SITE_DESCRIPTION: string =
  "Shop thoughtful lamps, planters and desk organisers, or contact us to get your gifts customised for birthdays, anniversaries and housewarmings. Tinglet.";

export const SOCIAL_IMAGE: string = "/logo_v2.jpeg";
export const LOGO_PATH: string = "/logo_v1.svg";
export const INSTAGRAM_URL: string = "https://www.instagram.com/tinglet_gifts/";

const resolveSiteUrl = (): string => {
  const explicit: string | undefined = process.env.SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercel: string | undefined = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  return vercel ? `https://${vercel}` : "http://localhost:3000";
};

export const SITE_URL: string = resolveSiteUrl();

export const absoluteUrl = (path: string): string =>
  /^https?:\/\//i.test(path)
    ? path
    : `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

export const RESERVED_HANDLES: readonly string[] = [
  "admin",
  "api",
  "login",
  "register",
  "showcase",
  "product",
  "blog",
  "faq",
  "cart",
  "catalog-query",
  "robots.txt",
  "sitemap.xml",
];
