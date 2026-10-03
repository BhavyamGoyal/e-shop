"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, registerAction, type AuthState } from "@/server/actions/auth.actions";
import { Button, Heading, Text } from "../atoms";
import { AlertMessage, FormField } from "../molecules";

export type AuthMode = "login" | "register";

export interface AuthFormProps {
  mode: AuthMode;
  next: string;
}

const COPY: Record<AuthMode, { title: string; submit: string; alt: string; altHref: string; altLabel: string }> = {
  login: {
    title: "Sign in",
    submit: "Sign in",
    alt: "New here?",
    altHref: "/register",
    altLabel: "Create an account",
  },
  register: {
    title: "Create account",
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
    <form action={action} className="flex w-full max-w-sm flex-col gap-4">
      <Heading level={2}>{copy.title}</Heading>
      <input type="hidden" name="next" value={next} />
      {mode === "register" ? <FormField id="name" name="name" label="Name" autoComplete="name" /> : null}
      <FormField id="email" name="email" type="email" label="Email" autoComplete="email" required />
      <FormField
        id="password"
        name="password"
        type="password"
        label="Password"
        autoComplete={mode === "login" ? "current-password" : "new-password"}
        hint={mode === "register" ? "At least 8 characters" : undefined}
        required
      />
      {state.error ? <AlertMessage tone="danger" message={state.error} /> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Please wait..." : copy.submit}
      </Button>
      <Text tone="muted" className="text-sm">
        {copy.alt}{" "}
        <Link href={altHref} className="font-medium text-primary underline">
          {copy.altLabel}
        </Link>
      </Text>
    </form>
  );
}
