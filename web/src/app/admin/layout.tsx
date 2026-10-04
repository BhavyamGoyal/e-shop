import type { Metadata } from "next";
import { AdminTemplate } from "@/components/templates";
import { NOT_INDEXED } from "@/lib/seo/metadata";
import { requireAdminPage } from "@/server/auth/guard";

export const metadata: Metadata = { title: "Admin", robots: NOT_INDEXED };

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const session = await requireAdminPage();
  return <AdminTemplate email={session.email} readOnly={session.role !== "admin"}>{children}</AdminTemplate>;
}
