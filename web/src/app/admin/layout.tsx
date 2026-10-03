import { AdminTemplate } from "@/components/templates";
import { requireAdminPage } from "@/server/auth/guard";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const session = await requireAdminPage();
  return <AdminTemplate email={session.email}>{children}</AdminTemplate>;
}
