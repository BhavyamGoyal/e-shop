"use client";

import { useEffect, useState } from "react";
import { Button, Text } from "../atoms";
import { ThemeSwitcher } from "./ThemeSwitcher";

interface Profile {
  name: string;
  email: string;
  image: string;
}

interface ProfileMenuProps {
  guestIcon: string;
}

const initialOf = (profile: Profile): string => (profile.name || profile.email).charAt(0).toUpperCase();

async function logout(): Promise<void> {
  const response: Response = await fetch("/api/auth/logout", { method: "POST" });
  const body: { redirect?: string } = await response.json();
  window.location.assign(body.redirect ?? "/login");
}

function Avatar({ profile }: { profile: Profile }) {
  if (profile.image) {
    return (
      <img
        src={profile.image}
        alt={profile.name || profile.email}
        referrerPolicy="no-referrer"
        className="size-9 rounded-full object-cover"
      />
    );
  }
  return (
    <span className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
      {initialOf(profile)}
    </span>
  );
}

export function ProfileMenu({ guestIcon }: ProfileMenuProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loaded, setLoaded] = useState<boolean>(false);

  useEffect(() => {
    fetch("/api/me")
      .then((response: Response) => response.json())
      .then((body: { data: Profile | null }) => setProfile(body.data))
      .catch(() => setProfile(null))
      .finally(() => setLoaded(true));
  }, []);

  if (loaded && !profile) {
    return (
      <a href="/login" className="flex flex-col items-center gap-1 px-1 text-muted-foreground hover:text-foreground">
        <img src={guestIcon} alt="Login" width={24} height={24} />
        <span className="hidden text-xs whitespace-nowrap md:block">Hi Guest</span>
      </a>
    );
  }

  return (
    <div className="group relative">
      <button type="button" aria-label="Profile" className="flex items-center px-1">
        {profile ? <Avatar profile={profile} /> : <span className="size-9 rounded-full bg-muted" />}
      </button>
      {profile && (
        <div className="invisible absolute right-0 top-full z-50 pt-2 opacity-0 transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
          <div className="flex w-72 flex-col gap-4 rounded-lg border bg-surface p-4 text-surface-foreground shadow-lg">
            <div className="flex items-center gap-3">
              <Avatar profile={profile} />
              <div className="min-w-0">
                <Text className="truncate font-semibold">{profile.name || "Your account"}</Text>
                <Text tone="muted" className="truncate text-sm">{profile.email}</Text>
              </div>
            </div>
            <div className="flex flex-col gap-2 border-t pt-3">
              <Text className="text-sm font-medium">Theme</Text>
              <ThemeSwitcher />
            </div>
            <div className="flex flex-col gap-2 border-t pt-3">
              <a href="/account/addresses" className="text-sm font-medium hover:underline">
                My addresses
              </a>
              <Button type="button" variant="outline" tone="secondary" size="sm" className="w-full" onClick={() => void logout()}>
                Log out
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
