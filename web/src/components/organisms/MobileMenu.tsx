"use client";

import { useEffect, useState } from "react";
import { useProfile } from "@/lib/use-profile";
import { Button, Text } from "../atoms";
import { AccountLinks } from "./AccountLinks";
import { Avatar, logout } from "./ProfileMenu";
import { ThemeSwitcher } from "./ThemeSwitcher";

export function MobileMenu() {
  const [open, setOpen] = useState<boolean>(false);
  const { profile, loaded } = useProfile();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="flex size-10 items-center justify-center rounded-md text-foreground hover:bg-muted"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <div
        className={`fixed inset-0 z-[60] bg-foreground/40 transition-opacity ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setOpen(false)}
      />
      <aside
        aria-hidden={!open}
        className={`fixed inset-y-0 left-0 z-[70] flex w-72 max-w-[85vw] flex-col gap-5 overflow-y-auto bg-surface p-5 text-surface-foreground shadow-lg transition-transform ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between">
          <Text className="font-semibold">Menu</Text>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="flex size-9 items-center justify-center rounded-md hover:bg-muted"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        {profile && (
          <div className="flex items-center gap-3 border-t pt-4">
            <Avatar profile={profile} />
            <div className="min-w-0">
              <Text className="truncate font-semibold">{profile.name || "Your account"}</Text>
              <Text tone="muted" className="truncate text-sm">{profile.email}</Text>
            </div>
          </div>
        )}
        {profile && (
          <div className="border-t pt-4">
            <AccountLinks onNavigate={() => setOpen(false)} />
          </div>
        )}
        {loaded && !profile && (
          <a href="/login" className="rounded-md bg-primary px-3 py-2.5 text-center text-sm font-medium text-primary-foreground">
            Log in
          </a>
        )}
        <div className="flex flex-col gap-2 border-t pt-4">
          <Text className="text-sm font-medium">Theme</Text>
          <ThemeSwitcher />
        </div>
        {profile && (
          <Button type="button" variant="outline" tone="secondary" size="sm" className="w-full" onClick={() => void logout()}>
            Log out
          </Button>
        )}
      </aside>
    </div>
  );
}
