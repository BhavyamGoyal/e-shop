import { readSession, type Session } from "../auth/session";
import { UnauthorizedError } from "../http/errors";
import { wishlistRepository, type StoredWishlist } from "../repositories/wishlist.repository";
import type { WishlistItemRecord } from "../types/wishlist.types";

type Raw = Record<string, unknown>;

const MAX_ITEMS = 200;

const asText = (value: unknown): string => (typeof value === "string" ? value : "");
const asNumber = (value: unknown): number => (typeof value === "number" && Number.isFinite(value) ? value : 0);

function toItem(value: unknown): WishlistItemRecord | null {
  const raw: Raw = (value ?? {}) as Raw;
  const handle: string = asText(raw.handle);
  if (!handle) return null;
  const compareAtPrice: number = asNumber(raw.compareAtPrice);
  return {
    handle,
    title: asText(raw.title) || handle,
    image: asText(raw.image) || null,
    price: Math.max(0, asNumber(raw.price)),
    compareAtPrice: compareAtPrice > 0 ? compareAtPrice : null,
  };
}

const parseItems = (payload: unknown): WishlistItemRecord[] => {
  const items: unknown = ((payload ?? {}) as Raw).items;
  if (!Array.isArray(items)) return [];
  const seen: Set<string> = new Set();
  return items
    .map(toItem)
    .filter((item: WishlistItemRecord | null): item is WishlistItemRecord => {
      if (!item || seen.has(item.handle)) return false;
      seen.add(item.handle);
      return true;
    })
    .slice(0, MAX_ITEMS);
};

const requireSession = async (): Promise<Session> => {
  const session: Session | null = await readSession();
  if (!session) throw new UnauthorizedError();
  return session;
};

export const wishlistController = {
  async get(): Promise<WishlistItemRecord[]> {
    const session: Session = await requireSession();
    const stored: StoredWishlist | null = await wishlistRepository.findByUserId(session.userId);
    return (stored?.items ?? []) as WishlistItemRecord[];
  },

  async save(payload: unknown): Promise<void> {
    const session: Session = await requireSession();
    await wishlistRepository.save(session.userId, parseItems(payload));
  },
};
