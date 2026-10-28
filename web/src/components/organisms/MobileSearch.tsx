"use client";

import { useState } from "react";
import { SearchBox } from "./SearchBox";

interface MobileSearchProps {
  icon: string;
  placeholder: string;
}

export function MobileSearch({ icon, placeholder }: MobileSearchProps) {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Close search" : "Open search"}
        aria-expanded={open}
        onClick={() => setOpen((value: boolean) => !value)}
        className="flex flex-col items-center px-1 text-muted-foreground hover:text-foreground"
      >
        <img src={icon} alt="" width={24} height={24} />
      </button>
      {open && (
        <div className="absolute inset-x-0 top-full z-50 border-b border-border bg-background px-4 py-3 shadow-md">
          <SearchBox icon={icon} placeholder={placeholder} autoFocus onNavigate={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}
