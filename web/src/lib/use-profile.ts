"use client";

import { useEffect, useState } from "react";
import { useHydrated } from "@/hooks/useHydrated";
import { loadProfile } from "@/lib/account-loaders";
import { useAccountStore } from "@/stores/account/Account.store";
import type { Profile } from "@/stores/account/Account.types";

export type { Profile };

export interface ProfileState {
  profile: Profile | null;
  loaded: boolean;
}

export function useProfile(): ProfileState {
  const hydrated: boolean = useHydrated();
  const profile: Profile | null = useAccountStore((state) => state.profile);
  const [settled, setSettled] = useState<boolean>(false);

  useEffect((): void => {
    void loadProfile().finally((): void => setSettled(true));
  }, []);

  const cached: boolean = hydrated && profile !== null;
  return { profile: hydrated ? profile : null, loaded: cached || settled };
}
