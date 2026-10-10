import { requireStaff } from "../auth/guard";
import { readSession, type Session } from "../auth/session";
import { NotFoundError, UnauthorizedError } from "../http/errors";
import { cartRepository, type StoredCart } from "../repositories/cart.repository";
import { userRepository, type StoredUser } from "../repositories/user.repository";
import type { CartDetail, CartLineRecord, CartSummary } from "../types/cart.types";

type Raw = Record<string, unknown>;

const MAX_LINES = 100;

const asText = (value: unknown): string => (typeof value === "string" ? value : "");
const asNumber = (value: unknown): number => (typeof value === "number" && Number.isFinite(value) ? value : 0);

function toLine(value: unknown): CartLineRecord | null {
  const raw: Raw = (value ?? {}) as Raw;
  const key: string = asText(raw.key);
  const handle: string = asText(raw.handle);
  const quantity: number = Math.floor(asNumber(raw.quantity));
  if (!key || !handle || quantity < 1) return null;
  const compareAtPrice: number = asNumber(raw.compareAtPrice);
  return {
    key,
    handle,
    title: asText(raw.title) || handle,
    variantTitle: asText(raw.variantTitle) || null,
    image: asText(raw.image) || null,
    price: Math.max(0, asNumber(raw.price)),
    compareAtPrice: compareAtPrice > 0 ? compareAtPrice : null,
    quantity: Math.min(99, quantity),
  };
}

const parseLines = (payload: unknown): CartLineRecord[] => {
  const items: unknown = ((payload ?? {}) as Raw).items;
  if (!Array.isArray(items)) return [];
  return items
    .slice(0, MAX_LINES)
    .map(toLine)
    .filter((line: CartLineRecord | null): line is CartLineRecord => line !== null);
};

const toSummary = (cart: StoredCart): CartSummary => ({
  userId: cart.userId,
  email: cart.email,
  name: cart.name ?? "",
  itemCount: cart.items.reduce((sum: number, line): number => sum + line.quantity, 0),
  total: cart.items.reduce((sum: number, line): number => sum + line.price * line.quantity, 0),
  updatedAt: new Date(cart.updatedAt).toISOString(),
});

export const cartController = {
  async save(payload: unknown): Promise<void> {
    const session: Session | null = await readSession();
    if (!session) throw new UnauthorizedError();
    const user: StoredUser | null = await userRepository.findById(session.userId);
    if (!user) throw new UnauthorizedError();
    await cartRepository.save(session.userId, user.email, user.name ?? "", parseLines(payload));
  },

  async list(): Promise<CartSummary[]> {
    await requireStaff();
    return (await cartRepository.listNonEmpty()).map(toSummary);
  },

  async detail(userId: string): Promise<CartDetail> {
    await requireStaff();
    const cart: StoredCart | null = await cartRepository.findByUserId(userId);
    if (!cart) throw new NotFoundError("Cart not found");
    return { ...toSummary(cart), items: cart.items as CartLineRecord[] };
  },
};
