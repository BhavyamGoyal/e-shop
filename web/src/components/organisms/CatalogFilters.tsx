import { FilterGroup, FilterOption } from "../molecules";
import type { CatalogFacets, FacetValue, ProductQuery } from "@/server/types/product.types";

interface CatalogFiltersProps {
  facets: CatalogFacets;
  query: ProductQuery;
  basePath: string;
}

interface PriceFieldProps {
  name: string;
  label: string;
  placeholder: number;
  value?: number;
}

const priceInput =
  "w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-ring";

function PriceField({ name, label, placeholder, value }: PriceFieldProps) {
  return (
    <input
      type="number"
      name={name}
      min={0}
      placeholder={String(placeholder)}
      defaultValue={value}
      aria-label={label}
      className={priceInput}
    />
  );
}

function renderOptions(name: string, values: FacetValue[], selected: string[]) {
  return values.map((item: FacetValue) => (
    <FilterOption
      key={item.value}
      name={name}
      value={item.value}
      label={item.value}
      count={item.count}
      checked={selected.includes(item.value)}
    />
  ));
}

export function CatalogFilters({ facets, query, basePath }: CatalogFiltersProps) {
  const availability: number = Number(query.available === true) + Number(query.onSale === true);
  const price: number = Number(query.minPrice !== undefined) + Number(query.maxPrice !== undefined);
  const active: number = availability + price + query.productTypes.length + query.tags.length;
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm text-muted-foreground">Filter:</span>
      <FilterGroup title="Availability" selected={availability}>
        <FilterOption name="available" value="true" label="In stock only" checked={query.available === true} />
        <FilterOption name="onSale" value="true" label="On sale" checked={query.onSale === true} />
      </FilterGroup>
      <FilterGroup title="Price" selected={price}>
        <div className="flex items-center gap-2">
          <PriceField name="minPrice" label="Minimum price" placeholder={facets.minPrice} value={query.minPrice} />
          <span className="text-muted-foreground">–</span>
          <PriceField name="maxPrice" label="Maximum price" placeholder={facets.maxPrice} value={query.maxPrice} />
        </div>
      </FilterGroup>
      {facets.productTypes.length > 0 && (
        <FilterGroup title="Product type" selected={query.productTypes.length}>
          {renderOptions("productType", facets.productTypes, query.productTypes)}
        </FilterGroup>
      )}
      {facets.tags.length > 0 && (
        <FilterGroup title="Tags" selected={query.tags.length}>
          {renderOptions("tag", facets.tags, query.tags)}
        </FilterGroup>
      )}
      {active > 0 && (
        <a href={basePath} className="text-sm text-muted-foreground underline hover:text-foreground">
          Remove all
        </a>
      )}
    </div>
  );
}
