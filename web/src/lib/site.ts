export const SITE_NAME: string = "Tinglet";
export const SITE_DESCRIPTION: string =
  "Tinglet: Lamps, planters, desk organisers and gifts, crafted for you.";

export const SOCIAL_IMAGE: string = "/logo_v2.jpeg";

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
  "catalog-query",
  "robots.txt",
  "sitemap.xml",
];
