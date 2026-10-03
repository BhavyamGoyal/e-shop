import { ProductEditor } from "@/components/organisms";
import { AdminPage } from "@/components/templates";
import { productAdminController } from "@/server/controllers/product-admin.controller";

export default async function NewProductPage() {
  return (
    <AdminPage>
      <ProductEditor {...(await productAdminController.editor(null))} />
    </AdminPage>
  );
}
