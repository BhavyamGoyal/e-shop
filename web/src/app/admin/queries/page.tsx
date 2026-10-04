import { QueriesManager } from "@/components/organisms";
import { AdminPage } from "@/components/templates";
import { requireAdminPage } from "@/server/auth/guard";

export default async function AdminQueriesPage() {
  await requireAdminPage();
  return (
    <AdminPage>
      <QueriesManager />
    </AdminPage>
  );
}
