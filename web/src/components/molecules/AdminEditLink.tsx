"use client";

import { PencilIcon } from "@/components/atoms/Icons/PencilIcon";
import { useIsAdmin } from "@/lib/use-is-admin";

interface AdminEditLinkProps {
  productId: string;
}

export function AdminEditLink({ productId }: AdminEditLinkProps) {
  const isAdmin: boolean = useIsAdmin();
  if (!isAdmin) return null;

  return (
    <a
      href={`/admin/products/${productId}`}
      aria-label="Edit product"
      title="Edit product"
      className="fixed right-4 bottom-24 z-40 grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg lg:bottom-6"
    >
      <PencilIcon width={20} height={20} fill="currentColor" />
    </a>
  );
}
