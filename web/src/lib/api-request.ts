export class AuthRequiredError extends Error {}

export async function request<T>(method: string, url: string, payload?: unknown): Promise<T> {
  const response: Response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });
  const body: T & { error?: string } = await response.json().catch(() => ({}) as T & { error?: string });
  if (response.status === 401) throw new AuthRequiredError();
  if (!response.ok) throw new Error(body.error ?? "Something went wrong");
  return body;
}
