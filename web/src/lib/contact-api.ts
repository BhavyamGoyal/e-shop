import type { CustomerQueryInput } from "@/server/types/contact.types";

export async function submitQuery(input: CustomerQueryInput): Promise<void> {
  const response: Response = await fetch("/api/queries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const body: { error?: string } = await response.json();
  if (!response.ok) throw new Error(body.error ?? "Request failed");
}
