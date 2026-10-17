"use client";

import { useEffect, useState } from "react";

export function useTinglePoints(refreshKey: string): number {
  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    fetch("/api/tingle-points")
      .then((response: Response) => (response.ok ? response.json() : { balance: 0 }))
      .then((body: { balance: number }) => setBalance(body.balance))
      .catch(() => setBalance(0));
  }, [refreshKey]);

  return balance;
}
