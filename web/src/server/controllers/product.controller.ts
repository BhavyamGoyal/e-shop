import type { NextRequest } from "next/server";
import { NotFoundError } from "../http/errors";
import { handleRequest } from "../http/handler";
import { toDetail, toSummary } from "../mappers/product.mapper";
import { productRepository, type ProductRepository } from "../repositories/product.repository";
import type { CatalogFacets, ProductDetail, ProductPage, ProductQuery } from "../types/product.types";
import { parseProductQuery } from "../validators/product-query";

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

  detail = (handle: string): Promise<Response> =>
    handleRequest(async (): Promise<Response> => Response.json({ data: await this.findByHandle(handle) }));
}

export const productController: ProductController = new ProductController(productRepository);
