import { handleRequest } from "@/server/http/handler";
import { queryController } from "@/server/controllers/query.controller";

export function GET(): Promise<Response> {
  return handleRequest(async (): Promise<Response> => Response.json({ data: await queryController.list() }));
}
