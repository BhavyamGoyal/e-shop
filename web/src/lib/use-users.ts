"use client";

import { useCallback, useEffect, useState } from "react";
import type { UserRecord, UserRoleName } from "@/server/types/admin.types";
import { fetchUsers, updateUserRole } from "./admin-api";

export interface UsersController {
  users: UserRecord[];
  loading: boolean;
  error: string | null;
  setRole: (id: string, role: UserRoleName) => Promise<void>;
}

const message = (error: unknown): string => (error instanceof Error ? error.message : "Request failed");

export function useUsers(): UsersController {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState<number>(0);

  useEffect(() => {
    let active = true;
    fetchUsers()
      .then((result: UserRecord[]): void => {
        if (active) setUsers(result);
      })
      .catch((reason: unknown): void => {
        if (active) setError(message(reason));
      })
      .finally((): void => {
        if (active) setLoading(false);
      });
    return (): void => {
      active = false;
    };
  }, [version]);

  const setRole = useCallback(async (id: string, role: UserRoleName): Promise<void> => {
    try {
      await updateUserRole(id, role);
      setError(null);
    } catch (reason: unknown) {
      setError(message(reason));
    }
    setVersion((value: number): number => value + 1);
  }, []);

  return { users, loading, error, setRole };
}
