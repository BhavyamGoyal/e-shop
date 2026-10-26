"use client";

import type { Profile } from "@/lib/use-profile";
import { Button, Text } from "../atoms";
import { AccountLinks } from "./AccountLinks";
import { Avatar, logout } from "./ProfileMenu";

interface AccountSidebarProps {
  profile: Profile | null;
  current: string;
}

export function AccountSidebar({ profile, current }: AccountSidebarProps) {
  return (
    <aside className="flex flex-col gap-2 lg:sticky lg:top-6 lg:self-start">
      {profile && (
        <div className="mb-2 hidden items-center gap-3 border-b border-(--pp-line) px-3 pb-5 lg:flex">
          <Avatar profile={profile} />
          <div className="min-w-0">
            <Text className="truncate font-semibold">{profile.name || "Your account"}</Text>
            <Text tone="muted" className="truncate text-xs">{profile.email}</Text>
          </div>
        </div>
      )}
      <AccountLinks current={current} className="max-lg:flex-row max-lg:overflow-x-auto" />
      {profile && (
        <Button type="button" variant="outline" tone="secondary" size="sm" className="mt-3 hidden w-full lg:inline-flex" onClick={() => void logout()}>
          Sign out
        </Button>
      )}
    </aside>
  );
}
