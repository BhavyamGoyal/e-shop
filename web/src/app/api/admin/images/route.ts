import type { NextRequest } from "next/server";
import { imageController } from "@/server/controllers/image.controller";
import { ValidationError } from "@/server/http/errors";
import { handleRequest } from "@/server/http/handler";

const DEFAULT_LIMIT = 24;

const positive = (value: string | null, fallback: number): number => {
  const parsed: number = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

export function GET(request: NextRequest): Promise<Response> {
  return handleRequest(async (): Promise<Response> => {
    const params: URLSearchParams = request.nextUrl.searchParams;
    const page = await imageController.list(
      positive(params.get("page"), 1),
      Math.min(positive(params.get("limit"), DEFAULT_LIMIT), 100),
      params.get("q")?.trim() ?? "",
    );
    return Response.json(page);
  });
}

export function POST(request: NextRequest): Promise<Response> {
  return handleRequest(async (): Promise<Response> => {
    const form: FormData = await request.formData();
    const file: FormDataEntryValue | null = form.get("file");
    if (!(file instanceof File)) throw new ValidationError("No file provided");
    return Response.json({ data: await imageController.upload(file) }, { status: 201 });
  });
}
