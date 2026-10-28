import type { NextRequest } from "next/server";
import { NotFoundError } from "../http/errors";
import { handleRequest } from "../http/handler";
import { toDetail, toSummary } from "../mappers/product.mapper";
import { productRepository, type ProductRepository, type ProductSitemapEntry } from "../repositories/product.repository";
import type { CatalogFacets, ProductDetail, ProductPage, ProductQuery, ProductSummary } from "../types/product.types";
import { parseProductQuery } from "../validators/product-query";

const SUGGEST_MIN_LENGTH = 2;
const SUGGEST_LIMIT = 6;

export class ProductController {
  private readonly repository: ProductRepository;

  constructor(repository: ProductRepository) {
    this.repository = repository;
  }

  search = async (query: ProductQuery): Promise<ProductPage> => {
    const { items, total } = await this.repository.search(query);
    return {
      data: items.map(toSummary),
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  };

  facets = (collections: string[]): Promise<CatalogFacets> => this.repository.facets(collections);

  sitemapEntries = (): Promise<ProductSitemapEntry[]> => this.repository.sitemapEntries();

  findByHandle = async (handle: string): Promise<ProductDetail> => {
    const doc = await this.repository.findByHandle(handle);
    if (!doc) throw new NotFoundError(`Product "${handle}" not found`);
    return toDetail(doc);
  };

  list = (request: NextRequest): Promise<Response> =>
    handleRequest(async (): Promise<Response> => {
      const query: ProductQuery = parseProductQuery(request.nextUrl.searchParams);
      return Response.json(await this.search(query));
    });

  suggest = (request: NextRequest): Promise<Response> =>
    handleRequest(async (): Promise<Response> => {
      const term: string = request.nextUrl.searchParams.get("q")?.trim() ?? "";
      if (term.length < SUGGEST_MIN_LENGTH) return Response.json({ data: [] });
      const query: ProductQuery = parseProductQuery(new URLSearchParams({ q: term, limit: String(SUGGEST_LIMIT) }));
      const page: ProductPage = await this.search(query);
      const data: ProductSummary[] = page.data;
      return Response.json({ data });
    });

  detail = (handle: string): Promise<Response> =>
    handleRequest(async (): Promise<Response> => Response.json({ data: await this.findByHandle(handle) }));
}

export const productController: ProductController = new ProductController(productRepository);
