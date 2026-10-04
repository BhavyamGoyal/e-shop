import { UsersManager } from "@/components/organisms";
import { AdminPage } from "@/components/templates";
import { requireAdminPage } from "@/server/auth/guard";

export default async function AdminUsersPage() {
  const session = await requireAdminPage();
  return (
    <AdminPage>
      <UsersManager canEdit={session.role === "admin"} currentUserId={session.userId} />
    </AdminPage>
  );
}
