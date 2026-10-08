export type AuthRoute = "login" | "register" | "google";

export async function postAuth(route: AuthRoute, payload: Record<string, string>): Promise<string> {
  const response: Response = await fetch(`/api/auth/${route}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body: { redirect?: string; error?: string } = await response.json().catch(() => ({}));
  if (!response.ok || !body.redirect) throw new Error(body.error ?? "Something went wrong");
  return body.redirect;
}
