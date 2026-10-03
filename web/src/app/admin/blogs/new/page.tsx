import { BlogEditor } from "@/components/organisms";
import { AdminPage } from "@/components/templates";
import { blogController } from "@/server/controllers/blog.controller";

export default async function NewBlogPage() {
  return (
    <AdminPage>
      <BlogEditor {...(await blogController.editor(null))} />
    </AdminPage>
  );
}
