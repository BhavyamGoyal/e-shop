import { ApiError } from "../http/errors";

const GRAPH_URL: string = "https://graph.facebook.com/v23.0";

export interface GraphCredentials {
  userId: string;
  token: string;
}

interface GraphErrorBody {
  error?: { message?: string };
}

export function readCredentials(): GraphCredentials | null {
  const userId: string | undefined = process.env.INSTAGRAM_USER_ID;
  const token: string | undefined = process.env.INSTAGRAM_ACCESS_TOKEN;
  return userId && token ? { userId, token } : null;
}

export async function graphGet<T>(path: string, params: Record<string, string>, token: string): Promise<T> {
  const query: URLSearchParams = new URLSearchParams({ ...params, access_token: token });
  const response: Response = await fetch(`${GRAPH_URL}/${path}?${query.toString()}`, { cache: "no-store" });
  const body: T & GraphErrorBody = await response.json();
  if (!response.ok) throw new ApiError(502, body.error?.message ?? "Instagram request failed");
  return body;
}
