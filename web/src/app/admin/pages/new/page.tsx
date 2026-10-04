import { PageEditor } from "@/components/organisms";
import { AdminPage } from "@/components/templates";
import { pageController } from "@/server/controllers/page.controller";

export default async function NewPagePage() {
  return (
    <AdminPage>
      <PageEditor {...(await pageController.editor(null))} />
    </AdminPage>
  );
}
