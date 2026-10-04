import {
  FOOTER_ADDRESS,
  FOOTER_GROUPS,
  FOOTER_TAGLINE,
  type FooterGroup,
} from "@/lib/footer";
import { SITE_NAME } from "@/lib/site";
import { collectionController } from "@/server/controllers/collection.controller";
import type { CollectionSummary } from "@/server/types/product.types";
import { ContactSection } from "./ContactSection";

const MAX_SHOP_LINKS: number = 6;

const loadShopGroup = async (): Promise<FooterGroup> => {
  const collections: CollectionSummary[] = await collectionController.all();
  return {
    title: "Shop",
    links: [
      { label: "All Products", href: "/product" },
      ...collections
        .slice(0, MAX_SHOP_LINKS)
        .map((collection: CollectionSummary) => ({
          label: collection.title,
          href: `/${collection.handle}`,
        })),
    ],
  };
};

export async function SiteFooter() {
  const groups: FooterGroup[] = [await loadShopGroup(), ...FOOTER_GROUPS];
  return (
    <div className="mt-auto w-full">
      <ContactSection />
      <footer className="w-full border-t border-border bg-muted text-foreground">
        <div className="mx-auto grid w-full max-w-[1400px] gap-10 px-6 py-12 md:grid-cols-[1.5fr_1fr_1fr_1fr] md:px-10">
          <div className="flex flex-col gap-4">
            <a href="/" className="w-fit">
              <img
                src="/logo_v1.svg"
                alt={SITE_NAME}
                className="block h-12 w-auto"
              />
            </a>
            <p className="max-w-xs text-sm text-muted-foreground">
              {FOOTER_TAGLINE}
            </p>
            <address className="text-sm not-italic text-muted-foreground">
              {FOOTER_ADDRESS.map((line: string) => (
                <div key={line}>{line}</div>
              ))}
            </address>
          </div>
          {groups.map((group: FooterGroup) => (
            <nav key={group.title} aria-label={group.title}>
              <h2 className="mb-4 text-sm font-semibold tracking-wide uppercase">
                {group.title}
              </h2>
              <ul className="flex flex-col gap-2.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="border-t border-border px-6 py-4 text-center text-xs text-muted-foreground md:px-10">
          © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
