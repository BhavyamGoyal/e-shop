import type { NextRequest } from "next/server";
import { productController } from "@/server/controllers/product.controller";

export async function GET(
  _request: NextRequest,
  context: RouteContext<"/api/product/[handle]">,
): Promise<Response> {
  const { handle } = await context.params;
  return productController.detail(handle);
}
