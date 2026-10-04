import { firebaseConfig } from "@/firebase";
import { ValidationError } from "../http/errors";

export interface GoogleProfile {
  name: string;
  email: string;
  image: string;
}

interface LookupUser {
  email?: string;
  emailVerified?: boolean;
  displayName?: string;
  photoUrl?: string;
}

const LOOKUP_URL = "https://identitytoolkit.googleapis.com/v1/accounts:lookup";

export async function verifyGoogleToken(idToken: string): Promise<GoogleProfile> {
  const response: Response = await fetch(`${LOOKUP_URL}?key=${firebaseConfig.apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
    cache: "no-store",
  });
  if (!response.ok) throw new ValidationError("Google sign-in failed");
  const body: { users?: LookupUser[] } = await response.json();
  const user: LookupUser | undefined = body.users?.[0];
  if (!user?.email || !user.emailVerified) throw new ValidationError("Google account email is not verified");
  return { name: user.displayName ?? "", email: user.email, image: user.photoUrl ?? "" };
}
