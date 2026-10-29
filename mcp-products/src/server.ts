import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { api, type ApiResult } from "./api.js";
import { productFolders, readProductFolder, type ProductFolder } from "./folders.js";
import { removeStaged, slugify, stageImages, stagedFolderExists, type StagedImage } from "./stage.js";

interface ToolResult {
  [key: string]: unknown;
  content: { type: "text"; text: string }[];
  isError?: boolean;
}

const reply = (data: unknown, isError = false): ToolResult => ({
  content: [{ type: "text", text: typeof data === "string" ? data : JSON.stringify(data, null, 2) }],
  isError,
});

const alert = (message: string): ToolResult => reply(`ALERT: ${message}. Nothing was changed.`, true);

const server = new McpServer({ name: "tinglet-products", version: "0.1.0" });

server.registerTool(
  "scan_products_folder",
  {
    description:
      "List every product subfolder under a root folder with the full text of its .txt file, its image files, and warnings. Read-only.",
    inputSchema: { root: z.string().describe("Absolute path of the folder that contains the product folders") },
  },
  async ({ root }): Promise<ToolResult> => {
    const folders: string[] = await productFolders(root);
    const products: ProductFolder[] = [];
    for (const folder of folders) products.push(await readProductFolder(folder));
    return reply(products);
  },
);

server.registerTool(
  "list_categories",
  {
    description: "List existing store categories so the product can be assigned to valid category slugs. Read-only.",
    inputSchema: {},
  },
  async (): Promise<ToolResult> => {
    const result: ApiResult<unknown> = await api<unknown>("/api/admin/categories");
    return result.ok ? reply(result.body) : reply(`Request failed with status ${result.status}`, true);
  },
);

server.registerTool(
  "create_product",
  {
    description:
      "Create one new product: converts and copies the folder images into web/public/products/<handle>/images, then creates the product through the Tinglet admin API. If the handle already exists, returns an ALERT and changes nothing. Never updates existing products.",
    inputSchema: {
      folder: z.string().describe("Absolute path of the product folder holding the images subfolder"),
      title: z.string().min(1),
      price: z.number().min(0).default(0),
      compareAtPrice: z.number().min(0).nullable().default(null),
      descriptionHtml: z.string().default(""),
      categories: z.array(z.string()).default([]),
      tags: z.array(z.string()).default([]),
      vendor: z.string().default(""),
      productType: z.string().default(""),
      seoTitle: z.string().default(""),
      seoDescription: z.string().default(""),
      manufacturingDays: z.number().int().min(0).default(0),
      available: z.boolean().default(true),
    },
  },
  async (input): Promise<ToolResult> => {
    const handle: string = slugify(input.title);
    if (!handle) return alert("Title produces an empty handle");

    const existing: ApiResult<unknown> = await api<unknown>(`/api/product/${handle}`);
    if (existing.ok) return alert(`A product with handle "${handle}" already exists on the store`);
    if (existing.status !== 404) return alert(`Could not verify handle "${handle}" (status ${existing.status})`);
    if (await stagedFolderExists(handle)) return alert(`web/public/products/${handle} already exists locally`);

    const folder: ProductFolder = await readProductFolder(input.folder);
    if (folder.images.length === 0) return alert("The product folder has no images");

    const staged: StagedImage[] = await stageImages(handle, folder.images);
    const created: ApiResult<{ id?: string; error?: string }> = await api("/api/admin/products", "POST", {
      title: input.title,
      handle,
      vendor: input.vendor,
      productType: input.productType,
      tags: input.tags,
      categories: input.categories,
      descriptionHtml: input.descriptionHtml,
      price: input.price,
      compareAtPrice: input.compareAtPrice,
      manufacturingDays: input.manufacturingDays,
      available: input.available,
      active: false,
      images: staged.map((image: StagedImage): { url: string; alt: string } => ({ url: image.url, alt: input.title })),
      seoTitle: input.seoTitle,
      seoDescription: input.seoDescription,
    });
    if (!created.ok) {
      await removeStaged(handle);
      return alert(`API rejected the product (status ${created.status}): ${created.body.error ?? "unknown error"}`);
    }
    return reply({
      created: true,
      id: created.body.id,
      handle,
      images: staged.map((image: StagedImage): string => image.url),
    });
  },
);

await server.connect(new StdioServerTransport());
