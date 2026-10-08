import { instagramController } from "@/server/controllers/instagram.controller";
import { handleRequest } from "@/server/http/handler";

export function POST(): Promise<Response> {
  return handleRequest(async (): Promise<Response> => Response.json({ data: await instagramController.sync() }));
}
