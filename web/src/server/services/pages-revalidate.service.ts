import { SITE_URL } from "@/lib/site";

const REVALIDATE_ENDPOINT = "/api/revalidate";
export const REVALIDATE_HEADER = "x-revalidate-secret";

export async function revalidatePages(paths: string[]): Promise<void> {
  const secret: string | undefined = process.env.AUTH_SECRET;
  if (!secret || !paths.length) return;
  try {
    const response: Response = await fetch(`${SITE_URL}${REVALIDATE_ENDPOINT}`, {
      method: "POST",
      headers: { "content-type": "application/json", [REVALIDATE_HEADER]: secret },
      body: JSON.stringify({ paths: [...new Set(paths)] }),
    });
    if (!response.ok) console.error(`Pages revalidation failed with ${response.status}`);
  } catch (error: unknown) {
    console.error("Pages revalidation request failed", error);
  }
}
