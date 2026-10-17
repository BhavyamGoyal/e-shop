"use client";

import { useState } from "react";
import type { UserOption } from "@/server/types/coupon.types";
import { Button } from "../atoms";
import { Select } from "../atoms/Controls/Select";

export interface CouponAssignProps {
  users: UserOption[];
  onAssign: (userId: string) => Promise<boolean>;
}

export function CouponAssign({ users, onAssign }: CouponAssignProps) {
  const [userId, setUserId] = useState<string>("");
  const [busy, setBusy] = useState<boolean>(false);

  const assign = async (): Promise<void> => {
    setBusy(true);
    const ok: boolean = await onAssign(userId);
    setBusy(false);
    if (ok) setUserId("");
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="min-w-56 flex-1">
        <Select
          aria-label="Assign to user"
          value={userId}
          placeholder="Assign to user..."
          options={users.map((user: UserOption) => ({ value: user.id, label: user.label }))}
          onChange={(e) => setUserId(e.target.value)}
        />
      </div>
      <Button size="sm" disabled={busy || !userId} onClick={() => void assign()}>
        {busy ? "Assigning..." : "Assign"}
      </Button>
    </div>
  );
}
