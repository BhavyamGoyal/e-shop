import { CartsManager } from "@/components/organisms";
import { AdminPage } from "@/components/templates";
import { requireAdminPage } from "@/server/auth/guard";

export default async function AdminCartsPage() {
  await requireAdminPage();
  return (
    <AdminPage>
      <CartsManager />
    </AdminPage>
  );
}
