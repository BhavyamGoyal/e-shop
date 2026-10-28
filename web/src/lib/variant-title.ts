import type { ProductOption } from "@/server/types/product.types";

export const isSingleDefault = (options: ProductOption[]): boolean =>
  options.length === 0 || (options.length === 1 && options[0].values.length === 1);
