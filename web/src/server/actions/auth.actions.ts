"use server";

import { redirect } from "next/navigation";
import { endSession, startSession, type Session } from "../auth/session";
import { ApiError } from "../http/errors";
import { loginUser, registerUser } from "../services/auth.service";

export interface AuthState {
  error: string | null;
}

const field = (data: FormData, key: string): string => {
  const value: FormDataEntryValue | null = data.get(key);
  return typeof value === "string" ? value : "";
};

const safeNext = (value: string, fallback: string): string =>
  value.startsWith("/") && !value.startsWith("//") ? value : fallback;

async function authenticate(action: () => Promise<Session>, next: string): Promise<AuthState> {
  let session: Session;
  try {
    session = await action();
  } catch (error: unknown) {
    if (error instanceof ApiError) return { error: error.message };
    throw error;
  }
  await startSession(session);
  redirect(session.role === "admin" ? safeNext(next, "/admin") : safeNext(next, "/"));
}

export async function loginAction(_state: AuthState, data: FormData): Promise<AuthState> {
  return authenticate(() => loginUser(field(data, "email"), field(data, "password")), field(data, "next"));
}

export async function registerAction(_state: AuthState, data: FormData): Promise<AuthState> {
  return authenticate(
    () => registerUser(field(data, "name"), field(data, "email"), field(data, "password")),
    field(data, "next"),
  );
}

export async function logoutAction(): Promise<void> {
  await endSession();
  redirect("/login");
}
