"use client";

import { useRouter } from "next/router";
import { useEffect } from "react";

export function useAuthPage(): string {
  const router = useRouter();

  useEffect((): void => {
    fetch("/api/me")
      .then((response: Response) => response.json())
      .then((body: { landing: string | null }): void => {
        if (body.landing) router.replace(body.landing);
      })
      .catch((): void => undefined);
  }, [router]);

  const next: string | string[] | undefined = router.query.next;
  return typeof next === "string" ? next : "";
}
