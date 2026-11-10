import { notFound } from "next/navigation";
import { AdminCustomizerStudio } from "@/customizers/components/AdminCustomizerStudio";
import { ADMIN_NAME_KEYCHAIN_SLUG } from "@/customizers/admin-slugs";
import { AdminPage } from "@/components/templates";
import { customizerService } from "@/server/services/customizer.service";
import type { CustomizerRecord } from "@/server/types/customizer.types";

export default async function AdminKeychainStudioPage() {
  const customizer: CustomizerRecord | null = await customizerService.findActive(ADMIN_NAME_KEYCHAIN_SLUG);
  if (!customizer) notFound();
  return (
    <AdminPage>
      <AdminCustomizerStudio customizer={JSON.parse(JSON.stringify(customizer)) as CustomizerRecord} />
    </AdminPage>
  );
}
