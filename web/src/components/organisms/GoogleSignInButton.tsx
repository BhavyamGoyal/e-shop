"use client";

import { GoogleAuthProvider, getAuth, signInWithPopup, signOut, type UserCredential } from "firebase/auth";
import { useState } from "react";
import { app } from "@/firebase";
import { googleLoginAction } from "@/server/actions/auth.actions";
import { Button } from "../atoms";
import { AlertMessage } from "../molecules";

export interface GoogleSignInButtonProps {
  next: string;
}

export function GoogleSignInButton({ next }: GoogleSignInButtonProps) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<boolean>(false);

  const signIn = async (): Promise<void> => {
    setPending(true);
    setError(null);
    try {
      const auth = getAuth(app);
      const credential: UserCredential = await signInWithPopup(auth, new GoogleAuthProvider());
      const idToken: string = await credential.user.getIdToken();
      await signOut(auth);
      const result = await googleLoginAction(idToken, next);
      if (result.error) setError(result.error);
    } catch (caught: unknown) {
      const code: string = (caught as { code?: string }).code ?? "";
      if (code !== "auth/popup-closed-by-user" && code !== "auth/cancelled-popup-request") {
        setError("Google sign-in failed. Please try again.");
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {error ? <AlertMessage tone="danger" message={error} /> : null}
      <Button variant="outline" tone="primary" disabled={pending} onClick={signIn}>
        {pending ? "Please wait..." : "Continue with Google"}
      </Button>
    </div>
  );
}
