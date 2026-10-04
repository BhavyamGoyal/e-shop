"use client";

import { useUsers } from "@/lib/use-users";
import type { UserRecord, UserRoleName } from "@/server/types/admin.types";
import { Heading, Text } from "../atoms";
import { AlertMessage } from "../molecules";

export interface UsersManagerProps {
  canEdit: boolean;
  currentUserId: string;
}

const ROLE_LABELS: Record<UserRoleName, string> = {
  admin: "Admin",
  manager: "Manager",
  customer: "Normal",
};

const ROLES: UserRoleName[] = ["admin", "manager", "customer"];

export function UsersManager({ canEdit, currentUserId }: UsersManagerProps) {
  const { users, loading, error, setRole } = useUsers();

  return (
    <section className="flex flex-col gap-5">
      <div>
        <Heading level={2}>Users</Heading>
        <Text tone="muted" className="text-sm">
          {users.length} users
        </Text>
      </div>
      {error ? <AlertMessage tone="danger" message={error} /> : null}
      {loading ? <Text tone="muted">Loading...</Text> : null}
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">User</th>
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 font-medium">Role</th>
              <th className="px-4 py-2 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user: UserRecord) => (
              <tr key={user.id} className="border-t">
                <td className="px-4 py-2">
                  <div className="flex items-center gap-3">
                    {user.image ? (
                      <img src={user.image} alt="" referrerPolicy="no-referrer" className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-muted" />
                    )}
                    <span>{user.name || "-"}</span>
                  </div>
                </td>
                <td className="px-4 py-2">{user.email}</td>
                <td className="px-4 py-2">
                  {canEdit && user.id !== currentUserId ? (
                    <select
                      value={user.role}
                      onChange={(event) => void setRole(user.id, event.target.value as UserRoleName)}
                      className="rounded-md border bg-background px-2 py-1"
                    >
                      {ROLES.map((role: UserRoleName) => (
                        <option key={role} value={role}>
                          {ROLE_LABELS[role]}
                        </option>
                      ))}
                    </select>
                  ) : (
                    ROLE_LABELS[user.role]
                  )}
                </td>
                <td className="px-4 py-2">{new Date(user.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
