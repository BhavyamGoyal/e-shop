import { notFound } from "next/navigation";
import { OrderDetailView } from "@/components/organisms";
import { AdminPage } from "@/components/templates";
import { requireAdminPage } from "@/server/auth/guard";
import { orderController } from "@/server/controllers/order.controller";
import { NotFoundError } from "@/server/http/errors";
import type { OrderDetail } from "@/server/types/order-view.types";

export default async function AdminOrderDetailPage(props: PageProps<"/admin/orders/[orderNumber]">) {
  await requireAdminPage();
  const { orderNumber } = await props.params;
  let order: OrderDetail;
  try {
    order = await orderController.detail(orderNumber);
  } catch (error: unknown) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }
  return (
    <AdminPage>
      <OrderDetailView order={order} />
    </AdminPage>
  );
}
