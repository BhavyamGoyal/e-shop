import type { NextApiRequest, NextApiResponse } from "next";
import { REVALIDATE_HEADER } from "@/server/services/pages-revalidate.service";

const isPath = (value: unknown): value is string => typeof value === "string" && value.startsWith("/");

export default async function handler(request: NextApiRequest, response: NextApiResponse): Promise<void> {
  const secret: string | undefined = process.env.AUTH_SECRET;
  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }
  if (!secret || request.headers[REVALIDATE_HEADER] !== secret) {
    response.status(401).json({ error: "Unauthorized" });
    return;
  }
  const requested: unknown = request.body?.paths;
  const paths: string[] = Array.isArray(requested) ? requested.filter(isPath) : [];
  const results: PromiseSettledResult<void>[] = await Promise.allSettled(
    paths.map((path: string): Promise<void> => response.revalidate(path)),
  );
  const failed: string[] = paths.filter((_: string, index: number): boolean => results[index].status === "rejected");
  response.status(failed.length ? 500 : 200).json({ revalidated: paths.length - failed.length, failed });
}
