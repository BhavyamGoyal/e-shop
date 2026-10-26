"use client";

import type { ReactNode } from "react";
import { useProfile, type ProfileState } from "@/lib/use-profile";
import { AccountSidebar } from "./AccountSidebar";

interface AccountShellProps {
  current: string;
  children: ReactNode;
}

export function AccountShell({ current, children }: AccountShellProps) {
  const { profile }: ProfileState = useProfile();
  return (
    <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
      <AccountSidebar profile={profile} current={current} />
      <div className="flex min-w-0 flex-col gap-8">{children}</div>
    </div>
  );
}
