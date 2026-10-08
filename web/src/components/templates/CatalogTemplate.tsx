import { AutoSubmitForm, SortSelect } from "../molecules";
import { CatalogFilters, Pagination, ProductGrid, SiteFooter, SiteHeader } from "../organisms";
import type { CatalogData } from "@/lib/catalog";
import { useCatalog, type CatalogState } from "@/lib/use-catalog";
import type { FooterGroup } from "@/lib/footer";
import type { HeaderData } from "@/lib/website-data";

interface CatalogTemplateProps {
  header: HeaderData;
  shop: FooterGroup;
  catalog: CatalogData;
}

export function CatalogTemplate({ header, shop, catalog }: CatalogTemplateProps) {
  const { title, description, basePath, facets } = catalog;
  const { search, loading, query, meta, products }: CatalogState = useCatalog(catalog);
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader header={header} />
      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 pt-10 pb-16 md:px-10">
        <h1 className="text-center text-3xl font-semibold md:text-4xl">{title}</h1>
        {description && <p className="mx-auto mt-2 max-w-2xl text-center text-muted-foreground">{description}</p>}
        <AutoSubmitForm key={search} action={basePath} className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-y border-border py-4">
            <CatalogFilters facets={facets} query={query} basePath={basePath} />
            <div className="flex items-center gap-5">
              <SortSelect value={query.sort} />
              <span className="text-sm text-muted-foreground">
                {loading ? "Loading…" : `${meta.total} ${meta.total === 1 ? "product" : "products"}`}
              </span>
            </div>
          </div>
          <div className="mt-8">
            {loading ? (
              <div role="status" aria-live="polite" className="grid min-h-80 place-items-center text-muted-foreground">
                Loading products…
              </div>
            ) : (
              <>
                <ProductGrid products={products} />
                <Pagination meta={meta} query={query} basePath={basePath} />
              </>
            )}
          </div>
        </AutoSubmitForm>
      </main>
      <SiteFooter shop={shop} />
    </div>
  );
}
