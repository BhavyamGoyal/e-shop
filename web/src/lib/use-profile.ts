"use client";

import { useEffect, useState } from "react";

export interface Profile {
  name: string;
  email: string;
  image: string;
}

export interface ProfileState {
  profile: Profile | null;
  loaded: boolean;
}

export function useProfile(): ProfileState {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loaded, setLoaded] = useState<boolean>(false);

  useEffect(() => {
    fetch("/api/me")
      .then((response: Response) => response.json())
      .then((body: { data: Profile | null }) => setProfile(body.data))
      .catch(() => setProfile(null))
      .finally(() => setLoaded(true));
  }, []);

  return { profile, loaded };
}
