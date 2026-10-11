import { AdminOrdersManager } from "@/components/organisms";
import { AdminPage } from "@/components/templates";
import { requireAdminPage } from "@/server/auth/guard";

export default async function AdminOrdersPage() {
  await requireAdminPage();
  return (
    <AdminPage>
      <AdminOrdersManager />
    </AdminPage>
  );
}
