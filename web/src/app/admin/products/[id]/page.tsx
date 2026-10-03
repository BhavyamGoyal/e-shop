import { notFound } from "next/navigation";
import { ProductEditor } from "@/components/organisms";
import { AdminPage } from "@/components/templates";
import { productAdminController } from "@/server/controllers/product-admin.controller";
import { NotFoundError } from "@/server/http/errors";
import type { ProductEditorData } from "@/server/types/admin.types";

export default async function EditProductPage(props: PageProps<"/admin/products/[id]">) {
  const { id } = await props.params;
  let data: ProductEditorData;
  try {
    data = await productAdminController.editor(id);
  } catch (error: unknown) {
    if (error instanceof NotFoundError || (error instanceof Error && error.name === "CastError")) notFound();
    throw error;
  }
  return (
    <AdminPage>
      <ProductEditor {...data} />
    </AdminPage>
  );
}
