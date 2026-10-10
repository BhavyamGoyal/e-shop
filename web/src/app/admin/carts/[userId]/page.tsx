import { notFound } from "next/navigation";
import { CartDetailView } from "@/components/organisms";
import { AdminPage } from "@/components/templates";
import { requireAdminPage } from "@/server/auth/guard";
import { cartController } from "@/server/controllers/cart.controller";
import { NotFoundError } from "@/server/http/errors";
import type { CartDetail } from "@/server/types/cart.types";

export default async function AdminCartDetailPage(props: PageProps<"/admin/carts/[userId]">) {
  await requireAdminPage();
  const { userId } = await props.params;
  let cart: CartDetail;
  try {
    cart = await cartController.detail(userId);
  } catch (error: unknown) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }
  return (
    <AdminPage>
      <CartDetailView cart={cart} />
    </AdminPage>
  );
}
