import { notFound } from "next/navigation";
import { BlogEditor } from "@/components/organisms";
import { AdminPage } from "@/components/templates";
import { blogController } from "@/server/controllers/blog.controller";
import { NotFoundError } from "@/server/http/errors";
import type { BlogEditorData } from "@/server/types/content.types";

export default async function EditBlogPage(props: PageProps<"/admin/blogs/[id]">) {
  const { id } = await props.params;
  let data: BlogEditorData;
  try {
    data = await blogController.editor(id);
  } catch (error: unknown) {
    if (error instanceof NotFoundError || (error instanceof Error && error.name === "CastError")) notFound();
    throw error;
  }
  return (
    <AdminPage>
      <BlogEditor {...data} />
    </AdminPage>
  );
}
