"use client";

import { GoogleAuthProvider, getAuth, signInWithCredential, signOut } from "firebase/auth";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { app } from "@/firebase";
import { googleLoginAction } from "@/server/actions/auth.actions";

interface CredentialResponse {
  credential: string;
}

interface GoogleIdentity {
  accounts: {
    id: {
      initialize: (config: {
        client_id: string;
        callback: (response: CredentialResponse) => void;
        auto_select: boolean;
        cancel_on_tap_outside: boolean;
      }) => void;
      prompt: () => void;
      cancel: () => void;
    };
  };
}

declare global {
  interface Window {
    google?: GoogleIdentity;
  }
}

const CLIENT_ID: string = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
const AUTH_PATHS: readonly string[] = ["/login", "/register"];

export function GoogleOneTap() {
  const pathname: string = usePathname();
  const [ready, setReady] = useState<boolean>(false);
  const [anonymous, setAnonymous] = useState<boolean>(false);
  const nextRef = useRef<string>(pathname);
  nextRef.current = AUTH_PATHS.includes(pathname) ? "/" : pathname;

  useEffect(() => {
    if (!CLIENT_ID) return;
    fetch("/api/me")
      .then((response: Response) => response.json())
      .then((body: { data: unknown }) => setAnonymous(!body.data))
      .catch(() => setAnonymous(false));
  }, []);

  useEffect(() => {
    if (!ready || !anonymous || !window.google) return;
    const identity = window.google.accounts.id;
    identity.initialize({
      client_id: CLIENT_ID,
      auto_select: true,
      cancel_on_tap_outside: false,
      callback: async ({ credential }: CredentialResponse): Promise<void> => {
        try {
          const auth = getAuth(app);
          const result = await signInWithCredential(auth, GoogleAuthProvider.credential(credential));
          const idToken: string = await result.user.getIdToken();
          await signOut(auth);
          await googleLoginAction(idToken, nextRef.current);
        } catch {
          return;
        }
      },
    });
    identity.prompt();
    return () => identity.cancel();
  }, [ready, anonymous]);

  if (!CLIENT_ID || !anonymous) return null;
  return (
    <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onReady={() => setReady(true)} />
  );
}
