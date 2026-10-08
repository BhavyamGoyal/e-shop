import type { NextRequest } from "next/server";
import { isStaff } from "../auth/guard";
import { startSession, type Session } from "../auth/session";
import { handleRequest } from "../http/handler";
import { loginUser, loginWithGoogle, registerUser } from "../services/auth.service";

type Fields = Record<string, unknown>;

const text = (raw: Fields, key: string): string => (typeof raw[key] === "string" ? (raw[key] as string) : "");

const safeNext = (value: string, fallback: string): string =>
  value.startsWith("/") && !value.startsWith("//") ? value : fallback;

export const landingPath = (session: Session, next: string): string =>
  safeNext(next, isStaff(session.role) ? "/admin" : "/");

export class AuthController {
  private authenticate = (
    request: NextRequest,
    resolve: (raw: Fields) => Promise<Session>,
  ): Promise<Response> =>
    handleRequest(async (): Promise<Response> => {
      const raw: Fields = ((await request.json()) ?? {}) as Fields;
      const session: Session = await resolve(raw);
      await startSession(session);
      return Response.json({ redirect: landingPath(session, text(raw, "next")) });
    });

  login = (request: NextRequest): Promise<Response> =>
    this.authenticate(request, (raw: Fields): Promise<Session> => loginUser(text(raw, "email"), text(raw, "password")));

  register = (request: NextRequest): Promise<Response> =>
    this.authenticate(request, (raw: Fields): Promise<Session> =>
      registerUser(text(raw, "name"), text(raw, "email"), text(raw, "password")),
    );

  google = (request: NextRequest): Promise<Response> =>
    this.authenticate(request, (raw: Fields): Promise<Session> => loginWithGoogle(text(raw, "idToken")));
}

export const authController: AuthController = new AuthController();
