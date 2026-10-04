import { notFound } from "next/navigation";
import { PageEditor } from "@/components/organisms";
import { AdminPage } from "@/components/templates";
import { pageController } from "@/server/controllers/page.controller";
import { NotFoundError } from "@/server/http/errors";
import type { PageEditorData } from "@/server/types/content.types";

export default async function EditPagePage(props: PageProps<"/admin/pages/[id]">) {
  const { id } = await props.params;
  let data: PageEditorData;
  try {
    data = await pageController.editor(id);
  } catch (error: unknown) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }
  return (
    <AdminPage>
      <PageEditor {...data} />
    </AdminPage>
  );
}
