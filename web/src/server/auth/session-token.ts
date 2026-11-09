import { createHmac, timingSafeEqual } from "node:crypto";
import type { UserRole } from "../models/user.model";

export interface Session {
  userId: string;
  email: string;
  role: UserRole;
}

interface SessionPayload extends Session {
  exp: number;
}

export const SESSION_COOKIE = "tinglet_session";
export const SESSION_SECONDS = 60 * 60 * 24 * 7;

function secret(): string {
  const value: string | undefined = process.env.AUTH_SECRET;
  if (!value) throw new Error("AUTH_SECRET is not set");
  return value;
}

const sign = (body: string): string => createHmac("sha256", secret()).update(body).digest("base64url");

export function encodeSession(session: Session): string {
  const payload: SessionPayload = { ...session, exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS };
  const body: string = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function decodeSession(token: string | undefined): Session | null {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  const expected: Buffer = Buffer.from(sign(body));
  const actual: Buffer = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  const payload: SessionPayload = JSON.parse(Buffer.from(body, "base64url").toString());
  if (payload.exp < Date.now() / 1000) return null;
  return { userId: payload.userId, email: payload.email, role: payload.role };
}
