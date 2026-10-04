import { AutoSubmitForm, SortSelect } from "../molecules";
import { CatalogFilters, Pagination, ProductGrid, SiteFooter, SiteHeader } from "../organisms";
import type { CatalogData } from "@/lib/catalog";
import type { HeaderData } from "@/lib/website-data";

interface CatalogTemplateProps {
  header: HeaderData;
  catalog: CatalogData;
}

export function CatalogTemplate({ header, catalog }: CatalogTemplateProps) {
  const { title, description, basePath, query, facets, meta, products } = catalog;
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader header={header} />
      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 pt-10 pb-16 md:px-10">
        <h1 className="text-center text-3xl font-semibold md:text-4xl">{title}</h1>
        {description && <p className="mx-auto mt-2 max-w-2xl text-center text-muted-foreground">{description}</p>}
        <AutoSubmitForm action={basePath} className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-y border-border py-4">
            <CatalogFilters facets={facets} query={query} basePath={basePath} />
            <div className="flex items-center gap-5">
              <SortSelect value={query.sort} />
              <span className="text-sm text-muted-foreground">
                {meta.total} {meta.total === 1 ? "product" : "products"}
              </span>
            </div>
          </div>
          <div className="mt-8">
            <ProductGrid products={products} />
            <Pagination meta={meta} query={query} basePath={basePath} />
          </div>
        </AutoSubmitForm>
      </main>
      <SiteFooter />
    </div>
  );
}
