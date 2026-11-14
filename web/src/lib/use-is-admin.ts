"use client";

import { useEffect, useState } from "react";

export function useIsAdmin(): boolean {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect((): void => {
    fetch("/api/me")
      .then((response: Response) => response.json())
      .then((body: { isAdmin?: boolean }): void => setIsAdmin(body.isAdmin === true))
      .catch((): void => undefined);
  }, []);

  return isAdmin;
}
