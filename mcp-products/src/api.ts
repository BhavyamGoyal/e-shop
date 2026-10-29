import { config } from "./config.js";

export interface ApiResult<T> {
  ok: boolean;
  status: number;
  body: T;
}

let cookie: string | null = null;

async function login(): Promise<void> {
  const response: Response = await fetch(`${config.apiUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: config.email, password: config.password }),
  });
  if (!response.ok) throw new Error(`Login failed with status ${response.status}`);
  const session: string | undefined = response.headers
    .getSetCookie()
    .map((value: string): string => value.split(";")[0])
    .find((value: string): boolean => value.startsWith("tinglet_session="));
  if (!session) throw new Error("Login did not return a session cookie");
  cookie = session;
}

async function send(path: string, method: string, payload?: unknown): Promise<Response> {
  return fetch(`${config.apiUrl}${path}`, {
    method,
    headers: { "Content-Type": "application/json", Cookie: cookie ?? "" },
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });
}

export async function api<T>(path: string, method = "GET", payload?: unknown): Promise<ApiResult<T>> {
  if (!cookie) await login();
  let response: Response = await send(path, method, payload);
  if (response.status === 401) {
    await login();
    response = await send(path, method, payload);
  }
  const text: string = await response.text();
  const body: T = (text ? JSON.parse(text) : {}) as T;
  return { ok: response.ok, status: response.status, body };
}
