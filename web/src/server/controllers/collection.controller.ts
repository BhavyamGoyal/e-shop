import {
  productRepository,
  type CollectionStat,
  type ProductRepository,
} from "../repositories/product.repository";
import type { CollectionSummary } from "../types/product.types";

const titleCase = (handle: string): string =>
  handle
    .split("-")
    .map((word: string): string => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

function assignDistinctCovers(stats: CollectionStat[]): CollectionSummary[] {
  const used: Set<string> = new Set();
  return stats.map((stat: CollectionStat): CollectionSummary => {
    const image: string | null =
      stat.images.find((url: string): boolean => !used.has(url)) ?? stat.images[0] ?? null;
    if (image) used.add(image);
    return { handle: stat.handle, title: titleCase(stat.handle), count: stat.count, image };
  });
}

export class CollectionController {
  private readonly repository: ProductRepository;

  constructor(repository: ProductRepository) {
    this.repository = repository;
  }

  all = async (): Promise<CollectionSummary[]> => {
    const stats: CollectionStat[] = await this.repository.collectionStats();
    return assignDistinctCovers(stats).sort(
      (a: CollectionSummary, b: CollectionSummary): number =>
        b.count - a.count || a.handle.localeCompare(b.handle),
    );
  };

  findByHandle = async (handle: string): Promise<CollectionSummary | null> =>
    (await this.all()).find((collection: CollectionSummary): boolean => collection.handle === handle) ?? null;
}

export const collectionController: CollectionController = new CollectionController(productRepository);
