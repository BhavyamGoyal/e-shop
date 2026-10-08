import { InstagramDashboard } from "@/components/organisms";
import { AdminPage } from "@/components/templates";
import { requireAdminPage } from "@/server/auth/guard";

export default async function AdminInstagramPage() {
  await requireAdminPage();
  return (
    <AdminPage>
      <InstagramDashboard />
    </AdminPage>
  );
}
