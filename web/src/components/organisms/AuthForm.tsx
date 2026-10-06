"use client";

import Link from "next/link";
import { useActionState, type ReactNode } from "react";
import { loginAction, registerAction, type AuthState } from "@/server/actions/auth.actions";
import { Button, Heading, Text } from "../atoms";
import { AlertMessage, IconField } from "../molecules";
import { GoogleSignInButton } from "./GoogleSignInButton";

export type AuthMode = "login" | "register";

export interface AuthFormProps {
  mode: AuthMode;
  next: string;
}

const iconSvg = (path: string): ReactNode => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-4" aria-hidden="true">
    <path d={path} />
  </svg>
);

const MAIL_ICON: ReactNode = iconSvg("M4 6h16v12H4zM4 7l8 6 8-6");
const LOCK_ICON: ReactNode = iconSvg("M6 11h12v9H6zM8 11V8a4 4 0 0 1 8 0v3");
const USER_ICON: ReactNode = iconSvg("M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21a8 8 0 0 1 16 0");

const COPY: Record<
  AuthMode,
  { title: string; subtitle: string; submit: string; alt: string; altHref: string; altLabel: string }
> = {
  login: {
    title: "Sign in with email",
    subtitle: "Welcome back. Sign in to continue shopping.",
    submit: "Sign in",
    alt: "New here?",
    altHref: "/register",
    altLabel: "Create an account",
  },
  register: {
    title: "Create account",
    subtitle: "Join us and start shopping in seconds.",
    submit: "Register",
    alt: "Already registered?",
    altHref: "/login",
    altLabel: "Sign in",
  },
};

const INITIAL: AuthState = { error: null };

export function AuthForm({ mode, next }: AuthFormProps) {
  const [state, action, pending] = useActionState(mode === "login" ? loginAction : registerAction, INITIAL);
  const copy = COPY[mode];
  const altHref: string = next ? `${copy.altHref}?next=${encodeURIComponent(next)}` : copy.altHref;

  return (
    <form
      action={action}
      className="flex w-full max-w-sm flex-col gap-4 rounded-3xl border border-surface/60 bg-surface/60 p-8 shadow-xl backdrop-blur-md"
    >
      <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-background text-foreground shadow-sm">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-5" aria-hidden="true">
          <path d="M10 17l5-5-5-5M15 12H3M15 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
        </svg>
      </span>
      <div className="flex flex-col items-center gap-1 text-center">
        <Heading level={2}>{copy.title}</Heading>
        <Text tone="muted" className="text-sm">
          {copy.subtitle}
        </Text>
      </div>
      <input type="hidden" name="next" value={next} />
      {mode === "register" ? (
        <IconField id="name" name="name" label="Name" icon={USER_ICON} autoComplete="name" />
      ) : null}
      <IconField id="email" name="email" type="email" label="Email" icon={MAIL_ICON} autoComplete="email" required />
      <IconField
        id="password"
        name="password"
        type="password"
        label="Password"
        icon={LOCK_ICON}
        autoComplete={mode === "login" ? "current-password" : "new-password"}
        hint={mode === "register" ? "At least 8 characters" : undefined}
        required
      />
      {state.error ? <AlertMessage tone="danger" message={state.error} /> : null}
      <Button type="submit" disabled={pending} className="h-11 rounded-lg bg-foreground text-background">
        {pending ? "Please wait..." : copy.submit}
      </Button>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        Or sign in with
        <span className="h-px flex-1 bg-border" />
      </div>
      <GoogleSignInButton next={next} />
      <Text tone="muted" className="text-center text-sm">
        {copy.alt}{" "}
        <Link href={altHref} className="font-medium text-primary underline">
          {copy.altLabel}
        </Link>
      </Text>
    </form>
  );
}
